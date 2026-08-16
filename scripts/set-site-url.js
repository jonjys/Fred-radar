#!/usr/bin/env node
/**
 * Byt produktionsdomän i ett steg.
 * Usage: node scripts/set-site-url.js https://din-domän.se
 *    or: npm run set-site-url -- https://din-domän.se
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const url = process.argv[2];
if (!url || !/^https?:\/\//.test(url)) {
  console.error("Användning: npm run set-site-url -- https://din-domän.se");
  process.exit(1);
}
const clean = url.replace(/\/$/, "");

const root = path.join(__dirname, "..");
const sitePath = path.join(root, "data/site.json");
const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const old = site.siteUrl || "https://radar.se";
site.siteUrl = clean;
fs.writeFileSync(sitePath, JSON.stringify(site, null, 2) + "\n");

const files = ["index.html", "quiz.html", "scripts/template-kategori.html"];
for (const f of files) {
  const fp = path.join(root, f);
  if (!fs.existsSync(fp)) continue;
  let t = fs.readFileSync(fp, "utf8");
  t = t.split(old).join(clean);
  t = t.split("https://radar.se").join(clean);
  fs.writeFileSync(fp, t);
}

console.log(`siteUrl: ${old} → ${clean}`);
console.log("Kör npm run build …");
execSync("npm run build", { cwd: root, stdio: "inherit" });
console.log("Klart. Kör git diff innan du committar.");
