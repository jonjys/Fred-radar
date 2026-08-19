# Radar

**Radar finns för att göra det enkelt och ärligt att välja rätt AI-verktyg — utan att gissa, utan att lita på sponsrade "bäst i test"-listor, och utan att behöva vara jurist för att veta om ett verktyg är tryggt att använda.**

Målet är en levande rekommendationstjänst för AI- och produktivitetsverktyg, byggd för svenska och nordiska förhållanden — som i stort sett sköter sig själv. Inte ännu en generisk topplista sponsrad av den som betalar mest, utan en plattform som väger kvalitet, pris och dataskydd ärligt, förklarar *varför* den rekommenderar något, och tjänar sina pengar öppet utan att det styr rankingen.

**Vad den ska bli:** det första och mest pålitliga stället en nordisk privatperson eller ett litet företag går till när AI-verktygsdjungeln känns övermäktig — och en verksamhet som växer och underhåller sig själv med minimal manuell insats, där förtroendet den bygger hos användarna är det som driver intäkterna, inte tvärtom.

## Gör detta nu (människa)

Repot är tekniskt klart. Det som återstår kräver ett konto, ett beslut eller en ansökan som bara du kan göra – jag kan inte automatisera något av detta:

1. **Sätt Production Branch i Vercel** (Settings → Git → Production Branch).
2. **Ansök om och fyll i riktiga affiliate-koder** för de 11 verktyg som väntar (prioritetsordning nedan).
3. **Skapa ett analyticskonto** (Plausible eller Fathom) och aktivera det i config.
4. **Skapa ett nyhetsbrevskonto** (Buttondown/ConvertKit/Loops) och koppla det i config.
5. **Peka er riktiga domän** och kör ett kommando för att byta den överallt.

Detaljerad, länkad version av samma fem steg (plus den sista "gå live"-åtgärden) finns i **Launch checklist** direkt nedan – den är den enda sanningen för ordning och detaljer i den här filen. Om något annat avsnitt i README verkar säga något annat, är det den här listan och Launch checklist som gäller.

## Launch checklist

Gör i exakt den här ordningen. Varje steg länkar till avsnittet med detaljer.

1. **[ ] Sätt Production Branch i Vercel** till er faktiska produktionsbranch. Vercel Dashboard → projektet → **Settings → Git → Production Branch**. Se [Deploy](#deploy-vercel) för hela flödet.
2. **[ ] Byt ut de 11 `?ref=radar-pending`-länkarna** mot riktiga, godkända affiliate-koder – en rad per verktyg i `data/tools.json` (`affiliateUrl`), följt av `npm run build`. Prioritetsordning (efter godkännande-svårighet, nordisk relevans och recurring-potential – inte bara högst provision) + direktlänkar till varje programs ansökningssida finns under [Affiliate-länkar](#affiliate-länkar-tracking--disclosure). Börja med Make (lättast godkänt + högst nordisk relevans + recurring).
3. **[ ] Koppla ett analyticskonto** (Plausible eller Fathom) – skapa kontot, sätt sedan `data/site.json` → `analytics.domain` + `analytics.enabled: true`. Se [Analytics](#analytics).
4. **[ ] Koppla nyhetsbrevet** till en riktig leverantör – `data/site.json` → `newsletter.endpoint`. Buttondown/ConvertKit/Loops kräver ingen egen backend. Se [Nyhetsbrev](#nyhetsbrev).
5. **[x] OG-bild** – klar, `assets/og-image.png` (1200×630) är genererad och kopplad på alla sidor. Inget kvar att göra här. Valfritt: byt ut mot en egen designad version (se [OG-bild](#og-bild) för hur) – detta är en framtida förbättring, inte ett launch-krav.
6. **[ ] Byt domän i config** – kör `npm run set-site-url -- https://din-riktiga-domän.se` från repo-roten (ETT kommando, uppdaterar allt automatiskt). Se [Byta produktionsdomän](#byta-produktionsdomän).
7. **[ ] Första trafikkälla** – posta Reddit-utkastet **efter** steg 1 och 6 är klara (branchen är live och länken pekar på rätt domän). Se [Första trafikkälla](#första-trafikkälla) för det färdiga utkastet och exakt timing.

**Innan ni kör steg 1–7:** låt någon GDPR-kunnig stämma av `gdpr`-fälten i `tools.json` om ni tänker marknadsföra GDPR-vänlighet aktivt (se [GDPR-bedömningar](#gdpr-bedömningar--viktig-brasklapp)) – inte blockerande för launch, men bör göras innan ni skalar upp marknadsföringen.

Efter steg 1–7: kör `npm run build` en sista gång, kontrollera att `git status` är rent efteråt (byggsteget ska vara deterministiskt), committa, pusha. Allt annat (fler verktyg, riktig klickloggning till en backend, SEO-finslipning) kan läggas till löpande efter launch utan att blockera den – se [Nästa steg](#nästa-steg-efter-launch-inte-blockerande) längst ner.

## Struktur

```
├── index.html                    # Landningssida
├── quiz.html                     # 6-frågors quiz (logik i assets/js/quiz.js)
├── kategori/                     # Genererade kategorisidor – redigera inte för hand
│   ├── ai-writing.html
│   ├── ai-image.html
│   └── produktivitet.html
├── go/index.html                 # Central redirect för alla utgående/affiliate-länkar
├── sitemap.xml                   # Genererad – redigera inte för hand
├── robots.txt                    # Genererad – redigera inte för hand
├── data/
│   ├── tools.json                # Källa till sanning: alla verktyg
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

### Prioritetsordning för de 11 väntande länkarna

Rankad efter tre kriterier, i den ordningen: **(1) hur enkelt/snabbt ni sannolikt blir godkända**, **(2) hur relevant verktyget är för en svensk/nordisk publik**, **(3) intäktspotential (recurring väger tydligt högre än engångsersättning, oavsett hur hög procentsatsen är)**. Det här är alltså **inte** samma ordning som "högst provision" – ett par verktyg med lägre uppgiven procentsats ligger ändå högre upp för att de är lättare att komma igång med eller passar målgruppen bättre. Exakta villkor varierar mellan tredjepartskataloger och kan skilja sig från vad som faktiskt gäller vid godkännande – bekräfta alltid siffrorna direkt hos leverantören.

| # | Verktyg | Godkännande | Nordisk relevans | Potential | Varför den här platsen |
|---|---|---|---|---|---|
| 1 | **Make** | 🟢 Lätt – självservice-ansökan, [make.com/en/affiliate](https://www.make.com/en/affiliate) | 🟢 Hög – EU-rötter (f.d. tjeckiska Integromat), populärt bland tekniska nordiska team | 🟢 35% recurring i 12 mån | Bäst på alla tre axlar samtidigt – börja här |
| 2 | **ClickUp AI** | 🟢 Lätt – självservice, [clickup.com/partners/affiliates](https://clickup.com/partners/affiliates) | 🟡 Medel – globalt populärt, inte specifikt nordiskt | 🟢 Upp till 30% recurring | Näst enklast att komma igång med, stark recurring |
| 3 | **Reclaim.ai** | 🟢 Lätt – självservice, [reclaim.ai/affiliate-program](https://reclaim.ai/affiliate-program) | 🟡 Medel – kalender/schemaläggning, bred målgrupp | 🟢 40% i 12 mån + bonus/signup | Högst uppgiven procentsats av alla 11, enkel ansökan |
| 4 | **Rytr** | 🟢 Lätt – självservice, [rytr.me/affiliates](https://rytr.me/affiliates) | 🟡 Medel – budgetverktyg, bred men ytlig relevans | 🟢 30% recurring | Enkelt och snabbt, men lägre snittintäkt per kund (billig produkt) |
| 5 | **Copy.ai** | 🟡 Medel – ingen officiell ansökningssida hittad, kräver research/kontakt | 🟡 Medel – generellt AI-skrivverktyg | 🟢 ~45% recurring (högst i listan) | Högst provision totalt, men osäkert exakt hur ni ansöker – räkna med extra tid |
| 6 | **Canva Magic Media** | 🟡 Medel – kräver godkännande via Impact-nätverket, ej direkt självservice | 🟢 Hög – förmodligen det mest använda verktyget i hela listan bland svenska småföretagare | 🟡 80% första 2 månaderna, men **inte** långsiktigt recurring | Enorm varumärkeskännedom väger upp den lite krångligare ansökan – värt besväret |
| 7 | **Akiflow** | 🟡 Medel – Tapfiliate-ansökan, [akiflowpartners.tapfiliate.com](https://akiflowpartners.tapfiliate.com/) | 🟢 Hög – EU-bolag (Italien), bra GDPR-story att kombinera med er egen vinkel | 🟡 14% recurring + upp till $50/referral | EU-vinkeln är värdefull för er positionering, men lägre procentsats och mindre känt varumärke |
| 8 | **Writesonic** | 🟢 Lätt – självservice, [writesonic.com/affiliate](https://writesonic.com/affiliate) | 🟡 Medel – SEO/innehållsverktyg | 🟡 20% officiellt (lägre än de flesta andra) | Enkel ansökan men klart lägre intäktspotential än 1–7 |
| 9 | **Zapier** | 🔴 Svårare – ansökningsbaserat "Solution Partner"-program, inte ren självservice, [zapier.com/partners](https://zapier.com/partners) | 🟢 Hög – mycket välkänt, relevant för nordiska automation-intresserade företag | 🟡 15–25% recurring (varierar) | Stort varumärke men krångligare/långsammare godkännandeprocess |
| 10 | **Motion** | 🟡 Medel – ansökan via [affiliate.usemotion.com](https://affiliate.usemotion.com/), inte tydligt självservice | 🔴 Låg – mest känt i USA, mindre etablerat i Norden | 🔴 ~$75/kund eller ~25% första betalningen – **inte** tydligt recurring | Svagast på både relevans och långsiktig intäkt av de 11 |
| 11 | **Ideogram** | 🔴 Svårast – "Creators Club" riktar sig till innehållsskapare (YouTube/Instagram/TikTok), en jämförelsesajt passar troligen inte profilen lika bra, [ideogram.ai/features/creators-club](https://ideogram.ai/features/creators-club/) | 🟡 Medel – nischat AI-bildverktyg | 🔴 Okänd/ej offentlig provision | Osäkert på alla tre axlar – lägst prioritet |

**Rekommendation:** ansök till **Make, ClickUp AI och Reclaim.ai** först (radgruppen längst upp) – ni kan sannolikt bli godkända för alla tre samma dag, och de täcker både bäst potential och bäst nordisk passform. Jasper, Adobe Firefly och Notion AI (se "Status just nu" ovan) behöver *också* riktiga koder trots att de redan har ett ifyllt länkformat – ansök till dem parallellt, gärna i samma svep som steg 2–3.

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
- **Open Graph + Twitter Card:** title/description/type/url/locale/image på alla sidor, unika per sida (inte kopierade från startsidan). `twitter:card` är `summary_large_image` för en stor förhandsvisningsbild.

## OG-bild

`assets/og-image.png` (1200×630 px, ~210 KB) är klar och kopplad via `og:image`/`twitter:image` på alla sidor – index, quiz och samtliga kategorisidor (kategorisidorna delar samma bild via `{{OG_IMAGE_URL}}` i generatorn, byggt från `data/site.json` → `siteUrl`).

**Vill ni ha en egen, mer polerad bild?** Två sätt:

1. **Redigera källan och rendera om** – `assets/og-image-source.html` är en fristående, självförsörjande HTML-fil (inline CSS, ingen extern font/nätverksberoende) med exakt samma text som hero-sektionen på startsidan. Ändra texten/färgerna där, rendera sedan om till PNG med valfritt verktyg, t.ex. med Chrome/Chromium installerat lokalt:

   ```bash
   google-chrome --headless --disable-gpu --window-size=1200,630 \
     --screenshot=assets/og-image.png assets/og-image-source.html
   ```

   (På Mac: byt `google-chrome` mot sökvägen till Chrome.app, eller använd Playwright/Puppeteer om ni redan har det installerat – rendera med viewport exakt 1200×630 och `deviceScaleFactor: 1`.)

2. **Designa från scratch i Canva eller Figma:**
   - Skapa en ny design med **exakt 1200×630 px**.
   - Håll er till Radars färgpalett: bakgrund `#0b0d12` (nästan svart), accentfärg `#7c9eff` (ljusblå), text `#f2f4f8` (nästan vit), dämpad text `#a2a9ba`.
   - Inkludera logotypen (📡-emoji eller en enkel prick + "Radar"-ordmärke) och en kort rubrik, t.ex. "Hitta rätt AI-verktyg på 60 sekunder".
   - Exportera som PNG, döp filen till `og-image.png`, och lägg den i `/assets/og-image.png` i repot (skriv över den befintliga filen).
   - Inga kodändringar krävs – alla `og:image`-taggar pekar redan på den filen.

## Byta produktionsdomän

Rör inte `data/site.json` → `siteUrl` för hand. Kör istället, från repo-roten:

```bash
npm run set-site-url -- https://din-riktiga-domän.se
```

Det här ETT kommandot (`scripts/set-site-url.js`):

1. Uppdaterar `siteUrl` i `data/site.json`.
2. Ersätter domänen i `index.html` och `quiz.html` – de **enda** handskrivna filerna där domänen är hårdkodad (i `<link rel="canonical">`, OG-taggar, JSON-LD).
3. Kör `npm run build` automatiskt, vilket regenererar `kategori/*.html`, `sitemap.xml` och `robots.txt` – de läser redan `siteUrl` dynamiskt från `data/site.json` och behöver aldrig redigeras för hand.

Verifierat med ett fullständigt rundtursstest (bytt till en testdomän och tillbaka) – korrekt URL-normalisering (inklusive punycode för icke-ASCII-domäner) och `git diff` helt ren efteråt. Kör `git diff` efter kommandot för att se exakt vad som ändrades, committa, pusha.

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
"analytics": { "provider": "plausible", "domain": "radar.se", "enabled": true }
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

## Första trafikkälla

Ett färdigt utkast, redo att kopieras. Föreslagen kanal: **r/foretagande** (svensk subreddit för företagare/soloentreprenörer – naturlig målgrupp för AI-verktygstips) eller motsvarande nordisk Facebook-grupp/LinkedIn. Kolla subredditens regler för självpromotion innan ni postar (de flesta kräver att man är transparent med att man är skaparen, vilket utkastet nedan redan är).

**Rubrik:**

> Byggde ett quiz som rankar AI-verktyg efter GDPR, pris och vad du faktiskt ska göra – inte efter vem som betalar mest

**Brödtext:**

> Hej! Jag har byggt Radar – en liten sajt som jämför AI- och produktivitetsverktyg för svenska/nordiska förhållanden.
>
> Bakgrunden: jag var trött på "bäst i test"-listor som känns sponsrade och som sällan tar upp GDPR eller var datan faktiskt lagras.
>
> Så jag gjorde ett 60-sekunders quiz som viktar rekommendationer efter budget, hur viktigt GDPR är för dig, teknisk nivå och vad du prioriterar mest – och visar *varför* just de verktygen föreslås, inte bara en generisk topplista.
>
> 👉 **[LÄNK TILL /quiz.html – byt ut innan ni postar]**
>
> Sajten är oberoende – vissa länkar är annonslänkar (tydligt märkta), men de påverkar aldrig rankingen. Skulle uppskatta feedback, särskilt om något verktyg saknas eller om någon GDPR-bedömning känns fel!

**Innan ni postar:**
- Byt `[LÄNK TILL /quiz.html]` mot er riktiga URL (Vercel-preview funkar för en första mjuk-launch, men helst er riktiga domän om steg 6 i checklistan är klart).
- Läs igenom subredditens regler – de flesta (inkl. r/foretagande) tillåter transparent "jag byggde det här"-inlägg men inte ren reklam.
- Svara på kommentarer samma dag – tidig respons är det som avgör om ett sånt här inlägg lyfter eller dör tyst.

## Status inför launch – vad saknas innan vi kör trafik

| Klart ✅ | Saknas innan riktig trafik ⚠️ |
|---|---|
| Quiz + viktad ranking (20 verktyg, testad stabil efter varje datauppdatering) | Production Branch måste sättas i Vercel-dashboarden manuellt (checklista steg 1) |
| Alla utgående länkar via `/go/`, inkl. sekundärlänkar, med UTM-spårning – verifierat noll direkta externa länkar kvar | Riktiga, godkända affiliate-koder – **alla 14** verktyg med `affiliateStatus: "placeholder"` behöver en (11 har ingen kod alls ännu, 3 har rätt parameterformat men platshållarvärden) (checklista steg 2) |
| Klickloggning (console + localStorage, redo att uppgraderas med en rad) | Klickloggning kopplad till en riktig backend/endpoint |
| Analytics-loader (kod klar, av som standard) | Ett faktiskt analyticskonto (checklista steg 3) |
| Nyhetsbrevs-POST (kod klar, väntar på en riktig leverantörs-endpoint) | Ett faktiskt nyhetsbrevskonto (checklista steg 4) |
| **OG-bild (1200×630)** – klar, genererad och kopplad överallt | Juridisk genomgång av GDPR-bedömningarna i `tools.json` |
| **Ett-kommandos domänbyte** (`npm run set-site-url`), testat rundtur | Riktig produktionsdomän ännu inte satt (checklista steg 6 – kommandot finns, bara att köra det) |
| sitemap.xml, robots.txt, JSON-LD, OG-taggar, unika title/description | Färdigt utkast till första Reddit-post finns – bara att posta (checklista steg 7) |
| Deploy-konfiguration (Vercel, `npm run build`), verifierat deterministisk | – |
| Mobilanpassat, mörkt tema, verifierat ingen horisontal overflow på 375px | – |

## Nästa steg (efter launch, inte blockerande)

Allt som krävs *för* launch finns i **Gör detta nu (människa)** / **Launch checklist** högst upp i den här filen – den listan är den enda sanningen för vad som återstår innan ni kör trafik. Det som listas här är sådant som medvetet **inte** är byggt, och som inte behöver vara klart för en första, liten launch:

- **Klickspårning till en riktig backend**: en Vercel-funktion eller tredjepartsverktyg som tar emot `navigator.sendBeacon`-anropet (extension point finns redan i `go/index.html`, se [Affiliate-länkar](#affiliate-länkar-tracking--disclosure)).
- **Fler kategorier/verktyg**: strukturen är byggd för att skala – lägg till i `data/tools.json` och `data/categories.json` enligt [Hur man lägger till ett nytt verktyg](#hur-man-lägger-till-ett-nytt-verktyg--steg-för-steg).
- **Server-renderad header/footer**: header/footer injiceras via JS idag (`partials.js`), vilket är svagare för sökmotorer utan JS-rendering än server-side HTML. Fungerar för Google idag men är en framtida förbättring.
