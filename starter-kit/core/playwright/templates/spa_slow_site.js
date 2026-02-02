// Template: Slow SPA navigation + screenshots + extraction
// Fill in TARGET_URL and extraction logic.

const { chromium } = require('playwright');

const TARGET_URL = process.env.TARGET_URL || 'https://example.com';

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function screenshot(page, name) {
  const path = `/tmp/playwright-${name}-${ts()}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log('📸 Screenshot:', path);
  return path;
}

async function goto(page, url) {
  console.log('➡️ goto', url);
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
    await goto(page, TARGET_URL);
    await screenshot(page, 'loaded');

    // TODO: add your actions + selector waits

    const text = await page.locator('body').innerText();
    require('fs').writeFileSync('/tmp/playwright-extract.txt', text, 'utf8');
    console.log('📝 Saved /tmp/playwright-extract.txt');
  } finally {
    await browser.close();
  }
})();
