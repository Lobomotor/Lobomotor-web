import { test, expect } from '@playwright/test';

const CONTACT_ENDPOINT = 'https://script.google.com/macros/s/test-contact-deployment/exec';

function acknowledgement(request, ok = true, message = '') {
  const fields = Object.fromEntries(new URLSearchParams(request.postData()));
  const data = { type: 'lobomotor-contact-result', requestId: fields.requestId, ok, message };
  const script = `window.top.postMessage(${JSON.stringify(data)}, ${JSON.stringify(fields.returnOrigin)});`;
  // Apps Script delivers HTML inside a Google-owned sandbox iframe.
  const contents = JSON.stringify('<script>' + script + '</script>').replace(/</g, '\\u003c');
  return `<!doctype html><body><script>const child=document.createElement('iframe');child.srcdoc=${contents};document.body.append(child);</script></body>`;
}

test.beforeEach(async ({ page }) => {
  // Keep CI independent of Google Fonts and never send actual contact messages.
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
  await page.route('**/contact-config.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ endpoint: CONTACT_ENDPOINT }) }));
  await page.route(CONTACT_ENDPOINT, route => route.fulfill({ contentType: 'text/html', body: acknowledgement(route.request()) }));
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

test('contact success and failure preserve fields and reuse the request id on retry', async ({ page }) => {
  let attempt = 0;
  let firstId;
  const formspreeRequests = [];
  page.on('request', request => { if (request.url().includes('formspree.io')) formspreeRequests.push(request.url()); });
  await page.route(CONTACT_ENDPOINT, async route => {
    expect(route.request().method()).toBe('POST');
    const data = Object.fromEntries(new URLSearchParams(route.request().postData()));
    expect(data.name).toBe('Preview Test');
    expect(data.email).toBe('preview@example.com');
    expect(data.message).toBe('Automated local test');
    expect(data.website).toBe('');
    if (!firstId) firstId = data.requestId;
    expect(data.requestId).toBe(firstId);
    attempt++;
    await route.fulfill({ contentType: 'text/html', body: acknowledgement(route.request(), attempt > 1, 'Please retry your message.') });
  });
  await page.goto('/#contact');
  await page.getByLabel('Your Name').fill('Preview Test');
  await page.getByLabel('Your Email').fill('preview@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Automated local test');
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Please retry your message.');
  await expect(page.getByLabel('Your Name')).toHaveValue('Preview Test');
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Message Sent!' })).toBeVisible();
  await page.getByRole('button', { name: 'Send another message' }).click();
  await expect(page.getByLabel('Your Name')).toHaveValue('');
  expect(formspreeRequests).toEqual([]);
  expect(attempt).toBe(2);
});

test('unconfigured email backend reports the problem without claiming success', async ({ page }) => {
  await page.route('**/contact-config.json', route => route.fulfill({ contentType: 'application/json', body: '{"endpoint":""}' }));
  await page.goto('/#contact');
  await page.getByLabel('Your Name').fill('Preview Test');
  await page.getByLabel('Your Email').fill('preview@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Keep this message');
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('not configured yet');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Keep this message');
  await expect(page.getByRole('heading', { name: 'Message Sent!' })).toHaveCount(0);
});

test('team carousel advances', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByAltText('Leo Kihlman', { exact: true })).toHaveAttribute('src', './media/team-leo.jpg');
  await expect(page.getByAltText('Leo Kihlman', { exact: true })).toHaveAttribute('src', './media/team-studio-1.png', { timeout: 7000 });
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
