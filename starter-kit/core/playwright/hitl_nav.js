// HITL helper for navigation/extraction phases (mobile-first UX)
//
// When stuck AFTER login (nav item not found, content not visible, paywall overlay),
// ask for the exact URL to use for the next step and a simple success cue.

const fs = require('fs');

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function screenshot(page, name) {
  const path = `/tmp/hitl-${name}-${ts()}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function hitlNav(page, opts) {
  const step = opts?.step || 'navigate';
  const reason = opts?.reason || 'Need guidance';

  const url = page.url();
  const shot = await screenshot(page, `${step}`);

  const questions = opts?.questions || [
    'Please paste the exact URL I should open for the next step (target page).',
    'If there is a paywall/overlay, is there a different URL that shows the content once logged in? (paste it)',
    'What visual cue confirms success? (e.g., “left sidebar appears”, “my name shows”, “note text visible”)',
  ];

  const packet = {
    kind: 'hitl',
    phase: 'navigate',
    step,
    reason,
    url,
    screenshot: shot,
    capturedAt: new Date().toISOString(),
    questions,
  };

  const packetPath = `/tmp/hitl-${step}-${ts()}.json`;
  fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2), 'utf8');

  console.log('\n===== HITL_REQUIRED =====');
  console.log('Phase: navigate/extract');
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

module.exports = { hitlNav };
