// HITL helper for Playwright scripts (mobile-first UX)
//
// Goal: when automation gets stuck, capture a screenshot + URL + a short set of questions
// so the user can respond via chat (often on mobile).
//
// Default questions focus on:
// 1) correct LOGIN URL
// 2) correct TARGET content URL
// 3) login method (username/password vs Google OAuth vs other SSO)

const fs = require('fs');

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function screenshot(page, name) {
  const path = `/tmp/hitl-${name}-${ts()}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

/**
 * Trigger a HITL request.
 * Writes a decision packet to /tmp and prints a concise prompt block.
 *
 * @param {import('playwright').Page} page
 * @param {object} opts
 * @param {string} opts.step - short step key e.g. "login" | "navigate" | "extract"
 * @param {string} opts.reason - short description of why we need human input
 * @param {string[]} [opts.questions] - override default questions
 */
async function hitl(page, opts) {
  const step = opts?.step || 'unknown';
  const reason = opts?.reason || 'Need guidance';

  const url = page.url();
  const shot = await screenshot(page, `${step}`);

  const questions = opts?.questions || [
    'What is the exact LOGIN URL for this site? (paste it)',
    'What is the exact URL of the page/content you want after login? (paste it)',
    'What login method is used here? Reply with: (a) username+password (b) Google OAuth (c) social sign-on (d) other',
  ];

  const packet = {
    kind: 'hitl',
    step,
    reason,
    url,
    screenshot: shot,
    capturedAt: new Date().toISOString(),
    questions,
  };

  const packetPath = `/tmp/hitl-${step}-${ts()}.json`;
  fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2), 'utf8');

  // Print a block that a supervising agent can forward to a user.
  // Keep it copy/paste friendly.
  console.log('\n===== HITL_REQUIRED =====');
  console.log('Step:', step);
  console.log('Reason:', reason);
  console.log('Current URL:', url);
  console.log('Screenshot:', shot);
  console.log('Decision packet:', packetPath);
  console.log('Questions:');
  questions.forEach((q, i) => console.log(`  ${i + 1}) ${q}`));
  console.log('=========================\n');

  return { packetPath, screenshotPath: shot, url };
}

module.exports = { hitl };
