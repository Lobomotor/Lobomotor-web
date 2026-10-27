import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Keep CI independent of Google Fonts and never send actual contact messages.
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
  await page.route('https://formspree.io/**', route => route.abort());
  await page.route('https://ponganoid-777006893258.us-west1.run.app/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Ponganoid test frame</h1>' }));
});

test('renders content, icons and local images without JavaScript errors', async ({ page }, testInfo) => {
  const errors = [];
  const scripts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Crafting Worlds' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Embassy', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'PLAY A GAME' }).locator('svg')).not.toHaveCount(0);
  for (const image of await page.locator('img').all()) {
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate(element => element.naturalWidth)).toBeGreaterThan(0);
    expect(await image.getAttribute('src')).toMatch(/^\.\/media\//);
  }
  expect(scripts.every(url => url.startsWith('http://127.0.0.1:3000/'))).toBe(true);
  expect(errors).toEqual([]);
  await testInfo.attach('page-preview', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('navigation and mobile menu reach the contact section', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    const toggle = page.getByRole('button', { name: 'Toggle navigation' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#mobile-navigation').getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  } else {
    await page.getByRole('link', { name: "Let's Talk", exact: true }).click();
  }
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByLabel('Your Email')).toBeVisible();
});

test('game opens and closes without navigating away', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'PLAY A GAME' }).click();
  await expect(page.getByTitle('Ponganoid Game')).toHaveAttribute('src', 'https://ponganoid-777006893258.us-west1.run.app');
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Ponganoid test frame' })).toBeVisible();
  await page.getByRole('button', { name: 'Close Game' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('contact success and failure paths use mocked Formspree responses', async ({ page }) => {
  let attempt = 0;
  await page.route('https://formspree.io/f/mykbgqop', async route => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ name: 'Preview Test', email: 'preview@example.com', message: 'Automated local test' });
    attempt++;
    await route.fulfill({ status: attempt === 1 ? 500 : 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/#contact');
  await page.getByLabel('Your Name').fill('Preview Test');
  await page.getByLabel('Your Email').fill('preview@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Automated local test');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Message Sent!' })).toBeVisible();
  await page.getByRole('button', { name: 'Send another message' }).click();
  await expect(page.getByLabel('Your Name')).toHaveValue('');
});

test('team carousel advances', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByAltText('Leo Kihlman', { exact: true })).toHaveAttribute('src', './media/team-leo.jpg');
  await page.clock.runFor(5000);
  await expect(page.getByAltText('Leo Kihlman', { exact: true })).toHaveAttribute('src', './media/team-studio-1.png');
});

test('internal links resolve and preview server does not expose source', async ({ page, request }) => {
  await page.goto('/');
  const anchors = await page.locator('a[href^="#"]').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  for (const anchor of new Set(anchors.filter(anchor => anchor !== '#'))) {
    await expect(page.locator(anchor)).toHaveCount(1);
  }
  for (const file of ['/src/main.jsx', '/package.json', '/.env', '/missing.html']) {
    expect((await request.get(file)).status()).toBe(404);
  }
  expect((await request.get('/media/logo.png')).status()).toBe(200);
});
