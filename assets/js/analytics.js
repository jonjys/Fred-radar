/**
 * Privacy-vänlig analytics – av som standard.
 *
 * Läser data/site.json → analytics: { provider, domain, enabled }. Om
 * enabled=false (standard) görs ingenting alls: inga externa script laddas,
 * inga cookies sätts, inga nätverksanrop utöver hämtningen av site.json.
 *
 * Aktivera: sätt "domain" och "enabled": true i data/site.json, committa,
 * deploya. Inget kodändring krävs. Se README för fler leverantörer.
 */
(function () {
  fetch("/data/site.json")
    .then((r) => r.json())
    .then((site) => {
      const a = site && site.analytics;
      if (!a || !a.enabled || !a.domain) return;

      if (a.provider === "plausible") {
        const s = document.createElement("script");
        s.defer = true;
        s.dataset.domain = a.domain;
        s.src = "https://plausible.io/js/script.js";
        document.head.appendChild(s);
        return;
      }

      if (a.provider === "fathom") {
        const s = document.createElement("script");
        s.defer = true;
        s.dataset.site = a.domain; // här är "domain" Fathoms site-ID, inte en domän
        s.src = "https://cdn.usefathom.com/script.js";
        document.head.appendChild(s);
        return;
      }

      // Lägg till fler leverantörer här vid behov (t.ex. Vercel Analytics
      // sköts separat via deras egna paket/integration, inte den här filen).
    })
    .catch(() => {
      /* site.json otillgängligt – tyst no-op, analytics är aldrig kritiskt */
    });
})();
