#!/usr/bin/env node

import { chromium } from 'playwright';

const WEB = (process.env.LIVE_WEB_URL || 'https://delta-travel-web.onrender.com').replace(
  /\/$/,
  '',
);

function pass(label, detail = '') {
  console.log(`PASS  ${label}${detail ? `  ${detail}` : ''}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('response', (response) => {
    if (response.url().includes('/api/v1/tours/')) {
      console.log('LIVE_TOUR_RESPONSE', response.status(), response.url());
    }
  });

  await page.goto(WEB + '/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  const homepagePlanner = page.locator('[data-ai-surface="context-card"]').first();
  await homepagePlanner.waitFor({ state: 'visible' });
  if (await page.getByTestId('ai-command-center-launcher').count()) {
    throw new Error(
      'Homepage should use the inline DELTA AI planner without a duplicate floating launcher',
    );
  }
  pass('homepage DELTA AI planner without duplicate launcher');

  await page.goto(WEB + '/tours', { waitUntil: 'domcontentloaded', timeout: 120000 });
  const discovery = page.locator('[data-ai-surface="context-card"]').first();
  await discovery.waitFor({ state: 'visible' });

  // Capture a real catalog destination before AI ranking reorders the cards.
  const stableTourLink = page.locator('a.liquid-glass-card[href^="/tours/"]').first();
  await stableTourLink.waitFor({ state: 'visible', timeout: 30000 });
  const stableTourHref = await stableTourLink.getAttribute('href');
  if (!stableTourHref) throw new Error('No stable production tour card link found');
  console.log('LIVE_DETAIL_TARGET', stableTourHref);

  const discoveryInput = discovery.locator('textarea[aria-label="Yêu cầu cho DELTA AI"]');
  await discoveryInput.fill('Tìm tour phù hợp cho 2 người lớn, ngân sách khoảng 8 triệu.');
  await discovery.getByRole('button', { name: 'Hỏi AI' }).click();
  await discovery
    .locator('[data-ai-response="true"]')
    .waitFor({ state: 'visible', timeout: 90000 });
  const discoveryText = (await discovery.locator('[data-ai-response="true"]').innerText()).trim();
  if (discoveryText.length < 40)
    throw new Error('Tour discovery AI response is unexpectedly short');
  pass('tour discovery grounded AI response', `chars=${discoveryText.length}`);

  const recommended = await page.getByText('AI đề xuất', { exact: true }).count();
  if (recommended < 1)
    throw new Error('AI discovery did not surface any TOUR source into catalog ranking');
  pass('AI-ranked tour catalog', `recommended=${recommended}`);

  await page.goto(WEB + stableTourHref, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  const advisor = page.locator('[data-ai-surface="context-card"]').first();
  try {
    await advisor.waitFor({ state: 'visible', timeout: 30000 });
  } catch {
    console.log('DETAIL_RECOVERY_URL', page.url());
    console.log('DETAIL_RECOVERY_BODY', (await page.locator('body').innerText()).slice(0, 1600));
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await advisor.waitFor({ state: 'visible', timeout: 60000 });
  }
  const advisorResponse = advisor.locator('[data-ai-response="true"]');
  try {
    await advisorResponse.waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    const askAdvisor = advisor.getByRole('button', { name: 'Hỏi AI' });
    await askAdvisor.click({ timeout: 30000 });
    await advisorResponse.waitFor({ state: 'visible', timeout: 90000 });
  }
  pass('tour detail AI fit advisor');

  await page.goto(WEB + '/tours', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page
    .getByTestId('ai-command-center-launcher')
    .waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('ai-command-center-launcher').click();
  const center = page.getByTestId('ai-command-center');
  await center.waitFor({ state: 'visible' });
  const contextualSuggestion = center
    .getByText('Gợi ý theo ngữ cảnh', { exact: true })
    .locator('..')
    .locator('button')
    .first();
  await contextualSuggestion.waitFor({ state: 'visible', timeout: 30000 });
  await contextualSuggestion.click();
  await center
    .getByTestId('ai-command-center-message-assistant')
    .last()
    .waitFor({ state: 'visible', timeout: 90000 });
  pass('global page-aware AI command center');

  await center.getByRole('button', { name: 'Đóng' }).click();
  await center.waitFor({ state: 'hidden', timeout: 30000 });

  await page.goto(WEB + '/assistant', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByText('DELTA AI', { exact: true }).first().waitFor({
    state: 'visible',
    timeout: 30000,
  });
  const body = await page.locator('body').innerText();
  if (!body.includes('xác nhận') && !body.includes('approval')) {
    throw new Error('Assistant page does not explain explicit user approval');
  }
  pass('action agent keeps explicit user approval');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(WEB + '/tours', { waitUntil: 'domcontentloaded', timeout: 120000 });
  const mobileLauncher = page.getByTestId('ai-command-center-launcher');
  await mobileLauncher.waitFor({ state: 'visible', timeout: 30000 });
  await mobileLauncher.click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="ai-command-center-launcher"]')
        ?.getAttribute('aria-expanded') === 'true',
    null,
    { timeout: 30000 },
  );
  const mobileCenter = page.getByTestId('ai-command-center');
  await mobileCenter.waitFor({ state: 'visible', timeout: 30000 });
  const mobileBox = await mobileCenter.boundingBox();
  if (!mobileBox || mobileBox.width > 390 || mobileBox.height > 844) {
    throw new Error('Mobile AI command center overflowed the viewport');
  }
  await page.keyboard.press('Escape');
  await mobileCenter.waitFor({ state: 'hidden', timeout: 30000 });
  if ((await mobileLauncher.getAttribute('aria-expanded')) !== 'false') {
    throw new Error('Mobile AI command center did not reset expanded state after Escape');
  }
  pass('mobile AI command center + Escape close');

  if (pageErrors.length) {
    throw new Error('Page errors during AI-first acceptance: ' + pageErrors.join(' | '));
  }

  console.log('\nAI_FIRST_LIVE_ACCEPTANCE_PASS');
} finally {
  await browser.close();
}
