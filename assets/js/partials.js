/**
 * Shared header/footer – FRED-Radar (EN default, working EN/SV toggle)
 */
(function () {
  const CAT_IDS = ["ai-writing", "ai-image", "produktivitet", "ai-code", "ai-voice"];
  const EN = {
    "nav.home": "Home",
    "nav.best": "Best",
    "nav.alts": "Alternatives",
    "nav.quiz": "Quiz →",
    "nav.menu": "Open menu",
    "cats.ai-writing.name": "Write",
    "cats.ai-image.name": "Image",
    "cats.produktivitet.name": "Productivity",
    "cats.ai-code.name": "Code",
    "cats.ai-voice.name": "Voice",
    "cats.ai-writing.full": "AI writing tools",
    "cats.ai-image.full": "AI image tools",
    "cats.produktivitet.full": "Productivity",
    "cats.ai-code.full": "AI for code",
    "cats.ai-voice.full": "Voice & transcription",
    "footer.blurb": "Honest recommendations of AI and productivity tools.",
    "footer.categories": "Categories",
    "footer.takeQuiz": "Take the quiz",
    "footer.bestLists": "Best lists",
    "footer.alts": "Alternatives",
    "footer.about": "About FRED-Radar",
    "footer.disclosure": "FRED-Radar may earn a commission if you click through. It does not change price or ranking.",
    "footer.bottom": "© {{year}} FRED-Radar."
  };

  function I() { return window.FredI18n; }
  function t(k, vars) {
    var v = I() ? I().t(k, vars) : null;
    if (v && v !== k) return v;
    var fb = EN[k] || k;
    if (vars && typeof fb === "string") {
      Object.keys(vars).forEach(function (x) {
        fb = fb.replace("{{" + x + "}}", String(vars[x]));
      });
    }
    return fb;
  }
  function href(path) { return I() ? I().withLang(path, I().lang) : path; }
  function lang() { return I() ? I().lang : "en"; }

  function currentPath() {
    var p = window.location.pathname.replace(/\/index\.html$/, "/");
    if (p === "/sv") p = "/";
    if (p.startsWith("/sv/")) p = p.slice(3);
    return p;
  }

  function isCurrent(target) {
    var path = currentPath();
    if (target === "/" && (path === "/" || path === "")) return true;
    return target !== "/" && path.indexOf(target.replace(".html", "")) !== -1;
  }

  function langToggleHTML() {
    var L = lang();
    return (
      '<div class="lang-toggle" role="group" aria-label="Language">' +
      '<button type="button" class="lang-btn' + (L === "en" ? " active" : "") + '" data-lang="en" aria-pressed="' + (L === "en") + '">EN</button>' +
      '<button type="button" class="lang-btn' + (L === "sv" ? " active" : "") + '" data-lang="sv" aria-pressed="' + (L === "sv") + '">SV</button>' +
      "</div>"
    );
  }

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var categoryLinks = CAT_IDS.map(function (id) {
      var name = t("cats." + id + ".name");
      var full = t("cats." + id + ".full");
      var path = "/kategori/" + id + ".html";
      return '<a href="' + href(path) + '"' + (isCurrent(path) ? ' aria-current="page"' : "") + ' title="' + full + '">' + name + "</a>";
    }).join("");

    el.innerHTML =
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="' + href("/") + '"><span class="dot"></span> FRED-Radar</a>' +
      '<div class="header-right">' + langToggleHTML() +
      '<button class="nav-toggle" id="navToggle" aria-label="' + t("nav.menu") + '" aria-expanded="false">☰</button></div>' +
      '<nav class="main-nav" id="mainNav">' +
      '<a href="' + href("/") + '"' + (isCurrent("/") ? ' aria-current="page"' : "") + ">" + t("nav.home") + "</a>" +
      categoryLinks +
      '<a href="' + href("/basta.html") + '"' + (isCurrent("/basta") || isCurrent("/best") ? ' aria-current="page"' : "") + ">" + t("nav.best") + "</a>" +
      '<a href="' + href("/alternativ.html") + '"' + (isCurrent("/alternativ") || isCurrent("/alternatives") ? ' aria-current="page"' : "") + ">" + t("nav.alts") + "</a>" +
      '<a href="' + href("/quiz.html") + '" class="nav-cta">' + t("nav.quiz") + "</a>" +
      "</nav></div></header>";

    el.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (I()) I().setLang(btn.getAttribute("data-lang"));
      });
    });
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var year = new Date().getFullYear();
    var categoryLinks = CAT_IDS.map(function (id) {
      return '<a href="' + href("/kategori/" + id + ".html") + '">' + t("cats." + id + ".full") + "</a>";
    }).join("");
    el.innerHTML =
      '<footer class="site-footer"><div class="wrap"><div class="footer-grid">' +
      '<div class="footer-col"><a class="brand" href="' + href("/") + '"><span class="dot"></span> FRED-Radar</a>' +
      '<p style="max-width:280px;">' + t("footer.blurb") + "</p></div>" +
      '<div class="footer-col"><h4>' + t("footer.categories") + "</h4>" + categoryLinks + "</div>" +
      '<div class="footer-col"><h4>FRED-Radar</h4>' +
      '<a href="' + href("/quiz.html") + '">' + t("footer.takeQuiz") + "</a>" +
      '<a href="' + href("/basta.html") + '">' + t("footer.bestLists") + "</a>" +
      '<a href="' + href("/alternativ.html") + '">' + t("footer.alts") + "</a>" +
      '<a href="' + href("/") + '#om">' + t("footer.about") + "</a></div></div>" +
      '<div class="disclosure"><strong>' + (lang() === "sv" ? "Om annonslänkar:" : "Affiliate links:") + "</strong> " + t("footer.disclosure") + "</div>" +
      '<div class="footer-bottom">' + t("footer.bottom", { year: year }) + "</div></div></footer>";
  }

  function renderAll() {
    renderHeader();
    renderFooter();
  }

  function boot() {
    renderAll();
    if (window.FredI18n && window.FredI18n.whenReady) window.FredI18n.whenReady(renderAll);
    window.addEventListener("fred-i18n-ready", renderAll);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
