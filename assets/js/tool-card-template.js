/**
 * Enda källan för hur ett "tool-card" ser ut.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.ToolCardTemplate = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  function gdprLabel(score) {
    if (score >= 5) return "Utmärkt GDPR-anpassning";
    if (score >= 4) return "Stark GDPR-anpassning";
    if (score >= 3) return "Godkänd GDPR-anpassning";
    if (score >= 2) return "Begränsad GDPR-info";
    return "Svag GDPR-info";
  }

  function priceLabel(tool) {
    const p = tool.pricing;
    if (!p) return "";
    if (p.fromPriceSEK === 0) {
      if (tool.hardUsageLimits || (p.limitsNote && p.limitsNote.indexOf("⚠️") !== -1)) {
        return "Gratis med veckogräns";
      }
      return "Gratis";
    }
    const base = "Från " + p.fromPriceSEK + " kr/mån";
    return p.model === "freemium" ? base + " (gratisnivå finns)" : base;
  }

  function difficultyLabel(d) {
    return (
      { beginner: "Nybörjarvänligt", intermediate: "Viss erfarenhet krävs", advanced: "För avancerade användare" }[d] ||
      d
    );
  }

  function toolCardHTML(tool, opts) {
    opts = opts || {};
    const gdpr = tool.gdpr || { score: 0 };
    const src = opts.context || "kategori";
    const limitsPill = tool.pricing && tool.pricing.limitsNote
      ? '<span class="pill" style="border-color:#f59e0b;color:#fbbf24">' + tool.pricing.limitsNote + '</span>'
      : "";
    return (
      '<article class="tool-card" id="' + tool.id + '" data-id="' + tool.id + '" data-price="' + tool.pricing.fromPriceSEK + '" data-score="' + tool.score + '" data-gdpr="' + gdpr.score + '" data-difficulty="' + tool.difficulty + '">' +
        (tool.featured && opts.showFeaturedBadge ? '<span class="badge-featured">Redaktionens val</span>' : '') +
        '<div class="tool-card-top">' +
          '<div class="tool-logo" aria-hidden="true">' + (tool.logo || '🛠️') + '</div>' +
          '<div class="tool-heading">' +
            '<h3>' + tool.name + '</h3>' +
            '<p class="tagline">' + tool.tagline + '</p>' +
          '</div>' +
          '<div class="tool-score">' +
            '<span class="num">' + tool.score.toFixed(1) + '</span>' +
            '<span class="lbl">poäng</span>' +
          '</div>' +
        '</div>' +
        '<p class="tool-desc">' + tool.description + '</p>' +
        '<div class="tool-meta">' +
          '<span class="pill">' + priceLabel(tool) + '</span>' +
          '<span class="pill gdpr-' + gdpr.score + '">🔒 ' + gdprLabel(gdpr.score) + '</span>' +
          '<span class="pill">' + difficultyLabel(tool.difficulty) + '</span>' +
          limitsPill +
        '</div>' +
        '<div class="tool-bestfor"><strong>Bäst för:</strong> ' + tool.bestFor.slice(0, 3).join(', ') + '</div>' +
        (opts.showProsCons && (tool.pros || tool.cons) ? prosConsHTML(tool) : '') +
        '<div class="tool-actions">' +
          '<a class="btn btn-primary" href="/go/?tool=' + tool.id + '&src=' + src + '" target="_blank" rel="sponsored noopener">Besök ' + tool.name + '</a>' +
          '<a class="btn btn-ghost" href="/go/?tool=' + tool.id + '&src=' + src + '-website" target="_blank" rel="sponsored noopener">Webbplats</a>' +
          '<a class="btn btn-ghost" href="/alternativ/' + tool.id + '.html">Alternativ</a>' +
        '</div>' +
        '<p class="ad-note">Annonslänk – vi kan få provision. Påverkar inte priset eller rankingen.</p>' +
      '</article>'
    );
  }

  function prosConsHTML(tool) {
    var html = '<div class="tool-meta" style="flex-direction:column; align-items:stretch; gap:4px;">';
    (tool.pros || []).slice(0, 2).forEach(function (p) {
      html += '<span class="pill" style="justify-content:flex-start;">✅ ' + p + '</span>';
    });
    (tool.cons || []).slice(0, 1).forEach(function (c) {
      html += '<span class="pill" style="justify-content:flex-start;">⚠️ ' + c + '</span>';
    });
    html += '</div>';
    return html;
  }

  return { gdprLabel: gdprLabel, priceLabel: priceLabel, difficultyLabel: difficultyLabel, toolCardHTML: toolCardHTML };
});
