/**
 * Delade hjälpfunktioner för att hämta verktygsdata i klienten.
 * Kortrendering delegeras till tool-card-template.js (delad med Node-generatorn).
 */
window.RadarData = (function () {
  let cache = null;

  async function load() {
    if (cache) return cache;
    const [tools, categories] = await Promise.all([
      fetch("/data/tools.json").then((r) => r.json()),
      fetch("/data/categories.json").then((r) => r.json()),
    ]);
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
