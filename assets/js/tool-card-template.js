/**
 * Shared tool-card HTML. Works in the browser and in Node generators.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.ToolCardTemplate = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  function I() {
    return typeof window !== "undefined" ? window.FredI18n : null;
  }
  function tt(key, fallback, vars) {
    const i = I();
    if (i && i.t) {
      const v = i.t(key, vars);
      if (v && v !== key) return v;
    }
    if (vars && typeof fallback === "string") {
      return Object.keys(vars).reduce((s, k) => s.replace("{{" + k + "}}", vars[k]), fallback);
    }
    return fallback;
  }

  function gdprLabel(score) {
    if (score >= 5) return tt("card.gdpr5", "Excellent GDPR");
    if (score >= 4) return tt("card.gdpr4", "Strong GDPR");
    if (score >= 3) return tt("card.gdpr3", "Acceptable GDPR");
    if (score >= 2) return tt("card.gdpr2", "Limited GDPR info");
    return tt("card.gdpr1", "Weak GDPR info");
  }

  function priceLabel(tool) {
    const p = tool.pricing;
    if (!p) return "";
    if (p.fromPriceSEK === 0) {
      if (tool.hardUsageLimits || (p.limitsNote && String(p.limitsNote).indexOf("⚠️") !== -1)) {
        return tt("card.freeLimit", "Free with weekly cap");
      }
      return tt("card.free", "Free");
    }
    if (p.model === "freemium") return tt("card.freemium", "From {{n}} SEK/mo (free tier)", { n: p.fromPriceSEK });
    return tt("card.from", "From {{n}} SEK/mo", { n: p.fromPriceSEK });
  }

  function difficultyLabel(d) {
    return (
      {
        beginner: tt("card.beg", "Beginner-friendly"),
        intermediate: tt("card.int", "Some experience needed"),
        advanced: tt("card.adv", "For advanced users"),
      }[d] || d
    );
  }

  function toolCardHTML(tool, opts) {
    opts = opts || {};
    const i = I();
    const loc = i && i.localizeTool ? i.localizeTool(tool) : tool;
    const gdpr = loc.gdpr || { score: 0 };
    const src = opts.context || "kategori";
    const href = (path) => (i && i.withLang ? i.withLang(path, i.lang) : path);
    const honest = loc.honestPill || (loc.pricing && loc.pricing.limitsNote) || "";
    const featured = loc.featured && opts.showFeaturedBadge
      ? '<span class="badge-featured">' + tt("card.featured", "Editors' pick") + "</span>"
      : "";
    const recent = loc.id === "meta-ai" ? '<span class="badge-recent">Recently added: Meta AI</span>' : "";
    return `
      <article class="tool-card" id="${loc.id}" data-id="${loc.id}" data-price="${loc.pricing.fromPriceSEK}" data-score="${loc.score}" data-gdpr="${gdpr.score}" data-difficulty="${loc.difficulty}">
        ${featured}${recent}
        <div class="tool-card-top">
          <div class="tool-logo" aria-hidden="true">${loc.logo || "🛠️"}</div>
          <div class="tool-heading">
            <h3>${loc.name}</h3>
            <p class="tagline">${loc.tagline}</p>
          </div>
          <div class="tool-score">
            <span class="num">${Number(loc.score).toFixed(1)}</span>
            <span class="lbl">${i && i.lang === "sv" ? "poäng" : "score"}</span>
          </div>
        </div>
        <p class="tool-desc">${loc.description}</p>
        <div class="tool-meta">
          <span class="pill">${priceLabel(loc)}</span>
          <span class="pill gdpr-${gdpr.score}">🔒 ${gdprLabel(gdpr.score)}</span>
          <span class="pill">${difficultyLabel(loc.difficulty)}</span>
          ${honest ? `<span class="pill" style="border-color:#f59e0b;color:#fbbf24;">${honest}</span>` : ""}
        </div>
        <div class="tool-bestfor"><strong>${tt("card.bestFor", "Best for:")}</strong> ${(loc.bestFor || []).slice(0, 3).join(", ")}</div>
        ${opts.showProsCons && (loc.pros || loc.cons) ? prosConsHTML(loc) : ""}
        <div class="tool-actions">
          <a class="btn btn-primary" href="/go/?tool=${loc.id}&src=${src}" target="_blank" rel="sponsored noopener">${tt("card.visit", "Visit")} ${loc.name}</a>
          <a class="btn btn-ghost" href="/go/?tool=${loc.id}&src=${src}-website" target="_blank" rel="sponsored noopener">${tt("card.site", "Website")}</a>
          <a class="btn btn-ghost" href="${href("/alternativ/" + loc.id + ".html")}">${tt("card.alts", "Alternatives")}</a>
        </div>
        <p class="ad-note">${tt("card.ad", "Affiliate link — we may earn a commission. It does not change price or ranking.")}</p>
      </article>
    `;
  }

  function prosConsHTML(tool) {
    return `
      <div class="tool-meta" style="flex-direction:column; align-items:stretch; gap:4px;">
        ${(tool.pros || []).slice(0, 2).map((p) => `<span class="pill" style="justify-content:flex-start;">✅ ${p}</span>`).join("")}
        ${(tool.cons || []).slice(0, 1).map((c) => `<span class="pill" style="justify-content:flex-start;">⚠️ ${c}</span>`).join("")}
      </div>
    `;
  }

  return { gdprLabel, priceLabel, difficultyLabel, toolCardHTML };
});
