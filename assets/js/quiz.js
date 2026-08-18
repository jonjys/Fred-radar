/**
 * Radar-quizet: 6 frågor -> viktad ranking av verktyg från data/tools.json.
 *
 * Varje fråga bidrar till poängsättningen på ett eget sätt (se scoreTool):
 *  - purpose   filtrerar på kategori
 *  - budget    straffar/premierar utifrån pris vs. angiven budget
 *  - gdpr      viktar tool.gdpr.score efter hur viktigt användaren sa att det var
 *  - level     matchar tool.difficulty mot användarens tekniska nivå
 *  - priority  ger extra vikt åt den delpoäng (pris/kvalitet/enkelhet/GDPR/support)
 *              användaren sa var viktigast
 *  - updates   påverkar inte rankingen, bara om vi visar e-postfältet
 */
(function () {
  const QUESTIONS = [
    {
      id: "purpose",
      title: "Vad vill du främst använda AI till?",
      options: [
        { value: "ai-writing", label: "Skriva texter (copy, mejl, artiklar)", emoji: "✍️" },
        { value: "ai-image", label: "Skapa bilder eller design", emoji: "🎨" },
        { value: "produktivitet", label: "Planera och få mer gjort", emoji: "⚡" },
        { value: "ai-code", label: "Koda / Bygga appar & hemsidor", emoji: "</>" },
        { value: "ai-data", label: "Analysera data / Excel", emoji: "📊" },
        { value: "ai-voice", label: "Transkribera möten", emoji: "🎙️" },
        { value: "any", label: "Allmän AI-chatt & research", emoji: "💬" },
        { value: "other", label: "Annat: skriv in vad du söker…", emoji: "✏️", freeText: true },
      ],
    },
    {
      id: "budget",
      title: "Vad är din budget per månad?",
      options: [
        { value: "free", label: "Vill helst hålla mig gratis", emoji: "🆓" },
        { value: "low", label: "Upp till ca 150 kr/mån", emoji: "💳" },
        { value: "medium", label: "Upp till ca 400 kr/mån", emoji: "💰" },
        { value: "high", label: "Pris är inte det viktigaste", emoji: "🏦" },
      ],
    },
    {
      id: "gdpr",
      title: "Hur viktigt är det att verktyget hanterar data enligt GDPR / helst inom EU?",
      options: [
        { value: "low", label: "Inte så viktigt just nu", emoji: "🔓" },
        { value: "medium", label: "Ganska viktigt", emoji: "🔐" },
        { value: "high", label: "Mycket viktigt – avgörande för mig", emoji: "🔒" },
      ],
    },
    {
      id: "level",
      title: "Hur van är du vid att testa nya digitala verktyg?",
      options: [
        { value: "beginner", label: "Nybörjare – vill ha något enkelt", emoji: "🌱" },
        { value: "intermediate", label: "Van användare", emoji: "🧭" },
        { value: "advanced", label: "Avancerad / utvecklare", emoji: "🚀" },
      ],
    },
    {
      id: "priority",
      title: "Vad är viktigast för dig när du väljer verktyg?",
      options: [
        { value: "price", label: "Lägsta pris", emoji: "🏷️" },
        { value: "quality", label: "Bästa kvalitet/resultat", emoji: "⭐" },
        { value: "easeOfUse", label: "Enkelhet – snabbt igång", emoji: "🧩" },
        { value: "gdpr", label: "GDPR och datasäkerhet", emoji: "🛡️" },
        { value: "support", label: "Bra support, gärna på svenska", emoji: "💬" },
        { value: "swedish", label: "Funkar bra på svenska", emoji: "🇸🇪" },
      ],
    },
    {
      id: "updates",
      title: "Vill du få uppdateringar om nya verktyg och erbjudanden via mejl?",
      options: [
        { value: "yes", label: "Ja, gärna", emoji: "📬" },
        { value: "no", label: "Nej tack, bara resultatet nu", emoji: "🚫" },
      ],
    },
  ];

  const state = {
    step: 0,
    answers: {},
    email: "",
  };

  const root = document.getElementById("quizRoot");
  const progressBar = document.getElementById("progressBar");

  function updateProgress() {
    const pct = Math.round((state.step / QUESTIONS.length) * 100);
    progressBar.style.width = pct + "%";
  }

  function renderQuestion() {
    updateProgress();
    const q = QUESTIONS[state.step];
    const selected = state.answers[q.id];

    root.innerHTML = `
      <div class="quiz-step-label">Fråga ${state.step + 1} av ${QUESTIONS.length}</div>
      <div class="quiz-question">
        <h2>${q.title}</h2>
        <div class="quiz-options" role="radiogroup" aria-label="${q.title}">
          ${q.options
            .map(
              (opt) => `
            <button type="button" class="quiz-option${selected === opt.value ? " selected" : ""}" data-value="${opt.value}">
              <span class="opt-emoji">${opt.emoji}</span> ${opt.label}
            </button>
          `
            )
            .join("")}
        </div>
        ${q.id === "purpose" && selected === "other" ? `<div style="margin-top:14px"><input type="text" id="purposeOther" placeholder="Skriv vad du söker…" value="${state.answers.purposeOther || ""}" style="width:100%;max-width:420px;padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text)" /></div>` : ""}
        ${q.id === "updates" && selected === "yes" ? renderEmailRow() : ""}
        <div class="quiz-nav">
          <button class="btn btn-ghost" id="backBtn" ${state.step === 0 ? "disabled style=\"visibility:hidden\"" : ""}>← Tillbaka</button>
          <button class="btn btn-primary" id="nextBtn" ${selected ? "" : "disabled"}>
            ${state.step === QUESTIONS.length - 1 ? "Visa mina rekommendationer →" : "Nästa →"}
          </button>
        </div>
      </div>
    `;

    root.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.answers[q.id] = btn.dataset.value;
        renderQuestion();
      });
    });

    const backBtn = document.getElementById("backBtn");
    if (backBtn) backBtn.addEventListener("click", () => {
      state.step = Math.max(0, state.step - 1);
      renderQuestion();
    });

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (q.id === "updates") {
          const emailInput = document.getElementById("emailInput");
          if (emailInput && emailInput.value) saveEmailSignup(emailInput.value);
        }
        if (state.step === QUESTIONS.length - 1) {
          renderResults();
        } else {
          state.step += 1;
          renderQuestion();
        }
      });
    }
  }

  function renderEmailRow() {
    return `
      <div class="quiz-email-row">
        <label for="emailInput" class="sr-only">E-postadress</label>
        <input type="email" id="emailInput" name="email" placeholder="din@mejladress.se" value="${state.email}" autocomplete="email" />
      </div>
      <p class="quiz-note">Vi skickar bara relevanta AI-nyheter, ingen spam. Du kan avregistrera dig när som helst.</p>
    `;
  }

  function saveEmailSignup(email) {
    state.email = email;
    const entry = { email, ts: Date.now(), source: "quiz" };

    // Sparas ALLTID lokalt, oavsett om en riktig e-postleverantör är
    // konfigurerad – så ingen adress går förlorad om nätverksanropet
    // nedan misslyckas eller ingen endpoint är satt än.
    try {
      const key = "radar_email_signups";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push(entry);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      /* localStorage otillgängligt, ignorera tyst */
    }

    // Skickas till en riktig leverantör om data/site.json → newsletter.endpoint
    // är ifyllt. Medvetet "fire and forget" – ett misslyckat nätverksanrop ska
    // aldrig blockera eller krascha quizflödet för användaren.
    submitToNewsletterProvider(entry).catch(() => {});
  }

  let siteConfigPromise = null;
  function getSiteConfig() {
    if (!siteConfigPromise) {
      siteConfigPromise = fetch("/data/site.json").then((r) => r.json()).catch(() => ({}));
    }
    return siteConfigPromise;
  }

  async function submitToNewsletterProvider(entry) {
    const site = await getSiteConfig();
    const nl = site.newsletter;
    if (!nl || nl.provider === "none" || !nl.endpoint) return;

    await fetch(nl.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  }

  // ---------- Scoring ----------

  const LEVELS = ["beginner", "intermediate", "advanced"];
  const BUDGET_MAX = { free: 0, low: 150, medium: 400, high: Infinity };
  const GDPR_WEIGHT = { low: 0.4, medium: 1, high: 2.2 };
  const PRIORITY_LABEL = {
    price: "lägsta pris",
    quality: "bästa kvalitet",
    easeOfUse: "enkelhet",
    gdpr: "GDPR och datasäkerhet",
    support: "bra support",
    swedish: "fungerar på svenska",
  };

  function scoreTool(tool, answers) {
    const purpose = answers.purpose;
    // any/other = no hard filter; specific categories must match
    if (purpose && purpose !== "any" && purpose !== "other" && !(tool.categories || []).includes(purpose)) {
      return null;
    }

    const reasons = [];
    let score = tool.score * 10;

    // Budget – free tools get strong boost when user wants free
    const budgetMax = BUDGET_MAX[answers.budget];
    const price = (tool.pricing && tool.pricing.fromPriceSEK != null) ? tool.pricing.fromPriceSEK : 9999;
    if (price <= budgetMax) {
      score += 14;
      if (answers.budget === "free" && price === 0) {
        score += 18;
        reasons.push("Helt gratis – matchar din budget");
      } else if (answers.budget !== "high") {
        reasons.push(`Ryms inom din budget (${window.RadarData.priceLabel(tool)})`);
      }
    } else {
      const over = price - budgetMax;
      score += Math.max(-22, 14 - over / 15);
    }

    // GDPR
    const gdprWeight = GDPR_WEIGHT[answers.gdpr] || 1;
    const gdprScore = (tool.gdpr && tool.gdpr.score) || 0;
    score += gdprScore * 4 * gdprWeight;
    if (answers.gdpr === "high" && gdprScore >= 4) {
      reasons.push(`Stark GDPR-anpassning (${tool.gdpr.dataResidency || "—"})`);
    }

    // Level
    const diff = Math.abs(LEVELS.indexOf(tool.difficulty) - LEVELS.indexOf(answers.level));
    score += diff === 0 ? 10 : diff === 1 ? 2 : -10;
    if (diff === 0) reasons.push(`Matchar din tekniska nivå (${window.RadarData.difficultyLabel(tool.difficulty)})`);

    // Priority
    const subscoreMap = {
      price: (tool.scores && tool.scores.valueForMoney) || 0,
      quality: (tool.scores && tool.scores.quality) || 0,
      easeOfUse: (tool.scores && tool.scores.easeOfUse) || 0,
      gdpr: gdprScore * 2,
      support: (tool.scores && tool.scores.support) || 0,
      swedish: tool.swedishSupport ? 10 : 3,
    };
    const priorityValue = subscoreMap[answers.priority] || 0;
    score += priorityValue * 2.6;
    if (answers.priority === "swedish" && tool.swedishSupport) {
      score += 12;
      reasons.push("Fungerar bra på svenska");
    } else if (priorityValue >= 7.5 && PRIORITY_LABEL[answers.priority]) {
      reasons.push(`Stark på det du prioriterade: ${PRIORITY_LABEL[answers.priority]}`);
    }

    // Extra: free + beginner combo boosts Meta AI-class tools
    if (answers.budget === "free" && answers.level === "beginner" && price === 0 && tool.difficulty === "beginner") {
      score += 10;
      if (tool.swedishSupport) score += 6;
    }

    if (tool.id === "meta-ai" && answers.budget === "free") {
      score += 8;
      reasons.push("Senast tillagt gratis-alternativ (Meta AI)");
    }

    if (reasons.length === 0) reasons.push("Bra allroundval baserat på dina svar");
    return { tool, score, reasons: reasons.slice(0, 3) };
  }

  async function renderResults() {
    root.innerHTML = `<div class="empty-state">Räknar fram dina rekommendationer …</div>`;
    progressBar.style.width = "100%";

    const { tools } = await window.RadarData.load();
    const ranked = tools
      .map((t) => scoreTool(t, state.answers))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (ranked.length === 0) {
      root.innerHTML = `<div class="empty-state">Vi hittade inga bra matchningar än – prova att ändra ett par svar.</div>`;
      return;
    }

    root.innerHTML = `
      <div class="quiz-step-label">Ditt resultat</div>
      <div class="quiz-question">
        <h2>Här är våra tre bästa förslag åt dig</h2>
      </div>
      <div class="tool-grid" style="margin-top:20px;">
        ${ranked
          .map(
            (r, i) => `
          <article class="tool-card result-card">
            <span class="result-rank">${i + 1}</span>
            <div class="tool-card-top">
              <div class="tool-logo" aria-hidden="true">${r.tool.logo}</div>
              <div class="tool-heading">
                <h3>${r.tool.name}</h3>
                <p class="tagline">${r.tool.tagline}</p>
              </div>
              <div class="tool-score">
                <span class="num">${r.tool.score.toFixed(1)}</span>
                <span class="lbl">poäng</span>
              </div>
            </div>
            <div class="why-box">
              <strong>Varför vi rekommenderar det:</strong>
              <ul style="margin:8px 0 0; padding-left:18px;">
                ${r.reasons.map((reason) => `<li>${reason}</li>`).join("")}
              </ul>
            </div>
            <div class="tool-meta">
              <span class="pill">${window.RadarData.priceLabel(r.tool)}</span>
              <span class="pill gdpr-${r.tool.gdpr.score}">🔒 ${window.RadarData.gdprLabel(r.tool.gdpr.score)}</span>
            </div>
            <div class="tool-actions">
              <a class="btn btn-primary" href="/go/?tool=${r.tool.id}&src=quiz" target="_blank" rel="sponsored noopener">Besök ${r.tool.name}</a>
              <a class="btn btn-ghost" href="/kategori/${r.tool.categories[0]}.html#${r.tool.id}">Läs mer</a>
              <a class="btn btn-ghost" href="/alternativ/${r.tool.id}.html">Se alternativ</a>
            </div>
            <p class="ad-note">Annonslänk – vi kan få provision. Påverkar inte priset eller rankingen.</p>
          </article>
        `
          )
          .join("")}
      </div>
      <p style="text-align:center;margin-top:18px;font-size:0.85rem;color:var(--text-muted);">Senast tillagda: <strong>Meta AI 2026-08-15</strong> · listan uppdateras löpande</p>
      <div style="text-align:center; margin-top:16px; display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
        <a class="btn btn-primary" href="/alternativ.html">Fler alternativ →</a>
        <a class="btn btn-ghost" href="/basta.html">Bästa listor</a>
      </div>
      <div class="quiz-nav" style="justify-content:center; margin-top:22px; gap:12px;">
        <button class="btn btn-ghost" id="restartBtn">↺ Ta om quizet</button>
        <button class="btn btn-primary" id="shareBtn">Dela resultat</button>
      </div>
    `;

    document.getElementById("restartBtn").addEventListener("click", () => {
      state.step = 0;
      state.answers = {};
      renderQuestion();
    });

    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const names = ranked.map((r) => r.tool.name).join(", ");
        const shareData = {
          title: "Mina AI-rekommendationer från FRED-Radar",
          text: `FRED-Radar rekommenderade: ${names}. Hitta ditt verktyg på 60 sekunder.`,
          url: window.location.origin + "/quiz.html",
        };
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(shareData.text + " " + shareData.url);
            shareBtn.textContent = "Kopierat ✓";
            setTimeout(() => (shareBtn.textContent = "Dela resultat"), 2000);
          }
        } catch (e) {
          /* user cancelled or clipboard blocked */
        }
      });
    }
  }

  // Keyboard shortcuts: 1-5 select option, Enter next, Backspace back
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    const options = root.querySelectorAll(".quiz-option");
    if (!options.length) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= options.length) {
      options[num - 1].click();
      e.preventDefault();
    } else if (e.key === "Enter") {
      const next = document.getElementById("nextBtn");
      if (next && !next.disabled) next.click();
    } else if (e.key === "Backspace" || e.key === "Escape") {
      const back = document.getElementById("backBtn");
      if (back && back.style.visibility !== "hidden") back.click();
    }
  });

  renderQuestion();
})();
