#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { toolCardHTML } = require(path.join(ROOT, "assets/js/tool-card-template.js"));

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));
const template = fs.readFileSync(path.join(__dirname, "template-kategori.html"), "utf8");

const outDir = path.join(ROOT, "kategori");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const year = new Date().getFullYear();
let totalWritten = 0;

for (const category of categories) {
  const matchingTools = tools
    .filter((t) => (t.categories || []).includes(category.id))
    .sort((a, b) => b.score - a.score);

  const cardsHTML = matchingTools
    .map((t) => toolCardHTML(t, { showFeaturedBadge: true, showProsCons: true, context: "kategori" }))
    .join("\n");

  const title = `${category.name} – best AI tools ${year} | FRED-Radar`;
  const canonicalUrl = `${site.siteUrl}/kategori/${category.id}.html`;
  const canonicalSv = `${site.siteUrl}/sv/kategori/${category.id}.html`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: canonicalUrl,
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: matchingTools.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: t.name,
          url: t.website,
          applicationCategory: "BusinessApplication",
          offers: {
            "@type": "Offer",
            price: String(t.pricing.fromPriceSEK),
            priceCurrency: "SEK",
          },
        },
      })),
    },
  };

  const html = template
    .replaceAll("{{TITLE}}", title)
    .replaceAll("{{DESCRIPTION}}", category.description)
    .replaceAll("{{CATEGORY_ICON}}", category.icon)
    .replaceAll("{{CATEGORY_NAME}}", category.name)
    .replaceAll("{{CATEGORY_INTRO}}", category.intro)
    .replaceAll("{{TOOL_COUNT}}", String(matchingTools.length))
    .replaceAll("{{CANONICAL_URL}}", canonicalUrl)
    .replaceAll("{{CANONICAL_URL_SV}}", canonicalSv)
    .replaceAll("{{JSON_LD}}", JSON.stringify(jsonLd, null, 2))
    .replaceAll("{{TOOL_CARDS}}", cardsHTML || "<p class=\"empty-state\">No tools in this category yet.</p>");

  fs.writeFileSync(path.join(outDir, `${category.id}.html`), html);
  totalWritten += 1;
  console.log(`✓ kategori/${category.id}.html (${matchingTools.length} tools)`);
}

console.log(`\nDone – ${totalWritten} category pages from data/tools.json.`);
