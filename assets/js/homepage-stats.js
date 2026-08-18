/** Fixar dynamiskt verktygsantal + synkar hero-stats mot data/tools.json */
(async function () {
  try {
    const tools = await fetch("/data/tools.json").then((r) => r.json());
    const el = document.getElementById("toolCount") || document.querySelector(".hero-stats .stat .num");
    if (el) el.textContent = Array.isArray(tools) ? tools.length : "–";
  } catch (e) { /* ignore */ }
})();
