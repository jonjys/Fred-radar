/**
 * Alternatives page — fully i18n.
 */
(function () {
  const pickerEl = document.getElementById("toolPicker");
  const resultsEl = document.getElementById("altResults");
  if (!pickerEl || !resultsEl) return;
  let allTools = [];
  let categoriesById = {};
  let selectedId = null;

  function I() { return window.FredI18n; }
  function t(k, v) { return I() ? I().t(k, v) : k; }
  function href(p) { return I() ? I().withLang(p, I().lang) : p; }
  function lang() { return I() ? I().lang : "en"; }

  function getQueryTool() {
    return new URLSearchParams(window.location.search).get("tool") || null;
  }

  function catName(id) {
    var c = categoriesById[id];
    if (!c) return id;
    return lang() === "sv" ? (c.nameSv || c.name) : c.name;
  }

  function categoryNames(tool) {
    return (tool.categories || []).map(catName).join(", ");
  }

  function findAlternatives(source) {
    var catSet = new Set(source.categories || []);
    return allTools
      .filter(function (x) { return x.id !== source.id; })
      .map(function (tool) {
        var shared = (tool.categories || []).filter(function (c) { return catSet.has(c); });
        if (!shared.length) return null;
        var reasons = [];
        var score = tool.score * 10;
        reasons.push(
          shared.length > 1
            ? t("pages.alts.sharedCats", { n: shared.length, name: source.name })
            : t("pages.alts.sameCat", { name: catName(shared[0]) })
        );
        var delta = tool.score - source.score;
        if (delta > 0.3) { score += 8; reasons.push(t("pages.alts.higher")); }
        else if (delta < -0.8) score -= 6;
        var pSrc = source.pricing && source.pricing.fromPriceSEK != null ? source.pricing.fromPriceSEK : 9999;
        var pAlt = tool.pricing && tool.pricing.fromPriceSEK != null ? tool.pricing.fromPriceSEK : 9999;
        if (pAlt < pSrc - 20) { score += 6; reasons.push(t("pages.alts.cheaper")); }
        else if (Math.abs(pAlt - pSrc) <= 40) { score += 3; reasons.push(t("pages.alts.similarPrice")); }
        if ((tool.gdpr && tool.gdpr.score || 0) > (source.gdpr && source.gdpr.score || 0)) {
          score += 5; reasons.push(t("pages.alts.betterGdpr"));
        } else if ((tool.gdpr && tool.gdpr.score || 0) >= 4) {
          reasons.push(t("pages.alts.goodGdpr"));
        }
        if (tool.swedishSupport && !source.swedishSupport) {
          score += 4; reasons.push(t("pages.alts.hasSv"));
        }
        return { tool: tool, score: score, reasons: reasons.slice(0, 3) };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 6);
  }

  function renderPicker() {
    var sorted = allTools.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    pickerEl.innerHTML = sorted.map(function (tool) {
      return '<button type="button" data-id="' + tool.id + '" aria-pressed="' + (tool.id === selectedId) + '">' +
        '<span class="logo" aria-hidden="true">' + (tool.logo || "🛠️") + "</span><span>" + tool.name + "</span></button>";
    }).join("");
    pickerEl.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectedId = btn.dataset.id;
        var url = new URL(window.location.href);
        url.searchParams.set("tool", selectedId);
        history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
        renderPicker();
        renderResults();
      });
    });
  }

  function renderResults() {
    if (!selectedId) {
      resultsEl.innerHTML = '<div class="alt-empty"><p>' + t("pages.alts.empty") + "</p></div>";
      return;
    }
    var source = allTools.find(function (x) { return x.id === selectedId; });
    if (!source) {
      resultsEl.innerHTML = '<div class="alt-empty"><p>' + t("pages.alts.notFound") + "</p></div>";
      return;
    }
    var loc = I() && I().localizeTool ? I().localizeTool(source) : source;
    var alts = findAlternatives(source);
    var html = '<div class="alt-source"><h2>' + (loc.logo || "") + " " + loc.name + '</h2><p class="tagline">' + (loc.tagline || "") + "</p>" +
      '<div class="tool-meta" style="margin-top:8px;"><span class="pill">' + window.RadarData.priceLabel(loc) + "</span>" +
      '<span class="pill gdpr-' + ((loc.gdpr && loc.gdpr.score) || 0) + '">🔒 ' + window.RadarData.gdprLabel((loc.gdpr && loc.gdpr.score) || 0) + "</span>" +
      '<span class="pill">' + categoryNames(loc) + "</span></div>" +
      '<p style="margin:12px 0 0;font-size:0.92rem;opacity:0.85;">' + t("pages.alts.below", { n: allTools.length }) + "</p></div>";
    if (!alts.length) {
      resultsEl.innerHTML = html + '<div class="alt-empty"><p>' + t("pages.alts.none") + "</p></div>";
      return;
    }
    html += '<div class="tool-grid">';
    alts.forEach(function (row, i) {
      var tool = I() && I().localizeTool ? I().localizeTool(row.tool) : row.tool;
      html += '<article class="tool-card result-card"><span class="result-rank">' + (i + 1) + "</span>" +
        '<div class="tool-card-top"><div class="tool-logo">' + (tool.logo || "🛠️") + "</div>" +
        '<div class="tool-heading"><h3>' + tool.name + '</h3><p class="tagline">' + (tool.tagline || "") + "</p></div>" +
        '<div class="tool-score"><span class="num">' + tool.score.toFixed(1) + '</span><span class="lbl">' + t("pages.alts.score") + "</span></div></div>" +
        '<div class="why-box why-alt"><strong>' + t("pages.alts.why") + "</strong><ul>" +
        row.reasons.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
        '<div class="tool-meta"><span class="pill">' + window.RadarData.priceLabel(tool) + "</span>" +
        '<span class="pill gdpr-' + ((tool.gdpr && tool.gdpr.score) || 0) + '">🔒 ' + window.RadarData.gdprLabel((tool.gdpr && tool.gdpr.score) || 0) + "</span></div>" +
        '<div class="tool-actions"><a class="btn btn-primary" href="/go/?tool=' + tool.id + '&src=alternativ" target="_blank" rel="sponsored noopener">' + t("pages.alts.visit") + " " + tool.name + "</a>" +
        '<a class="btn btn-ghost" href="' + href("/kategori/" + (tool.categories[0] || "ai-writing") + ".html#" + tool.id) + '">' + t("pages.alts.readMore") + "</a></div>" +
        '<p class="ad-note">' + t("card.ad") + "</p></article>";
    });
    html += '</div><div style="text-align:center;margin-top:32px;"><a class="btn btn-ghost" href="' + href("/quiz.html") + '">' + t("pages.alts.ctaQuiz") + "</a></div>";
    resultsEl.innerHTML = html;
  }

  async function init() {
    var h1 = document.querySelector("main h1");
    var lead = document.querySelector("main .lead");
    var eye = document.querySelector("main .eyebrow");
    var pick = document.getElementById("pickerLabel");
    if (h1) h1.textContent = t("pages.alts.h1");
    if (lead) lead.textContent = t("pages.alts.lead");
    if (eye) eye.textContent = t("pages.alts.eyebrow");
    if (pick) pick.textContent = t("pages.alts.pick");
    document.title = t("pages.alts.title");
    var data = await window.RadarData.load();
    allTools = data.tools || [];
    (data.categories || []).forEach(function (c) { categoriesById[c.id] = c; });
    selectedId = getQueryTool();
    if (selectedId && !allTools.some(function (x) { return x.id === selectedId; })) selectedId = null;
    renderPicker();
    renderResults();
  }

  function start() {
    if (I() && I().whenReady) I().whenReady(init);
    else init();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  window.addEventListener("fred-i18n-ready", function () { if (allTools.length) init(); });
})();
