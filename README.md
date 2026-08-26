# TestExchange Frontend

The MVP frontend for TestExchange: a community where software builders test real projects, earn credits, and spend those credits on their own testing campaigns. Android closed testing is a specialized campaign template alongside iOS, web, desktop, and API testing.

## Public community

- Community-first homepage with active testing requests and reward explanations
- Public test directory with search, platform filters, tags, and sorting
- Shareable public test briefs with explicit privacy boundaries
- Public tag directory and testing-process guide
- Protected actions that return visitors to the intended flow after sign-in
- Private builds, exact contract tasks, evidence, findings, and conversations remain inside authenticated workspaces

## Console areas

- Dashboard with credit, testing, and campaign status
- Available Tests with search, filters, test briefs, and credit rewards
- My Tests with review and completion states
- My Campaigns with tester progress and campaign status
- Four-step campaign contract builder covering tester fit, required tasks, evidence, review rules, and reserved credits
- Tester workspaces with locked contracts, evidence, correction requests, private messages, and protected credit status
- Developer campaign management with access actions, tester progress, submission review, advisory quality checks, and approval or dispute decisions
- Credits with an activity ledger and one-time pack placeholders
- Profile with testing-environment details and notification preferences

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

The console is protected by `AuthProvider` and `RequireAuth`, while community pages are readable anonymously. A browser-local demo session keeps protected flows testable without a backend.

When Supabase is connected, replace the state and methods inside `src/auth/AuthContext.tsx` with the Supabase session, `onAuthStateChange`, sign-in, and sign-out calls. The routes and console layout should not need to change. Required environment variable names are listed in `.env.example`.

## Current data boundary

Console records are intentionally local mock data in `src/data/mockData.ts`, and public-safe community records live in `src/features/community/communityData.ts`. Campaign contracts are stored in browser storage through `src/features/campaigns/campaignDraft.ts` so the workflow can be tested before the backend contract is implemented. Credit purchases are shown as coming soon; there are no subscriptions.

The automated quality pre-check shown in campaign setup and submission review is a product integration point only. It is described as an assistant for detecting incomplete or suspicious submissions, not as the final authority over credit transfers. Workspace actions and private conversations use local demo state until the backend workflow and audit ledger are connected.
