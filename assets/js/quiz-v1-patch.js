/**
 * FRED-Radar v1.0 quiz – Koda/Data/Röst, fritext, svenska, Meta AI scoring
 */
(function () {
  const QUESTIONS = [
    { id: "purpose", title: "Vad vill du främst använda AI till?", options: [
      { value: "ai-writing", label: "Skriva texter (copy, mejl, artiklar)", emoji: "✍️" },
      { value: "ai-image", label: "Skapa bilder eller design", emoji: "🎨" },
      { value: "produktivitet", label: "Planera och få mer gjort", emoji: "⚡" },
      { value: "ai-code", label: "Koda / Bygga appar & hemsidor", emoji: "</>" },
      { value: "ai-data", label: "Analysera data / Excel", emoji: "📊" },
      { value: "ai-voice", label: "Transkribera möten", emoji: "🎙️" },
      { value: "any", label: "Allmän AI-chatt & research", emoji: "💬" },
      { value: "other", label: "Annat: skriv in vad du söker…", emoji: "✏️" },
    ]},
    { id: "budget", title: "Vad är din budget per månad?", options: [
      { value: "free", label: "Vill helst hålla mig gratis", emoji: "🆓" },
      { value: "low", label: "Upp till ca 150 kr/mån", emoji: "💳" },
      { value: "medium", label: "Upp till ca 400 kr/mån", emoji: "💰" },
      { value: "high", label: "Pris är inte det viktigaste", emoji: "🏦" },
    ]},
    { id: "gdpr", title: "Hur viktigt är det att verktyget hanterar data enligt GDPR / helst inom EU?", options: [
      { value: "low", label: "Inte så viktigt just nu", emoji: "🔓" },
      { value: "medium", label: "Ganska viktigt", emoji: "🔐" },
      { value: "high", label: "Mycket viktigt – avgörande för mig", emoji: "🔒" },
    ]},
    { id: "level", title: "Hur van är du vid att testa nya digitala verktyg?", options: [
      { value: "beginner", label: "Nybörjare – vill ha något enkelt", emoji: "🌱" },
      { value: "intermediate", label: "Van användare", emoji: "🧭" },
      { value: "advanced", label: "Avancerad / utvecklare", emoji: "🚀" },
    ]},
    { id: "priority", title: "Vad är viktigast för dig när du väljer verktyg?", options: [
      { value: "price", label: "Lägsta pris", emoji: "🏷️" },
      { value: "quality", label: "Bästa kvalitet/resultat", emoji: "⭐" },
      { value: "easeOfUse", label: "Enkelhet – snabbt igång", emoji: "🧩" },
      { value: "gdpr", label: "GDPR och datasäkerhet", emoji: "🛡️" },
      { value: "support", label: "Bra support, gärna på svenska", emoji: "💬" },
      { value: "swedish", label: "Funkar bra på svenska", emoji: "🇸🇪" },
    ]},
    { id: "updates", title: "Vill du få uppdateringar om nya verktyg och erbjudanden via mejl?", options: [
      { value: "yes", label: "Ja, gärna", emoji: "📬" },
      { value: "no", label: "Nej tack, bara resultatet nu", emoji: "🚫" },
    ]},
  ];
  const state = { step: 0, answers: {}, email: "" };
  const root = document.getElementById("quizRoot");
  const progressBar = document.getElementById("progressBar");
  if (!root) return;
  const LEVELS = ["beginner", "intermediate", "advanced"];
  const BUDGET_MAX = { free: 0, low: 150, medium: 400, high: Infinity };
  const GDPR_WEIGHT = { low: 0.4, medium: 1, high: 2.2 };

  function updateProgress() {
    if (progressBar) progressBar.style.width = Math.round((state.step / QUESTIONS.length) * 100) + "%";
  }

  function scoreTool(tool, answers) {
    const purpose = answers.purpose;
    if (purpose && purpose !== "any" && purpose !== "other" && !(tool.categories || []).includes(purpose)) return null;
    const reasons = [];
    let score = tool.score * 10;
    const price = tool.pricing && tool.pricing.fromPriceSEK != null ? tool.pricing.fromPriceSEK : 9999;
    const budgetMax = BUDGET_MAX[answers.budget];
    if (price <= budgetMax) {
      score += 14;
      if (answers.budget === "free" && price === 0) { score += 18; reasons.push("Helt gratis – matchar din budget"); }
    } else {
      score += Math.max(-22, 14 - (price - budgetMax) / 15);
    }
    const gdprScore = (tool.gdpr && tool.gdpr.score) || 0;
    score += gdprScore * 4 * (GDPR_WEIGHT[answers.gdpr] || 1);
    if (answers.gdpr === "high" && gdprScore >= 4) reasons.push("Stark GDPR-anpassning");
    const diff = Math.abs(LEVELS.indexOf(tool.difficulty) - LEVELS.indexOf(answers.level));
    score += diff === 0 ? 10 : diff === 1 ? 2 : -10;
    if (diff === 0) reasons.push("Matchar din tekniska nivå");
    const sub = {
      price: (tool.scores && tool.scores.valueForMoney) || 0,
      quality: (tool.scores && tool.scores.quality) || 0,
      easeOfUse: (tool.scores && tool.scores.easeOfUse) || 0,
      gdpr: gdprScore * 2,
      support: (tool.scores && tool.scores.support) || 0,
      swedish: tool.swedishSupport ? 10 : 3,
    };
    score += (sub[answers.priority] || 0) * 2.6;
    if (answers.priority === "swedish" && tool.swedishSupport) { score += 12; reasons.push("Fungerar bra på svenska"); }
    if (answers.budget === "free" && answers.level === "beginner" && price === 0 && tool.difficulty === "beginner") {
      score += 10;
      if (tool.swedishSupport) score += 6;
    }
    if (tool.id === "meta-ai" && answers.budget === "free") { score += 8; reasons.push("Senast tillagt gratis-alternativ (Meta AI)"); }
    if (!reasons.length) reasons.push("Bra allroundval baserat på dina svar");
    return { tool: tool, score: score, reasons: reasons.slice(0, 3) };
  }

  function renderQuestion() {
    updateProgress();
    const q = QUESTIONS[state.step];
    const selected = state.answers[q.id];
    root.innerHTML = '<div class="quiz-step-label">Fråga ' + (state.step + 1) + ' av ' + QUESTIONS.length + '</div>' +
      '<div class="quiz-question"><h2>' + q.title + '</h2><div class="quiz-options" role="radiogroup">' +
      q.options.map(function (opt) {
        return '<button type="button" class="quiz-option' + (selected === opt.value ? ' selected' : '') + '" data-value="' + opt.value + '">' +
          '<span class="opt-emoji">' + opt.emoji + '</span> ' + opt.label + '</button>';
      }).join('') + '</div>' +
      (q.id === 'purpose' && selected === 'other' ? '<div style="margin-top:14px"><input type="text" id="purposeOther" placeholder="Skriv vad du söker…" style="width:100%;max-width:420px;padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text)" /></div>' : '') +
      (q.id === 'updates' && selected === 'yes' ? '<div class="quiz-email-row"><input type="email" id="emailInput" placeholder="din@mejladress.se" /></div>' : '') +
      '<div class="quiz-nav"><button class="btn btn-ghost" id="backBtn"' + (state.step === 0 ? ' style="visibility:hidden"' : '') + '>← Tillbaka</button>' +
      '<button class="btn btn-primary" id="nextBtn"' + (selected ? '' : ' disabled') + '>' +
      (state.step === QUESTIONS.length - 1 ? 'Visa mina rekommendationer →' : 'Nästa →') + '</button></div></div>';
    root.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () { state.answers[q.id] = btn.dataset.value; renderQuestion(); });
    });
    var back = document.getElementById('backBtn');
    if (back) back.addEventListener('click', function () { state.step = Math.max(0, state.step - 1); renderQuestion(); });
    var next = document.getElementById('nextBtn');
    if (next) next.addEventListener('click', function () {
      var other = document.getElementById('purposeOther');
      if (other) state.answers.purposeOther = other.value;
      if (state.step === QUESTIONS.length - 1) renderResults();
      else { state.step += 1; renderQuestion(); }
    });
  }

  async function renderResults() {
    root.innerHTML = '<div class="empty-state">Räknar fram dina rekommendationer …</div>';
    if (progressBar) progressBar.style.width = '100%';
    var data = await window.RadarData.load();
    var ranked = data.tools.map(function (t) { return scoreTool(t, state.answers); }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    if (!ranked.length) { root.innerHTML = '<div class="empty-state">Inga matchningar – prova andra svar.</div>'; return; }
    root.innerHTML = '<div class="quiz-step-label">Ditt resultat</div><div class="quiz-question"><h2>Här är våra tre bästa förslag åt dig</h2></div>' +
      '<div class="tool-grid" style="margin-top:20px;">' +
      ranked.map(function (r, i) {
        return '<article class="tool-card result-card"><span class="result-rank">' + (i + 1) + '</span>' +
          '<div class="tool-card-top"><div class="tool-logo">' + (r.tool.logo || '🛠️') + '</div>' +
          '<div class="tool-heading"><h3>' + r.tool.name + '</h3><p class="tagline">' + (r.tool.tagline || '') + '</p></div>' +
          '<div class="tool-score"><span class="num">' + Number(r.tool.score).toFixed(1) + '</span><span class="lbl">poäng</span></div></div>' +
          '<div class="why-box"><strong>Varför:</strong><ul style="margin:8px 0 0;padding-left:18px;">' +
          r.reasons.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
          '<div class="tool-actions"><a class="btn btn-primary" href="/go/?tool=' + r.tool.id + '&src=quiz" target="_blank" rel="sponsored noopener">Besök ' + r.tool.name + '</a>' +
          '<a class="btn btn-ghost" href="/alternativ.html?tool=' + r.tool.id + '">Se alternativ</a></div></article>';
      }).join('') + '</div>' +
      '<p style="text-align:center;margin-top:18px;font-size:0.85rem;color:var(--text-muted)">Senast tillagda: <strong>Meta AI 2026-08-15</strong></p>' +
      '<div style="text-align:center;margin-top:12px;display:flex;flex-wrap:wrap;gap:10px;justify-content:center">' +
      '<a class="btn btn-primary" href="/alternativ.html">Fler alternativ →</a>' +
      '<a class="btn btn-ghost" href="/basta.html">Bästa listor</a>' +
      '<button class="btn btn-ghost" id="restartBtn">↺ Ta om quizet</button></div>';
    var restart = document.getElementById('restartBtn');
    if (restart) restart.addEventListener('click', function () { state.step = 0; state.answers = {}; renderQuestion(); });
  }

  renderQuestion();
})();
