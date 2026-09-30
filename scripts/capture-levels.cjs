const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  fs.mkdirSync(path.join('evidence'), { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5188/');
  for (let i = 0; i < 5; i++) {
    if (i) await page.locator(`[data-level="${i}"]`).click();
    await page.locator('h1').waitFor();
    await page.screenshot({ path: `evidence/level-${i + 1}.png`, fullPage: true });
  }
  await browser.close();
  if (errors.length) {
    console.error(JSON.stringify(errors));
    process.exit(1);
  }
  console.log('captured 5 levels');
})();
