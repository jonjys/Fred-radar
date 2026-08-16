/**
 * Night-run enhancements: share button + keyboard shortcuts for the quiz.
 * Loaded after quiz.js. Safe if quiz structure changes.
 */
(function () {
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const root = document.getElementById("quizRoot");
    if (!root) return;
    const options = root.querySelectorAll(".quiz-option");
    if (!options.length) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= options.length) {
      options[num - 1].click();
      e.preventDefault();
    } else if (e.key === "Enter") {
      const next = document.getElementById("nextBtn");
      if (next && !next.disabled) next.click();
    } else if (e.key === "Backspace" || e.key === "Escape") {
      const back = document.getElementById("backBtn");
      if (back && getComputedStyle(back).visibility !== "hidden") back.click();
    }
  });

  const observer = new MutationObserver(() => {
    const restart = document.getElementById("restartBtn");
    if (!restart || document.getElementById("shareBtn")) return;
    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.id = "shareBtn";
    btn.textContent = "Dela resultat";
    btn.style.marginLeft = "12px";
    restart.parentNode.appendChild(btn);
    btn.addEventListener("click", async () => {
      const names = [...document.querySelectorAll(".result-card h3")].map((h) => h.textContent).join(", ");
      const data = {
        title: "Mina AI-rekommendationer från Radar",
        text: names
          ? `Radar rekommenderade: ${names}. Hitta ditt verktyg på 60 sekunder.`
          : "Hitta ditt AI-verktyg på 60 sekunder med Radar.",
        url: location.origin + "/quiz.html",
      };
      try {
        if (navigator.share) await navigator.share(data);
        else {
          await navigator.clipboard.writeText(data.text + " " + data.url);
          btn.textContent = "Kopierat \u2713";
          setTimeout(() => (btn.textContent = "Dela resultat"), 2000);
        }
      } catch (e) {}
    });
  });
  const root = document.getElementById("quizRoot");
  if (root) observer.observe(root, { childList: true, subtree: true });
})();
