/**
 * LDMLFN Microtraining — adaptive experience dialogue
 * Relational, story-first capture of Microsoft product experience.
 * Requires an email profile; sessions are isolated per profile.
 */

(() => {
  const Profiles = window.LDMLFNProfiles;
  const AI_ENDPOINT_KEY = "ldmlfn-ai-endpoint";

  const PRODUCTS = [
    { id: "teams", labels: ["teams", "microsoft teams"], family: "collaboration" },
    { id: "outlook", labels: ["outlook", "email", "calendar"], family: "communication" },
    { id: "excel", labels: ["excel", "spreadsheet", "spreadsheets"], family: "data" },
    { id: "word", labels: ["word", "documents", "docs"], family: "documents" },
    { id: "powerpoint", labels: ["powerpoint", "power point", "pptx", "slides", "presentations"], family: "documents" },
    { id: "sharepoint", labels: ["sharepoint", "share point"], family: "collaboration" },
    { id: "onedrive", labels: ["onedrive", "one drive"], family: "storage" },
    { id: "onenote", labels: ["onenote", "one note"], family: "documents" },
    { id: "forms", labels: ["microsoft forms", "ms forms", "forms"], family: "data" },
    { id: "powerbi", labels: ["power bi", "powerbi"], family: "data" },
    { id: "powerautomate", labels: ["power automate", "powerautomate", "flow"], family: "automation" },
    { id: "powerapps", labels: ["power apps", "powerapps"], family: "automation" },
    { id: "copilot", labels: ["copilot", "co-pilot", "microsoft 365 copilot"], family: "ai" },
    { id: "azure", labels: ["azure", "entra", "active directory", "azure ad"], family: "cloud" },
    { id: "windows", labels: ["windows", "windows 11", "windows 10"], family: "platform" },
    { id: "planner", labels: ["planner", "microsoft planner"], family: "collaboration" },
    { id: "loop", labels: ["loop", "microsoft loop"], family: "collaboration" },
    { id: "bookings", labels: ["bookings"], family: "communication" },
    { id: "visio", labels: ["visio"], family: "documents" },
    { id: "access", labels: ["access database", "ms access"], family: "data" },
  ];

  const STAGES = {
    welcome: "Opening",
    relation: "Relation",
    landscape: "Landscape",
    deepen: "Deepening",
    clarify: "Clarifying",
    horizons: "Horizons",
    close: "Closing",
  };

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
    label: document.getElementById("reply-label"),
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
  };

  let session = createSession();
  let busy = false;

  function createSession() {
    return {
      id: `ldmlfn-${Date.now().toString(36)}`,
      startedAt: new Date().toISOString(),
      stage: "welcome",
      turns: [],
      context: {
        relation: "",
        landscape: "",
        products: [],
        productNotes: {},
        strengths: [],
        friction: [],
        learningStyle: "",
        goals: "",
        supports: "",
        reflections: [],
        rawStories: [],
      },
      askedIds: [],
      deepenCount: 0,
      clarifyCount: 0,
      pendingPrompt: null,
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

  function enterAppShell(result) {
    refreshUserChrome();
    Profiles.adoptLegacySessionIfEmpty();

    const person = Profiles.getCurrent();
    const saved = load();

    els.landingTitle.textContent = result?.isNew
      ? `Welcome, ${person.name}`
      : `Welcome back, ${person.name}`;
    els.landingLede.textContent = result?.isNew
      ? "Your profile is ready. Begin when you want — this dialogue stays with your email only."
      : "Your profile is open. Continue a saved dialogue or begin a new one — other people’s answers stay out of reach.";

    if (saved && saved.stage === "close" && saved.turns?.length) {
      session = saved;
      renderPortrait();
      showPanel("close");
      setProgress();
      return;
    }

    if (saved && saved.stage !== "close" && saved.turns?.length) {
      els.resume.hidden = false;
      showPanel("landing");
      return;
    }

    els.resume.hidden = true;
    showPanel("landing");
  }

  function setProgress() {
    const order = ["welcome", "relation", "landscape", "deepen", "clarify", "horizons", "close"];
    const idx = Math.max(0, order.indexOf(session.stage));
    const pct = Math.round((idx / (order.length - 1)) * 100);
    els.progress.style.width = `${pct}%`;
    els.stage.textContent = STAGES[session.stage] || "Dialogue";
  }

  function addBubble(role, text, kind = "") {
    const turn = {
      role,
      text,
      kind,
      at: new Date().toISOString(),
    };
    session.turns.push(turn);
    renderBubble(turn);
    save();
  }

  function renderBubble(turn) {
    const div = document.createElement("div");
    div.className = `bubble bubble--${turn.role}${turn.kind === "reflect" ? " reflect" : ""}`;
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

  function detectProducts(text) {
    const lower = text.toLowerCase();
    const found = [];
    for (const product of PRODUCTS) {
      if (product.labels.some((label) => lower.includes(label))) {
        found.push(product.id);
      }
    }
    return [...new Set(found)];
  }

  function mergeProducts(ids) {
    const set = new Set(session.context.products);
    ids.forEach((id) => set.add(id));
    session.context.products = [...set];
  }

  function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function isVague(text) {
    const t = text.trim().toLowerCase();
    if (wordCount(t) < 8) return true;
    const vaguePatterns = [
      /^(yes|no|ok|okay|sure|idk|i don't know|not sure|maybe|fine|good|alright)[.!]?$/i,
      /^(a bit|somewhat|kind of|sort of).{0,20}$/i,
      /^(i use (it|them) (sometimes|a little|a bit)).{0,30}$/i,
    ];
    return vaguePatterns.some((re) => re.test(t));
  }

  function productDisplayName(id) {
    const map = {
      teams: "Microsoft Teams",
      outlook: "Outlook",
      excel: "Excel",
      word: "Word",
      powerpoint: "PowerPoint",
      sharepoint: "SharePoint",
      onedrive: "OneDrive",
      onenote: "OneNote",
      forms: "Microsoft Forms",
      powerbi: "Power BI",
      powerautomate: "Power Automate",
      powerapps: "Power Apps",
      copilot: "Microsoft Copilot",
      azure: "Azure / Entra",
      windows: "Windows",
      planner: "Planner",
      loop: "Microsoft Loop",
      bookings: "Bookings",
      visio: "Visio",
      access: "Access",
    };
    return map[id] || id;
  }

  function listProducts(ids) {
    if (!ids.length) return "the Microsoft tools in your world";
    if (ids.length === 1) return productDisplayName(ids[0]);
    const names = ids.map(productDisplayName);
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  }

  function extractSignals(text) {
    const lower = text.toLowerCase();
    const frictionWords = ["hard", "struggle", "confus", "frustrat", "don't know", "dont know", "overwhelming", "stuck", "barrier", "difficult", "avoid"];
    const strengthWords = ["confident", "comfortable", "teach", "help others", "advanced", "expert", "daily", "every day", "love", "rely"];
    const learningWords = ["watch", "video", "hands-on", "hands on", "try", "practice", "read", "mentor", "ask someone", "workshop", "self-paced"];

    frictionWords.forEach((w) => {
      if (lower.includes(w) && !session.context.friction.includes(w)) {
        session.context.friction.push(w);
      }
    });
    strengthWords.forEach((w) => {
      if (lower.includes(w) && !session.context.strengths.includes(w)) {
        session.context.strengths.push(w);
      }
    });
    learningWords.forEach((w) => {
      if (lower.includes(w) && !session.context.learningStyle) {
        session.context.learningStyle = w;
      }
    });
  }

  function reflectOn(text, products) {
    const short = text.trim().replace(/\s+/g, " ");
    const snippet = short.length > 160 ? `${short.slice(0, 157)}…` : short;
    if (products.length) {
      const verb = products.length === 1 ? "is" : "are";
      return `What I’m hearing is that ${listProducts(products)} ${verb} part of your path — especially around: “${snippet}”`;
    }
    return `I’m holding what you shared: “${snippet}” — thank you for offering that context.`;
  }

  function buildLocalPrompt() {
    const ctx = session.context;
    const asked = new Set(session.askedIds);

    if (session.stage === "welcome" || !session.pendingPrompt) {
      return {
        id: "open-relation",
        stage: "relation",
        prompt:
          "Before we talk about tools, I’d like to understand your relationship to this work.\n\nWhere do you sit in your organization or community, and what kinds of responsibilities tend to bring Microsoft tools into your day?",
        hint: "Role, team, or community context is enough — titles are optional.",
        allowSkip: false,
      };
    }

    if (session.stage === "relation" && !asked.has("landscape")) {
      return {
        id: "landscape",
        stage: "landscape",
        prompt:
          "Looking across the Microsoft landscape — Teams, Outlook, Excel, Word, PowerPoint, SharePoint, OneDrive, Power BI, Copilot, and others — which tools show up most in your real work?\n\nTell me a short story of a typical week, or of a moment that stayed with you.",
        hint: "Name the tools in your own words. Stories carry more truth than skill ratings.",
        allowSkip: false,
      };
    }

    const lastYou = [...session.turns].reverse().find((t) => t.role === "you");
    if (
      lastYou &&
      isVague(lastYou.text) &&
      session.clarifyCount < 3 &&
      session.stage !== "horizons"
    ) {
      session.clarifyCount += 1;
      const focus = ctx.products[0] ? productDisplayName(ctx.products[0]) : "that tool";
      return {
        id: `clarify-${session.clarifyCount}`,
        stage: "clarify",
        prompt:
          `I want to make sure I’m understanding clearly, not assuming.\n\nWhen you think of ${focus}, what does a real moment of use look like for you — who is involved, what are you trying to get done, and what feels easy or sticky?`,
        hint: "Even one concrete example helps us design microtraining that fits.",
        allowSkip: true,
        isClarify: true,
      };
    }

    const underexplored = ctx.products.filter((id) => !ctx.productNotes[id] || ctx.productNotes[id].length < 40);
    if (underexplored.length && session.deepenCount < 4) {
      const target = underexplored[0];
      session.deepenCount += 1;
      const angles = [
        `With ${productDisplayName(target)}, what do you already do with confidence — and what still asks for patience or help?`,
        `How does ${productDisplayName(target)} connect you to other people — teammates, learners, partners, or community?`,
        `If someone walked beside you while you used ${productDisplayName(target)}, what would you want them to notice about how you work?`,
        `What would make ${productDisplayName(target)} feel more like a helper and less like a hurdle in your week?`,
      ];
      return {
        id: `deepen-${target}-${session.deepenCount}`,
        stage: "deepen",
        prompt: angles[(session.deepenCount - 1) % angles.length],
        hint: "You can focus on one habit, one struggle, or one win.",
        allowSkip: true,
        productFocus: target,
      };
    }

    if (!asked.has("gaps") && ctx.products.length) {
      return {
        id: "gaps",
        stage: "deepen",
        prompt:
          "Are there Microsoft tools you’ve heard about but haven’t really walked with yet — Copilot, Power Automate, Power BI, SharePoint, or others?\n\nWhat keeps them at a distance: time, access, confidence, relevance, or something else?",
        hint: "Distance is useful information for microtraining design.",
        allowSkip: true,
      };
    }

    if (!asked.has("horizons")) {
      return {
        id: "horizons",
        stage: "horizons",
        prompt:
          "Looking ahead, what would you like LDMLFN microtraining to help you grow into?\n\nSpeak to the outcome that would feel meaningful — for your work, your learners, or your community — not just a feature list.",
        hint: "Goals can be practical, relational, or both.",
        allowSkip: false,
      };
    }

    if (!asked.has("support")) {
      return {
        id: "support",
        stage: "horizons",
        prompt:
          "How do you learn best when a tool is new — watching, trying beside someone, short practice tasks, written guides, or another way that works for you?",
        hint: "This shapes how we package microtraining.",
        allowSkip: true,
      };
    }

    return { id: "done", stage: "close", done: true };
  }

  async function maybeRemoteAI(userText) {
    const endpoint = localStorage.getItem(AI_ENDPOINT_KEY);
    if (!endpoint) return null;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ldmlfn-microtraining",
          principles: [
            "relational before extractive",
            "story over ratings",
            "reflect understanding before probing",
            "clarify context with care",
            "honor lived Microsoft product experience",
          ],
          person: Profiles.getCurrentPublic(),
          session: {
            stage: session.stage,
            context: session.context,
            recentTurns: session.turns.slice(-8),
          },
          latestAnswer: userText,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !data.prompt) return null;
      return {
        id: data.id || `remote-${Date.now()}`,
        stage: data.stage || session.stage,
        prompt: data.prompt,
        hint: data.hint || "Share what feels true.",
        allowSkip: Boolean(data.allowSkip),
        reflection: data.reflection || null,
        done: Boolean(data.done),
      };
    } catch (_) {
      return null;
    }
  }

  async function nextGuideMove(userText) {
    const remote = await maybeRemoteAI(userText);
    if (remote) return remote;

    const products = detectProducts(userText);
    mergeProducts(products);
    extractSignals(userText);

    if (session.pendingPrompt?.productFocus) {
      const pid = session.pendingPrompt.productFocus;
      session.context.productNotes[pid] = `${session.context.productNotes[pid] || ""} ${userText}`.trim();
    }

    if (session.stage === "relation") {
      session.context.relation = userText;
    } else if (session.stage === "landscape") {
      session.context.landscape = userText;
      session.context.rawStories.push(userText);
    } else if (session.pendingPrompt?.id === "horizons") {
      session.context.goals = userText;
    } else if (session.pendingPrompt?.id === "support") {
      session.context.supports = userText;
    } else {
      session.context.rawStories.push(userText);
    }

    const local = buildLocalPrompt();
    if (local.done) return local;

    const shouldReflect =
      !local.isClarify &&
      userText &&
      wordCount(userText) >= 6 &&
      session.context.reflections.length < 5;

    let reflection = null;
    if (shouldReflect) {
      reflection = reflectOn(userText, products.length ? products : session.context.products.slice(0, 3));
      session.context.reflections.push(reflection);
    }

    return { ...local, reflection };
  }

  async function speakGuide(promptObj) {
    if (promptObj.reflection) {
      addBubble("guide", promptObj.reflection, "reflect");
      await wait(480);
    }
    addBubble("guide", promptObj.prompt);
    session.pendingPrompt = promptObj;
    session.stage = promptObj.stage || session.stage;
    if (promptObj.id) session.askedIds.push(promptObj.id);
    els.hint.textContent = promptObj.hint || "Share what feels true.";
    els.skip.hidden = !promptObj.allowSkip;
    setProgress();
    save();
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
      addBubble(
        "guide",
        `Welcome, ${person.name}. This dialogue is a listening space for your experience with Microsoft products.\n\nWe’ll move at a human pace: relationship first, then the tools that live in your work, then the growth that would matter next.`
      );
      await wait(350);
      const first = buildLocalPrompt();
      await speakGuide(first);
    } else {
      restoreThread();
      if (session.pendingPrompt) {
        els.hint.textContent = session.pendingPrompt.hint || "Share what feels true.";
        els.skip.hidden = !session.pendingPrompt.allowSkip;
      }
    }
  }

  async function handleReply(text, skipped = false) {
    if (busy || !requireProfile()) return;
    const cleaned = text.trim();
    if (!cleaned && !skipped) return;

    busy = true;
    els.send.disabled = true;
    els.skip.disabled = true;

    if (!skipped) {
      addBubble("you", cleaned);
    } else {
      addBubble("you", "(passing on this thread for now)");
    }

    els.input.value = "";

    const thinking = document.createElement("div");
    thinking.className = "bubble bubble--guide";
    thinking.innerHTML = '<span class="bubble__who">LDMLFN guide</span><p class="typing">Listening</p>';
    els.thread.appendChild(thinking);

    await wait(650 + Math.min(900, cleaned.length * 8));

    const move = await nextGuideMove(skipped ? session.context.landscape || "skipped" : cleaned);
    thinking.remove();

    if (move.done) {
      finishSession();
    } else {
      await speakGuide(move);
    }

    busy = false;
    els.send.disabled = false;
    els.skip.disabled = false;
    els.input.focus();
  }

  function finishSession() {
    session.stage = "close";
    setProgress();
    save();
    Profiles.markComplete();
    renderPortrait();
    showPanel("close");
    const n = session.context.products.length;
    els.closeSummary.textContent =
      n > 0
        ? `Your experience map names ${n} Microsoft product pathway${n === 1 ? "" : "s"} and the context around them. Review, export, or begin again.`
        : "Your experience map captures the context you offered. Review, export, or begin again when you’re ready.";
  }

  function renderPortrait() {
    const ctx = session.context;
    const person = Profiles.getCurrentPublic();
    const chips = ctx.products.length
      ? `<div class="chip-row">${ctx.products.map((p) => `<span class="chip">${productDisplayName(p)}</span>`).join("")}</div>`
      : "<p>No specific Microsoft products named yet — relational context still captured.</p>";

    const notes = Object.entries(ctx.productNotes)
      .map(([id, note]) => `<li><strong>${productDisplayName(id)}:</strong> ${escapeHtml(truncate(note, 220))}</li>`)
      .join("");

    els.portrait.innerHTML = `
      <h3>Experience portrait</h3>
      <h4>Profile</h4>
      <p>${escapeHtml(person?.name || "—")} · ${escapeHtml(person?.email || "—")}</p>
      <h4>Relation</h4>
      <p>${escapeHtml(ctx.relation || "Not yet described")}</p>
      <h4>Microsoft landscape</h4>
      ${chips}
      <h4>Landscape story</h4>
      <p>${escapeHtml(truncate(ctx.landscape || "—", 360))}</p>
      ${notes ? `<h4>Deepened pathways</h4><ul>${notes}</ul>` : ""}
      <h4>Growth horizon</h4>
      <p>${escapeHtml(ctx.goals || "—")}</p>
      <h4>Learning support</h4>
      <p>${escapeHtml(ctx.supports || ctx.learningStyle || "—")}</p>
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
      purpose: "Relational capture of Microsoft product experience for microtraining design",
      exportedAt: new Date().toISOString(),
      person: Profiles.getCurrentPublic(),
      sessionId: session.id,
      startedAt: session.startedAt,
      context: session.context,
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
    a.download = `ldmlfn-experience-${slug}-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copySummary() {
    const ctx = session.context;
    const person = Profiles.getCurrentPublic();
    const lines = [
      "LDMLFN Microtraining — Experience summary",
      `Person: ${person?.name || "—"} <${person?.email || "—"}>`,
      `Session: ${session.id}`,
      "",
      `Relation: ${ctx.relation || "—"}`,
      `Products: ${ctx.products.map(productDisplayName).join(", ") || "—"}`,
      `Landscape: ${ctx.landscape || "—"}`,
      `Goals: ${ctx.goals || "—"}`,
      `Supports: ${ctx.supports || ctx.learningStyle || "—"}`,
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
    session = createSession();
    startDialogue(false);
  });

  els.resume?.addEventListener("click", () => {
    const saved = load();
    if (!saved) return;
    session = saved;
    startDialogue(true);
  });

  els.restart.addEventListener("click", () => {
    resetDialogueOnly();
  });

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
  if (params.has("signout")) {
    Profiles.signOut();
  }
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
  };
})();
