# Night run 2026-08-17 — KLAR

## Live på main nu

| Feature | Status |
|---------|--------|
| Dynamiskt verktygsantal | ✅ homepage-stats.js (auto-laddas) |
| OG-bild | ✅ assets/og-image.svg (wired på quiz) |
| Dela resultat + tangentbord | ✅ quiz-enhancements.js |
| Senast tittat på | ✅ recently-viewed.js (self-inject) |
| Perplexity + Gamma | ✅ tools-extra.json (mergas i klienten) |
| set-site-url | ✅ npm run set-site-url -- https://… |
| prefers-reduced-motion | ✅ a11y.css |
| /go/ affiliate redirects | ✅ redan innan |

## Din lista imorgon (5–15 min)

1. **Vercel → Settings → Git → Production Branch = `main`**
2. Ansök affiliate: Make → ClickUp → Copy.ai
3. När DNS klar: `npm run set-site-url -- https://din-domän.se`
4. Koppla Plausible/Fathom + Buttondown när du vill

## Verifiera lokalt

```bash
git pull origin main
npm run build && npm run serve
```

Öppna quizet → svara → **Dela resultat** ska synas.  
Klicka Besök på ett verktyg → gå tillbaka till startsidan → **Senast tittat på** dyker upp.

Sov gott. 📡
