/**
 * Delad header/footer för alla sidor. Injiceras i <div id="site-header">
 * och <div id="site-footer"> så navigationen bara behöver underhållas på
 * ett ställe – även på automatiskt genererade kategorisidor.
 */
(function () {
  const CATEGORIES = [
    { id: "ai-writing", name: "Skriv", full: "AI-skrivverktyg" },
    { id: "ai-image", name: "Bild", full: "AI-bildverktyg" },
    { id: "produktivitet", name: "Produktivitet", full: "Produktivitet" },
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
        `<a href="/kategori/${c.id}.html"${isCurrent(`/kategori/${c.id}.html`) ? ' aria-current="page"' : ""} title="${c.full}">${c.name}</a>`
    ).join("");

    el.innerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="/">
            <span class="dot"></span> Fred-Radar
          </a>
          <button class="nav-toggle" id="navToggle" aria-label="Öppna meny" aria-expanded="false">☰</button>
          <nav class="main-nav" id="mainNav">
            <a href="/"${isCurrent("/") ? ' aria-current="page"' : ""}>Hem</a>
            ${categoryLinks}
            <a href="/basta.html"${isCurrent("/basta.html") ? ' aria-current="page"' : ""}>Bästa</a>
            <a href="/alternativ.html"${isCurrent("/alternativ.html") ? ' aria-current="page"' : ""}>Alternativ</a>
            <a href="/quiz.html" class="nav-cta">Quiz →</a>
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
      (c) => `<a href="/kategori/${c.id}.html">${c.full}</a>`
    ).join("");

    el.innerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-col">
              <a class="brand" href="/"><span class="dot"></span> Fred-Radar</a>
              <p style="max-width:280px;">Smarta rekommendationer &amp; jämförelser av AI- och produktivitetsverktyg – anpassat för svenska och nordiska användare.</p>
            </div>
            <div class="footer-col">
              <h4>Kategorier</h4>
              ${categoryLinks}
            </div>
            <div class="footer-col">
              <h4>Fred-Radar</h4>
              <a href="/quiz.html">Ta quizet</a>
              <a href="/basta.html">Bästa listor</a>
              <a href="/alternativ.html">Alternativ</a>
              <a href="/#om">Om Fred-Radar</a>
            </div>
          </div>
          <div class="disclosure">
            <strong>Om annonslänkar:</strong> Fred-Radar kan få provision när du klickar dig vidare till eller köper ett verktyg via länkarna på sajten. Det påverkar inte vad du betalar, och det styr inte våra rankingar – vi rankar utifrån kvalitet, pris och GDPR-anpassning, inte vem som betalar mest.
          </div>
          <div class="footer-bottom">
            © ${year} Fred-Radar. Priser och information kan ändras – kontrollera alltid leverantörens webbplats innan köp.
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
