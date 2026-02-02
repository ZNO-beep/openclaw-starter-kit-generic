// Success cue utilities
//
// A "success cue" is a simple, human-provided indicator that the automation
// reached the right authenticated state, e.g.:
// - "Founder’s Notes" visible in sidebar
// - "Account" menu present
// - specific text visible
//
// For now we support two cue types:
// - textContains: substring match in body text
// - urlIncludes: substring match in current URL

async function waitForSuccessCue(page, cue, { timeoutMs = 60000 } = {}) {
  if (!cue || typeof cue !== 'object') return { ok: false, reason: 'missing_cue' };

  const start = Date.now();
  const sleep = (ms) => page.waitForTimeout(ms);

  while (Date.now() - start < timeoutMs) {
    const url = page.url();

    if (cue.urlIncludes && typeof cue.urlIncludes === 'string') {
      if (url.includes(cue.urlIncludes)) return { ok: true, kind: 'urlIncludes', value: cue.urlIncludes };
    }

    if (cue.textContains && typeof cue.textContains === 'string') {
      const body = await page.locator('body').innerText().catch(() => '');
      if (body && body.toLowerCase().includes(cue.textContains.toLowerCase())) {
        return { ok: true, kind: 'textContains', value: cue.textContains };
      }
    }

    await sleep(1000);
  }

  return { ok: false, reason: 'timeout' };
}

module.exports = { waitForSuccessCue };
