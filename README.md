# TestExchange Frontend

The MVP frontend for TestExchange: a community where software builders test real projects, earn credits, and spend those credits on their own testing campaigns. Android closed testing is a specialized campaign template alongside iOS, web, desktop, and API testing.

## Public community

- Community-first homepage with active testing requests and reward explanations
- Public test directory with search, platform filters, tags, and sorting
- Shareable public test briefs with explicit privacy boundaries
- Public tag directory and testing-process guide
- Capped public-beta registration with a waitlist when the cohort is full or paused
- Public beta terms, privacy notice, acceptable-use rules, and support instructions
- Protected actions that return visitors to the intended flow after sign-in
- Private builds, exact contract tasks, evidence, findings, and conversations remain inside authenticated workspaces

## Console areas

- Dashboard with credit, testing, and campaign status
- Available Tests with search, filters, test briefs, and credit rewards
- My Tests with review and completion states
- My Campaigns with tester progress and campaign status
- Four-step campaign contract builder covering tester fit, required tasks, evidence, review targets, and permanent publishing cost
- Tester workspaces with locked contracts, evidence, correction requests, private messages, and protected credit status
- Developer campaign management with recruitment pause/resume/close, accept/decline actions, tester progress, submission review, advisory quality checks, and approval or dispute decisions
- Tester withdrawal controls and moderator participant suspension/restoration
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
npm test
npm run build
```

Create `.env` from `.env.example` and add the frontend-safe Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPPORT_EMAIL=support@example.com
VITE_SENTRY_DSN=https://public-key@organization.ingest.sentry.io/project
VITE_SENTRY_RELEASE=testexchange-web@commit-sha
VITE_SENTRY_TRACES_SAMPLE_RATE=0.05
```

Never put the Supabase database password or service-role key in this frontend file.

Production builds can upload hidden source maps by setting the build-only `SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, and `SENTRY_PROJECT` values. These values must not use the `VITE_` prefix. The build
deletes source-map files after upload so they are not published with the site.

## Authentication and API

The console uses Supabase email/password Auth with confirmed email. Community campaign pages and
the public-beta capacity/waitlist calls are anonymous, while protected requests attach the current
Supabase access token. The backend atomically claims a capped beta seat, creates the TestExchange
profile, and grants starting credits when a signed-in user first enters the console. If the cohort
is full, the login page switches account creation to the waitlist.

Run the backend on port `8000` and this Vite application on port `5173`. For local two-account testing, create one developer and one tester account (two browser profiles make switching easier), then follow this sequence:

1. Developer creates and publishes a campaign.
2. Tester opens the public request, signs in, and applies.
3. Developer accepts the tester from the campaign workspace.
4. Tester starts the assignment, completes contract tasks, and submits evidence.
5. Developer approves, requests changes, or rejects the submission.
6. An approval issues the promised tester reward and both credit ledgers reflect the campaign spend and reward.

## Current data boundary

Campaigns, assignments, contracts, submissions, reviews, messages, profiles, and credit ledgers now come from the backend API. Unpublished campaign drafts remain in browser storage so the builder can autosave before anything is sent to the backend. Credit purchases are placeholders; there are no subscriptions.

Tester evidence uploads go directly to the private Supabase Storage bucket named `test-evidence`. Apply `../TestExchangeBackend/docs/supabase-storage-policies.sql` in the Supabase SQL editor before testing uploads. The frontend only stores the assignment-scoped storage key in the submission; reviewer links are short-lived signed URLs, and evidence is never made public. The current client accepts PNG, JPEG, WebP, MP4, TXT, PDF, and ZIP files up to 50 MB each.

Submission review calls the backend advisory quality-check endpoint when it is available. The checks highlight missing or incomplete evidence, but never approve, reject, or transfer credits. Google Play does not require a fixed screenshot count for a closed test; the product therefore captures the durable baseline reviewers need to explain tester engagement, feature/task coverage, feedback, changes made, and production readiness. Photos are supporting evidence rather than automatic proof.
