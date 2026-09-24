# LDMLFN Microtraining — Current understanding (for review)

**Status:** Revised after stakeholder feedback (2026-09-21).  
**Scope of this file:** Understanding of the **listening and training-needs tool** — one component within the broader **LDMLFN training development** project.  
**Related:** [`PROJECT-GUIDANCE.md`](./PROJECT-GUIDANCE.md) · [`README.md`](./README.md)

Please continue to correct anything that is still wrong or over-assumed.

---

## 0. Place in the broader project

**LDMLFN training development** is larger than this tool. It can include facilitated conversations, hands-on activities, videos, coaching, and learning that never involves a survey.

This document describes only a proposed **listening and training-needs tool**: a remote way to hear what people already do with Microsoft applications, what helps or gets in the way, and how working with others shapes that experience — so practical training can be shaped from real work.

Completing this tool is optional relative to the wider training project.

---

## 1. Clear purpose (no hidden layer)

**Purpose participants should understand:**

> We want to understand what you already do, what helps or gets in the way, and how working with others affects your experience. Your responses will help shape practical training.

Questions may concern **both**:
- the software itself, and  
- the work relationships surrounding it  

when those relationships matter to the person answering.

**What this is not**
- Not a skill score or assessment of the person  
- Not a hidden cultural analysis underneath a software quiz  
- Not software claiming an Indigenous interpretation of someone’s experience  

The tool should invite people to explain what matters to them. Ordinary software difficulties should not be reframed as cultural characteristics unless the participant themselves connects those dots.

---

## 2. Recommended next step: small SharePoint pilot

Until the basic experience has been reviewed, development should focus on a **SharePoint pilot** with:

| Include now | Hold as later extensions |
| --- | --- |
| Clear purpose (above) | Other product modules (Teams, Excel, Outlook, OneDrive, Copilot) |
| Strengths-first questions | Cross-person / peer-coordinated questions |
| Optional, correctable follow-ups | Dense multi-module curriculum map |
| Participant-approved draft summary | Auto-submit to external collectors |
| Defined information-sharing arrangement | Visible attendance roster (unless pilot explicitly needs it) |

Other modules and cross-person features remain **proposed extensions**, not pilot requirements.

---

## 3. Question stance: strengths and useful work first

Emphasize empowerment, participant choice, and learning toward a shared practical goal — not only friction.

Example question directions for the SharePoint pilot:

1. What already works well for you with SharePoint (or related file-sharing)?  
2. What is something you would like to accomplish more easily?  
3. When you need help, what kind of support works for you?  
4. What gets in the way, when it does?  
5. How does working with others affect your experience (when relevant to you)?  

Challenges still matter; they should not be the only door into the conversation.

---

## 4. Follow-ups: optional and correctable

An automatic AI question after every answer can feel repetitive or intrusive. Sometimes the answer is already enough.

**Pilot expectation**
- Follow-ups are **optional**  
- Participant controls: **Skip**, **Continue**, and **Correct what was understood**  
- The system may draft a reflective check (“Here’s what I understood…”) that the person can accept, edit, or reject  

**Output**
- Describe the result as a **draft summary of their answers** (an “experience portrait” only as a working title)  
- Not an assessment of the person  
- Participants should be able to **review and edit** the draft before sharing it  

---

## 5. Cross-person questions — unresolved; off for pilot

Using other people’s answers (even short snippets) to shape later questions can:
- identify someone through role, circumstances, or wording  
- influence later answers  

**For the initial SharePoint pilot: leave this feature off.**

If developed later, the design must specify before use:
- participant permission  
- who reviews themes  
- what information may be reused  
- preference for asking about a **broad theme neutrally**, rather than suggesting that a colleague has reported a problem  

Until then, treat cross-person coordination as a separate design choice — not core product behavior.

---

## 6. Identity, privacy, and information sharing (must resolve before participant use)

### Important distinctions
- **Entering an email is identification, not proof of identity.**  
- “Same email = continue profile” is convenience, not secure access.  
- Separate browser records do **not**, by themselves, demonstrate confidentiality.

### Questions the pilot must answer in plain language

| Question | Pilot answer to define before launch |
| --- | --- |
| Who sees attendance? | _TBD with LDMLFN — propose: facilitators only, or no roster in pilot_ |
| Who sees full answers? | _TBD — propose: participant + designated facilitators only_ |
| Who sees draft summaries / exports? | _TBD — propose: participant first; shared only after they approve_ |
| Why collect name / email / visits / last access? | _TBD — collect only what the pilot actually needs_ |
| Where is information stored? | Currently browser `localStorage` on the device used; optional sync not required for pilot |
| Does any information leave the device? | Not by default in the current static setup; any sync/export path must be stated |
| How can participants correct information? | Draft summary editable before share (required for pilot) |
| How can participants delete information? | _TBD — need an explicit clear/delete path_ |

**Working proposal for pilot (subject to your approval)**
1. Minimal identity needed to return to one’s own draft (e.g. email or local session) — without claiming “secure login.”  
2. No visible multi-person roster in the participant UI for the first pilot.  
3. Participant reviews/edits draft summary before any sharing.  
4. Facilitator access to shared results only after participant approval (or an agreed alternate consent process).  
5. Written notice on the access page stating storage location and sharing rules.

---

## 7. Indigenous-informed approach (concrete and locally reviewable)

Avoid language like “AI clarifies culture.” That gives the system too much interpretive authority.

**Better role for the tool**
- Ask **respectful questions about relationships and responsibilities when participants themselves make those relevant**  
- Support participant control, careful listening, and reciprocity  
- Leave interpretation to people and to **local review** — not to the software  

The document and product should not imply that software can determine an Indigenous interpretation of someone’s experience. Local reviewers should be able to inspect wording, consent, and process.

---

## 8. Role / bio context (kept, with care)

Asking about role and who someone works with can still help frame questions in that person’s real work — e.g. facilitator supporting instructors vs. admin managing sites.

**Pilot care**
- Make purpose of bio questions explicit  
- Do not over-collect  
- Use bio to ask better questions, not to categorize people culturally  

---

## 9. What earlier “as built” work represented

Earlier drafts and code explored:
- modular Microsoft product sections  
- email-based profiles and a people roster  
- AI follow-ups after each answer  
- cross-user insight pooling for supplemental questions  
- “surface vs underneath” framing  

Those explorations are useful prototypes. They are **not** the approved pilot definition. Implementation should be brought into line with this revised understanding before participant use.

---

## 10. Success for the SharePoint pilot

Success looks like:
- participants understand why they are being asked  
- they can speak to what already works, what they want to do more easily, and what support helps  
- follow-ups feel optional and respectful, not relentless  
- they recognize and can edit their draft summary  
- information-sharing rules are clear and followed  
- LDMLFN can use approved summaries to shape practical SharePoint training  

It does **not** look like scored expertise or a cultural diagnosis produced by software.

---

## 11. Correction checklist

- [ ] Broader project vs. listening-tool distinction is clear  
- [ ] Purpose wording is acceptable for participants  
- [ ] Strengths-first question stance is right  
- [ ] Optional Skip / Continue / Correct + editable draft summary is right  
- [ ] Cross-person feature stays off for pilot  
- [ ] Privacy table in §6 — fill or rewrite before launch  
- [ ] Indigenous-informed stance in §7 is acceptable for local review  
- [ ] SharePoint-only pilot scope is the right next build focus  
- [ ] Anything still misunderstood: _______________  

---

## 12. One-sentence summary (revised)

**This listening and training-needs tool is one part of LDMLFN training development: a SharePoint-first way for people to describe what already works, what they want to do more easily, and how working with others affects their experience — with optional follow-ups, participant-approved draft summaries, and clear information-sharing rules — so practical training can be shaped from lived work rather than from scores or hidden interpretation.**
