import { NextResponse } from 'next/server';
import { resolveProvider, validateContact } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Best-effort in-memory throttle. Serverless instances are short-lived, so this
 * is a speed bump rather than a guarantee — the honeypot and timing check do
 * most of the work.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  const now = Date.now();

  if (rateLimited(clientKey(request), now)) {
    return NextResponse.json(
      {
        ok: false,
        code: 'rate_limited',
        errors: { form: 'Too many messages. Try again shortly.' },
      },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: 'invalid_json', errors: { form: 'Malformed request.' } },
      { status: 400 },
    );
  }

  const result = validateContact(payload, now);
  if (!result.ok || !result.value) {
    return NextResponse.json(
      { ok: false, code: 'invalid', errors: result.errors },
      { status: 400 },
    );
  }

  const provider = resolveProvider();
  if (!provider) {
    // No delivery configured. Say so honestly; never fake a success.
    return NextResponse.json(
      {
        ok: false,
        code: 'not_configured',
        errors: { form: 'Message delivery is not configured for this deployment.' },
      },
      { status: 503 },
    );
  }

  const { name, email, message } = result.value;

  try {
    if (provider === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL,
          to: [process.env.CONTACT_TO_EMAIL],
          reply_to: email,
          subject: `New message from ${name}`,
          text: `From: ${name} <${email}>\n\n${message}`,
        }),
      });
      if (!response.ok) throw new Error(`Resend responded ${response.status}`);
    } else {
      const response = await fetch(process.env.FORMSPREE_ENDPOINT as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
    }
  } catch (error) {
    console.error('[contact] delivery failed', error);
    return NextResponse.json(
      {
        ok: false,
        code: 'delivery_failed',
        errors: {
          form: 'That message did not go through. Please try again, or reach me directly.',
        },
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

/** Anything other than POST is not a route worth advertising. */
export async function GET() {
  return NextResponse.json({ ok: false, code: 'method_not_allowed' }, { status: 405 });
}
