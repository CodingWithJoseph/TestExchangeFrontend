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
- Profile backed by the authenticated user’s API record

## Run locally

```bash
npm install
npm run check
npm run dev
```

Quality checks:

```bash
npm run check
npm run build
```

Create `.env` from `.env.example` and add the frontend-safe Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_URL=http://127.0.0.1:8000
```

Never put the Supabase database password or service-role key in this frontend file.

## Authentication and API

The console uses Supabase email/password Auth. Community campaign pages call the backend’s anonymous read endpoints, while protected requests attach the current Supabase access token. The backend creates the TestExchange profile and signup credit account when a signed-in user first enters the console.

Run the backend on port `8000` and this Vite application on port `5173`. For local two-account testing, create one developer and one tester account (two browser profiles make switching easier), then follow this sequence:

1. Developer creates and publishes a campaign.
2. Tester opens the public request, signs in, and applies.
3. Developer accepts the tester from the campaign workspace.
4. Tester starts the assignment, completes contract tasks, and submits evidence.
5. Developer approves, requests changes, or rejects the submission.
6. An approval transfers the reserved reward and both credit ledgers reflect it.

## Current data boundary

Campaigns, assignments, contracts, submissions, reviews, messages, profiles, and credit ledgers now come from the backend API. Unpublished campaign drafts remain in browser storage so the builder can autosave before anything is sent to the backend. Credit purchases are placeholders; there are no subscriptions.

The automated quality pre-check shown in campaign setup and submission review is a future product integration point only. It is described as advisory and does not decide credit transfers.
