import { beforeEach, describe, expect, it } from 'vitest';
import {
  LIMITS,
  isValidEmail,
  normalizeText,
  resolveProvider,
  validateContact,
} from '@/lib/validation';

const NOW = 1_700_000_000_000;
const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'I have a product idea and I would like to talk about building it properly.',
  renderedAt: NOW - 10_000,
};

describe('isValidEmail', () => {
  it.each(['ada@example.com', 'joey.landry@sub.domain.co.uk', 'first+tag@example.io', 'a@b.cd'])(
    'accepts %s',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each([
    '',
    'ada',
    'ada@',
    '@example.com',
    'ada@example',
    'ada@@example.com',
    'ada example@test.com',
    'ada@example..com',
    'ada@example.c',
    'ada@exam ple.com',
  ])('rejects %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  it('rejects an address longer than the limit', () => {
    expect(isValidEmail(`${'a'.repeat(LIMITS.email.max)}@example.com`)).toBe(false);
  });
});

describe('normalizeText', () => {
  it('strips control characters and trims', () => {
    expect(normalizeText('  hello\u0000 world \u007F ')).toBe('hello world');
  });

  it('leaves ordinary punctuation and newlines alone', () => {
    expect(normalizeText('Line one.\nLine two — done.')).toBe('Line one.\nLine two — done.');
  });
});

describe('validateContact', () => {
  it('accepts a well-formed message', () => {
    const result = validateContact(valid, NOW);
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      name: valid.name,
      email: valid.email,
      message: valid.message,
    });
  });

  it('rejects non-object payloads', () => {
    for (const payload of [null, undefined, 'string', 42, true]) {
      expect(validateContact(payload, NOW).ok).toBe(false);
    }
  });

  it('reports each invalid field separately', () => {
    const result = validateContact({ ...valid, name: 'A', email: 'nope', message: 'short' }, NOW);
    expect(result.ok).toBe(false);
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.message).toBeTruthy();
  });

  it('rejects a filled honeypot without revealing why', () => {
    const result = validateContact({ ...valid, company: 'Acme Bots' }, NOW);
    expect(result.ok).toBe(false);
    expect(result.errors.form).toBe('Rejected.');
    expect(result.errors.name).toBeUndefined();
  });

  it('rejects submissions faster than a human could type', () => {
    const result = validateContact({ ...valid, renderedAt: NOW - 100 }, NOW);
    expect(result.ok).toBe(false);
    expect(result.errors.form).toMatch(/too quick/i);
  });

  it('accepts submissions with no render timestamp', () => {
    const { renderedAt: _ignored, ...rest } = valid;
    expect(validateContact(rest, NOW).ok).toBe(true);
  });

  it('enforces maximum lengths', () => {
    expect(
      validateContact({ ...valid, name: 'a'.repeat(LIMITS.name.max + 1) }, NOW).errors.name,
    ).toBeTruthy();
    expect(
      validateContact({ ...valid, message: 'a'.repeat(LIMITS.message.max + 1) }, NOW).errors
        .message,
    ).toBeTruthy();
  });

  it('trims whitespace-only input into a failure', () => {
    const result = validateContact({ ...valid, name: '   ', message: '   ' }, NOW);
    expect(result.ok).toBe(false);
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.message).toBeTruthy();
  });

  it('coerces missing fields rather than throwing', () => {
    expect(() => validateContact({}, NOW)).not.toThrow();
    expect(validateContact({}, NOW).ok).toBe(false);
  });
});

describe('resolveProvider', () => {
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    env = {} as NodeJS.ProcessEnv;
  });

  it('returns null when nothing is configured', () => {
    expect(resolveProvider(env)).toBeNull();
  });

  it('requires all three Resend values', () => {
    env.RESEND_API_KEY = 'key';
    expect(resolveProvider(env)).toBeNull();
    env.CONTACT_TO_EMAIL = 'to@example.com';
    expect(resolveProvider(env)).toBeNull();
    env.CONTACT_FROM_EMAIL = 'from@example.com';
    expect(resolveProvider(env)).toBe('resend');
  });

  it('falls back to Formspree when only that is configured', () => {
    env.FORMSPREE_ENDPOINT = 'https://formspree.io/f/abc';
    expect(resolveProvider(env)).toBe('formspree');
  });

  it('prefers Resend when both are configured', () => {
    env.RESEND_API_KEY = 'key';
    env.CONTACT_TO_EMAIL = 'to@example.com';
    env.CONTACT_FROM_EMAIL = 'from@example.com';
    env.FORMSPREE_ENDPOINT = 'https://formspree.io/f/abc';
    expect(resolveProvider(env)).toBe('resend');
  });
});
