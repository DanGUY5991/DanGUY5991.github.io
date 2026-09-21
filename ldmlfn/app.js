/**
 * LDMLFN Microtraining — dialogue runner
 * Product modules (SharePoint, Teams, Excel, …): simple surface question →
 * answer → AI-crafted clarifying follow-up → next question.
 */

(() => {
  const Profiles = window.LDMLFNProfiles;
  const Modules = window.LDMLFNModules;
  const Goals = window.LDMLFNSurveyGoals;
  const Clarify = window.LDMLFNClarify;
  const AI_ENDPOINT_KEY = "ldmlfn-ai-endpoint";

  const els = {
    auth: document.getElementById("panel-auth"),
    landing: document.getElementById("panel-landing"),
    dialogue: document.getElementById("panel-dialogue"),
    close: document.getElementById("panel-close"),
    authForm: document.getElementById("auth-form"),
    authEmail: document.getElementById("auth-email"),
    authName: document.getElementById("auth-name"),
    authStatus: document.getElementById("auth-status"),
    accessLinkUrl: document.getElementById("access-link-url"),
    copyAccessLink: document.getElementById("copy-access-link"),
    copyLinkStatus: document.getElementById("copy-link-status"),
    userChip: document.getElementById("user-chip"),
    signout: document.getElementById("signout-btn"),
    begin: document.getElementById("begin-btn"),
    resume: document.getElementById("resume-btn"),
    restart: document.getElementById("restart-btn"),
    again: document.getElementById("again-btn"),
    thread: document.getElementById("thread"),
    form: document.getElementById("reply-form"),
    input: document.getElementById("reply-input"),
    hint: document.getElementById("hint-text"),
    skip: document.getElementById("skip-btn"),
    send: document.getElementById("send-btn"),
    progress: document.getElementById("progress-bar"),
    stage: document.getElementById("stage-label"),
    portrait: document.getElementById("experience-portrait"),
    exportBtn: document.getElementById("export-btn"),
    copyBtn: document.getElementById("copy-btn"),
    copyStatus: document.getElementById("copy-status"),
    closeSummary: document.getElementById("close-summary"),
    landingTitle: document.getElementById("landing-title"),
    landingLede: document.getElementById("landing-lede"),
    landingEyebrow: document.getElementById("landing-eyebrow"),
    modulePicker: document.getElementById("module-picker"),
  };

  function goal() {
    return Modules.getSelected() || Goals.getActiveGoal();
  }

  let session = createSession();
  let busy = false;

  function createSession() {
    const g = goal();
    return {
      id: `ldmlfn-${Date.now().toString(36)}`,
      startedAt: new Date().toISOString(),
      goalId: g.id,
      application: g.application,
      stage: "intro",
      /** @type {"surface"|"clarify"|"closing"} */
      phase: "surface",
      questionIndex: 0,
      pendingQuestionId: null,
      turns: [],
      pairs: [],
      currentPair: null,
      closingAnswer: "",
    };
  }

  function requireProfile() {
    return Profiles?.getCurrent() || null;
  }

  function save() {
    if (!requireProfile()) return;
    Profiles.saveSession(session);
  }

  function load() {
    if (!requireProfile()) return null;
    return Profiles.loadSession();
  }

  function clearSaved() {
    if (!requireProfile()) return;
    Profiles.clearSession();
  }

  function showPanel(name) {
    els.auth.hidden = name !== "auth";
    els.landing.hidden = name !== "landing";
    els.dialogue.hidden = name !== "dialogue";
    els.close.hidden = name !== "close";
    els.restart.hidden = !(name === "dialogue" || name === "close");
  }

  function refreshUserChrome() {
    const person = Profiles.getCurrentPublic();
    if (!person) {
      els.userChip.hidden = true;
      els.signout.hidden = true;
      els.userChip.textContent = "";
      return;
    }
    els.userChip.hidden = false;
    els.signout.hidden = false;
    els.userChip.textContent = `${person.name} · ${person.email}`;
  }

  function renderModulePicker() {
    if (!els.modulePicker) return;
    const selectedId = Modules.getSelectedId();
    els.modulePicker.innerHTML = Modules.list()
      .map((mod) => {
        const selected = mod.id === selectedId;
        const count = mod.questions?.length || 0;
        return `
          <button type="button" class="module-card${selected ? " is-selected" : ""}"
            role="option" aria-selected="${selected}" data-module-id="${mod.id}">
            <span class="module-card__name">${escapeHtml(mod.application)}</span>
            <span class="module-card__blurb">${escapeHtml(mod.blurb || "")}</span>
            <span class="module-card__meta">${count} key questions</span>
          </button>
        `;
      })
      .join("");

    els.modulePicker.querySelectorAll("[data-module-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Modules.setSelected(btn.getAttribute("data-module-id"));
        refreshLandingCopy();
        renderModulePicker();
      });
    });
  }

  function refreshLandingCopy() {
    const g = goal();
    const person = Profiles.getCurrent();
    if (els.landingEyebrow) {
      els.landingEyebrow.textContent = `${g.application} · product module`;
    }
    if (person && els.landingLede) {
      els.landingLede.textContent = `Selected module: ${g.application}. ${g.blurb || ""} Simple questions first; one clarifying follow-up after each answer.`;
    }
    if (els.begin) {
      els.begin.textContent = `Begin ${g.application} module`;
    }
  }

  function enterAppShell(result) {
    refreshUserChrome();
    Profiles.adoptLegacySessionIfEmpty();

    const person = Profiles.getCurrent();
    const saved = load();

    // If a saved session belongs to a module, keep that module selected for resume.
    if (saved?.goalId && Modules.get(saved.goalId)) {
      Modules.setSelected(saved.goalId);
    }

    els.landingTitle.textContent = result?.isNew
      ? `Welcome, ${person.name}`
      : `Welcome back, ${person.name}`;

    renderModulePicker();
    refreshLandingCopy();

    if (saved && saved.stage === "close" && saved.turns?.length) {
      session = saved;
      renderPortrait();
      showPanel("close");
      setProgress();
      return;
    }

    if (saved && saved.stage !== "close" && saved.turns?.length) {
      els.resume.hidden = false;
      els.resume.textContent = `Continue saved ${saved.application || "survey"}`;
      showPanel("landing");
      return;
    }

    els.resume.hidden = true;
    showPanel("landing");
  }

  function setProgress() {
    const total = goal().questions.length * 2 + 2; // surface+clarify pairs + intro/close weight
    let done = 0;
    if (session.stage === "intro") done = 0;
    else if (session.stage === "questions") {
      done = session.questionIndex * 2 + (session.phase === "clarify" ? 1 : 0) + 1;
    } else if (session.stage === "closing") done = total - 1;
    else done = total;

    const pct = Math.min(100, Math.round((done / total) * 100));
    els.progress.style.width = `${pct}%`;

    if (session.phase === "clarify") els.stage.textContent = "Clarifying";
    else if (session.stage === "closing") els.stage.textContent = "Closing";
    else if (session.stage === "close") els.stage.textContent = "Complete";
    else els.stage.textContent = `${goal().application} · Question ${Math.min(session.questionIndex + 1, goal().questions.length)}`;
  }

  function addBubble(role, text, kind = "") {
    const turn = {
      role,
      text,
      kind,
      at: new Date().toISOString(),
      phase: session.phase,
      questionId: session.pendingQuestionId,
    };
    session.turns.push(turn);
    renderBubble(turn);
    save();
  }

  function renderBubble(turn) {
    const div = document.createElement("div");
    div.className = `bubble bubble--${turn.role}${turn.kind === "reflect" ? " reflect" : ""}${turn.kind === "clarify" ? " clarify" : ""}`;
    const who = document.createElement("span");
    who.className = "bubble__who";
    who.textContent = turn.role === "guide" ? "LDMLFN guide" : "You";
    const p = document.createElement("p");
    p.textContent = turn.text;
    div.append(who, p);
    els.thread.appendChild(div);
    div.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function restoreThread() {
    els.thread.innerHTML = "";
    session.turns.forEach(renderBubble);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function currentQuestion() {
    return goal().questions[session.questionIndex] || null;
  }

  async function askSurfaceQuestion() {
    const q = currentQuestion();
    if (!q) {
      await askClosing();
      return;
    }
    session.stage = "questions";
    session.phase = "surface";
    session.pendingQuestionId = q.id;
    session.currentPair = {
      questionId: q.id,
      surface: q.surface,
      surfaceAnswer: "",
      clarification: null,
      clarifyAnswer: "",
    };
    addBubble("guide", q.surface);
    els.hint.textContent = q.hint || "A straightforward answer is enough.";
    els.skip.hidden = true;
    setProgress();
    save();
  }

  async function askClarification(answer) {
    const q = currentQuestion();
    session.phase = "clarify";
    setProgress();

    const thinking = document.createElement("div");
    thinking.className = "bubble bubble--guide";
    thinking.innerHTML = '<span class="bubble__who">LDMLFN guide</span><p class="typing">Crafting a follow-up</p>';
    els.thread.appendChild(thinking);

    const crafted = await Clarify.craftFollowUp({
      goal: goal(),
      question: q,
      answer,
      person: Profiles.getCurrentPublic(),
    });

    thinking.remove();

    if (crafted.reflection) {
      addBubble("guide", crafted.reflection, "reflect");
      await wait(400);
    }

    addBubble("guide", crafted.prompt, "clarify");
    if (session.currentPair) {
      session.currentPair.clarification = crafted;
    }
    els.hint.textContent = crafted.hint || "Add whatever clarifies the situation.";
    els.skip.hidden = false;
    setProgress();
    save();
  }

  async function askClosing() {
    session.stage = "closing";
    session.phase = "surface";
    session.pendingQuestionId = "closing";
    addBubble("guide", goal().closingPrompt);
    els.hint.textContent = "Optional — share anything else that matters.";
    els.skip.hidden = false;
    setProgress();
    save();
  }

  async function startDialogue(resume = false) {
    if (!requireProfile()) {
      showPanel("auth");
      return;
    }
    showPanel("dialogue");
    setProgress();
    els.input.value = "";
    els.input.focus();

    if (!resume) {
      els.thread.innerHTML = "";
      const person = Profiles.getCurrent();
      session = createSession();
      addBubble(
        "guide",
        `Welcome, ${person.name}. ${goal().intro}`
      );
      await wait(400);
      await askSurfaceQuestion();
    } else {
      restoreThread();
      els.hint.textContent =
        session.phase === "clarify"
          ? "Add whatever clarifies the situation."
          : "A straightforward answer is enough.";
      els.skip.hidden = session.phase !== "clarify" && session.stage !== "closing";
      setProgress();
    }
  }

  async function handleReply(text, skipped = false) {
    if (busy || !requireProfile()) return;
    const cleaned = text.trim();
    if (!cleaned && !skipped) return;

    busy = true;
    els.send.disabled = true;
    els.skip.disabled = true;

    if (!skipped) addBubble("you", cleaned);
    else addBubble("you", "(passing on this follow-up for now)");

    els.input.value = "";

    try {
      if (session.stage === "closing") {
        session.closingAnswer = skipped ? "" : cleaned;
        finishSession();
      } else if (session.phase === "surface") {
        if (session.currentPair) session.currentPair.surfaceAnswer = cleaned;
        await askClarification(cleaned);
      } else if (session.phase === "clarify") {
        if (session.currentPair) {
          session.currentPair.clarifyAnswer = skipped ? "" : cleaned;
          session.pairs.push(session.currentPair);
          session.currentPair = null;
        }
        session.questionIndex += 1;
        if (session.questionIndex >= goal().questions.length) {
          await askClosing();
        } else {
          await askSurfaceQuestion();
        }
      }
    } finally {
      busy = false;
      els.send.disabled = false;
      els.skip.disabled = false;
      els.input.focus();
    }
  }

  function finishSession() {
    session.stage = "close";
    session.phase = "surface";
    setProgress();
    save();
    Profiles.markComplete();
    renderPortrait();
    showPanel("close");
    els.closeSummary.textContent = `Your ${goal().application} listening map is ready — surface answers plus clarifying follow-ups about culture, relationships, and understanding.`;
  }

  function renderPortrait() {
    const person = Profiles.getCurrentPublic();
    const pairsHtml = session.pairs
      .map((pair) => {
        const q = goal().questions.find((item) => item.id === pair.questionId);
        return `
          <h4>${escapeHtml(q?.surface || pair.questionId)}</h4>
          <p><strong>Answer:</strong> ${escapeHtml(truncate(pair.surfaceAnswer || "—", 280))}</p>
          <p><strong>Clarification asked:</strong> ${escapeHtml(truncate(pair.clarification?.prompt || "—", 220))}</p>
          <p><strong>Clarified:</strong> ${escapeHtml(truncate(pair.clarifyAnswer || "—", 280))}</p>
        `;
      })
      .join("");

    els.portrait.innerHTML = `
      <h3>${escapeHtml(goal().application)} experience portrait</h3>
      <h4>Profile</h4>
      <p>${escapeHtml(person?.name || "—")} · ${escapeHtml(person?.email || "—")}</p>
      <h4>Survey goal</h4>
      <p>${escapeHtml(goal().surfaceFrame)}</p>
      ${pairsHtml || "<p>No completed question pairs yet.</p>"}
      <h4>Closing note</h4>
      <p>${escapeHtml(session.closingAnswer || "—")}</p>
    `;
  }

  function truncate(str, n) {
    const s = String(str || "").trim();
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function buildExport() {
    return {
      project: "LDMLFN Microtraining",
      surveyGoal: {
        id: goal().id,
        application: goal().application,
        surfaceFrame: goal().surfaceFrame,
        deepLenses: goal().deepLenses,
      },
      exportedAt: new Date().toISOString(),
      person: Profiles.getCurrentPublic(),
      sessionId: session.id,
      startedAt: session.startedAt,
      pairs: session.pairs,
      closingAnswer: session.closingAnswer,
      transcript: session.turns,
    };
  }

  function downloadExport() {
    const payload = buildExport();
    const person = Profiles.getCurrentPublic();
    const slug = (person?.email || "participant").replace(/[^a-z0-9]+/gi, "-");
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ldmlfn-${goal().id}-${slug}-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copySummary() {
    const person = Profiles.getCurrentPublic();
    const lines = [
      `LDMLFN Microtraining — ${goal().application} summary`,
      `Person: ${person?.name || "—"} <${person?.email || "—"}>`,
      "",
      ...session.pairs.map((pair, i) => {
        const q = goal().questions.find((item) => item.id === pair.questionId);
        return [
          `Q${i + 1}: ${q?.surface || pair.questionId}`,
          `A: ${pair.surfaceAnswer || "—"}`,
          `Follow-up: ${pair.clarification?.prompt || "—"}`,
          `Clarified: ${pair.clarifyAnswer || "—"}`,
          "",
        ].join("\n");
      }),
      `Closing: ${session.closingAnswer || "—"}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      els.copyStatus.textContent = "Summary copied to clipboard.";
    } catch (_) {
      els.copyStatus.textContent = "Could not copy automatically — use Download instead.";
    }
  }

  function resetDialogueOnly() {
    clearSaved();
    session = createSession();
    els.thread.innerHTML = "";
    els.copyStatus.textContent = "";
    els.resume.hidden = true;
    showPanel("landing");
  }

  function signOutToAuth() {
    Profiles.signOut();
    session = createSession();
    els.thread.innerHTML = "";
    refreshUserChrome();
    showPanel("auth");
  }

  const accessUrl = new URL(window.location.pathname, window.location.origin).href;
  if (els.accessLinkUrl) els.accessLinkUrl.textContent = accessUrl;
  els.copyAccessLink?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
      els.copyLinkStatus.textContent = "Access link copied.";
    } catch (_) {
      els.copyLinkStatus.textContent = "Could not copy — select the link manually.";
    }
  });

  els.authForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    els.authStatus.textContent = "";
    try {
      const result = Profiles.signIn({
        email: els.authEmail.value,
        name: els.authName.value,
      });
      els.authStatus.textContent = result.isNew
        ? "Profile created. You’re in."
        : "Welcome back — continuing your profile.";
      enterAppShell(result);
    } catch (err) {
      els.authStatus.textContent = err.message || "Could not sign in.";
    }
  });

  els.signout?.addEventListener("click", signOutToAuth);

  els.begin.addEventListener("click", () => {
    if (!requireProfile()) {
      showPanel("auth");
      return;
    }
    // Starting a module clears any prior in-progress session for a clean section run.
    clearSaved();
    startDialogue(false);
  });

  els.resume?.addEventListener("click", () => {
    const saved = load();
    if (!saved) return;
    if (saved.goalId && Modules.get(saved.goalId)) {
      Modules.setSelected(saved.goalId);
    }
    session = saved;
    startDialogue(true);
  });

  els.restart.addEventListener("click", resetDialogueOnly);
  els.again?.addEventListener("click", resetDialogueOnly);

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleReply(els.input.value, false);
  });

  els.skip.addEventListener("click", () => handleReply("", true));
  els.exportBtn.addEventListener("click", downloadExport);
  els.copyBtn.addEventListener("click", copySummary);

  els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      els.form.requestSubmit();
    }
  });

  const params = new URLSearchParams(window.location.search);
  if (params.has("fresh") || params.has("clear")) {
    if (requireProfile()) clearSaved();
  }
  if (params.has("signout")) Profiles.signOut();
  if (params.has("fresh") || params.has("clear") || params.has("signout")) {
    if (window.history.replaceState) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  if (requireProfile()) {
    enterAppShell({ action: "continue", isNew: false });
  } else {
    refreshUserChrome();
    showPanel("auth");
  }

  window.LDMLFN = {
    setAiEndpoint(url) {
      if (!url) localStorage.removeItem(AI_ENDPOINT_KEY);
      else localStorage.setItem(AI_ENDPOINT_KEY, url);
      return Boolean(localStorage.getItem(AI_ENDPOINT_KEY));
    },
    setSyncEndpoint: Profiles.setSyncEndpoint,
    exportSession: buildExport,
    listPeople: () => Profiles.listPeople(),
    activeGoal: () => goal(),
    listModules: () => Modules.list(),
    setModule: (id) => Modules.setSelected(id),
  };
})();
