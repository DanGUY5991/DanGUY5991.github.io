/**
 * Module: Outlook
 * Focus: email/calendar load, response culture, who gets looped in.
 */
(function () {
  window.LDMLFNModules.register({
    id: "outlook",
    application: "Outlook",
    order: 4,
    status: "available",
    blurb: "Email, calendar, and communication load.",
    surfaceFrame:
      "challenges of using Outlook and what people understand email/calendar are for in their work",
    intro:
      "This section focuses on Outlook. Simple questions about mail and calendar; follow-ups clarify culture, relationships, and communication care.",
    closingPrompt:
      "Anything else about email or calendar culture in your setting that we should understand?",
    questions: [
      {
        id: "ol-what-it-is",
        surface: "In your own words, what is Outlook mainly for in your workday?",
        hint: "Mail, calendar, both — keep it plain.",
        clarifyAim: "understanding",
      },
      {
        id: "ol-challenge",
        surface: "What is the biggest challenge you face with Outlook?",
        hint: "Volume, finding messages, meetings, urgency — whatever is hardest.",
        clarifyAim: "challenge",
      },
      {
        id: "ol-urgency",
        surface: "How do you tell what in your inbox actually needs a response?",
        hint: "Describe your real habit, not the ideal one.",
        clarifyAim: "challenge",
      },
      {
        id: "ol-who",
        surface: "Who are you most often corresponding with through Outlook?",
        hint: "Roles or relationship types are enough.",
        clarifyAim: "understanding",
      },
      {
        id: "ol-calendar",
        surface: "How does your calendar in Outlook usually get filled — by you, by others, or both?",
        hint: "One honest pattern is enough.",
        clarifyAim: "understanding",
      },
      {
        id: "ol-change",
        surface: "If one thing about Outlook or email culture could change, what would help your team or community?",
        hint: "One concrete change.",
        clarifyAim: "challenge",
      },
    ],
  });
})();
