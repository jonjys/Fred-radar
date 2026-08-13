#!/usr/bin/env node
/**
 * Genererar kategori/<id>.html från data/tools.json + data/categories.json.
 *
 * Kör efter varje ändring i data/tools.json eller data/categories.json:
 *   npm run build:kategori
 *
 * Filerna i kategori/ är byggda output – redigera inte dem för hand,
 * ändra data/tools.json (innehåll) eller scripts/template-kategori.html
 * (layout) och kör om skriptet.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { toolCardHTML } = require(path.join(ROOT, "assets/js/tool-card-template.js"));

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));
const template = fs.readFileSync(path.join(__dirname, "template-kategori.html"), "utf8");

const outDir = path.join(ROOT, "kategori");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let totalWritten = 0;

for (const category of categories) {
  const matchingTools = tools
    .filter((t) => t.categories.includes(category.id))
    .sort((a, b) => b.score - a.score);

  const cardsHTML = matchingTools
    .map((t) => toolCardHTML(t, { showFeaturedBadge: true, showProsCons: true }))
    .join("\n");

  const html = template
    .replaceAll("{{TITLE}}", `${category.name} – bästa AI-verktygen 2026 | Radar`)
    .replaceAll("{{DESCRIPTION}}", category.description)
    .replaceAll("{{CATEGORY_ICON}}", category.icon)
    .replaceAll("{{CATEGORY_NAME}}", category.name)
    .replaceAll("{{CATEGORY_INTRO}}", category.intro)
    .replaceAll("{{TOOL_COUNT}}", String(matchingTools.length))
    .replaceAll("{{TOOL_CARDS}}", cardsHTML || "<p class=\"empty-state\">Inga verktyg i den här kategorin ännu.</p>");

  const outPath = path.join(outDir, `${category.id}.html`);
  fs.writeFileSync(outPath, html);
  totalWritten += 1;
  console.log(`✓ kategori/${category.id}.html (${matchingTools.length} verktyg)`);
}

console.log(`\nKlart – ${totalWritten} kategorisidor genererade från data/tools.json.`);
