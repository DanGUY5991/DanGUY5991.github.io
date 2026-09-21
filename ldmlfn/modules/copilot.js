/**
 * Module: Microsoft Copilot
 * Focus: AI assistance, trust, what people understand it can/should do.
 */
(function () {
  window.LDMLFNModules.register({
    id: "copilot",
    application: "Microsoft Copilot",
    order: 6,
    status: "available",
    blurb: "AI assistance, trust, and new work habits.",
    surfaceFrame:
      "challenges of using Copilot and what people understand Copilot is for",
    intro:
      "This section focuses on Microsoft Copilot. Simple questions about AI assistance; follow-ups clarify trust, relationships, and cultural care around knowledge.",
    closingPrompt:
      "Anything else about Copilot — hopes, hesitations, or community impacts — that we should understand?",
    questions: [
      {
        id: "cp-what-it-is",
        surface: "In your own words, what do you understand Microsoft Copilot is for?",
        hint: "Even if you have barely used it — your understanding matters.",
        clarifyAim: "understanding",
      },
      {
        id: "cp-use",
        surface: "Have you used Copilot yet — and if so, for what kind of task?",
        hint: "If not, say what has kept it at a distance.",
        clarifyAim: "understanding",
      },
      {
        id: "cp-challenge",
        surface: "What is the biggest challenge or hesitation you have with Copilot?",
        hint: "Trust, access, skill, relevance — whatever is true.",
        clarifyAim: "challenge",
      },
      {
        id: "cp-trust",
        surface: "What would make you trust — or not trust — an answer from Copilot?",
        hint: "Accuracy, sources, accountability.",
        clarifyAim: "understanding",
      },
      {
        id: "cp-who",
        surface: "Who around you is already using Copilot, encouraging it, or cautious about it?",
        hint: "Roles or relationships are enough.",
        clarifyAim: "understanding",
      },
      {
        id: "cp-change",
        surface: "If microtraining about Copilot could help one thing in your work or community, what should it be?",
        hint: "One concrete hope.",
        clarifyAim: "challenge",
      },
    ],
  });
})();
