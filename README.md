# Fred-Radar

Smarta rekommendationer & jämförelser av AI- och produktivitetsverktyg – anpassat för svenska och nordiska användare.

**Live:** https://fred-radar.vercel.app  
**Repo:** https://github.com/jonjys/Fred-radar

Fred-Radar är en statisk sajt (HTML/CSS/vanilla JS, ingen backend) som:

- viktar ett 6-frågors quiz mot verktygsdata för att ge en personlig ranking,
- genererar kategorisidor, alternativ-sidor och sitemap automatiskt från `data/tools.json`,
- samlar alla utgående affiliate-länkar på `/go/` med UTM och disclosure,
- är förberedd för deploy på Vercel.

## Gör detta nu (människa)

1. Koppla Vercel-projektet till detta GitHub-repo (Connect Git) om det inte redan är gjort.
2. Sätt Production Branch till `master` (eller `main`).
3. Deploya: `npx vercel --prod` eller låt Vercel auto-deploya vid push.
4. Ansök affiliate-koder (Make, ClickUp AI, Reclaim.ai först).
5. Byt `siteUrl` i `data/site.json` när egen domän är klar → `npm run build`.

## Struktur (kort)

```
├── index.html, quiz.html, basta.html, alternativ.html, 404.html
├── kategori/          # genererade kategorisidor
├── alternativ/        # 21 SEO-sidor (en per verktyg)
├── data/tools.json    # enda källan till sanning
├── assets/js/         # partials, quiz, tool-cards
└── scripts/           # generate-kategori, generate-alternativ, generate-sitemap
```

`npm run build` kör alla generatorer. Kör alltid innan commit.

---

│   ├── categories.json           # Kategorier (namn, ikon, beskrivning)
│   └── site.json                 # Domän, analytics- och nyhetsbrevskonfiguration
├── assets/
│   ├── css/style.css             # Delat mörkt designsystem
│   └── js/
│       ├── partials.js           # Injicerar header/footer på alla sidor
│       ├── tool-card-template.js # Enda källan för hur ett "tool-card" ser ut
│       ├── tools-data.js         # Hämtar tools.json/categories.json i klienten
│       ├── quiz.js               # Quizlogik, viktad poängsättning, nyhetsbrevs-POST
│       ├── kategori.js           # Sortering/filtrering på kategorisidorna
│       └── analytics.js          # Privacy-vänlig analytics-loader, av som standard
├── scripts/
│   ├── generate-kategori.js      # Genererar kategori/*.html från data/tools.json
│   ├── generate-sitemap.js       # Genererar sitemap.xml + robots.txt från data/site.json
│   └── template-kategori.html    # Layout-mallen generatorn fyller i
├── package.json
└── vercel.json
```

## Så hänger det ihop

**`data/tools.json` är den enda källan till sanning.** Allt annat läser därifrån:

- `quiz.js` hämtar filen i klienten och räknar ut en viktad ranking.
- `index.html` hämtar filen för att visa kategorier och utvalda verktyg.
- `scripts/generate-kategori.js` läser filen vid byggtillfället och skriver ut statisk HTML till `kategori/*.html`, inklusive JSON-LD.
- `scripts/generate-sitemap.js` läser `data/categories.json` + `data/site.json` och skriver `sitemap.xml`/`robots.txt`.

Kortmarkeringen (`.tool-card`) är definierad **en gång**, i `assets/js/tool-card-template.js`, och delas mellan webbläsaren (`window.ToolCardTemplate`) och Node-generatorn (`module.exports`) – så genererade kategorisidor kan aldrig hamna i otakt med korten som renderas dynamiskt på index/quiz.

`npm run build` kör **båda** generatorerna (`build:kategori` + `build:sitemap`) i rätt ordning. Kör alltid detta – inte bara ett av delstegen – innan du committar ändringar i `data/`.

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
     "affiliateUrl": "https://exempel.se/?ref=radar-pending",
     "hasAffiliateProgram": true,
     "affiliateStatus": "placeholder",
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

   `id` måste vara unikt och URL-vänligt (a-ö, bindestreck) – det används i `/go/?tool=<id>` och som ankarlänk på kategorisidan. `categories` kan innehålla flera kategori-id:n om verktyget passar i mer än en (se t.ex. `canva-magic-media`). `affiliateStatus` ska vara `"placeholder"` om `hasAffiliateProgram` är `true` men länken inte är verifierad/riktig än, annars `"no-public-program"`.

2. **Kör generatorn:**

   ```bash
   npm run build
   ```

   Detta skriver om `kategori/*.html` och `sitemap.xml` så det nya verktyget dyker upp, sorterat efter `score`.

3. **Committa** `data/tools.json` och alla omgenererade filer (`kategori/*.html`, `sitemap.xml`, `robots.txt`).

Det är allt – verktyget syns nu automatiskt på rätt kategorisida, tas med i quizets viktade ranking, och kan dyka upp bland "Utvalda verktyg" på startsidan om du sätter `"featured": true`.

Vercel kör dessutom `npm run build` automatiskt vid varje deploy (se `vercel.json`), så genererade filer byggs alltid om från senaste data – men de är även committade så sajten fungerar direkt utan byggsteg om man föredrar det. **Kör alltid `npm run build` lokalt innan du committar** – annars kan de committade filerna hamna i otakt med mallarna (det har hänt en gång under den här sessionen, se git-historiken).

## Lägga till en ny kategori

1. Lägg till kategorin i `data/categories.json`.
2. Tagga relevanta verktyg i `data/tools.json` med kategorins `id` i fältet `categories`.
3. Lägg till en länk till kategorin i `assets/js/partials.js` (`CATEGORIES`-listan) så den syns i navigationen.
4. Kör `npm run build`.

## Quizets poängsättning

Se `assets/js/quiz.js` → `scoreTool()`. Kort sammanfattning:

| Fråga | Effekt på poängsättningen |
|---|---|
| Syfte | Filtrerar bort verktyg utanför vald kategori (om inte "vet inte") |
| Budget | Straffar verktyg som är dyrare än angiven budget, skalande med hur mycket dyrare |
| GDPR-vikt | Multiplicerar verktygets GDPR-poäng med en viktfaktor baserat på hur viktigt användaren sa att det var |
| Teknisk nivå | Bonus om verktygets svårighetsgrad matchar användarens nivå, avdrag vid stor mismatch |
| Prioritet | Ger extra vikt åt den delpoäng (pris/kvalitet/enkelhet/GDPR/support) användaren valde som viktigast |
| E-postuppdateringar | Påverkar inte rankingen – styr bara om e-postfältet visas och om adressen POSTas vidare (se [Nyhetsbrev](#nyhetsbrev)) |

Resultatet visar de tre högst rankade verktygen med en kort, konkret motivering ("Varför vi rekommenderar det") som pekar på vilka av ovanstående faktorer som slog igenom. Formeln är testad efter varje datauppdatering under den här sessionen (senast: 20 verktyg, 9 i produktivitet) och ger fortsatt stabila, rimliga resultat.

## Affiliate-länkar, tracking &amp; disclosure

**Alla utgående länkar går via `/go/`** – både primära "Besök X"-knappar och sekundära "Webbplats"-länkar, på index, kategorisidor och quizresultat. Ingen HTML-fil länkar direkt till en leverantörs domän. `go/index.html`:

1. Slår upp verktyget i `data/tools.json` och väljer `affiliateUrl` (eller `website` som fallback om verktyget saknar affiliatelänk).
2. Sätter alltid egna UTM-parametrar (`utm_source=radar`, `utm_medium=affiliate|referral` beroende på `hasAffiliateProgram`, `utm_campaign=<kategori>`, `utm_content=<tool-id>`, `utm_term=<src>`) **ovanpå** eventuella leverantörsspecifika spårningsparametrar (`?fpr=`, `?sdid=`, `?ref=` …) – de skriver inte över varandra.
3. Loggar klicket (se nedan) och vidarebefordrar besökaren, med en kort synlig "Skickar dig vidare …"-mellansida.

Varje länk skickar med en `src`-parameter (`index`, `kategori`, `kategori-website`, `quiz`) som hamnar i `utm_term`, så det går att se i efterhand *var på sajten* ett klick kom ifrån – inte bara vilket verktyg.

**Klickloggning:** varje klick loggas redan idag till webbläsarkonsolen (`console.debug`) och till `localStorage` (nyckel `radar_click_log`, senaste 200 klick) – inspektera med `JSON.parse(localStorage.getItem("radar_click_log"))` i DevTools. Uppgradera till riktig loggning genom att lägga till `navigator.sendBeacon("/api/click", ...)` i `logClick()`-funktionen i `go/index.html` – enda filen som behöver ändras.

**Disclosure – tre lager, enligt marknadsföringslagens krav på tydlig märkning av reklam:**
- En kort rad direkt under **varje** verktygskort, på index, kategorisidor och quizresultat: *"Annonslänk – vi kan få provision. Påverkar inte priset eller rankingen."* (`.ad-note` i `assets/css/style.css`) – tydlig i direkt anslutning till länken, men diskret till formatet.
- En disclosure-box högst upp på varje kategorisida.
- En utförligare disclosure i footern på varje sida (`assets/js/partials.js`).

### Status just nu: 14 av 20 verktyg har en (placeholder-)affiliatelänk

`affiliateStatus` i `tools.json` säger exakt var varje verktyg står:

- **`"placeholder"`** (14 verktyg) – programmet finns bekräftat, men länken innehåller ännu ingen riktig, godkänd spårkod. Tre av dem (`jasper`, `adobe-firefly`, `notion-ai`) har leverantörsspecifika parameterformat ifyllda (`?fpr=`, `?sdid=`, `?ref=`) som bara behöver bytas mot er egen kod. Övriga elva har `?ref=radar-pending` som en tydlig markör att koden saknas.
- **`"no-public-program"`** (6 verktyg) – ChatGPT Plus, Claude Pro, Midjourney, Leonardo.Ai (programmet stängdes april 2026, se nedan), Microsoft Designer, Sana. Ingen känd affiliate-möjlighet hittad vid research – dessa länkar går till `website` med bara UTM-spårning (`utm_medium=referral`), aldrig `affiliate`.

### Prioritetsordning för att fylla i riktiga länkar

Baserat på research (augusti 2026, se källor nedan) av vilka verktyg som har högst uppgiven provision **och** löpande (recurring) intäkt. Exakta villkor varierar mellan tredjepartskataloger och kan skilja sig från vad som gäller när man faktiskt blir godkänd – bekräfta alltid siffrorna direkt hos leverantören innan ni räknar på intäkter:

| # | Verktyg | Kategori | Uppgiven provision | Recurring? | Ansök här |
|---|---|---|---|---|---|
| 1 | Copy.ai | ai-writing | ~45% | Ja (12 mån–livstid, källor går isär) | Ingen officiell ansökningssida hittad – kontakta Copy.ai direkt eller sök via en affiliatekatalog |
| 2 | Make | produktivitet | 35% i 12 månader | Ja | [make.com/en/affiliate](https://www.make.com/en/affiliate) |
| 3 | ClickUp AI | produktivitet | Upp till 30% (nivåbaserat) | Ja | [clickup.com/partners/affiliates](https://clickup.com/partners/affiliates) |
| 4 | Rytr | ai-writing | 30% | Ja (senaste källor: 12 mån) | [rytr.me/affiliates](https://rytr.me/affiliates) |
| 5 | Reclaim.ai | produktivitet | 40% i 12 mån + $1/signup | Ja | [reclaim.ai/affiliate-program](https://reclaim.ai/affiliate-program) |
| 6 | Writesonic | ai-writing | 20% officiellt (tredje part uppger 30–40%) | Ja, 12 mån | [writesonic.com/affiliate](https://writesonic.com/affiliate) |
| 7 | Jasper | ai-writing | 25% (upp till 30%) | Ja, 12 mån | ✅ Placeholder-kod redan satt, byt till er riktiga |
| 8 | Adobe Firefly | ai-image | 85% av första månaden | Delvis | ✅ Placeholder-kod redan satt, byt till er riktiga |
| 9 | Akiflow | produktivitet | 14% recurring, upp till $50/referral | Ja | [akiflowpartners.tapfiliate.com](https://akiflowpartners.tapfiliate.com/) |
| 10 | Motion | produktivitet | $75/kund eller ~25% första betalning | Nej/delvis | [affiliate.usemotion.com](https://affiliate.usemotion.com/) |
| 11 | Canva Magic Media | ai-image/produktivitet | 80% första 2 månaderna (månadsplan) | Delvis | Ansök via [Impact](https://impact.com) – sök efter Canva |
| 12 | Ideogram | ai-image | Ej publikt – "Creators Club", ansökningsbaserat | Okänt | [ideogram.ai/features/creators-club](https://ideogram.ai/features/creators-club/) |
| 13 | Zapier | produktivitet | 15–25% (varierar, partnerprogram) | Ja | [zapier.com/partners](https://zapier.com/partners) – ansökningsbaserat, ej självservice |
| 14 | Notion AI | produktivitet | Ej offentligt specificerad | Okänt | ✅ Placeholder-kod redan satt, byt till er riktiga |

**Kortaste vägen till mest intäkt snabbast:** Copy.ai, Make och ClickUp AI har högst uppgiven provision och saknar helt riktig koppling idag – störst sannolik avkastning för minsta insats.

Sources:
- [Copy.ai Affiliate Program Breakdown: 45% Lifetime Recurring Commission](https://tommyhauer.nl/copy-ai-affiliate-program-breakdown-45-lifetime-recurring-commission/)
- [Make Affiliate Program – officiell sida](https://www.make.com/en/affiliate)
- [ClickUp Affiliate Program – officiell sida](https://clickup.com/partners/affiliates)
- [Rytr Affiliates – officiell sida](https://rytr.me/affiliates)
- [Reclaim.ai Affiliate Program – officiell sida](https://reclaim.ai/affiliate-program)
- [Writesonic Affiliate Program – officiell sida](https://writesonic.com/affiliate)
- [Jasper Affiliate Program: Complete 2026 Guide](https://blog.contentgorilla.co/jasper-affiliate-program-complete-2026-guide-commissions/)
- [Adobe Affiliate Marketing – officiell sida](https://www.adobe.com/affiliates.html)
- [Akiflow affiliate signup (Tapfiliate)](https://akiflowpartners.tapfiliate.com/)
- [Motion Affiliate Resource Center](https://affiliate.usemotion.com/)
- [Canva Affiliate Program via Impact](https://bloggingtips.com/canva-affiliate-program/)
- [Ideogram Creators Club](https://ideogram.ai/features/creators-club/)
- [Leonardo.Ai affiliate program – bekräftat stängt april 2026](https://intercom.help/leonardo-ai/en/articles/9057851-affiliate-program-faq)

**Så byter du en placeholder mot en riktig länk:** ersätt `affiliateUrl` för verktyget i `data/tools.json` med er godkända spårlänk, sätt `affiliateStatus` till `"live"` (nytt värde – används inte av kod ännu, men håller data ärlig), kör `npm run build`, committa.

## GDPR-bedömningar – viktig brasklapp

Fälten `gdpr.score` och `gdpr.notes` i `tools.json` är redaktionella, generella bedömningar baserade på offentligt tillgänglig information om respektive leverantörs datahantering – **inte juridisk rådgivning**, och inte verifierade av jurist. Skalan (1–5) är genomgången för intern konsekvens men bygger på min tolkning av leverantörernas egna sidor, inte en formell DPA-granskning:

- **5** – EU-baserat bolag, EU-datalagring som standard (idag bara Sana).
- **4** – EU-datalagring finns som tydligt, etablerat alternativ (t.ex. för Enterprise-kunder), eller bolaget är EU-domicilierat men mindre/mindre dokumenterat än en 5:a (Adobe, Canva, Microsoft Designer, Akiflow, Make).
- **3** – DPA och/eller standardavtalsklausuler (SCC) finns, men ingen tydlig EU-datalagring för vanliga kunder.
- **2** – Amerikanskt/utomeuropeiskt bolag utan tydligt dokumenterad EU-hantering, ofta mindre leverantör med begränsad enterprise-dokumentation.

**Innan ni marknadsför GDPR-vänlighet aggressivt** (t.ex. i annonser eller riktade utskick till företagskunder) – låt en jurist eller GDPR-kunnig person stämma av bedömningarna mot leverantörernas faktiska, aktuella DPA-avtal. Fel eller inaktuell information om GDPR-efterlevnad är ett område där felaktiga påståenden kan få juridiska konsekvenser, till skillnad från t.ex. en optimistisk prisuppgift.

## SEO

- **`sitemap.xml` och `robots.txt`** genereras av `scripts/generate-sitemap.js` från `data/site.json` (`siteUrl`) + `data/categories.json`, körs som en del av `npm run build`. `robots.txt` blockerar `/go/` (ren redirect-nytta, inget att indexera) och pekar på sitemapen.
- **JSON-LD:** `WebSite`-schema med en `SearchAction` mot quizet på `index.html`; `CollectionPage` + `ItemList` av `SoftwareApplication` på varje kategorisida, genererat från samma `tools.json`-data som korten. Medvetet **ingen** `AggregateRating`/`Review`-schema – vi har inga riktiga användarrecensioner, och att fabricera betyg strider mot Googles riktlinjer för strukturerad data.
- **Open Graph + Twitter Card:** title/description/type/url/locale på alla sidor, unika per sida (inte kopierade från startsidan).
- **Saknas fortfarande:** en riktig OG-bild (1200×630 px) – just nu finns ingen `og:image`-tagg, vilket ger en sämre förhandsvisning vid delning i sociala medier. Lägg till en bild i `/assets/og-image.png` och en `og:image`-tagg när ni har en designad bild.

## Nyhetsbrev

Quizets e-postopt-in (sista frågan) gör två saker vid varje inskickad adress:

1. **Sparar alltid lokalt** i `localStorage` (nyckel `radar_email_signups`) – fungerar direkt, ingen konfiguration krävs, men adresserna finns bara i respektive besökares egen webbläsare tills ni kopplar på en riktig leverantör.
2. **POST:ar till `data/site.json` → `newsletter.endpoint`** om den är ifylld (default: tom, gör ingenting). Tre leverantörer accepterar direkta POST-anrop från klienten utan egen backend:

   | Leverantör | `endpoint`-värde | Extra kod som krävs |
   |---|---|---|
   | Buttondown | `https://buttondown.com/api/emails/embed-subscribe/<ditt-username>` | Ingen |
   | ConvertKit | `https://api.convertkit.com/v3/forms/<FORM_ID>/subscribe` | Lägg till er publika `api_key` i body i `submitToNewsletterProvider()` i `quiz.js` |
   | Loops.so | `https://app.loops.so/api/newsletter-form/<FORM_ID>` | Ingen |

   Resend har **ingen** publik klient-endpoint (kräver en hemlig API-nyckel) – för Resend behövs en liten Vercel-funktion (`api/subscribe.js`) som proxy med `RESEND_API_KEY` som miljövariabel; sätt då `endpoint` till `"/api/subscribe"` istället för en extern URL.

## Analytics

`assets/js/analytics.js` är en privacy-vänlig loader, **av som standard** (verifierat: fyller inga nätverksanrop till Plausible/Fathom när `enabled: false`). Aktivera genom att i `data/site.json` sätta:

```json
"analytics": { "provider": "plausible", "domain": "fred-radar.vercel.app", "enabled": true }
```

Ingen kodändring, ingen miljövariabel, bara ett datafält. Byt `"provider"` till `"fathom"` för Fathom (då är `"domain"` egentligen Fathoms site-ID). Vercel Analytics är en separat integration (kräver `@vercel/analytics`-paketet) och hanteras inte av den här filen – lägg till separat om ni hellre vill använda den.

## Utveckling lokalt

```bash
npm run build      # genererar kategorisidor + sitemap.xml + robots.txt från data/
npm run serve       # startar en statisk lokal server (kräver att build körts)
```

Sajten använder absoluta sökvägar (`/assets/...`, `/data/...`) så den måste köras via en lokal server – att öppna filerna direkt i webbläsaren (`file://`) fungerar inte.

## Deploy (Vercel)

Repot kräver ingen extra konfiguration – `vercel.json` + `package.json` gör hela jobbet. Verifierat lokalt flera gånger under kvällen: `npm run build` körs felfritt från en ren clone och genererade filer (`kategori/*.html`, `sitemap.xml`, `robots.txt`) blir byte-för-byte identiska med det som redan är committat, så byggsteget är säkert att lita på i produktion.

**Från noll till live-URL:**

1. **Importera repot i Vercel** (Dashboard → Add New → Project → välj `jonjys/Fred-radar`). Vercel identifierar det som ett statiskt projekt – ingen framework-preset behövs.
2. Vercel läser `vercel.json` automatiskt: `buildCommand: npm run build` och `outputDirectory: .`. **Inga miljövariabler krävs** för grundfunktionaliteten (analytics/nyhetsbrev är valfria JSON-fält, inte env vars).
3. Klicka **Deploy**. Klart – du får en live-URL på under en minut.

**Om projektet redan är importerat** (som ni redan gjort): kontrollera två saker i Vercel-projektets inställningar under **Settings → Git**:

- **Production Branch** – sätt den till den branch ni vill ska vara "live" (t.ex. `main`). Pushar till andra branches (som denna: `claude/radar-quiz-ranking-rhhmf8`) skapar automatiskt en **Preview-deploy** med egen URL under fliken **Deployments** i Vercel – bra för att testa innan ni pekar produktions-URL:en dit.
- Så fort ni är nöjda: merga branchen till er produktionsbranch, eller ändra Production Branch i Vercel-inställningarna – nästa push bygger och publicerar automatiskt.
- Vill ni deploya manuellt från terminalen istället: `npx vercel --prod` från repo-roten (kräver att ni är inloggade med `npx vercel login` och att projektet redan är kopplat, vilket det är sedan importen).

Ingen serverdel, ingen databas, inga API-nycklar krävs – statisk hosting räcker för hela sajten som den ser ut idag.

## Status inför launch – vad saknas innan vi kör trafik

| Klart ✅ | Saknas innan riktig trafik ⚠️ |
|---|---|
| Quiz + viktad ranking (20 verktyg, testad stabil efter varje datauppdatering) | Riktig produktionsdomän i `data/site.json` (idag placeholder) |
| Alla utgående länkar via `/go/`, inkl. sekundärlänkar, med UTM-spårning | Riktiga affiliate-koder för fler än 3 av 14 möjliga verktyg (se prioritetstabell) |
| Klickloggning (console + localStorage, redo att uppgraderas med en rad) | Klickloggning kopplad till en riktig backend/endpoint |
| Nyhetsbrevs-POST (kod klar, väntar på en riktig leverantörs-endpoint) | Ett faktiskt nyhetsbrevskonto (Buttondown/ConvertKit/Loops/Resend) |
| Analytics-loader (kod klar, av som standard) | Ett faktiskt analytics-konto (Plausible/Fathom/Vercel Analytics) |
| Disclosure i tre lager (kort, kategorisida, footer) | Juridisk genomgång av GDPR-bedömningarna i `tools.json` |
| sitemap.xml, robots.txt, JSON-LD, OG-taggar, unika title/description | En riktig OG-bild (1200×630) för sociala delningar |
| Deploy-konfiguration (Vercel, `npm run build`), verifierat deterministisk | Production Branch måste sättas i Vercel-dashboarden manuellt |
| Mobilanpassat, mörkt tema | – |

## Nästa steg (inte byggt än)

- **Fler riktiga affiliate-partnerskap**: koppla på faktiska affiliate-ID:n i `affiliateUrl` (se prioritetsordning ovan).
- **Klickspårning till en riktig backend**: en Vercel-funktion eller tredjepartsverktyg som tar emot `navigator.sendBeacon`-anropet.
- **Riktigt nyhetsbrevskonto**: koppla `data/site.json` → `newsletter.endpoint` till Buttondown/ConvertKit/Loops (eller en Vercel-funktion för Resend).
- **Riktigt analyticskonto**: fyll i `data/site.json` → `analytics.domain` + `enabled: true`.
- **OG-bild**: designa en 1200×630 px-bild och lägg till `og:image`-taggar.
- **Fler kategorier/verktyg**: strukturen är byggd för att skala – lägg till i `data/tools.json` och `data/categories.json` enligt ovan.
- **Server-renderad header/footer**: header/footer injiceras via JS idag (`partials.js`), vilket är svagare för sökmotorer utan JS-rendering än server-side HTML. Fungerar för Google idag men är en framtida förbättring.
