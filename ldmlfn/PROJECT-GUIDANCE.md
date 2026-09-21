# LDMLFN Microtraining — Project ideas & functions

**Role of this file:** high-level product guidance that can change code structure.
Update this before large refactors. Prefer amending ideas here over inventing new modules ad hoc.

---

## 1. Purpose

Capture **lived experience with Microsoft applications** through a remote survey dialogue so LDMLFN can design microtraining that meets people where they already stand.

**Surface feel:** challenges of using the target app, and what people understand about it.

**Deeper capture:** culture, relationships, and Indigenous understanding of the situations around that tool.

---

## 2. Product modules (structure-critical)

Each Microsoft product is a **modular section** with its own **key initial questions**.

| Module ID | Application | File | Status |
| --- | --- | --- | --- |
| `sharepoint` | SharePoint | `modules/sharepoint.js` | available (default) |
| `teams` | Microsoft Teams | `modules/teams.js` | available |
| `excel` | Excel | `modules/excel.js` | available |
| `outlook` | Outlook | `modules/outlook.js` | available |
| `onedrive` | OneDrive | `modules/onedrive.js` | available |
| `copilot` | Microsoft Copilot | `modules/copilot.js` | available |

### Pattern inside every module

```
simple surface question  (module-specific)
  → participant answer
  → AI-crafted clarifying follow-up (from that answer)
  → participant clarification
  → next simple question
```

**Rule:** add a new Microsoft product by registering a new file under `modules/` — do not fork `app.js`.

---

## 3. Core product ideas

| ID | Idea | Status | Structural implication |
| --- | --- | --- | --- |
| I1 | Access before dialogue | decided | Auth gate before survey |
| I2 | Email is identity | decided | `profiles.js` separate from dialogue |
| I3 | Visible people, private answers | decided | Roster never loads another session body |
| I4 | Story before scores | decided | Open text, not ratings |
| I5 | Simple Q + AI clarification pair | decided | Pair-based runner in `app.js` |
| I6 | Indigenous-informed clarification lens | decided | Policy in `clarify.js` |
| I7 | Exportable experience maps | decided | Export = person + own session |
| I8 | Optional remote AI for follow-ups | decided | Local clarifier always works |
| I9 | Optional sync endpoint | leaning | Side-effect from profile events |
| I12 | Modular product sections with key initial questions | decided | One registerable module per Microsoft app |
| I13 | Surface = challenges/understanding; depth = culture/relationships/Indigenous understanding | decided | Clarifier always receives deep lenses |
| I14 | Cross-user supplemental questions from others’ answers | decided | Shared insight pool (`insights.js`); AI coordinates supplemental without opening full profiles |
| I15 | Bio/role questions that contextualize later prompts | leaning | Pre-module profile fields feed clarifier context (queued) |

### Idea inbox

- Multi-module progress per profile (complete SharePoint, then Teams)
- —

---

## 4. Primary functions

| ID | Function | Owns | Must not |
| --- | --- | --- | --- |
| F1 | Access link | `index.html` | Bundle with dialogue |
| F2–F6 | Sign-in, isolation, roster, access log | `profiles.js` / `people.*` | Cross-profile transcripts |
| F7 | Product module registry | `modules/registry.js` | Own UI chrome |
| F8 | Module question banks | `modules/*.js` | Clarifier policy |
| F9 | Clarifying follow-up craft | `clarify.js` | Hard-code per HTML page |
| F9b | Cross-user supplemental craft | `clarify.js` + `insights.js` | Expose another user’s full transcript in the UI |
| F10 | Dialogue runner + module picker | `app.js` | Own identity storage |
| F11–F12 | Exports + optional sync | `app.js` / `profiles.js` | Leak other profiles |

---

## 5. Module boundaries

```
ldmlfn/
  profiles.js
  insights.js          → shared perception pool for cross-user AI coordination
  modules/
    registry.js
    sharepoint.js | teams.js | excel.js | outlook.js | onedrive.js | copilot.js
  clarify.js           → per-answer clarify + peer-coordinated supplemental
  app.js
  people.js / people.html
  PROJECT-GUIDANCE.md
```

**Rules**

1. Identity ≠ dialogue ≠ product content ≠ clarifier ≠ insight pool.
2. New product = new `modules/<id>.js` that calls `LDMLFNModules.register(...)`.
3. Every simple question gets one crafted clarifying follow-up before the next simple question.
4. After a module’s key questions, AI may ask one **supplemental** question coordinated from other participants’ perceptions in that module (excluding the current user).
5. Insights are short perceptions for coordination — not a backdoor into another profile’s full session.
6. Clarifiers dig for culture / relationships / Indigenous understanding while staying framed as app challenge/understanding.

---

## 6. Non-goals (for now)

- Password / SSO
- Hidden participant lists
- Cross-profile browsing of answers
- Graded skill assessment

---

## 7. Decision log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-09-21 | Email-only login + visible roster | Track people without hiding; isolate answers |
| 2026-09-21 | SharePoint-first listening pattern | Prove simple Q + AI clarify |
| 2026-09-21 | Modular product sections | Focus key initial questions per Microsoft app without rewriting the runner |
| 2026-09-21 | Cross-user insight pool + supplemental AI questions | One person’s teamwork/perception themes can inform another user’s coordinated follow-up without opening full profiles |

---

## 8. How to use this file when coding

1. New Microsoft product? Add `modules/<id>.js` + a row in §2.
2. Changing clarification depth? Edit `clarify.js`, not every module file.
3. Cross-module features (bio role, cross-user AI) stay `leaning` until designed here first.
