/**
 * Hämtar tools.json + tools-extra*.json och categories.
 */
window.RadarData = (function () {
  let cache = null;

  async function load() {
    if (cache) return cache;
    const [tools, categories, extra, extra2] = await Promise.all([
      fetch("/data/tools.json").then((r) => r.json()),
      fetch("/data/categories.json").then((r) => r.json()),
      fetch("/data/tools-extra.json").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/data/tools-extra-2.json").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]);
    const ids = new Set(tools.map((t) => t.id));
    for (const t of [].concat(extra || [], extra2 || [])) {
      if (t && t.id && !ids.has(t.id)) {
        tools.push(t);
        ids.add(t.id);
      }
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
