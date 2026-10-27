import { build, transform } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const digest = (content) => createHash('sha256').update(content).digest('hex').slice(0, 12);

// Build the exact files reviewed in a pull request. Pages continues serving main /(root).
export async function buildSite() {
  await rm('dist', { recursive: true, force: true });
  await mkdir('dist/assets', { recursive: true });
  const result = await build({
    entryPoints: ['src/main.jsx'], bundle: true, write: false,
    minify: true, format: 'esm', platform: 'browser', target: ['es2020'],
    define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'inline',
  });
  const javascript = result.outputFiles[0].contents;
  const stylesheet = await postcss([tailwindcss('./tailwind.config.mjs')])
    .process(await readFile('src/styles.css', 'utf8'), { from: 'src/styles.css' });
  const { code: css } = await transform(stylesheet.css, { loader: 'css', minify: true });
  const scriptPath = `assets/app-${digest(javascript)}.js`;
  const stylePath = `assets/styles-${digest(css)}.css`;
  const html = (await readFile('src/page.html', 'utf8'))
    .replace('{{SCRIPT}}', `./${scriptPath}`).replace('{{STYLE}}', `./${stylePath}`);
  await writeFile(`dist/${scriptPath}`, javascript);
  await writeFile(`dist/${stylePath}`, css);
  await writeFile('dist/index.html', html);
  await cp('media', 'dist/media', { recursive: true });
  await cp('CNAME', 'dist/CNAME');
  await cp('contact-config.json', 'dist/contact-config.json');
  await writeFile('dist/.nojekyll', '');
  // Commit these generated files with source changes; CI verifies they match.
  await rm('assets', { recursive: true, force: true });
  await cp('dist/assets', 'assets', { recursive: true });
  await writeFile('index.html', html);
  console.log(`Built ${scriptPath} and ${stylePath}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSite();
}
