/**
 * Module: Excel
 * Focus: data work, accuracy, who owns the numbers.
 */
(function () {
  window.LDMLFNModules.register({
    id: "excel",
    application: "Excel",
    order: 3,
    status: "available",
    blurb: "Spreadsheets, tracking, and shared numbers.",
    surfaceFrame:
      "challenges of using Excel and what people understand Excel is for in their work",
    intro:
      "This section focuses on Excel. Simple questions about how spreadsheets show up in work; follow-ups clarify culture, ownership, and relationships around the numbers.",
    closingPrompt:
      "Anything else about how Excel sits in your work or community decision-making that we should understand?",
    questions: [
      {
        id: "xl-what-it-is",
        surface: "In your own words, what do you mainly use Excel for?",
        hint: "Tracking, reports, lists, analysis — plain language is fine.",
        clarifyAim: "understanding",
      },
      {
        id: "xl-challenge",
        surface: "What is the biggest challenge you run into with Excel?",
        hint: "Formulas, versions, sharing, errors — whatever is true.",
        clarifyAim: "challenge",
      },
      {
        id: "xl-versions",
        surface: "When more than one person touches a spreadsheet, how do you know which version is true?",
        hint: "Name what usually happens in practice.",
        clarifyAim: "challenge",
      },
      {
        id: "xl-who",
        surface: "Who else depends on the Excel work you do — or who do you depend on?",
        hint: "Roles or relationships are enough.",
        clarifyAim: "understanding",
      },
      {
        id: "xl-trust",
        surface: "What makes you trust — or question — numbers that come from Excel?",
        hint: "Source, ownership, or how they were built.",
        clarifyAim: "understanding",
      },
      {
        id: "xl-change",
        surface: "If one thing about how your group uses Excel could change, what would help most?",
        hint: "One concrete change.",
        clarifyAim: "challenge",
      },
    ],
  });
})();
