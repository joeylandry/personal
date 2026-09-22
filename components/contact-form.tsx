'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { LIMITS, type ContactFieldErrors } from '@/lib/validation';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'unavailable';

const field =
  'w-full border border-rule bg-transparent px-4 py-3 text-[0.95rem] text-fg placeholder:text-faint transition-colors duration-200 focus:border-accent focus-visible:outline-none';

/**
 * Contact form.
 *
 * Validates on the client for fast feedback, but the server revalidates and is
 * the only authority. When no delivery provider is configured the form says so
 * plainly and hands the visitor the direct links — it never reports a message
 * as sent when nothing was sent.
 */
export function ContactForm({
  fallbackHref,
  fallbackLabel,
}: {
  fallbackHref: string;
  fallbackLabel: string;
}) {
  const ids = useId();
  const nameId = `${ids}-name`;
  const emailId = `${ids}-email`;
  const messageId = `${ids}-message`;

  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  /**
   * When the form became fillable. Recorded after mount rather than during
   * render, and sent so the server can reject submissions that arrive faster
   * than a person could type.
   */
  const renderedAt = useRef<number | null>(null);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      company: String(data.get('company') ?? ''),
      ...(renderedAt.current === null ? {} : { renderedAt: renderedAt.current }),
    };

    setStatus('sending');
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        errors?: ContactFieldErrors;
      };

      if (response.ok && body.ok) {
        setStatus('sent');
        form.reset();
        renderedAt.current = Date.now();
        return;
      }

      if (response.status === 503 || body.code === 'not_configured') {
        setStatus('unavailable');
        return;
      }

      setErrors(body.errors ?? { form: 'Something went wrong. Please try again.' });
      setStatus('error');
    } catch {
      setStatus('unavailable');
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="border border-tick p-6">
        <p className="text-lead text-fg">Message received — thank you.</p>
        <p className="mt-2 text-sm text-muted">
          I read everything that comes through here and reply to anything that needs one.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor={nameId} className="meta block text-faint">
          Name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={LIMITS.name.max}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          className={`${field} mt-2`}
          placeholder="Your name"
        />
        {errors.name ? (
          <p id={`${nameId}-error`} className="mt-2 text-sm text-accent">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={emailId} className="meta block text-faint">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={LIMITS.email.max}
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className={`${field} mt-2`}
          placeholder="you@example.com"
        />
        {errors.email ? (
          <p id={`${emailId}-error`} className="mt-2 text-sm text-accent">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={messageId} className="meta block text-faint">
          Message
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          rows={5}
          maxLength={LIMITS.message.max}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
          className={`${field} mt-2 resize-y`}
          placeholder="What are you building?"
        />
        {errors.message ? (
          <p id={`${messageId}-error`} className="mt-2 text-sm text-accent">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot. Visually and semantically hidden; only bots fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${ids}-company`}>Company</label>
        <input id={`${ids}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center gap-2.5 bg-accent px-6 py-3.5 text-sm font-medium text-accent-fg transition-colors duration-200 hover:bg-fg hover:text-bg disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p className="meta text-faint">Usually a reply within a few days.</p>
      </div>

      <div role="status" aria-live="polite">
        {status === 'error' && errors.form ? (
          <p className="text-sm text-accent">{errors.form}</p>
        ) : null}
        {status === 'unavailable' ? (
          <div className="border border-rule-strong p-4">
            <p className="text-sm text-fg">
              This message couldn&apos;t be delivered from the site right now.
            </p>
            <p className="mt-2 text-sm text-muted">
              Copy what you wrote and reach me on{' '}
              <a
                href={fallbackHref}
                target={fallbackHref.startsWith('http') ? '_blank' : undefined}
                rel={fallbackHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="link-on text-accent"
              >
                {fallbackLabel}
              </a>{' '}
              instead — it reaches me just as fast.
            </p>
          </div>
        ) : null}
      </div>
    </form>
  );
}
