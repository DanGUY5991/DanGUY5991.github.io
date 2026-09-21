# LDMLFN Microtraining

Remote, relational experience dialogue for capturing lived experience with Microsoft products.

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

## Run locally

Open `ldmlfn/index.html` via any static server, or visit `/ldmlfn/` on the GitHub Pages site.

```bash
npx serve .
# then open http://localhost:3000/ldmlfn/
```

## Optional remote AI endpoint

By default the adaptive engine runs fully client-side (product detection, vagueness checks, reflective prompts, deepening paths).

To plug in a real model backend:

```js
LDMLFN.setAiEndpoint("https://your-api.example.com/ldmlfn");
```

Expected JSON response:

```json
{
  "prompt": "Next question text…",
  "hint": "Optional helper text",
  "stage": "deepen",
  "allowSkip": true,
  "reflection": "Optional reflection of the last answer",
  "done": false
}
```

Clear with `LDMLFN.setAiEndpoint(null)`.

## Privacy

Answers are stored in `localStorage` in the participant’s browser until they export or clear the session. Nothing is uploaded unless you wire a submission endpoint.
