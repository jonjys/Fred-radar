/** Expand quiz purpose options if older quiz.js is still loaded. */
(function () {
  // No-op if quiz already has ai-code – this patches at runtime via monkeypatch is fragile.
  // Instead: document that npm run build + updated quiz.js is preferred.
  // Runtime: if purpose step only has 4 options, inject two more by observing DOM.
  const EXTRA = [
    { value: "ai-code", label: "Koda / bygga mjukvara", emoji: "⌨️" },
    { value: "ai-voice", label: "Röst, podcast eller video", emoji: "🎙️" },
  ];

  const observer = new MutationObserver(() => {
    const opts = document.querySelectorAll(".quiz-option");
    if (!opts.length) return;
    const values = [...opts].map((o) => o.dataset.value);
    if (values.includes("ai-code")) return;
    if (!values.includes("ai-writing")) return;
    const container = document.querySelector(".quiz-options");
    if (!container) return;
    const anyBtn = [...opts].find((o) => o.dataset.value === "any");
    EXTRA.forEach((ex) => {
      if (values.includes(ex.value)) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option";
      btn.dataset.value = ex.value;
      btn.innerHTML = `<span class="opt-emoji">${ex.emoji}</span> ${ex.label}`;
      btn.addEventListener("click", () => {
        container.querySelectorAll(".quiz-option").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        btn.dispatchEvent(new Event("click", { bubbles: true }));
        // Trigger same as quiz.js: set answer via clicking pattern
        const event = new MouseEvent("click", { bubbles: true });
        // quiz.js binds its own listeners – clone behavior by simulating selection
        const native = container.querySelector(`[data-value="${ex.value}"]`);
      });
      if (anyBtn) container.insertBefore(btn, anyBtn);
      else container.appendChild(btn);
    });
    // Re-bind: click on new buttons should work like others – fire quiz's handler by cloning
    // Simplest reliable path: location.reload not needed; quiz binds on render.
    // Force re-click path: dispatch to parent by using same class and letting user click.
  });

  const root = document.getElementById("quizRoot");
  if (root) observer.observe(root, { childList: true, subtree: true });
})();
