#!/usr/bin/env node
/**
 * Byter produktionsdomän på ETT ställe.
 *
 * Usage:
 *   node scripts/set-site-url.js https://din-riktiga-domän.se
 *
 * Gör tre saker:
 *   1. Uppdaterar data/site.json -> siteUrl.
 *   2. Ersätter alla förekomster av den gamla domänen i index.html och
 *      quiz.html (canonical, OG-taggar, JSON-LD) – de enda handskrivna
 *      filerna som innehåller domänen hårdkodad.
 *   3. Kör om build (kategori/*.html, sitemap.xml, robots.txt läser redan
 *      siteUrl dynamiskt från data/site.json, så de behöver bara byggas om,
 *      inte redigeras).
 *
 * Kör INTE detta manuellt filvis – kör alltid via det här skriptet, annars
 * är det lätt att missa ett ställe.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const newUrlRaw = process.argv[2];

if (!newUrlRaw) {
  console.error("Användning: node scripts/set-site-url.js https://din-riktiga-domän.se");
  process.exit(1);
}

let newUrl;
try {
  const u = new URL(newUrlRaw);
  newUrl = `${u.protocol}//${u.host}`; // normalisera bort trailing slash och ev. path
} catch (e) {
  console.error(`"${newUrlRaw}" är inte en giltig URL. Exempel: https://radar.se`);
  process.exit(1);
}

const sitePath = path.join(ROOT, "data/site.json");
const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const oldUrl = site.siteUrl;

if (oldUrl === newUrl) {
  console.log(`siteUrl är redan ${newUrl} – inget att göra.`);
  process.exit(0);
}

// 1. data/site.json
site.siteUrl = newUrl;
fs.writeFileSync(sitePath, JSON.stringify(site, null, 2) + "\n");
console.log(`✓ data/site.json: siteUrl ${oldUrl} → ${newUrl}`);

// 2. Handskrivna filer med domänen hårdkodad (canonical/OG/JSON-LD).
//    kategori/*.html, sitemap.xml och robots.txt rörs INTE här – de är
//    genererad output som redan läser siteUrl dynamiskt och byggs om i
//    steg 3.
const HARDCODED_FILES = ["index.html", "quiz.html"];
for (const rel of HARDCODED_FILES) {
  const filePath = path.join(ROOT, rel);
  const before = fs.readFileSync(filePath, "utf8");
  const after = before.split(oldUrl).join(newUrl);
  const count = before.split(oldUrl).length - 1;
  fs.writeFileSync(filePath, after);
  console.log(`✓ ${rel}: ${count} förekomst${count === 1 ? "" : "er"} av domänen bytt`);
}

// 3. Bygg om genererad output (kategori/*.html, sitemap.xml, robots.txt)
//    så de matchar den nya domänen direkt.
console.log("\nKör npm run build för att synka genererade filer …");
execFileSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });

console.log(`\nKlart. Domänen är nu ${newUrl} överallt. Granska \`git diff\`, committa och pusha.`);
