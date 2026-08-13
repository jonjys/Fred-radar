# Radar

Smarta rekommendationer & jämförelser av AI- och produktivitetsverktyg – anpassat för svenska och nordiska användare.

Radar är en statisk sajt (HTML/CSS/vanilla JS, ingen backend) som:

- viktar ett 6-frågors quiz mot verktygsdata för att ge en personlig ranking,
- genererar kategorisidor automatiskt från en enda datakälla (`data/tools.json`),
- samlar alla utgående affiliate-länkar på ett ställe för enkel drift, och
- är förberedd för deploy på Vercel med noll konfiguration.

## Struktur

```
├── index.html                    # Landningssida
├── quiz.html                     # 6-frågors quiz (logik i assets/js/quiz.js)
├── kategori/                     # Genererade kategorisidor – redigera inte för hand
│   ├── ai-writing.html
│   ├── ai-image.html
│   └── produktivitet.html
├── go/index.html                 # Central redirect för alla utgående/affiliate-länkar
├── data/
│   ├── tools.json                # Källa till sanning: alla verktyg
│   └── categories.json           # Kategorier (namn, ikon, beskrivning)
├── assets/
│   ├── css/style.css             # Delat mörkt designsystem
│   └── js/
│       ├── partials.js           # Injicerar header/footer på alla sidor
│       ├── tool-card-template.js # Enda källan för hur ett "tool-card" ser ut
│       ├── tools-data.js         # Hämtar tools.json/categories.json i klienten
│       ├── quiz.js               # Quizlogik + viktad poängsättning
│       └── kategori.js           # Sortering/filtrering på kategorisidorna
├── scripts/
│   ├── generate-kategori.js      # Genererar kategori/*.html från data/tools.json
│   └── template-kategori.html    # Layout-mallen generatorn fyller i
├── package.json
└── vercel.json
```

## Så hänger det ihop

**`data/tools.json` är den enda källan till sanning.** Allt annat läser därifrån:

- `quiz.js` hämtar filen i klienten och räknar ut en viktad ranking.
- `index.html` hämtar filen för att visa kategorier och utvalda verktyg.
- `scripts/generate-kategori.js` läser filen vid byggtillfället och skriver ut statisk HTML till `kategori/*.html`.

Kortmarkeringen (`.tool-card`) är definierad **en gång**, i `assets/js/tool-card-template.js`, och delas mellan webbläsaren (`window.ToolCardTemplate`) och Node-generatorn (`module.exports`) – så genererade kategorisidor kan aldrig hamna i otakt med korten som renderas dynamiskt på index/quiz.

## Hur man lägger till ett nytt verktyg – steg för steg

1. **Öppna `data/tools.json`** och kopiera in ett nytt objekt i listan (kopiera gärna ett befintligt verktyg i samma kategori som utgångspunkt). Minimalt exempel:

   ```json
   {
     "id": "mitt-verktyg",
     "name": "Mitt Verktyg",
     "vendor": "Leverantör AB",
     "categories": ["ai-writing"],
     "logo": "🛠️",
     "tagline": "Kort, säljande underrubrik",
     "description": "1–2 meningar om vad verktyget gör och för vem.",
     "website": "https://exempel.se",
     "affiliateUrl": "https://exempel.se/?ref=radar",
     "hasAffiliateProgram": true,
     "pricing": { "model": "freemium", "fromPriceSEK": 150, "currency": "SEK", "billingNote": "Gratisnivå finns, betalplan från 150 kr/mån" },
     "score": 8.0,
     "scores": { "quality": 8, "easeOfUse": 8, "valueForMoney": 7, "support": 6 },
     "gdpr": { "score": 3, "dataResidency": "USA", "notes": "Kort motivering till bedömningen." },
     "difficulty": "beginner",
     "bestFor": ["Användningsfall 1", "Användningsfall 2"],
     "pros": ["Fördel 1", "Fördel 2"],
     "cons": ["Nackdel 1"],
     "languages": ["sv", "en"],
     "swedishSupport": false,
     "featured": false,
     "lastVerified": "2026-08"
   }
   ```

   `id` måste vara unikt och URL-vänligt (a-ö, bindestreck) – det används i `/go/?tool=<id>` och som ankarlänk på kategorisidan. `categories` kan innehålla flera kategori-id:n om verktyget passar i mer än en (se t.ex. `canva-magic-media`).

2. **Kör generatorn:**

   ```bash
   npm run build:kategori
   ```

   Detta skriver om `kategori/*.html` så det nya verktyget dyker upp, sorterat efter `score`.

3. **Committa** både `data/tools.json` och de omgenererade filerna i `kategori/`.

Det är allt – verktyget syns nu automatiskt på rätt kategorisida, tas med i quizets viktade ranking, och kan dyka upp bland "Utvalda verktyg" på startsidan om du sätter `"featured": true`.

Vercel kör dessutom `npm run build` automatiskt vid varje deploy (se `vercel.json`), så kategorisidorna byggs alltid om från senaste `tools.json` – men filerna är även committade så sajten fungerar direkt utan byggsteg om man föredrar det.

## Lägga till en ny kategori

1. Lägg till kategorin i `data/categories.json`.
2. Tagga relevanta verktyg i `data/tools.json` med kategorins `id` i fältet `categories`.
3. Lägg till en länk till kategorin i `assets/js/partials.js` (`CATEGORIES`-listan) så den syns i navigationen.
4. Kör `npm run build:kategori`.

## Quizets poängsättning

Se `assets/js/quiz.js` → `scoreTool()`. Kort sammanfattning:

| Fråga | Effekt på poängsättningen |
|---|---|
| Syfte | Filtrerar bort verktyg utanför vald kategori (om inte "vet inte") |
| Budget | Straffar verktyg som är dyrare än angiven budget, skalande med hur mycket dyrare |
| GDPR-vikt | Multiplicerar verktygets GDPR-poäng med en viktfaktor baserat på hur viktigt användaren sa att det var |
| Teknisk nivå | Bonus om verktygets svårighetsgrad matchar användarens nivå, avdrag vid stor mismatch |
| Prioritet | Ger extra vikt åt den delpoäng (pris/kvalitet/enkelhet/GDPR/support) användaren valde som viktigast |
| E-postuppdateringar | Påverkar inte rankingen – styr bara om e-postfältet visas |

Resultatet visar de tre högst rankade verktygen med en kort, konkret motivering ("Varför vi rekommenderar det") som pekar på vilka av ovanstående faktorer som slog igenom.

## Affiliate-länkar

Alla "Besök"-knappar pekar på `/go/?tool=<id>` istället för direkt till leverantören. `go/index.html` slår upp `affiliateUrl` (eller `website` som fallback) i `data/tools.json` och skickar besökaren vidare. Det gör att:

- affiliate-URL:er för ett verktyg bara behöver uppdateras på **ett** ställe,
- klickspårning/analytics kan läggas till senare utan att röra länkar på index/quiz/kategorisidor,
- vi kan visa tydlig annonsdisclosure (footer på varje sida) enligt marknadsföringslagens krav på att sponsrade länkar ska vara tydligt markerade.

**Testa flödet:** tre verktyg har redan realistiska (men falska) affiliate-spårningslänkar för att `/go/` ska gå att testa end-to-end – `jasper` (`?fpr=...`), `adobe-firefly` (`?sdid=...`) och `notion-ai` (`?ref=...`). Övriga verktyg har `affiliateUrl` satt till samma URL som `website` tills vidare.

**Innan launch:** ersätt placeholder-URL:erna i `affiliateUrl` med riktiga affiliate-länkar när partnerprogram är på plats, och sätt `hasAffiliateProgram: true/false` korrekt per verktyg.

## GDPR-bedömningar – viktig brasklapp

Fälten `gdpr.score` och `gdpr.notes` i `tools.json` är redaktionella, generella bedömningar baserade på offentligt tillgänglig information om respektive leverantörs datahantering. De är **inte juridisk rådgivning** och bör verifieras mot leverantörens aktuella DPA/dataskyddspolicy innan de används som beslutsunderlag, särskilt för företagskunder med specifika compliance-krav.

## Utveckling lokalt

```bash
npm run build      # genererar kategorisidorna från data/tools.json
npm run serve       # startar en statisk lokal server (kräver att build körts)
```

Sajten använder absoluta sökvägar (`/assets/...`, `/data/...`) så den måste köras via en lokal server – att öppna filerna direkt i webbläsaren (`file://`) fungerar inte.

## Deploy (Vercel)

Repot är förberett för deploy utan extra konfiguration:

1. Importera repot i Vercel.
2. Vercel läser `vercel.json` och kör `npm run build` (genererar kategorisidorna) innan sajten publiceras som statiska filer.
3. Klart – ingen serverdel, inga miljövariabler krävs för grundfunktionaliteten.

## Nästa steg (inte byggt än)

- **Riktiga affiliate-partnerskap**: koppla på faktiska affiliate-ID:n i `affiliateUrl`.
- **Klickspårning**: logga klick i `go/index.html` (t.ex. till ett enkelt analytics-verktyg) för att se vilka verktyg som konverterar.
- **Nyhetsbrev**: quizets e-postopt-in sparas idag bara i `localStorage` som platshållare – koppla på en riktig leverantör (t.ex. Resend) för faktiska utskick.
- **Fler kategorier/verktyg**: strukturen är byggd för att skala – lägg till i `data/tools.json` och `data/categories.json` enligt ovan.
- **SEO-förbättringar**: strukturerad data (JSON-LD), sitemap.xml, och server-renderad header/footer istället för klient-injicerad (för bättre indexering utan JS).
