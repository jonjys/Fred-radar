# Night run 2026-08-17

## Shipped while you slept (round 2)

1. **index.html** – OG-bild, dynamiskt verktygsantal, homepage-stats wired
2. **Perplexity Pro** + **Gamma** tillagda (22 verktyg totalt)
3. **Senast tittat på** – lokal historik av verktyg du klickat vidare till
4. **Quiz** – dela resultat + tangentbord (redan live)
5. **prefers-reduced-motion** – tillgänglighet
6. **set-site-url** – `npm run set-site-url -- https://din-domän.se`
7. Kategorisidor regenererade

## Still needs you (human)

1. Vercel → Settings → Git → **Production Branch** = `main`
2. Riktiga affiliate-koder (Make, ClickUp, Copy.ai först)
3. `npm run set-site-url -- https://...` när DNS är klart
4. Analytics + nyhetsbrev-konton
5. Juridisk GDPR-koll innan aggressiv marknadsföring

## Verify

```bash
git pull
npm run build && npm run serve
```
