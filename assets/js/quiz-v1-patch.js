/**
 * FRED-Radar v1.0 quiz — EN default, 8 purposes + freetext, honest Grok/Meta scoring
 */
(function () {
  const root = document.getElementById("quizRoot");
  const progressBar = document.getElementById("progressBar");
  if (!root) return;

  const LEVELS = ["beginner", "intermediate", "advanced"];
  const BUDGET_MAX = { free: 0, low: 150, medium: 400, high: Infinity };
  const GDPR_WEIGHT = { low: 0.4, medium: 1, high: 2.2 };

  const state = { step: 0, answers: {}, email: "", ranked: [], shown: 3, tools: [] };

  function t(key, vars) {
    return window.FredI18n ? window.FredI18n.t(key, vars) : key;
  }
  function href(path) {
    return window.FredI18n ? window.FredI18n.withLang(path, window.FredI18n.lang) : path;
  }

  function questions() {
    return [
      {
        id: "purpose",
        title: t("quiz.q1"),
        options: [
          { value: "ai-writing", label: t("quiz.q1_write"), emoji: "✍️" },
          { value: "ai-image", label: t("quiz.q1_image"), emoji: "🎨" },
          { value: "ai-code", label: t("quiz.q1_code"), emoji: "</>" },
          { value: "ai-data", label: t("quiz.q1_data"), emoji: "📊" },
          { value: "ai-voice", label: t("quiz.q1_voice"), emoji: "🎙️" },
          { value: "produktivitet", label: t("quiz.q1_plan"), emoji: "⚡" },
          { value: "any", label: t("quiz.q1_chat"), emoji: "💬" },
          { value: "other", label: t("quiz.q1_other"), emoji: "✏️" },
        ],
      },
      {
        id: "budget",
        title: t("quiz.q2"),
        options: [
          { value: "free", label: t("quiz.q2_free"), emoji: "🆓" },
          { value: "low", label: t("quiz.q2_low"), emoji: "💳" },
          { value: "medium", label: t("quiz.q2_mid"), emoji: "💰" },
          { value: "high", label: t("quiz.q2_high"), emoji: "🏦" },
        ],
      },
      {
        id: "gdpr",
        title: t("quiz.q3"),
        options: [
          { value: "low", label: t("quiz.q3_low"), emoji: "🔓" },
          { value: "medium", label: t("quiz.q3_mid"), emoji: "🔐" },
          { value: "high", label: t("quiz.q3_high"), emoji: "🔒" },
        ],
      },
      {
        id: "level",
        title: t("quiz.q4"),
        options: [
          { value: "beginner", label: t("quiz.q4_beg"), emoji: "🌱" },
          { value: "intermediate", label: t("quiz.q4_int"), emoji: "🧭" },
          { value: "advanced", label: t("quiz.q4_adv"), emoji: "🚀" },
        ],
      },
      {
        id: "priority",
        title: t("quiz.q5"),
        options: [
          { value: "price", label: t("quiz.q5_price"), emoji: "🏷️" },
          { value: "quality", label: t("quiz.q5_qual"), emoji: "⭐" },
          { value: "easeOfUse", label: t("quiz.q5_ease"), emoji: "🧩" },
          { value: "gdpr", label: t("quiz.q5_gdpr"), emoji: "🛡️" },
          { value: "support", label: t("quiz.q5_sup"), emoji: "💬" },
          { value: "swedish", label: t("quiz.q5_sv"), emoji: "🇸🇪" },
        ],
      },
      {
        id: "updates",
        title: t("quiz.q6"),
        options: [
          { value: "yes", label: t("quiz.q6_yes"), emoji: "📬" },
          { value: "no", label: t("quiz.q6_no"), emoji: "🚫" },
        ],
      },
    ];
  }

  function scoreTool(tool, answers) {
    const purpose = answers.purpose;
    if (purpose && purpose !== "any" && purpose !== "other" && !(tool.categories || []).includes(purpose)) return null;
    const reasons = [];
    let score = tool.score * 10;
    const price = tool.pricing && tool.pricing.fromPriceSEK != null ? tool.pricing.fromPriceSEK : 9999;
    const budgetMax = BUDGET_MAX[answers.budget];
    const hardLimits = !!tool.hardUsageLimits;

    if (answers.budget === "free" && price > 0) return null;

    if (purpose === "other" && answers.purposeOther) {
      const q = String(answers.purposeOther).toLowerCase();
      const blob = ((tool.name || "") + " " + (tool.tagline || "") + " " + (tool.description || "") + " " + (tool.bestFor || []).join(" ")).toLowerCase();
      if (blob.indexOf(q) !== -1) score += 16;
    }

    if (price <= budgetMax) {
      score += 14;
      if (answers.budget === "free" && price === 0) {
        if (hardLimits) {
          score += 4;
          reasons.push(t("reasons.freeHard"));
        } else {
          score += 18;
          reasons.push(t("reasons.free"));
        }
      } else if (answers.budget !== "high") {
        reasons.push(t("reasons.budget"));
      }
    } else {
      score += Math.max(-22, 14 - (price - budgetMax) / 15);
    }

    if (hardLimits && (answers.budget === "free" || answers.priority === "price")) {
      score -= 18;
      if (!reasons.some((r) => String(r).indexOf("⚠️") !== -1)) reasons.push(t("reasons.hard"));
    }

    const gdprScore = (tool.gdpr && tool.gdpr.score) || 0;
    score += gdprScore * 4 * (GDPR_WEIGHT[answers.gdpr] || 1);
    if (answers.gdpr === "high" && gdprScore >= 4) reasons.push(t("reasons.gdpr"));
    const diff = Math.abs(LEVELS.indexOf(tool.difficulty) - LEVELS.indexOf(answers.level));
    score += diff === 0 ? 10 : diff === 1 ? 2 : -10;
    if (diff === 0) reasons.push(t("reasons.level"));
    const sub = {
      price: (tool.scores && tool.scores.valueForMoney) || 0,
      quality: (tool.scores && tool.scores.quality) || 0,
      easeOfUse: (tool.scores && tool.scores.easeOfUse) || 0,
      gdpr: gdprScore * 2,
      support: (tool.scores && tool.scores.support) || 0,
      swedish: tool.swedishSupport || tool.swedish ? 10 : 3,
    };
    score += (sub[answers.priority] || 0) * 2.6;
    if (answers.priority === "swedish" && (tool.swedishSupport || tool.swedish)) {
      score += 12;
      reasons.push(t("reasons.swedish"));
    }

    if (answers.budget === "free" && answers.level === "beginner" && price === 0 && tool.difficulty === "beginner") {
      score += 10;
      if (tool.swedishSupport || tool.swedish) score += 6;
      if (tool.id === "meta-ai") score += 22;
      if (hardLimits) score -= 12;
    }
    if (tool.id === "meta-ai" && answers.budget === "free") {
      score += 10;
      reasons.push(t("reasons.meta"));
    }
    if (tool.id === "grok-free" && answers.budget === "free") {
      score -= 8;
      reasons.push(t("reasons.grok"));
    }
    if (!reasons.length) reasons.push(t("reasons.fallback"));
    return { tool: tool, score: score, reasons: reasons.slice(0, 3) };
  }

  function updateProgress(qs) {
    if (progressBar) progressBar.style.width = Math.round((state.step / qs.length) * 100) + "%";
  }

  function otherInputHTML() {
    const names = (state.tools || []).map((x) => x.name).filter(Boolean);
    const listId = "toolSuggest";
    return (
      '<div class="other-wrap" style="margin-top:14px;position:relative">' +
      '<label for="purposeOther" class="sr-only">' + t("quiz.otherPh") + "</label>" +
      '<input type="text" id="purposeOther" list="' + listId + '" placeholder="' + t("quiz.otherPh") + '" value="' +
      (state.answers.purposeOther || "").replace(/"/g, """) +
      '" autocomplete="off" style="width:100%;max-width:420px;padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text)" />' +
      '<datalist id="' + listId + '">' +
      names.map((n) => "<option value=\"" + n.replace(/"/g, """) + "\"></option>").join("") +
      "</datalist></div>"
    );
  }

  function renderEmailRow() {
    return (
      '<div class="quiz-email-row">' +
      '<label for="emailInput" class="sr-only">' + t("quiz.emailLabel") + "</label>" +
      '<input type="email" id="emailInput" name="email" placeholder="' + t("quiz.emailPh") + '" autocomplete="email" />' +
      "</div>"
    );
  }

  function renderQuestion() {
    const qs = questions();
    updateProgress(qs);
    const q = qs[state.step];
    const selected = state.answers[q.id];
    root.innerHTML =
      '<div class="quiz-step-label">' + t("quiz.step", { n: state.step + 1, total: qs.length }) + "</div>" +
      '<div class="quiz-question"><h2>' + q.title + '</h2><div class="quiz-options" role="radiogroup">' +
      q.options
        .map(function (opt) {
          return (
            '<button type="button" class="quiz-option' + (selected === opt.value ? " selected" : "") + '" data-value="' + opt.value + '">' +
            '<span class="opt-emoji">' + opt.emoji + "</span> " + opt.label + "</button>"
          );
        })
        .join("") +
      "</div>" +
      (q.id === "purpose" && selected === "other" ? otherInputHTML() : "") +
      (q.id === "updates" && selected === "yes" ? renderEmailRow() : "") +
      '<div class="quiz-nav">' +
      '<button class="btn btn-ghost" id="backBtn"' + (state.step === 0 ? ' style="visibility:hidden"' : "") + ">" + t("quiz.back") + "</button>" +
      '<button class="btn btn-primary" id="nextBtn"' + (selected ? "" : " disabled") + ">" +
      (state.step === qs.length - 1 ? t("quiz.show") : t("quiz.next")) +
      "</button></div></div>";

    root.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.answers[q.id] = btn.dataset.value;
        renderQuestion();
      });
    });
    var other = document.getElementById("purposeOther");
    if (other) other.addEventListener("input", function () { state.answers.purposeOther = other.value; });
    var back = document.getElementById("backBtn");
    if (back) back.addEventListener("click", function () { state.step = Math.max(0, state.step - 1); renderQuestion(); });
    var next = document.getElementById("nextBtn");
    if (next) next.addEventListener("click", function () {
      var o = document.getElementById("purposeOther");
      if (o) state.answers.purposeOther = o.value;
      var em = document.getElementById("emailInput");
      if (em) state.email = em.value;
      if (state.step === qs.length - 1) renderResults();
      else { state.step += 1; renderQuestion(); }
    });
  }

  function resultCards(slice) {
    return slice
      .map(function (r, i) {
        var loc = window.FredI18n && window.FredI18n.localizeTool ? window.FredI18n.localizeTool(r.tool) : r.tool;
        var limits = loc.honestPill || (loc.pricing && loc.pricing.limitsNote) || "";
        var recent = loc.id === "meta-ai" ? '<span class="badge-recent">Recently added: Meta AI</span>' : "";
        return (
          '<article class="tool-card result-card">' +
          '<span class="result-rank">' + (i + 1) + "</span>" + recent +
          '<div class="tool-card-top"><div class="tool-logo">' + (loc.logo || "🛠️") + "</div>" +
          '<div class="tool-heading"><h3>' + loc.name + '</h3><p class="tagline">' + (loc.tagline || "") + "</p></div>" +
          '<div class="tool-score"><span class="num">' + Number(loc.score).toFixed(1) + '</span><span class="lbl">' +
          (window.FredI18n && window.FredI18n.lang === "sv" ? "poäng" : "score") + "</span></div></div>" +
          '<div class="why-box"><strong>' + t("quiz.why") + '</strong><ul style="margin:8px 0 0;padding-left:18px;">' +
          r.reasons.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
          '<div class="tool-meta"><span class="pill">' + (window.RadarData.priceLabel ? window.RadarData.priceLabel(loc) : "") + "</span>" +
          (limits ? '<span class="pill" style="border-color:#f59e0b;color:#fbbf24">' + limits + "</span>" : "") + "</div>" +
          '<div class="tool-actions"><a class="btn btn-primary" href="/go/?tool=' + loc.id + '&src=quiz" target="_blank" rel="sponsored noopener">' +
          t("quiz.visit") + " " + loc.name + '</a><a class="btn btn-ghost" href="' + href("/alternativ.html?tool=" + loc.id) + '">' +
          t("quiz.seeAlts") + "</a></div></article>"
        );
      })
      .join("");
  }

  function paintResults() {
    var slice = state.ranked.slice(0, state.shown);
    var moreLeft = state.ranked.length > state.shown;
    root.innerHTML =
      '<div class="quiz-step-label">' + t("quiz.resultLabel") + "</div>" +
      '<div class="quiz-question"><h2>' + t("quiz.resultH2") + "</h2></div>" +
      '<div class="tool-grid" style="margin-top:20px;" id="resultGrid">' + resultCards(slice) + "</div>" +
      '<p style="text-align:center;margin-top:18px;font-size:0.85rem;color:var(--text-muted)">' + t("quiz.recent") + "</p>" +
      '<div style="text-align:center;margin-top:12px;display:flex;flex-wrap:wrap;gap:10px;justify-content:center">' +
      (moreLeft ? '<button class="btn btn-primary" id="moreBtn">' + t("quiz.more") + "</button>" : "") +
      '<a class="btn btn-ghost" href="' + href("/alternativ.html") + '">' + t("quiz.moreAlts") + "</a>" +
      '<a class="btn btn-ghost" href="' + href("/basta.html") + '">' + t("quiz.bestLists") + "</a>" +
      '<button class="btn btn-ghost" id="restartBtn">' + t("quiz.restart") + "</button></div>";
    var more = document.getElementById("moreBtn");
    if (more) more.addEventListener("click", function () { state.shown = Math.min(state.ranked.length, state.shown + 3); paintResults(); });
    var restart = document.getElementById("restartBtn");
    if (restart) restart.addEventListener("click", function () { state.step = 0; state.answers = {}; state.shown = 3; renderQuestion(); });
  }

  async function renderResults() {
    root.innerHTML = '<div class="empty-state">' + t("quiz.computing") + "</div>";
    if (progressBar) progressBar.style.width = "100%";
    var data = await window.RadarData.load();
    state.tools = data.tools;
    state.ranked = data.tools
      .map(function (x) { return scoreTool(x, state.answers); })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; });
    state.shown = 3;
    if (!state.ranked.length) {
      root.innerHTML = '<div class="empty-state">' + t("quiz.empty") + "</div>";
      return;
    }
    paintResults();
  }

  async function boot() {
    try {
      var data = await window.RadarData.load();
      state.tools = data.tools || [];
    } catch (e) {}
    renderQuestion();
  }

  if (window.FredI18n && window.FredI18n.whenReady) window.FredI18n.whenReady(boot);
  else boot();
})();
