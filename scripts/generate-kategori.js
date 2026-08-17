#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));
const { toolCardHTML } = require(path.join(ROOT, "assets/js/tool-card-template.js"));
const outDir = path.join(ROOT, "kategori");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const year = new Date().getFullYear();
for (const category of categories) {
  const matchingTools = tools
    .filter((t) => (t.categories || []).includes(category.id))
    .sort((a, b) => b.score - a.score);
  const cardsHTML = matchingTools
    .map((t) => toolCardHTML(t, { showFeaturedBadge: true, showProsCons: true, context: "kategori" }))
    .join("\n");
  const title = `${category.name} – bästa AI-verktygen ${year} | FRED-Radar`;
  const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="Jämför de bästa ${category.name.toLowerCase()}-verktygen. Ranking baserad på kvalitet, pris, GDPR och användarvänlighet." />
  <link rel="canonical" href="${site.siteUrl}/kategori/${category.id}.html" />
  <link rel="stylesheet" href="/assets/css/style.css" />
</head>
<body>
  <div id="site-header"></div>
  <main style="max-width:960px;margin:0 auto;padding:24px 16px">
    <h1>${category.name}</h1>
    <p>${category.description || ""}</p>
    <div class="tool-grid">${cardsHTML}</div>
  </main>
  <div id="site-footer"></div>
  <script src="/assets/js/tool-card-template.js"></script>
  <script src="/assets/js/tools-data.js"></script>
  <script src="/assets/js/partials.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(outDir, category.id + ".html"), html);
  console.log("✓ kategori/" + category.id + ".html (" + matchingTools.length + " verktyg)");
}
console.log("Klart – kategorisidor genererade.");
