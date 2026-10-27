import { watch } from 'node:fs';
import { buildSite } from './build.mjs';
import { serve } from './serve.mjs';

await buildSite();
serve();
let pending = false;
let building = false;
let timer;
async function rebuild() {
  if (building) { pending = true; return; }
  building = true;
  try { await buildSite(); console.log('Updated. Refresh your browser.'); }
  catch (error) { console.error(error); }
  finally { building = false; if (pending) { pending = false; await rebuild(); } }
}
for (const entry of ['src', 'media', 'tailwind.config.mjs']) {
  watch(entry, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}
