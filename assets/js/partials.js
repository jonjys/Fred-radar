/**
 * Shared header/footer – FRED-Radar (EN default, working EN/SV toggle)
 */
(function () {
  const CAT_IDS = ["ai-writing", "ai-image", "produktivitet", "ai-code", "ai-voice"];

  function I() {
    return window.FredI18n;
  }
  function t(k) {
    return I() ? I().t(k) : k;
  }
  function href(path) {
    return I() ? I().withLang(path, I().lang) : path;
  }
  function lang() {
    return I() ? I().lang : "en";
  }

  function currentPath() {
    let p = window.location.pathname.replace(/\/index\.html$/, "/");
    if (p === "/sv") p = "/";
    if (p.startsWith("/sv/")) p = p.slice(3);
    return p;
  }

  function isCurrent(target) {
    const path = currentPath();
    if (target === "/" && (path === "/" || path === "")) return true;
    return target !== "/" && path.endsWith(target);
  }

  function langToggleHTML() {
    const L = lang();
    return `
      <div class="lang-toggle" role="group" aria-label="Language">
        <button type="button" class="lang-btn${L === "en" ? " active" : ""}" data-lang="en" aria-pressed="${L === "en"}">EN</button>
        <button type="button" class="lang-btn${L === "sv" ? " active" : ""}" data-lang="sv" aria-pressed="${L === "sv"}">SV</button>
      </div>`;
  }

  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;

    const categoryLinks = CAT_IDS.map((id) => {
      const name = t("cats." + id + ".name");
      const full = t("cats." + id + ".full");
      const path = `/kategori/${id}.html`;
      return `<a href="${href(path)}"${isCurrent(path) ? ' aria-current="page"' : ""} title="${full}">${name}</a>`;
    }).join("");

    el.innerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="${href("/")}">
            <span class="dot"></span> FRED-Radar
          </a>
          <div class="header-right">
            ${langToggleHTML()}
            <button class="nav-toggle" id="navToggle" aria-label="${t("nav.menu")}" aria-expanded="false">☰</button>
          </div>
          <nav class="main-nav" id="mainNav">
            <a href="${href("/")}"${isCurrent("/") ? ' aria-current="page"' : ""}>${t("nav.home")}</a>
            ${categoryLinks}
            <a href="${href("/basta.html")}"${isCurrent("/basta.html") ? ' aria-current="page"' : ""}>${t("nav.best")}</a>
            <a href="${href("/alternativ.html")}"${isCurrent("/alternativ.html") ? ' aria-current="page"' : ""}>${t("nav.alts")}</a>
            <a href="${href("/quiz.html")}" class="nav-cta">${t("nav.quiz")}</a>
          </nav>
        </div>
      </header>
    `;

    el.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => I() && I().setLang(btn.getAttribute("data-lang")));
    });

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
    const categoryLinks = CAT_IDS.map((id) => {
      return `<a href="${href("/kategori/" + id + ".html")}">${t("cats." + id + ".full")}</a>`;
    }).join("");

    el.innerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-col">
              <a class="brand" href="${href("/")}"><span class="dot"></span> FRED-Radar</a>
              <p style="max-width:280px;">${t("footer.blurb")}</p>
            </div>
            <div class="footer-col">
              <h4>${t("footer.categories")}</h4>
              ${categoryLinks}
            </div>
            <div class="footer-col">
              <h4>FRED-Radar</h4>
              <a href="${href("/quiz.html")}">${t("footer.takeQuiz")}</a>
              <a href="${href("/basta.html")}">${t("footer.bestLists")}</a>
              <a href="${href("/alternativ.html")}">${t("footer.alts")}</a>
              <a href="${href("/")}#om">${t("footer.about")}</a>
            </div>
          </div>
          <div class="disclosure">
            <strong>${lang() === "sv" ? "Om annonslänkar:" : "Affiliate links:"}</strong> ${t("footer.disclosure")}
          </div>
          <div class="footer-bottom">${t("footer.bottom", { year })}</div>
        </div>
      </footer>
    `;
  }

  function renderAll() {
    renderHeader();
    renderFooter();
  }

  function boot() {
    if (window.FredI18n && window.FredI18n.whenReady) {
      window.FredI18n.whenReady(renderAll);
    } else {
      renderAll();
    }
    window.addEventListener("fred-i18n-ready", renderAll);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
