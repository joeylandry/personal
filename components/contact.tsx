import { profile, socials } from '@/content';
import { contactEmail } from '@/lib/site';
import { ContactForm } from './contact-form';
import { ExternalLink } from './external-link';
import { LinkedInGlyph, MailGlyph } from './glyphs';
import { Section } from './section';

const linkedin = socials.find((social) => social.label === 'LinkedIn')!;

export function Contact() {
  return (
    <Section
      id="contact"
      surface="ink"
      divider={false}
      labelledBy="contact-heading"
      className="overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="grid-field pointer-events-none absolute inset-0 opacity-60"
      />

      <div className="wrap relative grid gap-x-10 gap-y-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <div>
            <p className="meta section-label">{profile.contact.kicker}</p>
            <h1 id="contact-heading" className="mt-5 text-title font-medium">
              {profile.contact.headline}
            </h1>
            <p className="measure-tight mt-6 text-lead text-muted">{profile.contact.body}</p>
          </div>

          <div>
            <ul className="mt-10 space-y-0">
              <li className="rule-t">
                <ExternalLink
                  href={linkedin.href}
                  className="group flex items-center justify-between gap-4 py-4"
                >
                  <span className="flex items-center gap-3.5">
                    <LinkedInGlyph className="h-4 w-4 text-faint transition-colors group-hover:text-accent" />
                    <span className="text-sm text-fg">LinkedIn</span>
                  </span>
                  <span className="meta text-faint">{linkedin.handle}</span>
                </ExternalLink>
              </li>
              {contactEmail ? (
                <li className="rule-t rule-b">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span className="flex items-center gap-3.5">
                      <MailGlyph className="h-4 w-4 text-faint transition-colors group-hover:text-accent" />
                      <span className="text-sm text-fg">Email</span>
                    </span>
                    <span className="meta text-faint normal-case">{contactEmail}</span>
                  </a>
                </li>
              ) : (
                <li className="rule-t rule-b py-4">
                  <p className="meta text-faint normal-case tracking-normal">
                    LinkedIn is the fastest way to reach me.
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <ContactForm
            fallbackHref={contactEmail ? `mailto:${contactEmail}` : linkedin.href}
            fallbackLabel={contactEmail ? 'email' : 'LinkedIn'}
          />
        </div>
      </div>
    </Section>
  );
}
