/**
 * Shared insight pool for cross-user AI coordination.
 * Full dialogue transcripts stay private to each profile.
 * Insights are short perceptions (visible who shared) that help craft
 * supplemental questions for other participants in the same product module.
 */

(function (global) {
  const STORE_KEY = "ldmlfn-insights-v1";
  const MAX_INSIGHTS = 400;

  function read() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { version: 1, insights: [] };
      const parsed = JSON.parse(raw);
      return {
        version: 1,
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      };
    } catch (_) {
      return { version: 1, insights: [] };
    }
  }

  function write(store) {
    if (store.insights.length > MAX_INSIGHTS) {
      store.insights = store.insights.slice(-MAX_INSIGHTS);
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function paraphrase(answer, themes, application) {
    const clean = String(answer || "").trim().replace(/\s+/g, " ");
    if (!clean) return "";
    const short = clean.length > 160 ? `${clean.slice(0, 157)}…` : clean;
    const themeBit = themes?.length ? ` (themes: ${themes.join(", ")})` : "";
    return `Perception about ${application}${themeBit}: ${short}`;
  }

  const Insights = {
    /**
     * Record a perception from a participant answer for later coordination.
     * Does not grant other users access to the full profile session.
     */
    contribute({
      moduleId,
      application,
      questionId,
      answer,
      themes = [],
      person = null,
      kind = "surface",
    }) {
      const text = String(answer || "").trim();
      if (!text || text.length < 12) return null;
      if (text.startsWith("(passing")) return null;

      const store = read();
      const insight = {
        id: `ins-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        moduleId,
        application,
        questionId: questionId || null,
        themes: [...new Set(themes)],
        paraphrase: paraphrase(text, themes, application || moduleId),
        quoteSnippet: text.length > 140 ? `${text.slice(0, 137)}…` : text,
        fromEmail: person?.email || null,
        fromName: person?.name || null,
        kind,
        at: new Date().toISOString(),
      };
      store.insights.push(insight);
      write(store);
      return insight;
    },

    list({ moduleId = null, excludeEmail = null, limit = 40 } = {}) {
      let items = read().insights.slice().reverse();
      if (moduleId) items = items.filter((i) => i.moduleId === moduleId);
      if (excludeEmail) {
        const email = String(excludeEmail).toLowerCase();
        items = items.filter((i) => String(i.fromEmail || "").toLowerCase() !== email);
      }
      return items.slice(0, limit);
    },

    /**
     * Pick peer perceptions useful for coordinating a supplemental question.
     * Prefers theme overlap with the current participant's recent themes.
     */
    peersForCoordination({
      moduleId,
      excludeEmail,
      themes = [],
      limit = 5,
    }) {
      const peers = this.list({ moduleId, excludeEmail, limit: 80 });
      if (!peers.length) return [];

      const themeSet = new Set(themes);
      const scored = peers.map((insight) => {
        const overlap = (insight.themes || []).filter((t) => themeSet.has(t)).length;
        return { insight, score: overlap * 3 + 1 };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit).map((s) => s.insight);
    },

    exportPool() {
      return {
        project: "LDMLFN Microtraining",
        kind: "cross-user-insight-pool",
        exportedAt: new Date().toISOString(),
        insights: read().insights,
      };
    },
  };

  global.LDMLFNInsights = Insights;
})(window);
