/**
 * Craft clarifying follow-ups and cross-user supplemental questions.
 * Surface still feels like app challenge/understanding;
 * depth listens for culture, relationships, Indigenous understanding.
 * Supplemental questions coordinate other participants' perceptions
 * into another person's experience — without opening their full profile.
 */

(function (global) {
  const AI_ENDPOINT_KEY = "ldmlfn-ai-endpoint";

  function snippet(text, max = 120) {
    const s = String(text || "").trim().replace(/\s+/g, " ");
    if (!s) return "";
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  }

  function detectThemes(answer) {
    const t = answer.toLowerCase();
    const themes = [];
    const checks = [
      [/can'?t find|hard to find|search|lost|where is|buried/, "finding"],
      [/permission|access|denied|who can|lock|secure|confidential/, "access"],
      [/version|outdated|old copy|which one|duplicate|conflict/, "versions"],
      [/folder|structure|messy|organiz|navigate|library/, "structure"],
      [/team|teams|people|ask someone|manager|colleague|community|partner|teamwork|collaborat/, "people"],
      [/train|know how|confus|don'?t understand|unclear|intimidat/, "knowing"],
      [/slow|broken|error|sync|link/, "tech"],
      [/trust|reliable|source of truth|official/, "trust"],
      [/share|handoff|approv|review|ownership/, "flow"],
      [/meeting|channel|chat|inbox|email|calendar/, "communication"],
    ];
    checks.forEach(([re, id]) => {
      if (re.test(t)) themes.push(id);
    });
    return themes;
  }

  function localFollowUp({ goal, question, answer, person }) {
    const app = goal.application;
    const bit = snippet(answer, 140);
    const themes = detectThemes(answer);
    const aim = question.clarifyAim || "understanding";
    const role = person?.role;
    const rel = person?.relationships;

    const opener = bit
      ? `I’m holding what you shared about ${app}: “${bit}.”`
      : `I’m listening to how ${app} shows up for you.`;

    const roleBridge = role
      ? ` As a ${role}${rel ? ` in relationship with ${rel}` : ""},`
      : "";

    let probe;
    if (themes.includes("access") || themes.includes("trust")) {
      probe =
        `What does that challenge reveal about trust and accountability in your setting —${roleBridge} whose understanding of ${app} counts, and how are people cared for when access or information feels uncertain?`;
    } else if (themes.includes("finding") || themes.includes("structure")) {
      probe =
        `Can you say a little more about the culture of how knowledge is kept in ${app} —${roleBridge} whose pathways people actually trust, and what that means for relationships when someone new needs to find their way?`;
    } else if (themes.includes("people") || themes.includes("communication") || /who/i.test(question.id || "")) {
      probe =
        `To understand that more clearly:${roleBridge} how do relationships around ${app} shape who gets heard, who holds the knowledge, and who feels responsible when something goes missing or unclear?`;
    } else if (themes.includes("knowing")) {
      probe =
        `Where does understanding of ${app} usually live among your people — in documents, in a few individuals, or in shared practice — and how does that affect belonging or confidence for others${role ? ` in your work as ${role}` : ""}?`;
    } else if (themes.includes("flow") || themes.includes("versions")) {
      probe =
        `How do handoffs and “which version is true” play out relationally with ${app}?${roleBridge} who is accountable to whom, and what cultural habits help or hinder that care?`;
    } else if (aim === "challenge") {
      probe =
        `Looking at that challenge with ${app},${roleBridge} what else should we understand about the relationships or workplace/community culture that make this hard — not only the button clicks?`;
    } else {
      probe =
        `To clarify your understanding of ${app}:${roleBridge} how is this way of working connected to the people and culture around you, and what Indigenous or relational wisdom about sharing knowledge feels missing or honored in that situation?`;
    }

    return {
      reflection: opener,
      prompt: probe.replace(/\s+/g, " ").replace(/\s,/g, ",").trim(),
      hint: `Answer from your role${role ? ` as ${role}` : ""} — people, culture, and relationships around ${app}.`,
      themes,
      source: "local",
    };
  }

  function localSupplemental({ goal, peerInsights, personThemes = [], person = null }) {
    const app = goal.application;
    const peers = peerInsights || [];
    const lead = peers[0];
    const who = lead?.fromName ? `${lead.fromName}` : "another participant";
    const perception = lead?.quoteSnippet || lead?.paraphrase || "teamwork and coordination challenges";
    const role = person?.role;
    const rel = person?.relationships;

    const themeHint = personThemes.includes("people") || personThemes.includes("communication")
      ? "teamwork and how people work together"
      : "how this shows up in your own relationships and culture of work";

    const roleAsk = role
      ? `From your role as ${role}${rel ? ` (with ${rel})` : ""}, h`
      : "H";

    return {
      reflection: `Others working with ${app} have shared perceptions we can learn beside — not to compare you, but to listen across experiences.`,
      prompt:
        `${who} described something like this with ${app}: “${snippet(perception, 150)}.”\n\n${roleAsk}ow does that perception sit beside your experience — does it echo, differ, or reveal another side of ${themeHint} in your setting?`,
      hint: "You can agree, disagree, or add what is missing from your side of the story.",
      themes: lead?.themes || [],
      source: "local-supplemental",
      peerInsightIds: peers.map((p) => p.id),
    };
  }

  async function remoteCraft(mode, payload) {
    const endpoint = localStorage.getItem(AI_ENDPOINT_KEY);
    if (!endpoint) return null;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          instructions:
            mode === "ldmlfn-supplemental"
              ? [
                  "Craft ONE supplemental question that connects another participant's perception to this person's experience.",
                  "Example: one person's teamwork issues in Teams may illuminate another user's different experience of the same patterns.",
                  "Do not expose full private transcripts — use the provided peer insight snippets only.",
                  "Keep the question about the Microsoft application challenges/understanding on the surface.",
                  "Underneath, clarify culture, relationships, and Indigenous understanding of the situation.",
                  "Warm, careful tone. One question only.",
                ]
              : [
                  "Craft ONE clarifying follow-up question based on the participant's initial answer.",
                  "Use the participant bio (role, relationships, org context) to frame the follow-up in their role and relationships to others.",
                  "Optionally weave peer insight themes if provided, without quoting other people unless helpful.",
                  "Surface: challenges or understanding of the Microsoft application.",
                  "Depth: culture, relationships, Indigenous understanding of the situation.",
                  "One question only. Warm, careful tone.",
                ],
          goal: {
            id: payload.goal.id,
            application: payload.goal.application,
            surfaceFrame: payload.goal.surfaceFrame,
            deepLenses: payload.goal.deepLenses,
            lensDetail: global.LDMLFNSurveyGoals?.lensText(payload.goal),
          },
          question: payload.question || null,
          answer: payload.answer || null,
          person: payload.person || null,
          bio: {
            role: payload.person?.role || null,
            relationships: payload.person?.relationships || null,
            orgContext: payload.person?.orgContext || null,
          },
          peerInsights: payload.peerInsights || [],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.prompt) return null;
      return {
        reflection: data.reflection || null,
        prompt: data.prompt,
        hint: data.hint || "Add whatever clarifies the situation for you.",
        themes: data.themes || [],
        source: "remote",
        peerInsightIds: (payload.peerInsights || []).map((p) => p.id),
      };
    } catch (_) {
      return null;
    }
  }

  async function craftFollowUp(payload) {
    const Insights = global.LDMLFNInsights;
    const personEmail = payload.person?.email;
    const themes = detectThemes(payload.answer || "");
    const peerInsights = Insights
      ? Insights.peersForCoordination({
          moduleId: payload.goal.id,
          excludeEmail: personEmail,
          themes,
          limit: 3,
        })
      : [];

    const remote = await remoteCraft("ldmlfn-clarify", { ...payload, peerInsights });
    if (remote) return remote;
    return localFollowUp(payload);
  }

  async function craftSupplemental(payload) {
    const Insights = global.LDMLFNInsights;
    const personEmail = payload.person?.email;
    const personThemes = payload.personThemes || [];
    const peerInsights =
      payload.peerInsights ||
      (Insights
        ? Insights.peersForCoordination({
            moduleId: payload.goal.id,
            excludeEmail: personEmail,
            themes: personThemes,
            limit: 5,
          })
        : []);

    if (!peerInsights.length) return null;

    const remote = await remoteCraft("ldmlfn-supplemental", {
      ...payload,
      peerInsights,
    });
    if (remote) return remote;
    return localSupplemental({
      goal: payload.goal,
      peerInsights,
      personThemes,
      person: payload.person,
    });
  }

  global.LDMLFNClarify = {
    craftFollowUp,
    craftSupplemental,
    detectThemes,
    localFollowUp,
    localSupplemental,
  };
})(window);
