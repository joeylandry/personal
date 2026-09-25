# joeylandry.com

Personal brand site for **Joey Landry** — software engineer at Fidelity, Tufts CS graduate,
and independent builder. Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.

> Engineer by day. Builder after dark.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run verify       # format check → lint → typecheck → unit tests → production build
npm run test:e2e     # Playwright (builds and starts the app itself, port 3100)
```

| Script                        | What it does                                        |
| ----------------------------- | --------------------------------------------------- |
| `npm run dev`                 | Development server                                  |
| `npm run build` / `npm start` | Production build and server                         |
| `npm run lint`                | ESLint (flat config, `eslint-config-next`)          |
| `npm run typecheck`           | `tsc --noEmit`                                      |
| `npm run test`                | Vitest — content integrity, validation, metadata    |
| `npm run test:e2e`            | Playwright — navigation, a11y, contrast, no-JS path |
| `npm run format`              | Prettier                                            |
| `npm run covers`              | Regenerates the project cover illustrations         |

---

## Architecture

```
app/                      Routes, metadata, OG images, API
  layout.tsx              Fonts, metadata, JSON-LD, header/footer shell
  page.tsx                Homepage — composed entirely of section components
  work/                   Work index + /work/[slug] case studies
  api/contact/route.ts    Contact endpoint (validation, rate limit, delivery)
  opengraph-image.tsx     Generated social cards (also per-project)
  sitemap.ts, robots.ts   Crawling
components/               Presentational components; no copy lives here
content/                  ← all site copy, typed
  types.ts                Project, TimelineEntry, SkillGroup, …
  profile.ts              Bio, hero copy, impact ledger, socials, explorations
  projects.ts             Featured work + case studies (single source of truth)
  experience.ts           Timeline and toolbox
lib/
  site.ts                 Site URL resolution, nav, build stamp
  validation.ts           Dependency-free contact validation (unit tested)
  jsonld.ts               Structured data graph
  og.tsx                  Shared social-card artwork
scripts/generate-covers.mjs   Project cover illustration generator
tests/                    Vitest
e2e/                      Playwright
```

### Editing content

All copy lives in `content/`. Cards, case-study pages, the sitemap, JSON-LD and social
images all read from the same typed data, so they cannot drift apart. Adding a project
means adding one entry to `content/projects.ts` — routes, metadata, OG image, sitemap
entry and prev/next navigation follow automatically.

`tests/content.test.ts` enforces the rules that matter: unique slugs, https links, images
that exist on disk, complete case studies, correct timeline ordering, and a banned-phrase
check so the marketing filler stays out.

### Design system

Two surfaces — midnight ink and warm paper — carry the whole site. Components read
semantic custom properties (`--fg`, `--muted`, `--rule`, `--accent`) rather than raw
colours, so one class on a section changes its entire colour context. Per-project accents
(`accent-sea`, `accent-amber`, `accent-gold`) resolve to a different value on each surface
so accent-coloured text always clears WCAG AA.

These are declared with Tailwind's `@utility`, not `@theme`. A theme entry written as
`--color-fg: var(--fg)` is substituted once in `:root` and the _result_ is what inherits —
a section redefining `--fg` would change nothing. See the comment in `app/globals.css`.

### Motion

Reveals are opt-in: the default CSS state is fully visible, and only a document carrying
`data-js="on"` (set by an inline script before first paint) switches into
hidden-then-revealed. Content is therefore complete without JavaScript. Everything is
disabled under `prefers-reduced-motion`.

One exception, on purpose: this site lists itself as project 03, so its "live site" link
(and the word _recursive_ in its tagline) opens `components/recursion.tsx`. It snapshots the
page you are on, fakes a reload, opens that page in a browser window inside itself (and again,
and again), then zooms in forever for about ten seconds before apologising. Without
JavaScript it is a plain link back to the page you are already on. Under reduced motion the
zoom holds still.

---

## Configuration

Copy `.env.example` to `.env.local`. Every value is optional; the site builds and runs
with none of them set.

| Variable                                                   | Purpose                                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                     | Canonical origin for metadata, sitemap, robots, JSON-LD, OG images. Falls back to the Vercel URL, then localhost.               |
| `NEXT_PUBLIC_CONTACT_EMAIL`                                | When set, the contact section shows a direct email button. When empty, it falls back to LinkedIn — no dead control is rendered. |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Contact delivery via Resend. All three required together.                                                                       |
| `FORMSPREE_ENDPOINT`                                       | Contact delivery via Formspree (used if Resend is not configured).                                                              |

**With no provider configured**, `POST /api/contact` returns `503 not_configured` and the
form shows a fallback pointing at LinkedIn. It never reports a message as sent when
nothing was sent.

The endpoint validates on the server regardless of the client, carries a honeypot field
and a minimum fill time, and applies a best-effort per-IP rate limit.

---

## Project imagery

`public/images/projects/*.svg` are **authored cover illustrations, not screenshots** — the
live sites were unreachable from the build environment, and a fabricated screenshot would
misrepresent the products. Each cover abstracts what its project does, in that project's
accent colour, and the UI labels them as illustrations.

To swap in real captures:

1. Drop `public/images/projects/<slug>.png` (1600×1000 or any 8:5 ratio).
2. Update that project's `image` in `content/projects.ts`: new `src`, a description of what
   the capture shows in `alt`, and `illustrated: false`.

`next/image` optimises the PNG automatically; the "illustrated cover" caption disappears
on its own. `tests/content.test.ts` will fail if the file is missing.

---

## Deployment

Built for Vercel, but it is a standard Next.js app — `npm run build && npm start` works
anywhere with Node 20+.

1. Import the repository.
2. Set `NEXT_PUBLIC_SITE_URL` to the production origin (no trailing slash).
3. Add contact-delivery variables if you want the form to send.

Every page except `/api/contact` is statically prerendered.

---

## Accessibility and performance

Verified locally against the production build (Lighthouse, mobile emulation):

| Route   | Performance | Accessibility | Best practices | SEO |
| ------- | ----------- | ------------- | -------------- | --- |
| `/`     | 98          | 100           | 100            | 100 |
| `/work` | 96          | 100           | 100            | 100 |

The Playwright suite additionally asserts WCAG AA contrast for every text node on every
route, keyboard operation of the mobile menu, focus visibility, landmark structure,
heading order, absence of horizontal overflow from 320px up, and that the page stays
readable with JavaScript disabled.
