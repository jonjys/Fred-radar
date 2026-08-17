/**
 * Hämtar tools.json (+ valfria tools-extra*.json) i klienten.
 */
window.RadarData = (function () {
  let cache = null;

  async function loadJson(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  async function load() {
    if (cache) return cache;
    const [toolsMain, categories, extra] = await Promise.all([
      loadJson("/data/tools.json"),
      loadJson("/data/categories.json"),
      loadJson("/data/tools-extra-free.json"),
    ]);
    let tools = Array.isArray(toolsMain) ? toolsMain.slice() : [];
    if (Array.isArray(extra)) {
      const byId = new Map(tools.map((t) => [t.id, t]));
      for (const t of extra) byId.set(t.id, t);
      tools = Array.from(byId.values());
    }
    cache = { tools, categories: categories || [] };
    return cache;
  }

  const T = window.ToolCardTemplate || {};
  return {
    load,
    toolCardHTML: T.toolCardHTML,
    gdprLabel: T.gdprLabel,
    priceLabel: T.priceLabel,
    difficultyLabel: T.difficultyLabel,
  };
})();
