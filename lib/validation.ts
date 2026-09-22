/**
 * Dependency-free validation for the contact endpoint.
 *
 * Kept as pure functions so the rules can be unit tested without booting Next
 * or a network stack. Errors are returned per field so the form can announce
 * them next to the input that caused them.
 */

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  /** Honeypot. Must be empty — bots fill it, humans never see it. */
  company?: string;
  /** Client timestamp (ms) of when the form was rendered. */
  renderedAt?: number;
}

export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'message' | 'form', string>>;

export interface ValidationResult {
  ok: boolean;
  errors: ContactFieldErrors;
  value?: { name: string; email: string; message: string };
}

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 200 },
  message: { min: 20, max: 4000 },
  /** Minimum ms between render and submit. Anything faster is automated. */
  minFillMs: 2_000,
} as const;

/**
 * Pragmatic email check: a single @, no whitespace, a dotted domain with a
 * plausible TLD. Deliberately permissive — the provider is the real authority.
 */
const EMAIL_PATTERN = /^[^\s@,;:<>()[\]\\"]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > LIMITS.email.max) return false;
  if (trimmed.includes('..')) return false;
  if (!EMAIL_PATTERN.test(trimmed)) return false;
  const tld = trimmed.split('.').pop() ?? '';
  return tld.length >= 2;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Collapses runs of whitespace and strips control characters. */
export function normalizeText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

export function validateContact(input: unknown, now: number = Date.now()): ValidationResult {
  const errors: ContactFieldErrors = {};

  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: { form: 'Malformed request.' } };
  }

  const raw = input as Record<string, unknown>;

  // Honeypot: report success-shaped failure to the caller, never to the bot.
  if (asString(raw.company).length > 0) {
    return { ok: false, errors: { form: 'Rejected.' } };
  }

  const renderedAt = typeof raw.renderedAt === 'number' ? raw.renderedAt : undefined;
  if (renderedAt !== undefined && now - renderedAt < LIMITS.minFillMs) {
    return { ok: false, errors: { form: 'That was too quick — please try again.' } };
  }

  const name = normalizeText(asString(raw.name));
  const email = normalizeText(asString(raw.email));
  const message = normalizeText(asString(raw.message));

  if (name.length < LIMITS.name.min) {
    errors.name = 'Please tell me your name.';
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;
  }

  if (!isValidEmail(email)) {
    errors.email = 'Please enter an email address I can reply to.';
  }

  if (message.length < LIMITS.message.min) {
    errors.message = `A little more detail helps — at least ${LIMITS.message.min} characters.`;
  } else if (message.length > LIMITS.message.max) {
    errors.message = `Please keep it under ${LIMITS.message.max} characters.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, errors: {}, value: { name, email, message } };
}

export type ContactProvider = 'resend' | 'formspree' | null;

/** Which delivery provider the current environment supports, if any. */
export function resolveProvider(env: NodeJS.ProcessEnv = process.env): ContactProvider {
  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL) return 'resend';
  if (env.FORMSPREE_ENDPOINT) return 'formspree';
  return null;
}
