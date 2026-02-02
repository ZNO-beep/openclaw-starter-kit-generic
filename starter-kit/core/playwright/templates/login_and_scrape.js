// Template: login + navigate + scrape
// Uses env vars:
//   LOGIN_URL, TARGET_URL, USERNAME, PASSWORD

const { chromium } = require('playwright');
const { hitl } = require('../hitl');
const { hitlNav } = require('../hitl_nav');
const { detectAuthContext } = require('../auth_detect');

const { waitForSuccessCue } = require('../success_cue');

const LOGIN_URL = process.env.LOGIN_URL;
const TARGET_URL = process.env.TARGET_URL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const SUCCESS_CUE_TEXT = process.env.SUCCESS_CUE_TEXT;
const SUCCESS_CUE_URL_INCLUDES = process.env.SUCCESS_CUE_URL_INCLUDES;

if (!LOGIN_URL || !TARGET_URL || !USERNAME || !PASSWORD) {
  console.error('Missing required env vars: LOGIN_URL, TARGET_URL, USERNAME, PASSWORD');
  // If we have a browser page later, we can HITL; but at this stage fail fast.
  process.exit(2);
}

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function screenshot(page, name) {
  const path = `/tmp/login-${name}-${ts()}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log('📸 Screenshot:', path);
  return path;
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);
  try {
    await page.waitForLoadState('networkidle', { timeout: 60000 });
  } catch {}
  await page.waitForTimeout(1000);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  try {
    console.log('1) Login');
    await goto(page, LOGIN_URL);
    await screenshot(page, 'login');

    // Detect OAuth/SSO redirects early (common with Google/social login)
    const authCtx = detectAuthContext(page.url());
    if (authCtx.kind === 'google_oauth' || authCtx.kind === 'oauth_or_sso') {
      await hitl(page, {
        step: 'login',
        reason: `Detected ${authCtx.kind} flow (redirected to ${page.url()}). Reply with the correct login URL, target content URL, and whether to use Google/social sign-on.`,
      });
    }

    // Scope user field to the form containing the password input (more robust)
    const pw = page.locator('input[type="password"]').first();
    try {
      await pw.waitFor({ state: 'visible', timeout: 60000 });
    } catch (e) {
      await hitl(page, {
        step: 'login',
        reason: 'Password field not found/visible at login URL. Need correct login URL or login method details.',
      });
      throw e;
    }
    const form = pw.locator('xpath=ancestor::form[1]');

    const user = form.locator('input[type="email"], input[name="email"], input[name="username"], input[autocomplete="username"], input[type="text"]').first();
    try {
      await user.waitFor({ state: 'visible', timeout: 60000 });
    } catch (e) {
      await hitl(page, {
        step: 'login',
        reason: 'Username/email field not found/visible on login form. Need correct login URL or auth method.',
      });
      throw e;
    }

    await user.fill(USERNAME);
    await page.waitForTimeout(500);
    await pw.fill(PASSWORD);
    await page.waitForTimeout(500);

    const submit = form.locator('button[type="submit"], input[type="submit"], button:has-text("Log in"), button:has-text("Login"), button:has-text("Sign in")').first();
    try {
      await submit.waitFor({ state: 'visible', timeout: 60000 });
    } catch (e) {
      await hitl(page, {
        step: 'login',
        reason: 'Submit button not found/visible on login form. Need login method/flow guidance.',
      });
      throw e;
    }
    await submit.click();

    await page.waitForTimeout(3000);
    await screenshot(page, 'post-login');

    // Optional success cue check (user-provided)
    if (SUCCESS_CUE_TEXT || SUCCESS_CUE_URL_INCLUDES) {
      const cue = {
        textContains: SUCCESS_CUE_TEXT || undefined,
        urlIncludes: SUCCESS_CUE_URL_INCLUDES || undefined,
      };
      const cueRes = await waitForSuccessCue(page, cue, { timeoutMs: 60000 });
      if (!cueRes.ok) {
        await hitl(page, {
          step: 'login',
          reason: 'Login completed but success cue was not observed. Reply with the correct login URL and a success cue text/URL fragment.',
        });
      }
    }

    console.log('2) Navigate + scrape');
    try {
      await goto(page, TARGET_URL);
    } catch (e) {
      await hitlNav(page, { step: "navigate", reason: "Navigation to target URL failed (slow site, redirect, or auth gate). Provide correct target URL." });
      throw e;
    }
    await screenshot(page, 'target');

    // Basic paywall/overlay heuristic (customize per site record)
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const paywallHit = /subscribe to unlock|unlock access|subscribe now/i.test(bodyText || '');
    if (paywallHit) {
      await hitlNav(page, {
        step: 'extract',
        reason: 'Target page appears paywalled/blocked after navigation. Need the correct post-login content URL and/or login URL.',
      });
    }

    const text = (await page.locator('main').first().innerText().catch(async () => page.locator('body').innerText()))
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    require('fs').writeFileSync('/tmp/scrape.txt', text, 'utf8');
    console.log('📝 Saved /tmp/scrape.txt');
  } finally {
    await browser.close();
  }
})();
