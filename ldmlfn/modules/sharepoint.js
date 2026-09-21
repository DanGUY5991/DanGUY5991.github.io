/**
 * Module: SharePoint
 * Focus: where knowledge lives, finding, trust, who is involved.
 */
(function () {
  window.LDMLFNModules.register({
    id: "sharepoint",
    application: "SharePoint",
    order: 1,
    status: "available",
    blurb: "Libraries, sites, and shared knowledge pathways.",
    surfaceFrame:
      "challenges of using SharePoint and what people understand SharePoint to be for",
    intro:
      "This section focuses on SharePoint. Questions stay simple. After each answer, one follow-up clarifies culture, relationships, and how knowledge is cared for.",
    closingPrompt:
      "Is there anything else about how SharePoint sits in your work or community that we should understand before designing microtraining?",
    questions: [
      {
        id: "sp-what-it-is",
        surface: "In your own words, what is SharePoint used for in your work or organization?",
        hint: "A plain answer is enough — one clarifying follow-up comes next.",
        clarifyAim: "understanding",
      },
      {
        id: "sp-challenge",
        surface: "What is the biggest challenge you run into when using SharePoint?",
        hint: "Name the friction as you feel it day to day.",
        clarifyAim: "challenge",
      },
      {
        id: "sp-finding",
        surface: "When you need to find something in SharePoint, how do you usually go about it?",
        hint: "Search, folders, asking someone, bookmarks — whatever is true.",
        clarifyAim: "challenge",
      },
      {
        id: "sp-who",
        surface: "Who else is usually involved when SharePoint work happens around you?",
        hint: "Roles or relationships are fine — names are optional.",
        clarifyAim: "understanding",
      },
      {
        id: "sp-trust",
        surface: "What makes you trust — or hesitate to trust — information you find in SharePoint?",
        hint: "Think about accuracy, ownership, or how things get updated.",
        clarifyAim: "understanding",
      },
      {
        id: "sp-change",
        surface: "If one thing about SharePoint could change to make work easier for your team or community, what would it be?",
        hint: "One concrete change is enough.",
        clarifyAim: "challenge",
      },
    ],
  });
})();
