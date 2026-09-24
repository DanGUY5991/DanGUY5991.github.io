/**
 * Module: Microsoft Teams
 * Focus: collaboration, meetings, channels, who is in the room.
 */
(function () {
  window.LDMLFNModules.register({
    id: "teams",
    application: "Microsoft Teams",
    order: 2,
    status: "available",
    blurb: "Channels, meetings, and day-to-day collaboration.",
    surfaceFrame:
      "challenges of using Teams and what people understand Teams is for in their work",
    intro:
      "This section focuses on Microsoft Teams. Simple questions first; each answer gets one clarifying follow-up about people, culture, and relationships around collaboration.",
    closingPrompt:
      "Anything else about how Teams shapes teamwork or community connection that we should understand?",
    questions: [
      {
        id: "tm-what-it-is",
        surface: "In your own words, what is Microsoft Teams used for in your day-to-day work?",
        hint: "Keep it plain — we will ask one clarifying follow-up.",
        clarifyAim: "understanding",
      },
      {
        id: "tm-challenge",
        surface: "What is the biggest challenge you face when working in Teams?",
        hint: "Noise, missing messages, meetings, channels — name what is hardest.",
        clarifyAim: "challenge",
      },
      {
        id: "tm-channels",
        surface: "How do you decide where a conversation or file should live in Teams?",
        hint: "Channel, chat, meeting, or somewhere else.",
        clarifyAim: "understanding",
      },
      {
        id: "tm-who",
        surface: "Who do you most often need to reach or work with through Teams?",
        hint: "Roles or relationships are enough.",
        clarifyAim: "understanding",
      },
      {
        id: "tm-meetings",
        surface: "What usually makes a Teams meeting feel useful — or not useful — for you?",
        hint: "One honest observation is enough.",
        clarifyAim: "challenge",
      },
      {
        id: "tm-change",
        surface: "If one thing about Teams could change for your team or community, what would it be?",
        hint: "One concrete change.",
        clarifyAim: "challenge",
      },
    ],
  });
})();
