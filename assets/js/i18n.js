/**
 * FRED-Radar i18n
 * Default: English. /sv/... = Swedish.
 * Swedish browsers see a banner but stay on EN until they opt in.
 */
(function (root) {
  const STORAGE = "fred-lang";
  const dicts = { en: null, sv: null };
  let lang = "en";
  let ready = false;

  function pathIsSv() {
    const p = location.pathname.replace(/\/+$/, "") || "/";
    return p === "/sv" || p.startsWith("/sv/");
  }

  function detectLang() {
    if (pathIsSv()) return "sv";
    return "en";
  }

  function stripSv(pathname) {
    if (pathname === "/sv") return "/";
    if (pathname.startsWith("/sv/")) {
      const rest = pathname.slice(3);
      return rest || "/";
    }
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
    return path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
  }

  function t(key, vars) {
    const pack = dicts[lang] || dicts.en || {};
    let s = get(pack, key);
    if (s == null) s = get(dicts.en || {}, key);
    if (s == null) return key;
    if (typeof s !== "string") return s;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        s = s.replace(new RegExp("\\{\\{\\s*" + k + "\\s*\\}\\}", "g"), String(vars[k]));
      });
    }
    return s;
  }

  function localizeTool(tool) {
    if (!tool) return tool;
    const block = lang === "sv" ? tool.sv : tool.en;
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
    document.documentElement.lang = t("htmlLang") || lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    const titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) document.title = t(titleEl.getAttribute("data-i18n"));
    const metaDesc = document.querySelector('meta[name="description"][data-i18n]');
    if (metaDesc) metaDesc.setAttribute("content", t(metaDesc.getAttribute("data-i18n")));
  }

  function showBanner() {
    if (lang !== "en") return;
    let navLang = "";
    try {
      navLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    } catch (e) {}
    if (!navLang.startsWith("sv")) return;
    try {
      if (localStorage.getItem(STORAGE)) return;
      if (sessionStorage.getItem("fred-sv-banner-dismissed")) return;
    } catch (e) {}

    const bar = document.createElement("div");
    bar.className = "lang-banner";
    bar.setAttribute("role", "status");
    bar.innerHTML =
      "<span>" + t("banner.text") + "</span> " +
      '<button type="button" class="lang-banner-cta" id="svBannerCta">' + t("banner.cta") + "</button> " +
      '<button type="button" class="lang-banner-x" id="svBannerX" aria-label="Dismiss">×</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById("svBannerCta")?.addEventListener("click", () => setLang("sv"));
    document.getElementById("svBannerX")?.addEventListener("click", () => {
      try { sessionStorage.setItem("fred-sv-banner-dismissed", "1"); } catch (e) {}
      bar.remove();
    });
  }

  function injectHreflang() {
    const clean = stripSv(location.pathname);
    const origin = "https://fred-radar.vercel.app";
    const enHref = origin + (clean === "/" ? "/" : clean);
    const svHref = origin + (clean === "/" ? "/sv" : "/sv" + clean);
    function upsert(rel, hreflang, href) {
      let link = document.querySelector('link[rel="' + rel + '"][hreflang="' + hreflang + '"]');
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

  async function loadJson(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  async function init() {
    lang = detectLang();
    const [en, sv] = await Promise.all([
      loadJson("/data/i18n/en.json"),
      loadJson("/data/i18n/sv.json"),
    ]);
    dicts.en = en || {};
    dicts.sv = sv || {};
    ready = true;
    applyDom();
    injectHreflang();
    showBanner();
    root.dispatchEvent(new CustomEvent("fred-i18n-ready", { detail: { lang } }));
  }

  function setLang(next) {
    if (next !== "en" && next !== "sv") return;
    try { localStorage.setItem(STORAGE, next); } catch (e) {}
    const dest = withLang(location.pathname + location.search + location.hash, next);
    if (dest !== location.pathname + location.search + location.hash) {
      location.href = dest;
      return;
    }
    lang = next;
    applyDom();
    root.dispatchEvent(new CustomEvent("fred-i18n-ready", { detail: { lang } }));
  }

  root.FredI18n = {
    t,
    get lang() { return lang; },
    setLang,
    withLang,
    localizeTool,
    pathIsSv,
    ready: () => ready,
    whenReady: (fn) => {
      if (ready) fn();
      else root.addEventListener("fred-i18n-ready", fn, { once: true });
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
