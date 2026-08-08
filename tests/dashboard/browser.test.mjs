import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { PRODUCT_ROOT } from '../helpers/workspace.mjs';

test('generated dashboard browser program is syntactically valid', async () => {
  const html = await readFile(path.join(PRODUCT_ROOT, '.harness', 'dashboard.html'), 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert.ok(scripts.length >= 2);
  assert.doesNotThrow(() => new Function(scripts.at(-1)));
});

test('dashboard works at desktop and mobile widths', {
  skip: !process.env.HUAJUAN_DASHBOARD_URL || !process.env.CODEX_NODE_MODULES,
}, async () => {
  const runtimeRoot = path.dirname(process.env.CODEX_NODE_MODULES);
  const require = createRequire(path.join(runtimeRoot, 'package.json'));
  const { chromium } = require('playwright');
  const output = path.resolve(process.env.HUAJUAN_QA_OUTPUT ?? 'artifacts/dashboard-qa');
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.HUAJUAN_CHROME_EXECUTABLE ? { executablePath: process.env.HUAJUAN_CHROME_EXECUTABLE } : {}),
  });
  const errors = [];
  try {
    const desktop = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    desktop.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    desktop.on('pageerror', error => errors.push(error.message));
    await desktop.goto(process.env.HUAJUAN_DASHBOARD_URL, { waitUntil: 'networkidle' });
    await desktop.locator('[data-action="copy-init"]').click();
    assert.match(await desktop.locator('#toast').textContent(), /已复制|复制失败/);
    await desktop.locator('[data-view-target="knowledge"]').click();
    assert.equal(await desktop.locator('[data-view="knowledge"]').isVisible(), true);
    assert.equal(await desktop.locator('#knowledge-contract-grid .contract-card').count(), 6);
    await desktop.locator('[data-view-target="assets"]').click();
    assert.equal(await desktop.locator('[data-view="assets"]').isVisible(), true);
    await desktop.locator('[data-role="asset-search"]').fill('workspace-bootstrap');
    assert.ok(await desktop.locator('#asset-table-body tr').count() >= 1);
    await desktop.locator('[data-view-target="doctor"]').click();
    assert.equal(await desktop.locator('[data-view="doctor"]').isVisible(), true);
    await desktop.locator('[data-action="open-command-drawer"]').click();
    assert.equal(await desktop.locator('#command-drawer.open').isVisible(), true);
    await desktop.locator('[data-action="close-command-drawer"]').click();
    const downloadPromise = desktop.waitForEvent('download');
    await desktop.locator('[data-action="export-snapshot"]').click();
    const download = await downloadPromise;
    await download.saveAs(path.join(output, 'huajuan-dashboard-snapshot.json'));
    await desktop.locator('[data-view-target="overview"]').click();
    await desktop.screenshot({ path: path.join(output, 'desktop-1600x1000.png'), fullPage: true });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    mobile.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.goto(process.env.HUAJUAN_DASHBOARD_URL, { waitUntil: 'networkidle' });
    const width = await mobile.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    assert.ok(width.scroll <= width.client, JSON.stringify(width));
    await mobile.locator('[data-view-target="relations"]').click();
    assert.equal(await mobile.locator('[data-view="relations"]').isVisible(), true);
    await mobile.screenshot({ path: path.join(output, 'mobile-390x844.png'), fullPage: true });
  } finally {
    await browser.close();
  }
  assert.deepEqual(errors, []);
});
