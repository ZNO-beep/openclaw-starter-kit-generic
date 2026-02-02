# Human-in-the-Loop (HITL) — Mobile-first

This starter kit supports a **mobile-first HITL UX** where the user can provide guidance via chat without being technical.

## Default HITL questions (Mode A)
When the agent is stuck during login/navigation, ask:

1) **What is the exact LOGIN URL for this site?** (paste it)
2) **What is the exact URL of the page/content you want after login?** (paste it)
3) **What login method is used?**
   - (a) username+password
   - (b) Google OAuth
   - (c) social sign-on (Facebook/Apple/etc)
   - (d) other

## Why URLs first
URLs are:
- unambiguous
- easy to paste from mobile
- immediately actionable in automation

## Playwright integration
Playwright scripts can trigger HITL by writing a decision packet to `/tmp` and printing a `HITL_REQUIRED` block.

- Helper: `starter-kit/core/playwright/hitl.js`
- Artifacts:
  - `/tmp/hitl-<step>-*.png` (screenshot)
  - `/tmp/hitl-<step>-*.json` (decision packet)

## Operator guidance
When HITL triggers:
- send the screenshot to the user (Telegram/WhatsApp/etc)
- ask the 3 questions above
- update the site record with the correct login URL + target URL

## Common login patterns
- **Username/password**: stable form fields; prefer scoping selectors to the form containing the password field.
- **Google OAuth**: redirects to accounts.google.com; requires handling popups/redirects and may require reuse of a browser profile.
- **Social sign-on**: similar to OAuth; may open popup windows.

## Success cue
Ask the user for one visual cue that confirms success (e.g., "left sidebar appears", "my name appears", "dashboard home loads").
