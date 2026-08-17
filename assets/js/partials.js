/**
 * Delad header/footer – FRED-Radar
 */
(function () {
  const CATEGORIES = [
    { id: "ai-writing", name: "Skriv", full: "AI-skrivverktyg" },
    { id: "ai-image", name: "Bild", full: "AI-bildverktyg" },
    { id: "produktivitet", name: "Produktivitet", full: "Produktivitet" },
    { id: "ai-code", name: "Kod", full: "AI för kod" },
    { id: "ai-voice", name: "Röst", full: "Röst & transkribering" },
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
            <span class="dot"></span> FRED-Radar
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
              <a class="brand" href="/"><span class="dot"></span> FRED-Radar</a>
              <p style="max-width:280px;">Smarta rekommendationer &amp; jämförelser av AI- och produktivitetsverktyg – anpassat för svenska och nordiska användare.</p>
            </div>
            <div class="footer-col">
              <h4>Kategorier</h4>
              ${categoryLinks}
            </div>
            <div class="footer-col">
              <h4>FRED-Radar</h4>
              <a href="/quiz.html">Ta quizet</a>
              <a href="/basta.html">Bästa listor</a>
              <a href="/alternativ.html">Alternativ</a>
              <a href="/#om">Om FRED-Radar</a>
            </div>
          </div>
          <div class="disclosure">
            <strong>Om annonslänkar:</strong> FRED-Radar kan få provision när du klickar dig vidare till eller köper ett verktyg via länkarna på sajten. Det påverkar inte vad du betalar, och det styr inte våra rankingar.
          </div>
          <div class="footer-bottom">
            © ${year} FRED-Radar. Senast tillagda: Meta AI 2026-08-15. Priser kan ändras.
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
