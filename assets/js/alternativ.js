/**
 * Alternativ-sida: välj ett verktyg → visa rankade alternativ i samma kategori.
 * Stödjer ?tool=id i URL så quiz/resultat kan länka hit direkt.
 */
(function () {
  const pickerEl = document.getElementById("toolPicker");
  const resultsEl = document.getElementById("altResults");
  let allTools = [];
  let categoriesById = {};
  let selectedId = null;

  function getQueryTool() {
    const params = new URLSearchParams(window.location.search);
    return params.get("tool") || null;
  }

  function categoryNames(tool) {
    return (tool.categories || [])
      .map((id) => (categoriesById[id] && categoriesById[id].name) || id)
      .join(", ");
  }

  function findAlternatives(source) {
    const catSet = new Set(source.categories || []);
    const scored = allTools
      .filter((t) => t.id !== source.id)
      .map((t) => {
        const shared = (t.categories || []).filter((c) => catSet.has(c));
        if (shared.length === 0) return null;

        const reasons = [];
        let score = t.score * 10;

        // Samma kategori(er)
        reasons.push(
          shared.length > 1
            ? `Delar ${shared.length} kategorier med ${source.name}`
            : `Samma kategori: ${categoriesById[shared[0]]?.name || shared[0]}`
        );

        // Poängskillnad
        const delta = t.score - source.score;
        if (delta > 0.3) {
          score += 8;
          reasons.push(`Högre totalpoäng (${t.score.toFixed(1)} vs ${source.score.toFixed(1)})`);
        } else if (delta < -0.8) {
          score -= 6;
        }

        // Prisnära eller billigare
        const pSrc = source.pricing?.fromPriceSEK ?? 9999;
        const pAlt = t.pricing?.fromPriceSEK ?? 9999;
        if (pAlt < pSrc - 20) {
          score += 6;
          reasons.push(`Billigare startpris (${window.RadarData.priceLabel(t)})`);
        } else if (Math.abs(pAlt - pSrc) <= 40) {
          score += 3;
          reasons.push("Liknande prisnivå");
        }

        // GDPR
        if ((t.gdpr?.score || 0) > (source.gdpr?.score || 0)) {
          score += 5;
          reasons.push(`Starkare GDPR-betyg (${t.gdpr.score}/5)`);
        } else if ((t.gdpr?.score || 0) >= 4) {
          reasons.push(`Bra GDPR-anpassning (${t.gdpr.dataResidency || "—"})`);
        }

        // Svenskt stöd
        if (t.swedishSupport && !source.swedishSupport) {
          score += 4;
          reasons.push("Har svenskt stöd");
        }

        return { tool: t, score, reasons: reasons.slice(0, 3) };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return scored;
  }

  function renderPicker() {
    // Gruppera ungefär per primär kategori för läsbarhet
    const sorted = [...allTools].sort((a, b) => a.name.localeCompare(b.name, "sv"));
    pickerEl.innerHTML = sorted
      .map(
        (t) => `
      <button type="button" data-id="${t.id}" aria-pressed="${t.id === selectedId ? "true" : "false"}">
        <span class="logo" aria-hidden="true">${t.logo || "🛠️"}</span>
        <span>${t.name}</span>
      </button>`
      )
      .join("");

    pickerEl.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedId = btn.dataset.id;
        // Uppdatera URL utan reload
        const url = new URL(window.location.href);
        url.searchParams.set("tool", selectedId);
        history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
        renderPicker();
        renderResults();
      });
    });
  }

  function renderResults() {
    if (!selectedId) {
      resultsEl.innerHTML = `
        <div class="alt-empty">
          <p>Välj ett verktyg ovan så visar vi de bästa alternativen i samma kategori.</p>
        </div>`;
      return;
    }

    const source = allTools.find((t) => t.id === selectedId);
    if (!source) {
      resultsEl.innerHTML = `<div class="alt-empty"><p>Hittade inte verktyget.</p></div>`;
      return;
    }

    const alts = findAlternatives(source);

    let html = `
      <div class="alt-source">
        <h2>${source.logo || ""} ${source.name}</h2>
        <p class="tagline">${source.tagline}</p>
        <div class="tool-meta" style="margin-top:8px;">
          <span class="pill">${window.RadarData.priceLabel(source)}</span>
          <span class="pill gdpr-${source.gdpr?.score || 0}">🔒 ${window.RadarData.gdprLabel(source.gdpr?.score || 0)}</span>
          <span class="pill">${categoryNames(source)}</span>
        </div>
        <p style="margin:12px 0 0; font-size:0.92rem; opacity:0.85;">
          Nedan: rankade alternativ i samma kategori (scannat från alla ${allTools.length} verktyg).
        </p>
      </div>
    `;

    if (alts.length === 0) {
      html += `<div class="alt-empty"><p>Inga tydliga alternativ i samma kategori just nu.</p></div>`;
      resultsEl.innerHTML = html;
      return;
    }

    html += `<div class="tool-grid">`;
    alts.forEach((r, i) => {
      const t = r.tool;
      html += `
        <article class="tool-card result-card">
          <span class="result-rank">${i + 1}</span>
          <div class="tool-card-top">
            <div class="tool-logo" aria-hidden="true">${t.logo || "🛠️"}</div>
            <div class="tool-heading">
              <h3>${t.name}</h3>
              <p class="tagline">${t.tagline}</p>
            </div>
            <div class="tool-score">
              <span class="num">${t.score.toFixed(1)}</span>
              <span class="lbl">poäng</span>
            </div>
          </div>
          <div class="why-box why-alt">
            <strong>Varför det kan passa som alternativ:</strong>
            <ul>
              ${r.reasons.map((x) => `<li>${x}</li>`).join("")}
            </ul>
          </div>
          <div class="tool-meta">
            <span class="pill">${window.RadarData.priceLabel(t)}</span>
            <span class="pill gdpr-${t.gdpr?.score || 0}">🔒 ${window.RadarData.gdprLabel(t.gdpr?.score || 0)}</span>
          </div>
          <div class="tool-actions">
            <a class="btn btn-primary" href="/go/?tool=${t.id}&src=alternativ" target="_blank" rel="sponsored noopener">Besök ${t.name}</a>
            <a class="btn btn-ghost" href="/kategori/${t.categories[0]}.html#${t.id}">Läs mer</a>
          </div>
          <p class="ad-note">Annonslänk – vi kan få provision. Påverkar inte priset eller rankingen.</p>
        </article>
      `;
    });
    html += `</div>`;

    html += `
      <div style="text-align:center; margin-top:32px;">
        <a class="btn btn-ghost" href="/quiz.html">Ta quizet för personlig ranking →</a>
      </div>
    `;

    resultsEl.innerHTML = html;
  }

  async function init() {
    const data = await window.RadarData.load();
    allTools = data.tools || [];
    (data.categories || []).forEach((c) => {
      categoriesById[c.id] = c;
    });

    selectedId = getQueryTool();
    if (selectedId && !allTools.some((t) => t.id === selectedId)) {
      selectedId = null;
    }

    renderPicker();
    renderResults();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
