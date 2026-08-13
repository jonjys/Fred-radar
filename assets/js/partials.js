/**
 * Delad header/footer för alla sidor. Injiceras i <div id="site-header">
 * och <div id="site-footer"> så navigationen bara behöver underhållas på
 * ett ställe – även på automatiskt genererade kategorisidor.
 */
(function () {
  const CATEGORIES = [
    { id: "ai-writing", name: "AI-skrivverktyg" },
    { id: "ai-image", name: "AI-bildverktyg" },
    { id: "produktivitet", name: "Produktivitet" },
  ];

  function currentPath() {
    return window.location.pathname.replace(/\/index\.html$/, "/");
  }

  function isCurrent(href) {
    const path = currentPath();
    if (href === "/" && (path === "/" || path === "")) return true;
    return href !== "/" && path.endsWith(href);
  }

  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;

    const categoryLinks = CATEGORIES.map(
      (c) =>
        `<a href="/kategori/${c.id}.html"${isCurrent(`/kategori/${c.id}.html`) ? ' aria-current="page"' : ""}>${c.name}</a>`
    ).join("");

    el.innerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="/">
            <span class="dot"></span> Radar
          </a>
          <button class="nav-toggle" id="navToggle" aria-label="Öppna meny" aria-expanded="false">☰</button>
          <nav class="main-nav" id="mainNav">
            <a href="/"${isCurrent("/") ? ' aria-current="page"' : ""}>Hem</a>
            ${categoryLinks}
            <a href="/quiz.html" class="nav-cta">Ta quizet →</a>
          </nav>
        </div>
      </header>
    `;

    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;

    const year = new Date().getFullYear();
    const categoryLinks = CATEGORIES.map(
      (c) => `<a href="/kategori/${c.id}.html">${c.name}</a>`
    ).join("");

    el.innerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-col">
              <a class="brand" href="/"><span class="dot"></span> Radar</a>
              <p style="max-width:280px;">Smarta rekommendationer &amp; jämförelser av AI- och produktivitetsverktyg – anpassat för svenska och nordiska användare.</p>
            </div>
            <div class="footer-col">
              <h4>Kategorier</h4>
              ${categoryLinks}
            </div>
            <div class="footer-col">
              <h4>Radar</h4>
              <a href="/quiz.html">Ta quizet</a>
              <a href="/#om">Om Radar</a>
            </div>
          </div>
          <div class="disclosure">
            <strong>Om annonslänkar:</strong> Radar kan få provision när du klickar dig vidare till eller köper ett verktyg via länkarna på sajten. Det påverkar inte vad du betalar, och det styr inte våra rankingar – vi rankar utifrån kvalitet, pris och GDPR-anpassning, inte vem som betalar mest.
          </div>
          <div class="footer-bottom">
            © ${year} Radar. Priser och information kan ändras – kontrollera alltid leverantörens webbplats innan köp.
          </div>
        </div>
      </footer>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
  });
})();
