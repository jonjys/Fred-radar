# Night run 2026-08-16

## Shipped while you slept

1. **Dynamic tool count** on homepage (was hard-coded 18, now 21)
2. **OG image** (`assets/og-image.svg`) + wired on index + quiz
3. **Share results** button on quiz (Web Share API + clipboard fallback)
4. **Keyboard shortcuts** in quiz: 1–5 select, Enter next, Backspace/Esc back
5. **`npm run set-site-url -- https://din-domän.se`** script
6. **Perplexity Pro** added as tool #21 (research with sources)
7. Categories regenerated

## Still needs you (human)

- Set Production Branch in Vercel
- Real affiliate codes (start with Make, ClickUp, Copy.ai)
- Domain via `npm run set-site-url -- https://...`
- Analytics + newsletter accounts
- Legal GDPR review before aggressive marketing

## How to verify

```bash
npm run build
npm run serve
# open http://localhost:3000
```
