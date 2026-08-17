/**
 * Radar i18n – SV default, EN on toggle.
 * data-i18n="key" on elements. Lang in localStorage radar_lang.
 */
window.RadarI18n = (function () {
  const STR = {
    sv: {
      "nav.home": "Hem",
      "nav.quiz": "Ta quizet →",
      "nav.writing": "AI-skrivverktyg",
      "nav.image": "AI-bildverktyg",
      "nav.productivity": "Produktivitet",
      "hero.eyebrow": "🇸🇪 Byggt för svenska & nordiska förhållanden",
      "hero.title": "Sluta gissa. Hitta ditt AI-verktyg på 60 sekunder.",
      "hero.lead": "Radar väger pris, kvalitet och GDPR för varje verktyg – och visar exakt varför ett verktyg passar dig.",
      "hero.cta": "Ta 60-sekundersquizet →",
      "hero.browse": "Bläddra i kategorier",
      "stat.tools": "verktyg jämförda",
      "stat.categories": "kategorier",
      "stat.free": "att använda Radar",
      "stat.independent": "oberoende ranking",
      "sec.categories": "Kategorier",
      "sec.explore": "Utforska verktyg efter behov",
      "sec.featured": "Redaktionens val",
      "sec.featuredTitle": "Utvalda verktyg just nu",
      "sec.how": "Så funkar det",
      "sec.howTitle": "Rätt verktyg på tre steg",
      "sec.about": "Om Radar",
      "sec.aboutTitle": "Ärlig ranking, inte \"bäst i test\"",
      "cta.ready": "Redo?",
      "cta.title": "Hitta ditt verktyg innan kaffet blir kallt",
      "cta.sub": "Sex frågor. En viktad ranking. Ingen bindningstid.",
      "cta.btn": "Ta quizet nu →",
      "footer.tagline": "Smarta rekommendationer & jämförelser av AI- och produktivitetsverktyg – anpassat för svenska och nordiska användare.",
      "footer.disclosure": "Radar kan få provision när du klickar dig vidare till eller köper ett verktyg via länkarna på sajten. Det påverkar inte vad du betalar, och det styr inte våra rankingar.",
      "lang.switch": "EN",
      "recent.title": "Senast tittat på",
      "recent.sub": "Verktyg du klickat dig vidare till tidigare.",
    },
    en: {
      "nav.home": "Home",
      "nav.quiz": "Take the quiz →",
      "nav.writing": "AI Writing",
      "nav.image": "AI Image",
      "nav.productivity": "Productivity",
      "hero.eyebrow": "🇸🇪 Built for Nordic users & GDPR realities",
      "hero.title": "Stop guessing. Find your AI tool in 60 seconds.",
      "hero.lead": "Radar weighs price, quality and GDPR for every tool – and shows exactly why a tool fits you.",
      "hero.cta": "Take the 60-second quiz →",
      "hero.browse": "Browse categories",
      "stat.tools": "tools compared",
      "stat.categories": "categories",
      "stat.free": "to use Radar",
      "stat.independent": "independent ranking",
      "sec.categories": "Categories",
      "sec.explore": "Explore tools by need",
      "sec.featured": "Editor's picks",
      "sec.featuredTitle": "Featured tools right now",
      "sec.how": "How it works",
      "sec.howTitle": "The right tool in three steps",
      "sec.about": "About Radar",
      "sec.aboutTitle": "Honest ranking, not \"best in test\"",
      "cta.ready": "Ready?",
      "cta.title": "Find your tool before your coffee gets cold",
      "cta.sub": "Six questions. A weighted ranking. No commitment.",
      "cta.btn": "Take the quiz now →",
      "footer.tagline": "Smart recommendations & comparisons of AI and productivity tools – tailored for Nordic users.",
      "footer.disclosure": "Radar may earn a commission when you click through or buy a tool via links on this site. It does not affect what you pay, and it does not drive our rankings.",
      "lang.switch": "SV",
      "recent.title": "Recently viewed",
      "recent.sub": "Tools you clicked through to earlier.",
    },
  };

  function getLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "sv") {
      localStorage.setItem("radar_lang", q);
      return q;
    }
    return localStorage.getItem("radar_lang") || "sv";
  }

  function setLang(lang) {
    localStorage.setItem("radar_lang", lang);
    apply(lang);
    const url = new URL(location.href);
    if (lang === "sv") url.searchParams.delete("lang");
    else url.searchParams.set("lang", "en");
    history.replaceState({}, "", url);
  }

  function t(key, lang) {
    lang = lang || getLang();
    return (STR[lang] && STR[lang][key]) || (STR.sv && STR.sv[key]) || key;
  }

  function apply(lang) {
    lang = lang || getLang();
    document.documentElement.lang = lang === "en" ? "en" : "sv";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key, lang);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = val;
      else el.textContent = val;
    });
    const btn = document.getElementById("langSwitch");
    if (btn) btn.textContent = t("lang.switch", lang);
  }

  function toggle() {
    setLang(getLang() === "sv" ? "en" : "sv");
  }

  return { getLang, setLang, t, apply, toggle, STR };
})();
