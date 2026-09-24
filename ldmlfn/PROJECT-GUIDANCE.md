# LDMLFN listening tool — Project ideas & functions

**Role of this file:** high-level guidance that can change code structure.  
**Aligned with:** [`UNDERSTANDING.md`](./UNDERSTANDING.md) (stakeholder-revised understanding).

Update this before large refactors. Prefer amending ideas here over inventing features ad hoc.

---

## 1. Place in the broader project

**LDMLFN training development** includes facilitation, hands-on practice, video, coaching, and other learning paths.

This codebase is only the **listening and training-needs tool** — optional relative to the wider project.

---

## 2. Purpose (transparent)

Participant-facing purpose:

> We want to understand what you already do, what helps or gets in the way, and how working with others affects your experience. Your responses will help shape practical training.

Questions may address software **and** work relationships when participants make relationships relevant.  
There is **no hidden cultural layer** beneath a software quiz.

---

## 3. Pilot scope (structure-critical)

| In pilot now | Proposed extension later |
| --- | --- |
| SharePoint module only (as default focus) | Teams, Excel, Outlook, OneDrive, Copilot modules |
| Strengths-first + friction + support questions | Cross-person coordinated questions |
| Optional AI follow-ups (Skip / Continue / Correct) | Always-on follow-up after every answer |
| Editable draft summary before share | Auto-submit without review |
| Explicit info-sharing notice | Visible multi-person attendance roster |

**Rule:** do not turn on cross-person insight coordination for participant use until permission, review, and reuse rules are designed and approved.

---

## 4. Core product ideas

| ID | Idea | Status | Structural implication |
| --- | --- | --- | --- |
| I1 | Listening tool is one component of LDMLFN training | decided | Keep docs/UI from claiming to be the whole training program |
| I2 | Transparent purpose (software + relationships when relevant) | decided | No “surface vs secret underneath” framing in copy or prompts |
| I3 | Strengths and useful work first | decided | Question banks lead with what works / goals / support |
| I4 | Optional, correctable follow-ups | decided | Follow-up UI: Skip, Continue, Correct understanding |
| I5 | Draft summary, not assessment | decided | Editable portrait/summary before any share |
| I6 | SharePoint pilot first | decided | Other modules remain registered but not pilot-required |
| I7 | Cross-person questions off for pilot | decided | `insights` supplemental path disabled by default |
| I8 | Email is identification, not proof of identity | decided | Copy must not claim secure login |
| I9 | Privacy rules explicit before participant use | decided | Access page states who sees what, storage, correct/delete |
| I10 | Indigenous-informed = respectful questions + local review | decided | Tool asks; does not interpret culture for the person |
| I11 | Bio/role can contextualize questions carefully | decided | Explicit purpose; do not over-collect |
| I12 | Optional remote AI endpoint | leaning | Local drafting must work without remote |
| I13 | Facilitator sync / multi-device store | open | Only after sharing rules are clear |

---

## 5. Primary functions (pilot)

| ID | Function | Owns | Must not |
| --- | --- | --- | --- |
| F1 | Access + purpose notice | `index.html` | Hide sharing rules |
| F2 | Lightweight return-to-draft identity | `profiles.js` | Claim secure authentication |
| F3 | Bio (role, relationships) with clear purpose | bio panel | Cultural categorization |
| F4 | SharePoint question bank (strengths-first) | `modules/sharepoint.js` | Challenge-only framing |
| F5 | Optional follow-up draft + Correct/Skip/Continue | `clarify.js` + `app.js` | Force a follow-up every time |
| F6 | Editable draft summary | close panel | Present as assessment |
| F7 | Export / share only after participant approval | `app.js` | Silent upload |
| F8 | Clear / delete own draft | `profiles.js` | Leave no participant delete path |
| F9 | Product module registry (extensions) | `modules/*` | Require all modules in pilot |
| F10 | Cross-person insights (extension, off) | `insights.js` | Enable without consent design |

---

## 6. Module boundaries

```
ldmlfn/
  UNDERSTANDING.md     → stakeholder understanding (source of truth for intent)
  PROJECT-GUIDANCE.md  → this file (structure decisions)
  profiles.js          → return-to-draft identity, bio, local session, delete
  modules/             → question banks (SharePoint = pilot focus)
  clarify.js           → optional follow-up drafting (no forced cultural diagnosis)
  insights.js          → cross-person pool (disabled for pilot)
  app.js               → journey: purpose → bio → questions → optional follow-ups → edit summary
  people.*             → facilitator views only if pilot sharing rules require them
```

---

## 7. Follow-up policy (pilot)

1. After an answer, the tool **may** offer a drafted understanding check or one optional question.  
2. Participant can **Skip**, **Continue**, or **Correct what was understood**.  
3. If the answer is sufficient, no follow-up is required.  
4. Follow-ups may ask about relationships/responsibilities **when the participant’s answer makes those relevant** — not by default reinterpretation.  
5. Wording remains open to local review.

---

## 8. Decision log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-09-21 | Treat this as a listening tool within broader LDMLFN training | Avoid collapsing the whole project into a survey |
| 2026-09-21 | Drop hidden surface/underneath framing | Participants deserve transparent purpose |
| 2026-09-21 | Strengths-first SharePoint pilot | Align with empowerment and practical goals |
| 2026-09-21 | Optional correctable follow-ups + editable draft summary | Reduce intrusion; participant control |
| 2026-09-21 | Cross-person features off for pilot | Re-identification and influence risks |
| 2026-09-21 | Privacy/identity claims must be honest | Email ≠ secure identity; storage/sharing must be explicit |

---

## 9. How to use this file when coding

1. If a change conflicts with [`UNDERSTANDING.md`](./UNDERSTANDING.md), update understanding (with stakeholder review) before coding.  
2. Prefer SharePoint pilot quality over enabling every module.  
3. Do not re-enable cross-person supplemental without an approved consent design.  
4. Prefer participant control (skip/correct/edit/delete) over denser automation.
