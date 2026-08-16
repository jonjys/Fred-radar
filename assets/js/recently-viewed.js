/**
 * Sparar senast klickade verktyg (via /go/) och visar "Senast tittat på" på startsidan.
 * Injicerar sektionen själv om markup saknas.
 */
(function () {
  const KEY = "radar_recent_tools";
  const MAX = 6;

  function getRecent() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }

  function pushRecent(id) {
    if (!id) return;
    let list = getRecent().filter((x) => x !== id);
    list.unshift(id);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  }

  const params = new URLSearchParams(location.search);
  if (location.pathname.startsWith("/go") && params.get("tool")) {
    pushRecent(params.get("tool"));
  }

  async function renderRecent() {
    if (!window.RadarData) return;
    const ids = getRecent();
    if (!ids.length) return;

    let host = document.getElementById("recentGrid");
    if (!host) {
      const main = document.querySelector("main");
      const kat = document.getElementById("kategorier");
      if (!main || !kat) return;
      const section = document.createElement("section");
      section.id = "senast";
      section.innerHTML = '<div class="wrap"><div class="section-head"><span class="kicker">Ditt spår</span><h2>Senast tittat på</h2><p>Verktyg du klickat dig vidare till tidigare (sparat lokalt i din webbläsare).</p></div><div class="tool-grid" id="recentGrid"></div></div>';
      main.insertBefore(section, kat);
      host = document.getElementById("recentGrid");
    }

    const { tools } = await window.RadarData.load();
    const items = ids.map((id) => tools.find((t) => t.id === id)).filter(Boolean);
    if (!items.length) return;
    host.innerHTML = items.map((t) => window.RadarData.toolCardHTML(t, { context: "index" })).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(renderRecent, 80));
  } else {
    setTimeout(renderRecent, 80);
  }

  window.RadarRecent = { getRecent, pushRecent };
})();
