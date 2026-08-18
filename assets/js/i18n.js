/**
 * FRED-Radar i18n
 * Default English. /sv/... = Swedish.
 * Dictionaries are embedded (i18n-dict.js) so nav/quiz never wait on fetch.
 */
(function (root) {
  const STORAGE = "fred_lang";
  const embedded = (root.FRED_I18N_DICTS || {});
  const dicts = {
    en: embedded.en || {},
    sv: embedded.sv || {},
  };
  let lang = "en";
  let ready = false;

  function pathIsSv() {
    const p = (location.pathname || "/").replace(/\/+$/, "") || "/";
    return p === "/sv" || p.startsWith("/sv/");
  }

  function detectLang() {
    if (pathIsSv()) return "sv";
    return "en";
  }

  function stripSv(pathname) {
    if (pathname === "/sv") return "/";
    if (pathname.startsWith("/sv/")) return pathname.slice(3) || "/";
    return pathname || "/";
  }

  function withLang(href, nextLang) {
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return href;
    const url = new URL(href, location.origin);
    const clean = stripSv(url.pathname);
    if (nextLang === "sv") {
      url.pathname = clean === "/" ? "/sv" : "/sv" + (clean.startsWith("/") ? clean : "/" + clean);
    } else {
      url.pathname = clean;
    }
    return url.pathname + url.search + url.hash;
  }

  function get(obj, path) {
    return String(path).split(".").reduce(function (acc, k) {
      return acc && acc[k] != null ? acc[k] : undefined;
    }, obj);
  }

  function interpolate(s, vars) {
    if (!vars || typeof s !== "string") return s;
    Object.keys(vars).forEach(function (k) {
      s = s.replace(new RegExp("\\{\\{\\s*" + k + "\\s*\\}\\}", "g"), String(vars[k]));
    });
    return s;
  }

  function t(key, vars) {
    var s = get(dicts[lang] || {}, key);
    if (s == null) s = get(dicts.en || {}, key);
    if (s == null) return key;
    if (typeof s !== "string") return s;
    return interpolate(s, vars);
  }

  function localizeTool(tool) {
    if (!tool) return tool;
    var block = lang === "sv" ? tool.sv : tool.en;
    if (!block) return tool;
    return Object.assign({}, tool, {
      tagline: block.tagline || tool.tagline,
      description: block.description || tool.description,
      bestFor: block.bestFor || tool.bestFor,
      pros: block.pros || tool.pros,
      cons: block.cons || tool.cons,
    });
  }

  function applyDom() {
    document.documentElement.lang = lang === "sv" ? "sv" : "en";
    document.documentElement.setAttribute("data-lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    var titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) document.title = t(titleEl.getAttribute("data-i18n"));
    var metaDesc = document.querySelector('meta[name="description"][data-i18n]');
    if (metaDesc) metaDesc.setAttribute("content", t(metaDesc.getAttribute("data-i18n")));
  }

  function showBanner() {
    if (lang !== "en") return;
    var navLang = "";
    try { navLang = (navigator.language || navigator.userLanguage || "").toLowerCase(); } catch (e) {}
    if (!navLang.startsWith("sv")) return;
    try {
      if (localStorage.getItem(STORAGE)) return;
      if (sessionStorage.getItem("fred-sv-banner-dismissed")) return;
    } catch (e) {}
    if (document.querySelector(".lang-banner")) return;
    var bar = document.createElement("div");
    bar.className = "lang-banner";
    bar.setAttribute("role", "status");
    bar.innerHTML =
      "<span>" + t("banner.text") + "</span> " +
      '<button type="button" class="lang-banner-cta" id="svBannerCta">' + t("banner.cta") + "</button> " +
      '<button type="button" class="lang-banner-x" id="svBannerX" aria-label="Dismiss">×</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    var cta = document.getElementById("svBannerCta");
    if (cta) cta.addEventListener("click", function () { setLang("sv"); });
    var x = document.getElementById("svBannerX");
    if (x) x.addEventListener("click", function () {
      try { sessionStorage.setItem("fred-sv-banner-dismissed", "1"); } catch (e) {}
      bar.remove();
    });
  }

  function injectHreflang() {
    var clean = stripSv(location.pathname);
    var origin = "https://fred-radar.vercel.app";
    var enHref = origin + (clean === "/" ? "/" : clean);
    var svHref = origin + (clean === "/" ? "/sv" : "/sv" + clean);
    function upsert(rel, hreflang, href) {
      var link = document.querySelector('link[rel="' + rel + '"][hreflang="' + hreflang + '"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        link.setAttribute("hreflang", hreflang);
        document.head.appendChild(link);
      }
      link.href = href;
    }
    upsert("alternate", "en", enHref);
    upsert("alternate", "sv", svHref);
    upsert("alternate", "x-default", enHref);
  }

  function markReady() {
    applyDom();
    if (!ready) {
      ready = true;
      injectHreflang();
      showBanner();
    }
    root.dispatchEvent(new CustomEvent("fred-i18n-ready", { detail: { lang: lang } }));
  }

  function setLang(next) {
    if (next !== "en" && next !== "sv") return;
    try { localStorage.setItem(STORAGE, next); } catch (e) {}
    var dest = withLang(location.pathname + location.search + location.hash, next);
    if (dest !== location.pathname + location.search + location.hash) {
      location.href = dest;
      return;
    }
    lang = next;
    markReady();
  }

  async function hydrateFromNetwork() {
    async function load(path) {
      try {
        var r = await fetch(path, { cache: "no-cache" });
        if (!r.ok) return null;
        return await r.json();
      } catch (e) { return null; }
    }
    var pack = await Promise.all([
      load("/locales/en.json"),
      load("/locales/sv.json"),
      load("/data/i18n/en.json"),
      load("/data/i18n/sv.json"),
    ]);
    if (pack[0] || pack[2]) dicts.en = Object.assign({}, dicts.en, pack[2] || {}, pack[0] || {});
    if (pack[1] || pack[3]) dicts.sv = Object.assign({}, dicts.sv, pack[3] || {}, pack[1] || {});
    markReady();
  }

  lang = detectLang();

  root.FredI18n = {
    t: t,
    get lang() { return lang; },
    setLang: setLang,
    withLang: withLang,
    localizeTool: localizeTool,
    pathIsSv: pathIsSv,
    ready: function () { return ready; },
    whenReady: function (fn) {
      if (ready) fn();
      else root.addEventListener("fred-i18n-ready", fn, { once: true });
    },
  };

  function start() {
    markReady();
    hydrateFromNetwork();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(typeof window !== "undefined" ? window : globalThis);
