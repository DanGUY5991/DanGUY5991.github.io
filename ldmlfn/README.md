# LDMLFN Microtraining — Listening & training-needs tool

One component of **LDMLFN training development**. Plain **HTML + CSS + JavaScript** — no build step — so it can be hosted on **GitHub Pages**.

**Pilot focus:** SharePoint (strengths-first questions, optional follow-ups, participant-approved draft summaries).

See:
- [`UNDERSTANDING.md`](./UNDERSTANDING.md) — project understanding for review
- [`PROJECT-GUIDANCE.md`](./PROJECT-GUIDANCE.md) — structure decisions

## Host on GitHub Pages

This repo is already a GitHub Pages site (`DanGUY5991.github.io`), published from the **`main`** branch.

| Item | Value |
| --- | --- |
| Live survey URL (after merge to `main`) | https://danguy5991.github.io/ldmlfn/ |
| Local folder | `F:\DanGUY5991.github.io\ldmlfn` (or `/ldmlfn` in the repo) |
| Stack | Static HTML / CSS / JS only |
| Build / deploy command | None — push HTML to `main` |

### Publish steps

1. Merge the feature branch into `main` (or copy/update `ldmlfn/` on `main`).
2. Wait for Pages to rebuild (usually under a minute).
3. Open https://danguy5991.github.io/ldmlfn/
4. Share that link as the participant access link.

### Why this works for a survey

- No server, database, or Node build required  
- Relative paths (`styles.css`, `app.js`, `modules/…`) work under `/ldmlfn/`  
- Answers stay in the participant’s browser (`localStorage`) unless you later add an approved share/export path  

### Local check before push

```bash
npx serve .
# open http://localhost:3000/ldmlfn/
```

Or on Windows, open `ldmlfn\index.html` in a browser (some browsers restrict modules/`localStorage` quirks with `file://` — a local static server is more reliable).

## Pilot principles

1. Transparent purpose — software and work relationships when relevant  
2. Strengths and useful work first  
3. Optional follow-ups — Skip / Continue / Correct  
4. Editable draft summary — not an assessment  
5. Cross-person coordination off until approved  
6. Clear notice of who can see what and where data lives  

## Note on identity

Email sign-in is a convenience to return to a draft on that browser. It is **not** secure authentication.
