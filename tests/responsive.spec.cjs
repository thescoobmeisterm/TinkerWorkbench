const {test, expect} = require('@playwright/test');
const fs = require('node:fs');

const devices = [
  {name: 'phone', width: 390, height: 844},
  {name: 'ipad', width: 768, height: 1024},
  {name: 'laptop', width: 1280, height: 800}
];

async function noHorizontalOverflow(page) {
  const {scroll, inner} = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    inner: window.innerWidth
  }));
  expect(scroll, `horizontal overflow: scrollWidth ${scroll} > innerWidth ${inner}`).toBeLessThanOrEqual(inner + 1);
}

async function coreVisible(page) {
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#run')).toBeVisible();
  await expect(page.locator('[data-pin="uno:5v"]')).toBeVisible();
  await expect(page.locator('[data-sandbox]')).toBeVisible();
  const box = await page.locator('[data-pin="uno:5v"]').boundingBox();
  expect(box).toBeTruthy();
  expect(box.width).toBeGreaterThanOrEqual(36);
  expect(box.height).toBeGreaterThanOrEqual(36);
}

for (const device of devices) {
  test(`layout fits ${device.name} ${device.width}x${device.height} without sideways scroll`, async ({page}) => {
    fs.mkdirSync('evidence', {recursive: true});
    await page.setViewportSize({width: device.width, height: device.height});
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Light');
    await coreVisible(page);
    await noHorizontalOverflow(page);
    await page.screenshot({path: `evidence/${device.name}.png`, fullPage: true});
  });
}

test('phone landscape still avoids sideways scroll', async ({page}) => {
  await page.setViewportSize({width: 844, height: 390});
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await noHorizontalOverflow(page);
});
