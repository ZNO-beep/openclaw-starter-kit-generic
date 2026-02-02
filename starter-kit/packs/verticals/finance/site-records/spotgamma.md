# SpotGamma (dashboard pattern) — Site Record (Sanitized)

This record captures a **repeatable automation pattern** for a paid dashboard SPA.

## Known-good URLs
- Dashboard login: `https://dashboard.spotgamma.com/login`
- Founder’s Notes: `https://dashboard.spotgamma.com/foundersNotes`

## Key lessons
- **Use the dashboard login URL** (not the marketing site) to establish an authenticated session for dashboard pages.
- Prefer `slowMo` + explicit waits for slow SPAs.
- When selecting login fields, scope selectors to the **form containing the password field** to avoid newsletter/hidden inputs.

## Success cues
- Post-login, you may land on a dashboard home route.
- Left sidebar/menu becomes available.
- Founder’s Notes shows actual note content (not a subscribe overlay).

## Robust approach
- Launch headful for debugging: `headless: false`, `slowMo: 250–750`.
- Use `waitUntil: 'domcontentloaded'` + short buffers; apply `networkidle` carefully (SPAs may never idle).
- Take screenshots at: login page, post-login, target page, error.

## HITL trigger (recommended)
Escalate to human-in-the-loop after:
- 2 failed login attempts
- repeated paywall overlay after confirmed login
- repeated selector mismatch

In HITL, capture: screenshot + URL + ask user for next click & success cue.
