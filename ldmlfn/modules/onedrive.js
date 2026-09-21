/**
 * Module: OneDrive
 * Focus: personal/shared files, sync, handoff habits.
 */
(function () {
  window.LDMLFNModules.register({
    id: "onedrive",
    application: "OneDrive",
    order: 5,
    status: "available",
    blurb: "Personal and shared files, sync, and handoffs.",
    surfaceFrame:
      "challenges of using OneDrive and what people understand OneDrive is for",
    intro:
      "This section focuses on OneDrive. Simple questions about files and sharing; follow-ups clarify relationships and how knowledge is held.",
    closingPrompt:
      "Anything else about how OneDrive fits your work or community sharing that we should understand?",
    questions: [
      {
        id: "od-what-it-is",
        surface: "In your own words, what do you use OneDrive for?",
        hint: "Backup, sharing, drafting — plain language is fine.",
        clarifyAim: "understanding",
      },
      {
        id: "od-challenge",
        surface: "What is the biggest challenge you run into with OneDrive?",
        hint: "Sync, sharing links, finding files — whatever is true.",
        clarifyAim: "challenge",
      },
      {
        id: "od-share",
        surface: "When you need to share a file, how do you usually decide between OneDrive, email, or another place?",
        hint: "Describe your real habit.",
        clarifyAim: "understanding",
      },
      {
        id: "od-who",
        surface: "Who usually needs access to the files you keep in OneDrive?",
        hint: "Roles or relationships are enough.",
        clarifyAim: "understanding",
      },
      {
        id: "od-change",
        surface: "If one thing about OneDrive could change for your work, what would it be?",
        hint: "One concrete change.",
        clarifyAim: "challenge",
      },
    ],
  });
})();
