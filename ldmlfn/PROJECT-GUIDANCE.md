# LDMLFN Microtraining — Project guidance

High-level ideas and functions that should guide code structure decisions.
Treat this as living product intent, not implementation trivia.

## Purpose

Capture **lived experience with Microsoft products** through a remote, relational dialogue so LDMLFN can design microtraining that meets people where they already stand.

This is not a skill quiz. It is a listening instrument.

## Core product ideas

1. **Access before dialogue** — Participants arrive through a shareable access link, then sign in.
2. **Email is identity** — Create a profile or continue an existing one with the same email. No password required for v1.
3. **Visible people, private answers** — Facilitators can see who accessed (name, email, status, visits). Participants must not open each other’s dialogue content.
4. **Story before scores** — Questions invite narrative and relationship, not 1–5 ratings.
5. **Adaptive clarification** — The guide reflects understanding, then asks follow-ups when context is thin or a product path needs deepening.
6. **Indigenous-informed posture** — Relation first, reflective listening, clarify with care, gratitude at close. Do not appropriate ceremony; encode principles as dialogue design.
7. **Exportable experience maps** — Each profile can download their own transcript/portrait for microtraining design.

## Primary functions (map to modules)

| Function | Responsibility | Likely module |
| --- | --- | --- |
| Access link | Shareable entry URL; copy helper | `index.html` / auth panel |
| Sign in / create profile | Validate email; create or resume profile | `profiles.js` |
| Sign out | Clear active identity without deleting roster | `profiles.js` |
| Profile isolation | Load/save session only for current email | `profiles.js` |
| People roster | List visible metadata (no session bodies) | `people.html` + `people.js` |
| Access log | Append create/continue/complete/sign-out events | `profiles.js` |
| Dialogue engine | Adaptive prompts, product detection, reflections | `app.js` |
| Experience export | JSON download of person + session | `app.js` |
| Registry export | People + access log for facilitators | `people.js` |
| Optional AI endpoint | Remote prompt generation | `app.js` (`LDMLFN.setAiEndpoint`) |
| Optional sync endpoint | Push access events to an external store | `profiles.js` (`setSyncEndpoint`) |

## Structural rules for future code

- **Keep identity separate from dialogue.** Profile registry must not require loading another user’s transcript to render the people list.
- **Never switch sessions by picking a name from the roster.** Continuation only happens by signing in with that email.
- **Prefer additive prompts over branching trees** when extending AI behavior — store stage + context, then decide the next move.
- **Treat browser storage as the v1 source of truth** on GitHub Pages; any shared multi-device tracking must go through an explicit sync endpoint, not by exposing other profiles in the UI.
- **Guidance docs stay high-level.** Implementation details belong in code and README; this file captures decisions that should not be silently reversed.

## Non-goals (for now)

- Password / SSO authentication
- Encrypted anonymity / hidden participant lists
- Cross-profile browsing of answers
- Automatic cloud backup without a configured sync endpoint

## Open decisions

- Whether facilitators need a separate access code for the people roster
- Which sync backend (Sheets, Forms, worker, Supabase) becomes default later
- Whether completed experience maps should auto-submit on finish
