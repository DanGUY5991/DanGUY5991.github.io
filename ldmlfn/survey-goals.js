/**
 * LDMLFN survey goals by Microsoft application.
 * SharePoint is the first active goal.
 *
 * Surface frame: challenges + understanding of the app.
 * Deep capture (via clarifying follow-ups): culture, relationships,
 * Indigenous understanding of the situations around the tool.
 */

(function (global) {
  const LENSES = {
    culture:
      "workplace or community culture around how knowledge, files, and decisions are shared",
    relationships:
      "relationships between people who create, hold, review, or depend on the information",
    indigenous:
      "Indigenous understanding of the situation — relational accountability, care for knowledge, place, and who is affected — without appropriating ceremony",
  };

  /** @type {SurveyGoal[]} */
  const GOALS = [
    {
      id: "sharepoint",
      application: "SharePoint",
      status: "active",
      surfaceFrame:
        "challenges of using SharePoint and what people understand SharePoint to be for",
      deepLenses: ["culture", "relationships", "indigenous"],
      intro:
        "This listening survey focuses on SharePoint. The questions are simple on purpose. After each answer, a short follow-up will ask for a little more clarity — especially about how people, culture, and relationships show up around the tool.",
      closingPrompt:
        "Thank you for walking through SharePoint with us. Is there anything else about how SharePoint sits in your work or community that we should understand before we design microtraining?",
      questions: [
        {
          id: "sp-what-it-is",
          surface:
            "In your own words, what is SharePoint used for in your work or organization?",
          hint: "A plain answer is enough — we will ask one clarifying follow-up after this.",
          clarifyAim: "understanding",
        },
        {
          id: "sp-challenge",
          surface:
            "What is the biggest challenge you run into when using SharePoint?",
          hint: "Name the friction as you feel it day to day.",
          clarifyAim: "challenge",
        },
        {
          id: "sp-finding",
          surface:
            "When you need to find something in SharePoint, how do you usually go about it?",
          hint: "Search, folders, asking someone, bookmarks — whatever is true.",
          clarifyAim: "challenge",
        },
        {
          id: "sp-who",
          surface:
            "Who else is usually involved when SharePoint work happens around you?",
          hint: "Roles or relationships are fine — names are optional.",
          clarifyAim: "understanding",
        },
        {
          id: "sp-trust",
          surface:
            "What makes you trust — or hesitate to trust — information you find in SharePoint?",
          hint: "Think about accuracy, ownership, or how things get updated.",
          clarifyAim: "understanding",
        },
        {
          id: "sp-change",
          surface:
            "If one thing about SharePoint could change to make work easier for your team or community, what would it be?",
          hint: "One concrete change is enough.",
          clarifyAim: "challenge",
        },
      ],
    },
  ];

  function getActiveGoal() {
    return GOALS.find((g) => g.status === "active") || GOALS[0];
  }

  function getGoal(id) {
    return GOALS.find((g) => g.id === id) || getActiveGoal();
  }

  function lensText(goal) {
    return (goal.deepLenses || [])
      .map((key) => LENSES[key] || key)
      .join("; ");
  }

  global.LDMLFNSurveyGoals = {
    GOALS,
    LENSES,
    getActiveGoal,
    getGoal,
    lensText,
  };
})(window);
