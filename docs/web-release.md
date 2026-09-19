# Website release runbook

Release the website beta independently of the Android client. Directory launches are a way to
recruit the first users; an existing customer base is not a prerequisite.

## Build and host

1. Deploy the matching backend release and its migrations first. Complete its
   `docs/operations.md` security and recovery checks.
2. Set the frontend variables from `.env.example` in the website build environment. Use the
   production HTTPS API and Supabase URLs, a frontend-safe publishable/anon key, a monitored
   support mailbox, and the Sentry DSN and release identifier. Never use a service-role key
   in a `VITE_` variable. Build-time variable changes require a new build.
3. Run `npm ci`, `npm test`, and `npm run build:release`. The last command rejects missing
   release configuration before building; it does not prove that those services are reachable.
4. Publish `dist/` over HTTPS. Configure SPA fallback to `index.html` for application routes,
   including `/reset-password`, public campaign links, and `/console` routes. Serve actual
   assets normally. Avoid long caching of `index.html`; hashed assets may be cached immutably.
5. Set Supabase's Site URL to the final website origin and allow the exact
   `https://YOUR-WEBSITE/reset-password` redirect. Configure production email delivery and
   verify confirmation and recovery messages arrive in a mailbox you control.
6. Match the website origin in the API's `CORS_ORIGINS`. Keep beta capacity and moderator
   coverage small enough to handle incoming campaigns and disputes.

## Hosted smoke test

Use dedicated owner, tester, outsider, and moderator test accounts. Record the website/API
commit IDs, date, account IDs, campaign/assignment IDs, and outcomes without passwords or tokens.

- Open a public campaign without signing in. Private build links, locked tasks, and evidence
  must remain private. Refresh a deep link directly to verify the host's SPA fallback.
- Confirm a new email, sign in, sign out, and follow a password recovery email. Check the
  expired-link path as well. Resetting a password is a user-operated credential action.
- Publish a genuine test campaign; apply, accept, start, upload a PNG, submit, request changes,
  resubmit, and approve. Check that the promised credit reward appears once.
- Apply then withdraw before acceptance. The private contract must remain inaccessible.
- Reject a separate submission, escalate it, and claim it as moderator. Open its private
  attachment, resolve it, and confirm the audit entry and final credit balance.
- Exercise an overdue review in staging using a controlled deadline. The tester can request
  moderator review only after the agreed window; owner decisions stop while it is open.
- Suspend the tester. Both API operations and new direct Storage requests must be denied.
  Already issued signed URLs can remain valid until their short expiration.
- Save a private draft as owner A, sign out, and sign in as owner B on the same browser. B must
  not see A's draft or any old workspace state. Repeat on a narrow/mobile viewport.
- Verify the real support link, Sentry events, uptime alert, and backup restoration record.

## Draft compatibility

Drafts now use an authenticated user ID in their browser-storage key. Existing unowned `v1`
drafts are deliberately not imported: the application cannot prove which account created them.
They remain in local storage but disappear from the draft list. Tell existing beta users to
recreate these drafts or recover their own data privately before launch. This is account-level
UI isolation, not encryption against someone with access to the same browser profile.

## Launch and rollback

Prepare the directory listing, logo, screenshots, working URL, and a few real starter campaigns.
Publish listings after the hosted checks pass. Keep credit purchases marked unavailable while
payments are not implemented, and describe Android as in development until its separate release.
Measure actual testing activity as well as signups. Expand beta capacity only with moderation
coverage. If release checks fail, retain the previous website artifact, pause new registration
through the moderator controls, and investigate; do not reverse database security protections.
