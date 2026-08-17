#!/usr/bin/env node
/**
 * Genererar sitemap.xml från data/categories.json + data/site.json.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));

const today = new Date().toISOString().slice(0, 10);
const base = (site.siteUrl || "https://radar.se").replace(/\/$/, "");

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/quiz.html", changefreq: "monthly", priority: "0.9" },
  { loc: "/basta.html", changefreq: "weekly", priority: "0.8" },
  { loc: "/alternativ.html", changefreq: "weekly", priority: "0.8" },
  { loc: "/om.html", changefreq: "monthly", priority: "0.5" },
];

const categoryPages = categories.map((c) => ({
  loc: `/kategori/${c.id}.html`,
  changefreq: "weekly",
  priority: "0.8",
}));

const all = STATIC_PAGES.concat(categoryPages);

const urls = all
  .map(
    (p) => `  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
fs.writeFileSync(
  path.join(ROOT, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /go/\nSitemap: ${base}/sitemap.xml\n`
);
console.log(`✓ sitemap.xml (${all.length} URL:er, siteUrl=${base})`);
console.log(`✓ robots.txt (siteUrl=${base})`);
