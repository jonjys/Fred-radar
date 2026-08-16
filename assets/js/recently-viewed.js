/**
 * Sparar senast klickade verktyg (via /go/) och visar "Senast tittat på" på startsidan.
 */
(function () {
  const KEY = "radar_recent_tools";
  const MAX = 6;

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
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
    const host = document.getElementById("recentGrid");
    if (!host || !window.RadarData) return;
    const ids = getRecent();
    if (!ids.length) {
      host.closest("section")?.style.setProperty("display", "none");
      return;
    }
    const { tools } = await window.RadarData.load();
    const items = ids.map((id) => tools.find((t) => t.id === id)).filter(Boolean);
    if (!items.length) return;
    host.innerHTML = items
      .map((t) => window.RadarData.toolCardHTML(t, { context: "index" }))
      .join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(renderRecent, 50));
  } else {
    setTimeout(renderRecent, 50);
  }

  window.RadarRecent = { getRecent, pushRecent };
})();
