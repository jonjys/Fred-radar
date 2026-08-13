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

## Affiliate-länkar, tracking &amp; disclosure

**Alla utgående länkar går via `/go/`** – både primära "Besök X"-knappar och sekundära "Webbplats"-länkar, på index, kategorisidor och quizresultat. Ingen HTML-fil länkar direkt till en leverantörs domän. `go/index.html`:

1. Slår upp verktyget i `data/tools.json` och väljer `affiliateUrl` (eller `website` som fallback om verktyget saknar affiliatelänk).
2. Sätter alltid egna UTM-parametrar (`utm_source=radar`, `utm_medium=affiliate|referral` beroende på `hasAffiliateProgram`, `utm_campaign=<kategori>`, `utm_content=<tool-id>`, `utm_term=<src>`) **ovanpå** eventuella leverantörsspecifika spårningsparametrar (`?fpr=`, `?sdid=`, `?ref=` …) – de skriver inte över varandra.
3. Vidarebefordrar besökaren, med en kort synlig "Skickar dig vidare …"-mellansida.

Varje länk skickar med en `src`-parameter (`index`, `kategori`, `kategori-website`, `quiz`) som hamnar i `utm_term`, så det går att se i efterhand *var på sajten* ett klick kom ifrån – inte bara vilket verktyg.

**Disclosure – två lager, enligt marknadsföringslagens krav på tydlig märkning av reklam:**
- En kort rad direkt under varje verktygskort: *"Annonslänk – Radar kan få provision om du köper via länken."* (`.ad-note` i `assets/css/style.css`) – tydlig i direkt anslutning till länken, men diskret till formatet.
- En utförligare disclosure i footern på varje sida (`assets/js/partials.js`).

**Framtida klickloggning:** eftersom alla klick redan går via `/go/`, är det den enda platsen som behöver ändras för att lägga till riktig loggning – t.ex. ett `navigator.sendBeacon("/api/click", …)`-anrop. Platsen är kommenterad direkt i `go/index.html`. Inget i `index.html`, `quiz.js` eller kategorisidorna behöver röras.

**Testa flödet:** tre verktyg har redan realistiska (men falska) affiliate-spårningskoder för att `/go/` ska gå att testa end-to-end – `jasper` (`?fpr=...`), `adobe-firefly` (`?sdid=...`) och `notion-ai` (`?ref=...`). Övriga verktyg har `affiliateUrl` satt till samma URL som `website` tills vidare (de får ändå `utm_medium=referral` istället för `affiliate` automatiskt, baserat på `hasAffiliateProgram`).

### Bäst placerade att skaffa riktiga affiliate-avtal för först

Baserat på en snabb research (augusti 2026, se källor nedan) av vilka verktyg som har högst uppgiven provision **och** löpande (recurring) intäkt – exakta villkor varierar mellan tredjepartskataloger och kan skilja sig från vad som gäller när man faktiskt blir godkänd, så bekräfta alltid siffrorna direkt hos leverantören innan ni räknar på intäkter:

| # | Verktyg | Kategori | Uppgiven provision | Recurring? | `affiliateUrl` i tools.json |
|---|---|---|---|---|---|
| 1 | Copy.ai | ai-writing | ~45% | Ja (12 mån–livstid, källor går isär) | ❌ **Saknas** – pekar fortfarande på `website` |
| 2 | ClickUp AI | produktivitet | Upp till 30% (nivåbaserat) | Ja | ❌ **Saknas** |
| 3 | Rytr | ai-writing | 30% | Ja (senaste källor: 12 mån) | ❌ **Saknas** |
| 4 | Writesonic | ai-writing | 20% officiellt (tredje part uppger 30–40%) | Ja, 12 mån | ❌ **Saknas** |
| 5 | Jasper | ai-writing | 25% (upp till 30% för toppaffiliates) | Ja, 12 mån | ✅ Klart (placeholder-spårkod satt) |
| 6 | Adobe Firefly | ai-image | 85% av första månaden, lägre vid förnyelse | Delvis | ✅ Klart (placeholder-spårkod satt) |

**Prioritetsordning för att fylla i riktiga länkar:** Copy.ai, ClickUp AI och Rytr saknar helt affiliate-koppling idag och har de högsta uppgivna provisionerna – störst sannolik avkastning för minsta insats. Writesonic är fjärde eftersom den officiella siffran (20%) är lägre än vad tredjepartskataloger uppger.

Sources:
- [Copy.ai Affiliate Program Breakdown: 45% Lifetime Recurring Commission](https://tommyhauer.nl/copy-ai-affiliate-program-breakdown-45-lifetime-recurring-commission/)
- [Writesonic Affiliate Program – officiell sida](https://writesonic.com/affiliate)
- [Rytr Affiliates – officiell sida](https://rytr.me/affiliates)
- [Jasper Affiliate Program: Complete 2026 Guide](https://blog.contentgorilla.co/jasper-affiliate-program-complete-2026-guide-commissions/)
- [ClickUp Affiliate Program – officiell sida](https://clickup.com/partners/affiliates)
- [Adobe Affiliate Marketing – officiell sida](https://www.adobe.com/affiliates.html)

**Innan launch:** ersätt placeholder-URL:erna i `affiliateUrl` med riktiga affiliate-länkar när partnerprogram är på plats, och sätt `hasAffiliateProgram: true/false` korrekt per verktyg.

## GDPR-bedömningar – viktig brasklapp

Fälten `gdpr.score` och `gdpr.notes` i `tools.json` är redaktionella, generella bedömningar baserade på offentligt tillgänglig information om respektive leverantörs datahantering – **inte juridisk rådgivning**, och inte verifierade av jurist. Skalan (1–5) är genomgången för intern konsekvens (se nedan) men bygger på min tolkning av leverantörernas egna sidor, inte en formell DPA-granskning:

- **5** – EU-baserat bolag, EU-datalagring som standard (idag bara Sana).
- **4** – EU-datalagring finns som tydligt, etablerat alternativ (t.ex. för Enterprise-kunder), eller bolaget är EU-domicilierat men mindre/mindre dokumenterat än en 5:a.
- **3** – DPA och/eller standardavtalsklausuler (SCC) finns, men ingen tydlig EU-datalagring för vanliga kunder.
- **2** – Amerikanskt/utomeuropeiskt bolag utan tydligt dokumenterad EU-hantering, ofta mindre leverantör med begränsad enterprise-dokumentation.

**Innan ni marknadsför GDPR-vänlighet aggressivt** (t.ex. i annonser eller riktade utskick till företagskunder) – låt en jurist eller GDPR-kunnig person stämma av bedömningarna mot leverantörernas faktiska, aktuella DPA-avtal. Fel eller inaktuell information om GDPR-efterlevnad är ett område där felaktiga påståenden kan få juridiska konsekvenser, till skillnad från t.ex. en optimistisk prisuppgift.

## Utveckling lokalt

```bash
npm run build      # genererar kategorisidorna från data/tools.json
npm run serve       # startar en statisk lokal server (kräver att build körts)
```

Sajten använder absoluta sökvägar (`/assets/...`, `/data/...`) så den måste köras via en lokal server – att öppna filerna direkt i webbläsaren (`file://`) fungerar inte.

## Deploy (Vercel)

Repot kräver ingen extra konfiguration – `vercel.json` + `package.json` gör hela jobbet. Verifierat lokalt: `npm run build` körs felfritt från en ren clone och `kategori/*.html` regenereras byte-för-byte identiskt med det som redan är committat, så byggsteget är säkert att lita på i produktion.

**Från noll till live-URL:**

1. **Importera repot i Vercel** (Dashboard → Add New → Project → välj `jonjys/Fred-radar`). Vercel identifierar det som ett statiskt projekt – ingen framework-preset behövs.
2. Vercel läser `vercel.json` automatiskt: `buildCommand: npm run build` (regenererar kategorisidorna) och `outputDirectory: .`. Inga miljövariabler krävs.
3. Klicka **Deploy**. Klart – du får en live-URL på ~30 sekunder.

**Om projektet redan är importerat** (som ni redan gjort): kontrollera bara två saker i Vercel-projektets inställningar under **Settings → Git**:

- **Production Branch** – sätt den till den branch ni vill ska vara "live" (t.ex. `main`). Pushar till andra branches (som denna: `claude/radar-quiz-ranking-rhhmf8`) skapar automatiskt en **Preview-deploy** med egen URL under fliken **Deployments** i Vercel – bra för att testa innan ni pekar produktions-URL:en dit.
- Så fort ni är nöjda: merga branchen till er produktionsbranch, eller ändra Production Branch i Vercel-inställningarna – nästa push bygger och publicerar automatiskt.

Ingen serverdel, ingen databas, inga API-nycklar – statisk hosting räcker för hela sajten som den ser ut idag.

## Status inför launch – vad saknas innan vi kör trafik

Kort sammanfattning, se respektive avsnitt ovan för detaljer:

| Klart ✅ | Saknas innan riktig trafik ⚠️ |
|---|---|
| Quiz + viktad ranking | Riktiga affiliate-avtal (bara 2 av 12 möjliga verktyg har riktiga koder – se tabellen ovan, resten är fortfarande `website`-fallback) |
| Alla utgående länkar via `/go/`, inkl. sekundärlänkar | Riktig klickloggning (extension point finns i `go/index.html`, men inget lagras ännu) |
| UTM-spårning per klick/kanal | Nyhetsbrev – e-postopt-in i quizet sparas bara i `localStorage`, går ingenstans |
| Annonsdisclosure (kort + footer) | Juridisk genomgång av GDPR-bedömningarna i `tools.json` (redaktionella, inte verifierade av jurist – se brasklappen ovan) |
| Deploy-konfiguration (Vercel, `npm run build`) | SEO: ingen sitemap.xml, ingen strukturerad data (JSON-LD), header/footer renderas klientsidan (dåligt för indexering utan JS) |
| Mobilanpassat, mörkt tema | Analytics överhuvudtaget (t.ex. Vercel Analytics eller Plausible) för att se trafik, inte bara klick |

**Kortaste vägen till en "riktig men liten" launch:** fyll i affiliate-länkarna för Copy.ai, ClickUp AI och Rytr (högst prioritet enligt tabellen ovan), sätt Production Branch i Vercel, och kör en första trafikkälla (t.ex. en Reddit-tråd eller ett LinkedIn-inlägg) – resten (klickloggning, nyhetsbrev, SEO) går att lägga till löpande utan att blockera launch.

## Nästa steg (inte byggt än)

- **Riktiga affiliate-partnerskap**: koppla på faktiska affiliate-ID:n i `affiliateUrl` (se prioritetsordning ovan).
- **Klickspårning**: koppla en riktig endpoint till kommentaren i `go/index.html` (t.ex. en Vercel-funktion eller ett tredjepartsverktyg).
- **Nyhetsbrev**: quizets e-postopt-in sparas idag bara i `localStorage` som platshållare – koppla på en riktig leverantör (t.ex. Resend) för faktiska utskick.
- **Fler kategorier/verktyg**: strukturen är byggd för att skala – lägg till i `data/tools.json` och `data/categories.json` enligt ovan.
- **SEO-förbättringar**: strukturerad data (JSON-LD), sitemap.xml, och server-renderad header/footer istället för klient-injicerad (för bättre indexering utan JS).
