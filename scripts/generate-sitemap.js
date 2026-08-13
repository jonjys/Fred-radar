#!/usr/bin/env node
/**
 * Genererar sitemap.xml från data/categories.json + data/site.json.
 * Körs som del av `npm run build`. Lägg till nya statiska sidor i
 * STATIC_PAGES nedan om fler tillkommer (t.ex. /om.html).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));

const today = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/quiz.html", changefreq: "monthly", priority: "0.9" },
];

const categoryPages = categories.map((c) => ({
  loc: `/kategori/${c.id}.html`,
  changefreq: "weekly",
  priority: "0.8",
}));

const urls = [...STATIC_PAGES, ...categoryPages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${site.siteUrl}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`✓ sitemap.xml (${urls.length} URL:er, siteUrl=${site.siteUrl})`);

const robots = `User-agent: *
Allow: /
Disallow: /go/

Sitemap: ${site.siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);
console.log(`✓ robots.txt (siteUrl=${site.siteUrl})`);
