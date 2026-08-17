#!/usr/bin/env node
/**
 * Genererar kategori/<id>.html från data/tools.json + tools-extra*.json.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { toolCardHTML } = require(path.join(ROOT, "assets/js/tool-card-template.js"));

const toolsMain = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));
function loadExtra(name) {
  const p = path.join(ROOT, "data", name);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
const toolsExtra = loadExtra("tools-extra.json").concat(loadExtra("tools-extra-2.json"));
const seen = new Set(toolsMain.map((t) => t.id));
const tools = toolsMain.concat(toolsExtra.filter((t) => t && t.id && !seen.has(t.id)));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));
const template = fs.readFileSync(path.join(__dirname, "template-kategori.html"), "utf8");

const outDir = path.join(ROOT, "kategori");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const base = (site.siteUrl || "https://radar.se").replace(/\/$/, "");

for (const category of categories) {
  const matchingTools = tools
    .filter((t) => t.categories && t.categories.includes(category.id))
    .sort((a, b) => b.score - a.score);

  const cardsHTML = matchingTools
    .map((t) => toolCardHTML(t, { showFeaturedBadge: true, showProsCons: true, context: "kategori" }))
    .join("\n");

  const title = `${category.name} – jämförelse | Radar`;
  const description = category.description || "";
  const canonicalUrl = `${base}/kategori/${category.id}.html`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.intro || description,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: matchingTools.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `${canonicalUrl}#${t.id}`,
      })),
    },
  };

  const html = template
    .replaceAll("{{TITLE}}", title)
    .replaceAll("{{DESCRIPTION}}", description)
    .replaceAll("{{CATEGORY_NAME}}", category.name)
    .replaceAll("{{CATEGORY_ICON}}", category.icon || "")
    .replaceAll("{{CATEGORY_INTRO}}", category.intro || description)
    .replaceAll("{{TOOL_COUNT}}", String(matchingTools.length))
    .replaceAll("{{CANONICAL_URL}}", canonicalUrl)
    .replaceAll("{{JSON_LD}}", JSON.stringify(jsonLd, null, 2))
    .replaceAll("{{TOOL_CARDS}}", cardsHTML || "<p class=\"empty-state\">Inga verktyg i den här kategorin ännu.</p>");

  fs.writeFileSync(path.join(outDir, `${category.id}.html`), html);
  console.log(`✓ kategori/${category.id}.html (${matchingTools.length} verktyg)`);
}

console.log(`\nKlart – ${categories.length} kategorisidor genererade.`);
