# Fonts for social cards

`next/og` renders social images with Satori, which needs raw font data — it cannot use the
`next/font` pipeline. These three files are copied verbatim from the `geist` npm package
(`node_modules/geist/dist/fonts/`) so the generated cards use the same typefaces as the
site.

Geist and Geist Mono are published by Vercel under the SIL Open Font License 1.1; the
licence text ships with the `geist` package.

To refresh after a `geist` upgrade:

```bash
cp node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf assets/fonts/
cp node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf assets/fonts/
cp node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf assets/fonts/
```
