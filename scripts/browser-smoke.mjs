#!/usr/bin/env node

import { chromium, firefox } from 'playwright';

const WEB = (process.env.LIVE_WEB_URL || 'https://delta-travel-web.onrender.com').replace(
  /\/$/,
  '',
);
const publicRoutes = [
  '/',
  '/tours',
  '/assistant',
  '/login',
  '/register',
  '/forgot-password',
  '/payments/return',
];

async function assertBasicAccessibility(page, name, route) {
  const missingAlt = await page.locator('img:not([alt])').count();
  if (missingAlt > 0) throw new Error(`${name} ${route} has ${missingAlt} image(s) without alt`);

  const unnamedButtons = await page.locator('button').evaluateAll(
    (buttons) =>
      buttons.filter((button) => {
        const text = button.textContent?.trim();
        const label = button.getAttribute('aria-label')?.trim();
        const title = button.getAttribute('title')?.trim();
        return !text && !label && !title;
      }).length,
  );
  if (unnamedButtons > 0) {
    throw new Error(`${name} ${route} has ${unnamedButtons} unnamed button(s)`);
  }

  const unnamedLinks = await page.locator('a').evaluateAll(
    (links) =>
      links.filter((link) => {
        const text = link.textContent?.trim();
        const label = link.getAttribute('aria-label')?.trim();
        const title = link.getAttribute('title')?.trim();
        const imageAlt = link.querySelector('img')?.getAttribute('alt')?.trim();
        return !text && !label && !title && !imageAlt;
      }).length,
  );
  if (unnamedLinks > 0) {
    throw new Error(`${name} ${route} has ${unnamedLinks} unnamed link(s)`);
  }

  if ((await page.locator('main').count()) === 0) {
    throw new Error(`${name} ${route} is missing the main landmark`);
  }
}

function isTransientChunkError(message) {
  return /ChunkLoadError|Loading chunk \d+ failed/i.test(message);
}

async function openRoute(page, name, viewport, route, pageErrors) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const errorStart = pageErrors.length;
    const response = await page.goto(WEB + route, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    const status = response?.status();
    if (!response || status >= 400) {
      if (attempt < maxAttempts && status && [502, 503, 504].includes(status)) {
        console.log(`RETRY ${name} ${route} after transient HTTP ${status}`);
        await page.waitForTimeout(6000);
        continue;
      }
      throw new Error(`${name} ${route} returned HTTP ${status ?? 'no-response'}`);
    }
    await page.waitForTimeout(800);

    const routeErrors = pageErrors.slice(errorStart);
    if (
      attempt < maxAttempts &&
      routeErrors.length > 0 &&
      routeErrors.every((message) => isTransientChunkError(message))
    ) {
      pageErrors.splice(errorStart, routeErrors.length);
      console.log(`RETRY ${name} ${route} after transient chunk load error`);
      continue;
    }
    if (routeErrors.length) {
      throw new Error(`${name} ${route} page errors: ${routeErrors.join(' | ')}`);
    }

    const body = (await page.locator('body').innerText()).trim();
    if (body.length < 20) throw new Error(`${name} ${route} rendered unexpectedly little content`);
    await assertBasicAccessibility(page, name, route);
    console.log(`PASS  ${name} ${viewport.width}x${viewport.height} ${route}`);
    return;
  }

  throw new Error(`${name} ${route} kept failing to load its current deployment chunks`);
}

async function assertAuthGate(page, name, viewport, route, pageErrors) {
  await openRoute(page, name, viewport, route, pageErrors);
  await page.locator('a[href="/login"]').first().waitFor({ state: 'visible', timeout: 30000 });
  const leakedDashboard = await page
    .getByText('Trung Tâm Điều Hành Delta Travel', { exact: true })
    .count();
  if (leakedDashboard > 0) throw new Error(`${name} ${route} exposed protected admin content`);
  console.log(`PASS  ${name} auth gate ${route}`);
}

async function assertInternalLinks(page) {
  const origin = new URL(WEB).origin;
  const discovered = new Set();

  for (const seed of ['/', '/tours']) {
    await page.goto(WEB + seed, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(500);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')).filter(Boolean));
    for (const href of hrefs) {
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        continue;
      }
      const url = new URL(href, WEB);
      if (url.origin !== origin) continue;
      url.hash = '';
      discovered.add(url.toString());
    }
  }

  const failures = [];
  for (const url of [...discovered].sort()) {
    const response = await page.request.get(url, { timeout: 60000, maxRedirects: 5 });
    if (response.status() >= 400) failures.push(`${response.status()} ${url}`);
  }
  if (failures.length) {
    throw new Error(`Broken internal links: ${failures.join(' | ')}`);
  }
  console.log(`PASS  internal link integrity links=${discovered.size}`);
}

async function runEngine(name, engine, viewport) {
  const browser = await engine.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error)));

    for (const route of publicRoutes) {
      await openRoute(page, name, viewport, route, pageErrors);
    }

    await assertAuthGate(page, name, viewport, '/bookings', pageErrors);
    await assertAuthGate(page, name, viewport, '/admin', pageErrors);

    if (name === 'chromium-desktop') {
      await assertInternalLinks(page);
    }

    if (pageErrors.length) {
      throw new Error(`${name} page errors: ${pageErrors.join(' | ')}`);
    }
  } finally {
    await browser.close();
  }
}

await runEngine('chromium-desktop', chromium, { width: 1440, height: 900 });
await runEngine('chromium-mobile', chromium, { width: 390, height: 844 });
await runEngine('firefox-desktop', firefox, { width: 1440, height: 900 });

console.log('\nBROWSER_SMOKE_PASS');
