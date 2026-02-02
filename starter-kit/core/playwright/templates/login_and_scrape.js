// Template: login + navigate + scrape
// Uses env vars:
//   LOGIN_URL, TARGET_URL, USERNAME, PASSWORD

const { chromium } = require('playwright');

const LOGIN_URL = process.env.LOGIN_URL;
const TARGET_URL = process.env.TARGET_URL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

if (!LOGIN_URL || !TARGET_URL || !USERNAME || !PASSWORD) {
  console.error('Missing required env vars: LOGIN_URL, TARGET_URL, USERNAME, PASSWORD');
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

    // Scope user field to the form containing the password input (more robust)
    const pw = page.locator('input[type="password"]').first();
    await pw.waitFor({ state: 'visible', timeout: 60000 });
    const form = pw.locator('xpath=ancestor::form[1]');

    const user = form.locator('input[type="email"], input[name="email"], input[name="username"], input[autocomplete="username"], input[type="text"]').first();
    await user.waitFor({ state: 'visible', timeout: 60000 });

    await user.fill(USERNAME);
    await page.waitForTimeout(500);
    await pw.fill(PASSWORD);
    await page.waitForTimeout(500);

    const submit = form.locator('button[type="submit"], input[type="submit"], button:has-text("Log in"), button:has-text("Login"), button:has-text("Sign in")').first();
    await submit.waitFor({ state: 'visible', timeout: 60000 });
    await submit.click();

    await page.waitForTimeout(3000);
    await screenshot(page, 'post-login');

    console.log('2) Navigate + scrape');
    await goto(page, TARGET_URL);
    await screenshot(page, 'target');

    const text = (await page.locator('main').first().innerText().catch(async () => page.locator('body').innerText()))
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    require('fs').writeFileSync('/tmp/scrape.txt', text, 'utf8');
    console.log('📝 Saved /tmp/scrape.txt');
  } finally {
    await browser.close();
  }
})();
