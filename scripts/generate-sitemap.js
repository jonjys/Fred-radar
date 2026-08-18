#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/categories.json"), "utf8"));
const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/quiz.html", changefreq: "monthly", priority: "0.9" },
  { loc: "/basta.html", changefreq: "weekly", priority: "0.85" },
  { loc: "/alternativ.html", changefreq: "weekly", priority: "0.8" },
];

const categoryPages = categories.map((c) => ({
  loc: `/kategori/${c.id}.html`,
  changefreq: "weekly",
  priority: "0.8",
}));

const alternativPages = tools.map((t) => ({
  loc: `/alternativ/${t.id}.html`,
  changefreq: "monthly",
  priority: "0.7",
}));

const urls = [...STATIC_PAGES, ...categoryPages, ...alternativPages];

function svPath(loc) {
  if (loc === "/") return "/sv";
  return "/sv" + loc;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${site.siteUrl}${u.loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${site.siteUrl}${u.loc}" />
    <xhtml:link rel="alternate" hreflang="sv" href="${site.siteUrl}${svPath(u.loc)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${site.siteUrl}${u.loc}" />
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>
  <url>
    <loc>${site.siteUrl}${svPath(u.loc)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${site.siteUrl}${u.loc}" />
    <xhtml:link rel="alternate" hreflang="sv" href="${site.siteUrl}${svPath(u.loc)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${site.siteUrl}${u.loc}" />
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`✓ sitemap.xml (${urls.length * 2} URLs with hreflang)`);

const robots = `User-agent: *
Allow: /
Disallow: /go/

Sitemap: ${site.siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);
console.log(`✓ robots.txt`);
