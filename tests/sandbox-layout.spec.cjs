const {test, expect} = require('@playwright/test');
for (const width of [320, 390, 768, 1024, 1280, 1440]) {
  test(`sandbox parts stay separated and on breadboard at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: 1000});
    await page.goto('/');
    await page.locator('[data-sandbox]').click();
    const issues = await page.evaluate(() => {
      const board = document.querySelector('.breadboard').getBoundingClientRect();
      const parts = [...document.querySelectorAll('#parts-on-board .part')];
      const issues = [];
      const rects = parts.map(p => ({name:p.className, r:p.getBoundingClientRect()}));
      for (const {name,r} of rects) {
        if(r.left < board.left || r.right > board.right || r.top < board.top || r.bottom > board.bottom) issues.push(`${name} outside breadboard`);
      }
      for(let i=0;i<rects.length;i++) for(let j=i+1;j<rects.length;j++) {
        const a=rects[i].r,b=rects[j].r;
        if(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) issues.push(`${rects[i].name} overlaps ${rects[j].name}`);
      }
      const holes=document.querySelector('.holes').getBoundingClientRect();
      for(const pin of document.querySelectorAll('.pot-part .pin')) {
        const r=pin.getBoundingClientRect();
        if(r.bottom>holes.bottom || r.left<holes.left || r.right>holes.right) issues.push('pot terminal outside hole field');
      }
      return issues;
    });
    expect(issues).toEqual([]);
    for(const id of ['button:out','servo:signal','pot:wiper']) {
      await page.locator(`[data-pin="${id}"]`).click();
      await expect(page.locator(`[data-pin="${id}"]`)).toHaveClass(/selected/);
      await page.locator(`[data-pin="${id}"]`).click();
    }
    await page.locator('#board').screenshot({path:`evidence/sandbox-layout-${width}.png`});
  });
}
