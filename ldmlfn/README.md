# LDMLFN Microtraining — Listening & training-needs tool

One component of **LDMLFN training development**. Plain **HTML + CSS + JavaScript** — no build step — so it can be hosted on **GitHub Pages**.

**Pilot focus:** SharePoint (strengths-first questions, optional follow-ups, participant-approved draft summaries).

See:
- [`UNDERSTANDING.md`](./UNDERSTANDING.md) — project understanding for review
- [`PROJECT-GUIDANCE.md`](./PROJECT-GUIDANCE.md) — structure decisions

## Host on GitHub Pages

| Item | Value |
| --- | --- |
| Live welcome URL (after merge to `main`) | https://danguy5991.github.io/ldmlfn/ |
| Survey (after Let’s begin) | https://danguy5991.github.io/ldmlfn/survey.html |
| Stack | Static HTML / CSS / JS only |
| Build / deploy | None — push to `main` |

## Pages

| Page | Role |
| --- | --- |
| `index.html` | Welcome / purpose (SharePoint pilot) |
| `survey.html` | Account sign-in + listening survey |
| `people.html` | Facilitator roster (secret required) |

## Accounts (email + password)

1. **Create account** — email, display name, password (min 8 chars)  
2. **Sign in** — only that password opens that account’s answers  
3. Answers are **encrypted at rest** in the browser with a key derived from the password  
4. Password forgotten → facilitator resets it (clears that account’s encrypted answers)

### Facilitator commands (browser console)

```js
await LDMLFN.setFacilitatorSecret("your-long-secret")   // first time on this browser
await LDMLFN.unlockFacilitator("your-long-secret")
await LDMLFN.adminResetPassword("person@example.org", "TempPass123", "your-long-secret")

// AI: set a proxy URL only — never embed a provider API key in this static site
LDMLFN.setAiEndpoint("https://your-proxy.example.com/ldmlfn")
```

People roster: `/ldmlfn/people.html` (facilitator secret required).

### Security notes (honest)

- Stops other accounts from opening someone’s answers on this public HTML app  
- AI endpoint config is facilitator-gated; unsigned visitors cannot set it  
- This is **browser-side** protection suitable for GitHub Pages — not a full server auth system  
- Prefer a server proxy for any real AI provider keys  

## Local check

```bash
npx serve .
# open http://localhost:3000/ldmlfn/
```
