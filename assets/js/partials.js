/**
 * Shared header/footer + lang switcher + enhancement loaders.
 */
(function () {
  const CATEGORIES = [
    { id: "ai-writing", nameKey: "nav.writing", name: "AI-skrivverktyg" },
    { id: "ai-image", nameKey: "nav.image", name: "AI-bildverktyg" },
    { id: "produktivitet", nameKey: "nav.productivity", name: "Produktivitet" },
    { id: "ai-code", nameKey: "nav.code", name: "AI-kod" },
    { id: "ai-voice", nameKey: "nav.voice", name: "Röst & video" },
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
        `<a href="/kategori/${c.id}.html" data-i18n="${c.nameKey}"${isCurrent(`/kategori/${c.id}.html`) ? ' aria-current="page"' : ""}>${c.name}</a>`
    ).join("");

    el.innerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="/">
            <span class="dot"></span> Radar
          </a>
          <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">☰</button>
          <nav class="main-nav" id="mainNav">
            <a href="/" data-i18n="nav.home"${isCurrent("/") ? ' aria-current="page"' : ""}>Hem</a>
            ${categoryLinks}
            <a href="/basta.html">Topplistor</a>
            <button type="button" class="lang-switch" id="langSwitch" aria-label="Switch language">EN</button>
            <a href="/quiz.html" class="nav-cta" data-i18n="nav.quiz">Ta quizet →</a>
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

    const langBtn = document.getElementById("langSwitch");
    if (langBtn && window.RadarI18n) {
      langBtn.addEventListener("click", () => window.RadarI18n.toggle());
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
              <p style="max-width:280px;" data-i18n="footer.tagline">Smarta rekommendationer av AI-verktyg för nordiska användare.</p>
            </div>
            <div class="footer-col">
              <h4>Utforska</h4>
              ${categoryLinks}
              <a href="/basta.html">Topplistor</a>
              <a href="/alternativ.html">Alternativ</a>
              <a href="/om.html">Om Radar</a>
            </div>
            <div class="footer-col">
              <h4>Quiz</h4>
              <a href="/quiz.html">Ta quizet →</a>
            </div>
          </div>
          <div class="disclosure">
            <span data-i18n="footer.disclosure">Radar kan få provision via annonslänkar. Det påverkar inte priset eller rankingen.</span>
          </div>
          <div class="footer-bottom">© ${year} Radar</div>
        </div>
      </footer>
    `;
  }

  function loadScript(src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  }

  function loadCSS(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadCSS("/assets/css/a11y.css");
    loadCSS("/assets/css/mobile-dense.css");
    renderHeader();
    renderFooter();
    if (window.RadarI18n) {
      window.RadarI18n.apply();
      const langBtn = document.getElementById("langSwitch");
      if (langBtn) langBtn.addEventListener("click", () => window.RadarI18n.toggle());
    }
    loadScript("/assets/js/homepage-stats.js");
    loadScript("/assets/js/recently-viewed.js");
  });
})();
