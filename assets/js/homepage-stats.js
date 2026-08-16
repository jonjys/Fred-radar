/** Fixar dynamiskt verktygsantal mot data/tools.json */
(async function () {
  try {
    const tools = await fetch("/data/tools.json").then((r) => r.json());
    const el = document.getElementById("toolCount") || document.querySelector(".hero-stats .stat .num");
    if (el) el.textContent = Array.isArray(tools) ? tools.length : "\u2013";
  } catch (e) { /* ignore */ }
})();
