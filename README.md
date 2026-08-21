# TestExchange Frontend

The MVP console for TestExchange: a community where Android developers test real apps, earn credits, and spend those credits on their own testing campaigns.

## Console areas

- Dashboard with credit, testing, and campaign status
- Available Tests with search, filters, test briefs, and credit rewards
- My Tests with review and completion states
- My Campaigns with tester progress and campaign status
- Four-step campaign contract builder covering tester fit, required tasks, evidence, review rules, and reserved credits
- Credits with an activity ledger and one-time pack placeholders
- Profile with tester device details and notification preferences

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run check
npm run build
```

## Authentication

The console is protected by `AuthProvider` and `RequireAuth`. It currently uses an in-memory demo user so the frontend can be reviewed without a backend.

When Supabase is connected, replace the state and methods inside `src/auth/AuthContext.tsx` with the Supabase session, `onAuthStateChange`, sign-in, and sign-out calls. The routes and console layout should not need to change. Required environment variable names are listed in `.env.example`.

## Current data boundary

Console records are intentionally local mock data in `src/data/mockData.ts`. Campaign contracts are stored in browser storage through `src/features/campaigns/campaignDraft.ts` so the workflow can be tested before the backend contract is implemented. Credit purchases are shown as coming soon; there are no subscriptions.

The automated quality pre-check shown in campaign setup is a product integration point only. It is described as an assistant for detecting incomplete or suspicious submissions, not as the final authority over credit transfers.
