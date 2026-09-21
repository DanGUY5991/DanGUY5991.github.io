# LDMLFN Microtraining — Project ideas & functions

**Role of this file:** high-level product guidance that can change code structure.
Update this before large refactors. Prefer amending ideas here over inventing new modules ad hoc.

This is living intent, not implementation trivia. README covers how to run; code holds details.

---

## 1. Purpose

Capture **lived experience with Microsoft applications** through a remote survey dialogue so LDMLFN can design microtraining that meets people where they already stand.

**Surface feel:** collecting information about challenges of using the target app, and what people understand about it.

**Deeper capture:** culture, relationships, and Indigenous understanding of the situations around that tool.

This is not a skill quiz. It is a listening instrument.

---

## 2. Survey goals (Microsoft applications)

Surveys are organized by **application goal**. One goal is active at a time.

| Goal ID | Application | Status | Notes |
| --- | --- | --- | --- |
| `sharepoint` | SharePoint | **active (first)** | Challenges + understanding on the surface; culture / relationships / Indigenous understanding underneath |
| `teams` | Microsoft Teams | planned | Same pattern later |
| `excel` | Excel | planned | Same pattern later |
| `copilot` | Microsoft Copilot | planned | Same pattern later |

### Pattern for every goal (structure-critical)

```
simple surface question
    → participant answer
    → AI-crafted clarifying follow-up (based on that answer)
    → participant clarification
    → next simple question (or close)
```

- Surface questions stay **short and straightforward** (challenge / understanding).
- Follow-ups are **crafted from the initial answer**, not a fixed second script.
- Follow-ups still sound like SharePoint (or the current app) talk, while drawing out **culture, relationships, and Indigenous understanding of the situation**.

---

## 3. Core product ideas

Capture ideas here as durable decisions. Mark status: `decided` | `leaning` | `open`.

| ID | Idea | Status | Structural implication |
| --- | --- | --- | --- |
| I1 | Access before dialogue — shareable link, then sign-in | decided | Auth/gate is its own surface before dialogue panels |
| I2 | Email is identity — create or continue profile by email; no password in v1 | decided | Identity module separate from dialogue engine |
| I3 | Visible people, private answers — roster shows who joined; answers stay per profile | decided | People UI must never load another user’s session body |
| I4 | Story before scores — narrative over ratings | decided | Prompt design favors open text; avoid score schemas as primary data |
| I5 | Simple Q + AI clarification pair | decided | Dialogue engine is pair-based (ask → clarify), not a long fixed form |
| I6 | Indigenous-informed posture — relation, reflective listening, clarify with care | decided | Clarification lens lives in follow-up crafting policy |
| I7 | Exportable experience maps per person | decided | Export includes person metadata + own session only |
| I8 | Optional remote AI for follow-up crafting | decided | Local clarifier must work; remote AI is enhancement |
| I9 | Optional sync for multi-device facilitator tracking | leaning | Sync is side-effect from profile events |
| I10 | Facilitator access code for people roster | open | May gate `people.html` later |
| I11 | Auto-submit completed maps | open | Keep manual export either way |
| I12 | Survey goals by Microsoft app; SharePoint first | decided | Goal config module separate from UI shell |
| I13 | Surface = challenges/understanding; depth = culture/relationships/Indigenous understanding | decided | Clarifier always receives deep-lens instructions |

### Idea inbox

- Multi-goal selector after login (when more than SharePoint exists)
- —

---

## 4. Primary functions

| ID | Function | Responsibility | Owns | Must not |
| --- | --- | --- | --- | --- |
| F1 | Access link | Shareable entry URL; copy helper | `index.html`, `people.html` | Bundle with dialogue logic |
| F2 | Sign in / create profile | Validate email; create or resume | `profiles.js` | Create multiple profiles per email |
| F3 | Sign out | Clear active identity; keep roster | `profiles.js` | Delete history on sign-out |
| F4 | Profile isolation | Load/save session only for current email | `profiles.js` | Roster click-through into another session |
| F5 | People roster | Visible metadata only | `people.html`, `people.js` | Render transcripts |
| F6 | Access log | create / continue / complete / sign-out | `profiles.js` | Mix with dialogue turns |
| F7 | Survey goal config | App goal, surface questions, deep lenses | `survey-goals.js` | Own UI rendering |
| F8 | Clarifying follow-up craft | Build AI follow-up from initial answer + lenses | `clarify.js` (+ optional remote) | Ask unrelated product quizzes |
| F9 | Dialogue runner | Drive simple Q → answer → clarify → answer loop | `app.js` | Own identity storage |
| F10 | Experience export | Person + session JSON | `app.js` | Other profiles’ sessions |
| F11 | Registry export | People + access log | `people.js` | Full transcripts by default |
| F12 | Sync endpoint (optional) | Push access events | `profiles.js` | Be required for local use |

---

## 5. Module boundaries

```
ldmlfn/
  profiles.js        → identity, roster, access log, per-email session
  survey-goals.js    → Microsoft app goals + simple surface questions (SharePoint first)
  clarify.js         → craft clarifying follow-ups from an answer (local + optional AI)
  app.js             → UI shell + runs the Q → clarify loop for the active goal
  people.js          → facilitator roster / log
  index.html         → access + sign-in + dialogue shells
  people.html        → roster surface
  PROJECT-GUIDANCE.md
  README.md
```

**Rules**

1. Identity separate from dialogue.
2. Survey goal content separate from clarification crafting.
3. Continuation only by email sign-in.
4. Every simple question gets exactly one crafted clarifying follow-up before the next simple question (unless skipped).
5. Clarifiers dig for culture / relationships / Indigenous understanding while staying framed as app challenge/understanding.
6. Browser storage is v1 source of truth on GitHub Pages.

---

## 6. Non-goals (for now)

- Password / SSO authentication
- Hidden participant lists
- Cross-profile browsing of answers
- Multi-app survey picker in the UI (SharePoint is the only active goal)
- Graded skill assessment

---

## 7. Decision log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-09-21 | Email-only simple login | Low friction; enough to create/continue profiles |
| 2026-09-21 | Visible people roster | Document who accessed; identities need not be hidden |
| 2026-09-21 | Isolate sessions by email | Prevent cross-profile answer access |
| 2026-09-21 | SharePoint as first survey goal | Focus the listening instrument on one Microsoft app |
| 2026-09-21 | Simple question + AI clarification pair | Straightforward intake with deeper situational understanding |

---

## 8. How to use this file when coding

1. New feature? Add/update an idea (I#) and function (F#) first.
2. New Microsoft app goal? Add a goal row in §2 and a config object in `survey-goals.js` — do not fork `app.js`.
3. Changing clarification depth? Edit `clarify.js` policy / lenses, not individual HTML pages.
4. If an idea is `open`, do not bake irreversible structure around it.
