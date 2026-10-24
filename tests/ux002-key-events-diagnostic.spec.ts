import { test, expect, type Page } from '@playwright/test';

// An observation-only browser-engine diagnostic; NOT an accessibility acceptance test.
// It does not change source application behavior or weaken prior 21-case audit.
async function installProbe(page: Page) {
  await page.evaluate(() => {
    const events: Array<{type:string;key:string;target:string;active:string;trusted:boolean}> = [];
    Object.assign(window, { ux002KeyEvents: events });
    for (const type of ['keydown', 'keyup', 'click']) {
      document.addEventListener(type, (event) => {
        const k = event as KeyboardEvent;
        const target = event.target as HTMLElement | null;
        const active = document.activeElement as HTMLElement | null;
        events.push({
          type,
          key: k.key ?? '',
          target: target?.id || target?.tagName || '',
          active: active?.id || active?.tagName || '',
          trusted: event.isTrusted,
        });
      }, true);
    }
  });
}
async function pressUntil(page: Page, selector: string) {
  for(let i=0;i<35;i++){
    await page.keyboard.press('Tab');
    if(await page.locator(selector).evaluate(el=>el===document.activeElement))return;
  }
  throw Error('Could not Tab to '+selector);
}
async function snapshot(page: Page) {
  return page.evaluate(() => (window as unknown as {
    ux002KeyEvents: Array<{type:string;key:string;target:string;active:string;trusted:boolean}>
  }).ux002KeyEvents);
}

test('DIAG-ANALYZE: compare Enter, Space, direct click after natural Tab', async ({page,browserName})=>{
  await page.goto('/analyze');
  await installProbe(page);
  await pressUntil(page,'#btn-launch-analysis');
  await page.keyboard.press('Enter');
  const enterValidation=await page.locator('#code-snippet-error').count()>0;
  const enterEvents=await snapshot(page);
  if(!enterValidation)await page.keyboard.press('Space');
  const spaceValidation=await page.locator('#code-snippet-error').count()>0;
  const spaceEvents=await snapshot(page);
  if(!spaceValidation)await page.locator('#btn-launch-analysis').click();
  const clickValidation=await page.locator('#code-snippet-error').count()>0;
  console.log('KEY_DIAG_ANALYZE',JSON.stringify({browserName,enterValidation,spaceValidation,clickValidation,enterEvents:enterEvents.slice(-5),extraEvents:spaceEvents.slice(enterEvents.length)}));
  expect(clickValidation).toBe(true);
});

test('DIAG-HOME: compare Enter, Space, direct click on focused hero link',async({page,browserName})=>{
  await page.goto('/');
  await installProbe(page);
  // Directly observe natural focus of the specifically named hero CTA.
  const hero=page.getByRole('link',{name:'Open Verification Lab',exact:true});
  let onHero=await hero.evaluate(el=>el===document.activeElement);
  for(let i=0;!onHero&&i<20;i++){
    await page.keyboard.press('Tab');
    onHero=await hero.evaluate(el=>el===document.activeElement);
  }
  expect(onHero).toBe(true);
  await page.keyboard.press('Enter');
  const enterUrl=page.url();
  let events:Array<{type:string;key:string;target:string;active:string;trusted:boolean}>=[];
  if(!enterUrl.endsWith('/lab')) events=await snapshot(page);
  if(!enterUrl.endsWith('/lab'))await page.keyboard.press('Space');
  const spaceUrl=page.url();
  if(!spaceUrl.endsWith('/lab'))await hero.click();
  console.log('KEY_DIAG_HOME',JSON.stringify({browserName,enterUrl,spaceUrl,final:page.url(),events:events.slice(-6)}));
  await expect(page).toHaveURL(/\/lab$/);
});

test('DIAG-LAB: distinguish keyboard event, native click and JS hydration',async({page,browserName})=>{
  await page.route('**/api/v1/lab/verify', async route => {
    await new Promise(resolve => setTimeout(resolve, 1300));
    await route.continue();
  });
  await page.goto('/lab');
  await installProbe(page);
  await pressUntil(page,'#btn-execute-verification');
  await page.keyboard.press('Enter');
  const enterLoading=await page.locator('#btn-execute-verification').evaluate(e=>e.getAttribute('aria-disabled'))==='true';
  const enterEvents=await snapshot(page);
  if(!enterLoading)await page.keyboard.press('Space');
  const spaceLoading=await page.locator('#btn-execute-verification').evaluate(e=>e.getAttribute('aria-disabled'))==='true';
  const spaceEvents=await snapshot(page);
  if(!spaceLoading)await page.locator('#btn-execute-verification').click();
  await expect(page.getByText('Execution Run ID:')).toBeVisible({timeout:10000});
  console.log('KEY_DIAG_LAB',JSON.stringify({browserName,enterLoading,spaceLoading,enterEvents:enterEvents.slice(-5),extraEvents:spaceEvents.slice(enterEvents.length)}));
});
