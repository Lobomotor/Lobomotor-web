import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import path from 'node:path';
import { build } from 'esbuild';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);

test('published HTML uses existing local hashed assets and matches the preview', async () => {
  const html = await readFile('index.html', 'utf8');
  assert.equal(html, await readFile('dist/index.html', 'utf8'));
  const assets = [...html.matchAll(/(?:href|src)="\.\/(assets\/[^"]+)"/g)].map(match => match[1]);
  assert.equal(assets.length, 2);
  for (const asset of assets) {
    assert.match(asset, /-[a-f0-9]{12}\.(js|css)$/);
    assert.deepEqual(await readFile(asset), await readFile(`dist/${asset}`));
  }
  assert.doesNotMatch(html, /cdn\.tailwindcss|unpkg\.com|cdn\.jsdelivr|text\/babel/);
  assert.equal((await readFile('CNAME', 'utf8')).trim(), 'lobomotor.studio');
});

test('React renders content, real SVG icons, local images and labelled form fields', async () => {
  const source = (await readFile('src/main.jsx', 'utf8'))
    .replace("createRoot(document.getElementById('root')).render(<App />);", 'export { App };');
  const result = await build({ stdin: { contents: source, resolveDir: path.resolve('src'), loader: 'jsx' }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external' });
  const module = { exports: {} };
  vm.runInNewContext(result.outputFiles[0].text, { module, exports: module.exports, require });
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const html = renderToStaticMarkup(React.createElement(module.exports.App));
  for (const text of ['Crafting', 'The Embassy', 'Game Industry Consulting', 'leo@lobomotor.studio']) assert.ok(html.includes(text), text);
  assert.ok((html.match(/<svg/g) || []).length >= 8);
  const images = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(match => match[1]);
  assert.equal(images.length, 8);
  for (const image of images) {
    assert.match(image, /^\.\/media\//);
    assert.ok((await readFile(image)).length > 0);
  }
  for (const field of ['name', 'email', 'message']) {
    assert.ok(html.includes(`for="contact-${field}"`));
    assert.ok(html.includes(`id="contact-${field}"`));
  }
});

test('preview serves built assets and refuses source, credentials and missing pages', async () => {
  const previousPort = process.env.PORT;
  process.env.PORT = '0';
  const server = serve();
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(`${origin}/`)).status, 200);
    assert.match((await fetch(`${origin}/media/logo.png`)).headers.get('content-type'), /image\/png/);
    for (const file of ['/src/main.jsx', '/package.json', '/.env', '/missing.html']) assert.equal((await fetch(origin + file)).status, 404);
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previousPort === undefined) delete process.env.PORT;
    else process.env.PORT = previousPort;
  }
});
