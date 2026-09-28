#!/usr/bin/env node

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const WEB = (process.env.LIVE_WEB_URL || 'https://delta-travel-web.onrender.com').replace(/\/$/, '');
const routes = ['/', '/tours', '/assistant', '/login', '/register'];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let totalSerious = 0;
  let totalCritical = 0;

  for (const route of routes) {
    await page.goto(WEB + route, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(800);

    const result = await new AxeBuilder({ page }).analyze();
    const serious = result.violations.filter((v) => v.impact === 'serious');
    const critical = result.violations.filter((v) => v.impact === 'critical');

    totalSerious += serious.length;
    totalCritical += critical.length;

    console.log(
      `A11Y ${route}: violations=${result.violations.length}, serious=${serious.length}, critical=${critical.length}`,
    );

    for (const violation of [...critical, ...serious]) {
      console.log(`  - ${violation.id}: ${violation.help}`);
    }
  }

  if (totalCritical > 0) {
    throw new Error(`Critical accessibility violations detected: ${totalCritical}`);
  }

  console.log(
    `\nA11Y_AUDIT_PASS critical=0 serious=${totalSerious} (serious findings retained as review evidence)`,
  );
} finally {
  await browser.close();
}
