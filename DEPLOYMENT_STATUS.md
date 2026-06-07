# Deployment Status

## Team

Team number: 16  
OpenClaw: https://ai-native-16.digitalcoa.ch  
GitHub: https://github.com/DigitalCoa-ch/ai-native-team-16  
Published app: https://team-16.apps.digitalcoa.ch  

## Current Status

Last commit: `Team 16: Initial scaffold — Next.js credit pre-screening prototype`
Last push: 2026-05-18 13:30 UTC
Vercel status: Auto-deploys on push to `main`
Public URL checked: https://team-16.apps.digitalcoa.ch
Known error: None

## What works

- **Input Form tab**: Company name, sector, revenue, debt, loan amount, loan purpose, document checklist
- **AI Pre-Screening**: Calls Gemini API → returns risk class (low/medium/high), score, missing docs, recommendation, rationale
- **Results tab**: Displays AI analysis with colour-coded badges
- **Review Queue tab**: Lists all submitted applications; human can Approve / Request More Info / Escalate / Reject each one
- API key stored in `.env.local` (not committed)

## What is simulated

- In-memory application store (resets on cold start — acceptable for prototype demo)
- No persistent database

## Known constraint

- `NODE_ENV=production` in this environment; `npm install --include=dev` needed for devDependencies

## Next fix

None currently needed.