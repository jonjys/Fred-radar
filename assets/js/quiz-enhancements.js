/**
 * Quiz enhancements: share, keyboard, post-result links.
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
    if (!restart) return;

    if (!document.getElementById("shareBtn")) {
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
            ? "Radar rekommenderade: " + names + ". Hitta ditt verktyg på 60 sekunder."
            : "Hitta ditt AI-verktyg på 60 sekunder med Radar.",
          url: location.origin + "/quiz.html",
        };
        try {
          if (navigator.share) await navigator.share(data);
          else {
            await navigator.clipboard.writeText(data.text + " " + data.url);
            btn.textContent = "Kopierat ✓";
            setTimeout(() => (btn.textContent = "Dela resultat"), 2000);
          }
        } catch (e) {}
      });
    }

    if (!document.getElementById("extraLinks")) {
      const wrap = document.createElement("div");
      wrap.id = "extraLinks";
      wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:18px;";
      wrap.innerHTML =
        '<a class="btn btn-ghost" href="/basta.html">Topplistor</a>' +
        '<a class="btn btn-ghost" href="/alternativ.html">Hitta alternativ</a>' +
        '<a class="btn btn-ghost" href="/kategori/ai-code.html">AI-kod</a>' +
        '<a class="btn btn-ghost" href="/kategori/ai-voice.html">Röst & video</a>';
      const nav = restart.closest(".quiz-nav") || restart.parentNode;
      nav.parentNode.appendChild(wrap);
    }
  });

  const root = document.getElementById("quizRoot");
  if (root) observer.observe(root, { childList: true, subtree: true });
})();
