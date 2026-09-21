# LDMLFN Microtraining — Project ideas & functions

**Role of this file:** high-level product guidance that can change code structure.
Update this before large refactors. Prefer amending ideas here over inventing new modules ad hoc.

This is living intent, not implementation trivia. README covers how to run; code holds details.

---

## 1. Purpose

Capture **lived experience with Microsoft products** through a remote, relational dialogue so LDMLFN can design microtraining that meets people where they already stand.

This is not a skill quiz. It is a listening instrument.

---

## 2. Core product ideas

Capture ideas here as durable decisions. Mark status: `decided` | `leaning` | `open`.

| ID | Idea | Status | Structural implication |
| --- | --- | --- | --- |
| I1 | Access before dialogue — shareable link, then sign-in | decided | Auth/gate is its own surface before dialogue panels |
| I2 | Email is identity — create or continue profile by email; no password in v1 | decided | Identity module separate from dialogue engine |
| I3 | Visible people, private answers — roster shows who joined; answers stay per profile | decided | People UI must never load another user’s session body |
| I4 | Story before scores — narrative over ratings | decided | Prompt design favors open text; avoid score schemas as primary data |
| I5 | Adaptive clarification — reflect, then deepen/clarify from context | decided | Dialogue = stage + context + next-move function, not a fixed form wizard |
| I6 | Indigenous-informed posture — relation first, reflective listening, clarify with care, gratitude | decided | Encode as dialogue principles/prompt policy, not ceremony UI |
| I7 | Exportable experience maps per person | decided | Export includes person metadata + own session only |
| I8 | Optional remote AI for next questions | decided | Dialogue engine must work offline; AI is a plug-in endpoint |
| I9 | Optional sync for multi-device facilitator tracking | leaning | Sync is side-effect from profile events; not required for local use |
| I10 | Facilitator access code for people roster | open | May split `people.html` behind a simple shared code later |
| I11 | Auto-submit completed maps to a collector | open | Would add a submit function beside export; keep export either way |

### Idea inbox (capture freely)

_Add raw ideas below; promote into the table once they affect structure._

- —
- —

---

## 3. Primary functions

Functions the product must support. New features should map here or extend this list intentionally.

| ID | Function | Responsibility | Owns | Must not |
| --- | --- | --- | --- | --- |
| F1 | Access link | Shareable entry URL; copy helper | `index.html` auth panel, `people.html` | Bundle with dialogue logic |
| F2 | Sign in / create profile | Validate email; create or resume | `profiles.js` | Create multiple profiles per email |
| F3 | Sign out | Clear active identity; keep roster | `profiles.js` | Delete the person’s history on sign-out |
| F4 | Profile isolation | Load/save session only for current email | `profiles.js` | Allow roster click-through into another session |
| F5 | People roster | Visible metadata: name, email, status, visits, last access | `people.html`, `people.js` | Render transcripts or answer text |
| F6 | Access log | Record create / continue / complete / sign-out | `profiles.js` | Mix log entries with dialogue turns |
| F7 | Dialogue engine | Adaptive prompts, product detection, reflections | `app.js` | Own identity storage |
| F8 | Experience export | JSON of signed-in person + their session | `app.js` | Include other profiles’ sessions |
| F9 | Registry export | People + access log for facilitators | `people.js` | Include full transcripts by default |
| F10 | AI endpoint (optional) | Remote next-prompt generation | `app.js` | Block local dialogue if remote fails |
| F11 | Sync endpoint (optional) | Push access/profile events outward | `profiles.js` | Be required for single-browser use |

---

## 4. Module boundaries (code structure)

Keep these seams stable unless this file changes:

```
ldmlfn/
  profiles.js     → identity, roster data, access log, session persistence per email
  app.js          → dialogue UI + adaptive guide (consumes current profile only)
  people.js       → facilitator views of public metadata + log
  index.html      → access link + sign-in + dialogue shells
  people.html     → roster / log surface
  PROJECT-GUIDANCE.md → this file (intent)
  README.md       → run / share / endpoints
```

**Rules**

1. Identity separate from dialogue.
2. Continuation only by email sign-in — never by picking a name on the roster.
3. Prefer additive next-move prompts (stage + context) over hard-coded branching trees.
4. Browser storage is v1 source of truth on GitHub Pages; multi-device sharing needs an explicit sync endpoint.
5. Guidance stays high-level here; do not dump API field lists into this file.

---

## 5. Non-goals (for now)

- Password / SSO authentication
- Hidden or anonymized participant lists
- Cross-profile browsing of answers
- Automatic cloud backup without a configured sync endpoint
- Treating this form as a graded assessment

---

## 6. Decision log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-09-21 | Email-only simple login | Low friction for remote participants; enough to create/continue profiles |
| 2026-09-21 | Visible people roster | Facilitators need to document who accessed; no need to hide identities |
| 2026-09-21 | Isolate sessions by email | Prevent accidental or intentional cross-profile access to answers |
| 2026-09-21 | Client-side adaptive guide + optional AI | Works on GitHub Pages without a required backend |

---

## 7. How to use this file when coding

1. New feature? Find or add a function row (F#) and an idea row (I#) if needed.
2. If a change crosses module boundaries, update §4 first, then code.
3. If an idea is still `open`, do not bake irreversible structure around it.
4. Prefer small modules that match F1–F11 over a single growing `app.js` god-object over time.
