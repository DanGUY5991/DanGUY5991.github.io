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

A browser-based microtraining intake form that:

- Opens with relationship and context (not skill checkboxes)
- Invites story about how Microsoft tools show up in real work
- Uses an adaptive guide to reflect understanding and clarify vague answers
- Deepens by product (Teams, Excel, Copilot, SharePoint, and more)
- Closes with growth goals and preferred learning support
- Lets participants export an experience map as JSON

## Principles

Dialogue is shaped by Indigenous-informed knowledge practices applied carefully:

1. **Relation before extraction** — who you are in the work comes first
2. **Story over scores** — narrative carries more usable truth than 1–5 ratings
3. **Reflective listening** — the guide mirrors what it heard before asking more
4. **Clarify with care** — follow-ups seek missing context, not interrogation
5. **Gratitude and reciprocity** — closing names what was shared and what comes next

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
