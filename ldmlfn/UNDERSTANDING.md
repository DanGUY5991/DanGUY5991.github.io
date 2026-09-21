# LDMLFN Microtraining — Current understanding (for review)

**Purpose of this document:** a plain-language snapshot of how I currently understand this project, so you can correct, confirm, or redirect it.

**Date:** 2026-09-21  
**Related living guidance:** [`PROJECT-GUIDANCE.md`](./PROJECT-GUIDANCE.md) (structure decisions) · [`README.md`](./README.md) (how to run)

Please mark anything that is wrong, incomplete, or over-assumed.

---

## 1. What this project is

**LDMLFN Microtraining** is a remote, browser-based listening survey.

It is meant to help design microtraining by capturing how real people experience Microsoft applications — not by scoring their skills.

### What it feels like on the surface
A straightforward survey about:
- challenges of using a Microsoft product
- what people understand that product is for

### What it is trying to capture underneath
- culture around knowledge and work
- relationships between people
- Indigenous-informed understanding of the situation (relational care, accountability, who is affected) — without appropriating ceremony

**Working assumption:** the “surface” keeps the tool approachable; the “depth” is where training design insight actually lives.

---

## 2. Who it is for

| Audience | What they do |
| --- | --- |
| Participants | Open an access link, sign in with email, share role/bio, complete a product module |
| Facilitators / LDMLFN | See who accessed (visible roster), review exports / insights, design microtraining from what was heard |

**Working assumptions about privacy / visibility**
- People are **tracked and not hidden** (name, email, role can appear on a people list).
- Participants **must not open each other’s full answer transcripts**.
- Short perceptions from answers *can* be reused by AI to coordinate questions across people.

---

## 3. End-to-end participant journey (as built)

```
Access link (/ldmlfn/)
  → Simple email sign-in (create or continue profile)
  → Pick a Microsoft product module
  → Bio: role + who you work with/support (+ optional org context)
  → Module questions:
        simple question (framed by role)
          → answer
          → AI clarifying follow-up (from that answer + role/relationship context)
          → clarification answer
          → next simple question
  → Optional supplemental question coordinated from other people’s perceptions
  → Closing note
  → Experience portrait + export
```

---

## 4. Product modules

Each Microsoft application is its own **modular section** with focused key initial questions:

| Module | Focus of key questions (my read) |
| --- | --- |
| SharePoint | What it is for, finding, trust, who is involved |
| Teams | Collaboration, channels, meetings, who you reach |
| Excel | Spreadsheet work, versions, who depends on numbers |
| Outlook | Mail/calendar load, urgency, correspondence |
| OneDrive | Files, sharing choices, who needs access |
| Copilot | Understanding, use/hesitation, trust, who is adopting |

**Working assumption:** SharePoint was the first fully realized goal; the others follow the same pattern and are selectable now.

**Rule I am following:** add a new Microsoft product by adding a module file — do not rewrite the whole app for each product.

---

## 5. AI’s job in this project

AI is not the survey itself. AI’s job is to **craft follow-ups**.

### A) Clarifying follow-up (per answer)
After each simple answer:
- reflect briefly what was heard
- ask one clarifying question shaped by:
  - that answer
  - the product module
  - the person’s role and relationships
  - lenses: culture / relationships / Indigenous understanding of the situation

### B) Cross-user supplemental (after the module’s key questions)
If other people have shared perceptions in the same module:
- AI coordinates one supplemental question
- Example intent: one person’s teamwork issues in Teams can become a prompt that asks another person how that perception sits beside *their* experience

**Working assumption:** full transcripts stay private to each profile; only short insight snippets are used for coordination.

### Local vs remote AI
- Local clarifier works without a backend (GitHub Pages–friendly).
- Optional remote AI endpoint can replace/enhance crafting when configured.

---

## 6. Identity, bio, and tracking

### Identity
- Email is the profile key (no password in v1).
- Same email = continue the same profile.
- Different email = different isolated dialogue session.

### Bio (required before first module run)
- Role / kind of work
- Who they mainly work with or support
- Optional team/program/community context

This bio is used to **contextualize later questions**, e.g. framing SharePoint questions for a facilitator who supports instructors differently than for an admin.

### People roster
Visible list of who signed in: name, email, role, status, visits, last access.  
Not a place to open someone else’s answers.

---

## 7. How the codebase is organized (my mental model)

```
ldmlfn/
  index.html          access + landing + bio + dialogue UI
  people.html         facilitator roster / access log
  profiles.js         identity, bio, per-email session isolation
  insights.js         shared short perceptions for cross-user AI
  modules/            one file per Microsoft product + registry
  clarify.js          craft clarify + supplemental questions
  app.js              runs the journey / UI shell
  PROJECT-GUIDANCE.md structure-critical product decisions
  UNDERSTANDING.md    this review document
```

**Separation I believe matters**
1. Identity ≠ dialogue content  
2. Product question banks ≠ AI clarification policy  
3. Insight pool ≠ full transcript access  

---

## 8. What I believe success looks like

A useful LDMLFN output is not “User scored 3/5 on SharePoint.”  
It is an experience map that shows, for a person in a role:

- how they understand the tool
- where friction lives
- how culture and relationships shape that friction
- how their story sits beside others’ perceptions
- what microtraining should honor next

---

## 9. Open / unfinished items (please confirm priorities)

These are present as ideas or light hooks, not fully finished product:

1. **Multi-device facilitator sync** — optional sync endpoint exists conceptually; default is still browser `localStorage`.
2. **Multi-module progress per person** — can run modules one at a time; no strong “completed SharePoint → next Teams” curriculum map yet.
3. **Facilitator access code** for the people page — discussed as open, not built.
4. **Auto-submit** of completed maps to a collector — open.
5. **Stronger remote AI** wiring — local crafting works; production model endpoint not required yet.
6. **Indigenous-informed practice** — encoded as dialogue posture/lenses; should stay carefully non-appropriative and may need your cultural review.

---

## 10. Please correct me

Use this checklist (or rewrite freely):

- [ ] The purpose / surface-vs-depth split is right  
- [ ] The participant journey matches what you want  
- [ ] Module list and “key questions per product” approach is right  
- [ ] Cross-user supplemental use of others’ perceptions is wanted as described  
- [ ] Bio/role contextualization is wanted as described  
- [ ] Visible people + private answers is the right privacy posture  
- [ ] Anything in §9 that should move up as next build priority: _______________  
- [ ] Anything I misunderstood: _______________  

---

## 11. One-sentence summary

**LDMLFN Microtraining is a role-aware, module-based Microsoft listening survey that asks simple challenge/understanding questions, then uses AI to clarify culture and relationships — including coordinating supplemental questions from other people’s perceptions — so microtraining can be designed from lived experience rather than skill scores.**
