/**
 * Progressiv förbättring för de statiskt genererade kategorisidorna:
 * sortering och prisfiltrering på redan renderade .tool-card-element.
 * Körs helt i klienten, ingen ny data hämtas.
 */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("toolGrid");
    const sortSelect = document.getElementById("sortSelect");
    const budgetSelect = document.getElementById("budgetSelect");
    if (!grid || !sortSelect) return;

    const cards = Array.from(grid.querySelectorAll(".tool-card"));

    function apply() {
      const sortBy = sortSelect.value;
      const budget = budgetSelect ? budgetSelect.value : "all";

      let visible = cards.filter((card) => {
        if (budget === "all") return true;
        const price = parseFloat(card.dataset.price);
        if (budget === "free") return price === 0;
        if (budget === "low") return price <= 150;
        if (budget === "medium") return price <= 400;
        return true;
      });

      const sorters = {
        recommended: (a, b) => parseFloat(b.dataset.score) - parseFloat(a.dataset.score),
        price: (a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price),
        gdpr: (a, b) => parseFloat(b.dataset.gdpr) - parseFloat(a.dataset.gdpr),
      };
      visible.sort(sorters[sortBy] || sorters.recommended);

      cards.forEach((c) => (c.style.display = "none"));
      visible.forEach((c) => {
        c.style.display = "";
        grid.appendChild(c);
      });

      const empty = document.getElementById("emptyState");
      if (empty) empty.style.display = visible.length === 0 ? "block" : "none";
    }

    sortSelect.addEventListener("change", apply);
    if (budgetSelect) budgetSelect.addEventListener("change", apply);
  });
})();
