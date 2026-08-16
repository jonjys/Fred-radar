/**
 * Delade hjälpfunktioner för att hämta verktygsdata i klienten.
 * Kortrendering delegeras till tool-card-template.js (delad med Node-generatorn).
 * tools-extra.json mergas in (t.ex. nya verktyg från night runs utan full rewrite).
 */
window.RadarData = (function () {
  let cache = null;

  async function load() {
    if (cache) return cache;
    const [tools, categories, extra] = await Promise.all([
      fetch("/data/tools.json").then((r) => r.json()),
      fetch("/data/categories.json").then((r) => r.json()),
      fetch("/data/tools-extra.json").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]);
    const ids = new Set(tools.map((t) => t.id));
    for (const t of extra || []) {
      if (!ids.has(t.id)) tools.push(t);
    }
    cache = { tools, categories };
    return cache;
  }

  const T = window.ToolCardTemplate;

  return {
    load,
    toolCardHTML: T.toolCardHTML,
    gdprLabel: T.gdprLabel,
    priceLabel: T.priceLabel,
    difficultyLabel: T.difficultyLabel,
  };
})();
