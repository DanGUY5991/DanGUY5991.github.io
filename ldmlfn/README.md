# LDMLFN Microtraining

Remote, relational experience dialogue for capturing lived experience with Microsoft products.

## Access link

Share: `/ldmlfn/` (or `ldmlfn/index.html` on the site).

Participants:

1. Open the access link
2. Sign in with **email** (+ optional display name)
3. **Create** a profile on first visit, or **continue** with the same email later
4. Complete their own dialogue only

## People & tracking

Open `/ldmlfn/people.html` for a **visible roster** of who has signed in (name, email, status, visits, last access) plus an access log.

- People are **not hidden**
- Dialogue answers are **not shared across profiles**
- Continuing someone else’s dialogue requires signing in with **their email**

## What it is

A SharePoint-first listening survey (more Microsoft app goals later) that:

- Asks **simple, straightforward** questions about SharePoint challenges and understanding
- Crafts **one AI follow-up per answer** to clarify culture, relationships, and Indigenous understanding of the situation
- Keeps answers in an email-based profile (create or continue)
- Lets participants export an experience map as JSON

## Principles

1. **Surface vs depth** — feels like a SharePoint challenge/understanding survey; captures culture and relationships underneath
2. **Simple Q → crafted clarify** — every initial answer gets one follow-up built from that answer
3. **Relation before extraction** — clarify with care; no skill scores
4. **Visible people, private answers** — roster shows who joined; dialogues stay isolated by email

See also [`PROJECT-GUIDANCE.md`](./PROJECT-GUIDANCE.md) — high-level ideas & functions that guide code structure.

## Run locally

```bash
npx serve .
# then open http://localhost:3000/ldmlfn/
```

## Optional endpoints

```js
LDMLFN.setAiEndpoint("https://your-api.example.com/ldmlfn");
LDMLFN.setSyncEndpoint("https://your-api.example.com/ldmlfn-sync");
```

Clear with `null`.

## Privacy note

v1 stores profiles in the participant browser’s `localStorage` registry. For multi-device facilitator dashboards, configure a sync endpoint. The people page never exposes another user’s transcript.
