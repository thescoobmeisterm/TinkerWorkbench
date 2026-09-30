const {test, expect} = require('@playwright/test');
const fs = require('node:fs');

async function wireAndProgram(page, lesson) {
  for (const [a, b] of lesson.connections) {
    await page.locator(`[data-pin="${a}"]`).click();
    await page.locator(`[data-pin="${b}"]`).click();
  }
  for (let i = 0; i < lesson.blocks.length; i++) {
    await page.locator(`[data-add="${i}"]`).click();
  }
}

test('complete LED lesson with real pin clicks and blocks, preserve progress', async ({page}) => {
  fs.mkdirSync('evidence', {recursive: true});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Light');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('wires');
  const lesson = await page.evaluate(() => LESSONS[0]);
  await page.locator('[data-pin="uno:13"]').click();
  await page.locator('[data-pin="led:anode"]').click();
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('wrong');
  await page.locator('[data-remove-wire="0"]').click();
  await wireAndProgram(page, lesson);
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('running');
  await expect(page.locator('#led-bulb')).toHaveClass(/lit/);
  await page.locator('#finish').click();
  await expect(page.locator('#completion')).toBeVisible();
  await page.reload();
  await expect(page.locator('#progress-label')).toContainText('1 of 5');
  expect(errors).toEqual([]);
  await page.screenshot({path: 'evidence/desktop.png', fullPage: true});
});

test('sandbox shorts 5V to GND and puffs purple smoke', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.locator('[data-sandbox]').click();
  await expect(page.locator('h1')).toContainText('Purple smoke');
  await page.locator('[data-pin="uno:5v"]').click();
  await page.locator('[data-pin="uno:gnd"]').click();
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('Purple smoke');
  await expect(page.locator('#board')).toHaveClass(/smoked/);
  await expect(page.locator('#smoke')).toBeVisible();
  await expect(page.locator('#smoke-why')).toContainText('5V');
  expect(errors).toEqual([]);
  await page.screenshot({path: 'evidence/sandbox-smoke.png', fullPage: true});
});

test('potentiometer maps analog input onto a conservative servo angle', async ({page}) => {
  await page.goto('/');
  await page.locator('[data-level="4"]').click();
  await expect(page.locator('h1')).toContainText('Potentiometer');
  const lesson = await page.evaluate(() => LESSONS[4]);
  await wireAndProgram(page, lesson);
  await page.locator('#pot-value').fill('1023');
  await page.locator('#run').click();
  await expect(page.locator('#status')).toContainText('running');
  await expect(page.locator('#angle-label')).toContainText('160°');
  await page.locator('#pot-value').fill('0');
  await expect(page.locator('#angle-label')).toContainText('20°');
});
