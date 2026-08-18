/**
 * Loads tools.json + extras and normalizes fields.
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

  function normalize(t) {
    const p = t.pricing || {};
    t.beginnerFriendly = t.beginnerFriendly != null ? t.beginnerFriendly : t.difficulty === "beginner";
    t.swedish = t.swedish != null ? t.swedish : !!t.swedishSupport;
    t.limits = t.limits || p.limitsNote || p.billingNote || "";
    t.honestPill = t.honestPill || p.limitsNote || "";
    t.url = t.url || t.website;
    if (t.hardUsageLimits == null) t.hardUsageLimits = false;
    return t;
  }

  async function load() {
    if (cache) return cache;
    const [toolsMain, categories, extra, extra2] = await Promise.all([
      loadJson("/data/tools.json"),
      loadJson("/data/categories.json"),
      loadJson("/data/tools-extra-free.json"),
      loadJson("/data/tools-extra-2.json"),
    ]);
    let tools = Array.isArray(toolsMain) ? toolsMain.slice() : [];
    const byId = new Map(tools.map((t) => [t.id, t]));
    for (const pack of [extra, extra2]) {
      if (!Array.isArray(pack)) continue;
      for (const t of pack) byId.set(t.id, Object.assign({}, byId.get(t.id) || {}, t));
    }
    tools = Array.from(byId.values()).map(normalize);
    cache = { tools, categories: categories || [] };
    return cache;
  }

  const T = window.ToolCardTemplate || {};
  return {
    load,
    toolCardHTML: function (tool, opts) {
      const loc = window.FredI18n && window.FredI18n.localizeTool ? window.FredI18n.localizeTool(tool) : tool;
      return (T.toolCardHTML || function () { return ""; })(loc, opts);
    },
    gdprLabel: T.gdprLabel,
    priceLabel: T.priceLabel,
    difficultyLabel: T.difficultyLabel,
  };
})();
