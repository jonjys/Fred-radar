#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));
const { priceLabel, gdprLabel } = require(path.join(ROOT, "assets/js/tool-card-template.js"));

const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
const outDir = path.join(ROOT, "alternativ");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function findAlternatives(source) {
  const sourceCats = source.categories || [];
  return tools
    .filter((t) => t.id !== source.id && (t.categories || []).some((c) => sourceCats.includes(c)))
    .map((t) => {
      const reasons = [];
      if (t.score > source.score) reasons.push("Higher overall score");
      else if (t.score >= source.score - 0.5) reasons.push("Similar quality");
      const priceDiff = (t.pricing?.fromPriceSEK || 0) - (source.pricing?.fromPriceSEK || 0);
      if (priceDiff < -50) reasons.push("Lower starting price");
      else if (Math.abs(priceDiff) <= 50) reasons.push("Similar price");
      if ((t.gdpr?.score || 0) > (source.gdpr?.score || 0)) reasons.push("Better GDPR score");
      if (t.swedishSupport && !source.swedishSupport) reasons.push("Works in Swedish");
      if (!reasons.length) reasons.push("Same category");
      return { tool: t, reasons, score: t.score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

let written = 0;
for (const tool of tools) {
  const alts = findAlternatives(tool);
  const catNames = (tool.categories || []).map((id) => catMap[id]?.name || id).join(", ");
  const title = `Alternatives to ${tool.name} – compare and switch | FRED-Radar`;
  const description = `Find better or cheaper alternatives to ${tool.name}. Compare score, price, limits and GDPR.`.slice(0, 155);
  const canonical = `${site.siteUrl}/alternativ/${tool.id}.html`;
  const canonicalSv = `${site.siteUrl}/sv/alternativ/${tool.id}.html`;

  const altCards = alts
    .map(({ tool: t, reasons }, i) => `
      <article class="tool-card" id="${t.id}">
        <span class="result-rank" style="position:absolute;top:-10px;left:16px;">${i + 1}</span>
        <div class="tool-card-top">
          <div class="tool-logo" aria-hidden="true">${t.logo || "🛠️"}</div>
          <div class="tool-heading">
            <h3>${t.name}</h3>
            <p class="tagline">${t.tagline || ""}</p>
          </div>
          <div class="tool-score">
            <span class="num">${Number(t.score).toFixed(1)}</span>
            <span class="lbl">score</span>
          </div>
        </div>
        <div class="why-box">
          <strong>Why this alternative:</strong>
          <ul style="margin:8px 0 0;padding-left:18px;">
            ${reasons.map((r) => `<li>${r}</li>`).join("")}
          </ul>
        </div>
        <div class="tool-meta">
          <span class="pill">${priceLabel(t)}</span>
          <span class="pill gdpr-${t.gdpr?.score || 0}">🔒 ${gdprLabel(t.gdpr?.score || 0)}</span>
        </div>
        <div class="tool-actions">
          <a class="btn btn-primary" href="/go/?tool=${t.id}&src=alternativ-static" target="_blank" rel="sponsored noopener">Visit ${t.name}</a>
          <a class="btn btn-ghost" href="/kategori/${(t.categories || [])[0] || "ai-writing"}.html#${t.id}">Read more</a>
        </div>
      </article>`)
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${canonical}" />
  <link rel="alternate" hreflang="sv" href="${canonicalSv}" />
  <link rel="alternate" hreflang="x-default" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="FRED-Radar" />
  <meta property="og:title" content="${title}" />
  <meta property="og:locale" content="en_US" />
  <link rel="stylesheet" href="/assets/css/style.css" />
</head>
<body>
  <div id="site-header"></div>
  <main>
    <section class="hero" style="padding-top:48px;padding-bottom:28px;">
      <div class="wrap">
        <span class="eyebrow">Alternatives · ${catNames}</span>
        <h1 style="font-size:clamp(1.6rem,3.5vw,2.3rem);">Alternatives to ${tool.logo || ""} ${tool.name}</h1>
        <p class="lead" style="max-width:560px;">${tool.tagline || ""}</p>
        <p style="margin-top:18px;">
          <a class="btn btn-primary" href="/go/?tool=${tool.id}&src=alternativ-static" target="_blank" rel="sponsored noopener">Visit ${tool.name}</a>
          <a class="btn btn-ghost" href="/alternativ.html?tool=${tool.id}">Switch tool</a>
        </p>
      </div>
    </section>
    <section style="padding-top:8px;">
      <div class="wrap">
        <h2 style="margin-bottom:8px;">${alts.length} alternatives we recommend</h2>
        <div class="tool-grid">${altCards || '<p class="empty-state">No close alternatives yet.</p>'}</div>
      </div>
    </section>
  </main>
  <div id="site-footer"></div>
  <script src="/assets/js/i18n.js"></script>
  <script src="/assets/js/tool-card-template.js"></script>
  <script src="/assets/js/tools-data.js"></script>
  <script src="/assets/js/partials.js"></script>
  <script src="/assets/js/analytics.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, `${tool.id}.html`), html);
  written++;
}
console.log(`✓ alternativ/*.html (${written} pages)`);
