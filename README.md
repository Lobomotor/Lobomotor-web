# Lobomotor Studio

Website: https://lobomotor.studio/

The existing React single-page website now compiles into versioned static files. Its content, layout, colours, images and animations are preserved. React, Lucide icons, Framer Motion and Tailwind CSS are bundled locally instead of executing from third-party JavaScript CDNs.

## Develop and preview

Install Node.js 24 (recorded in `.nvmrc`), then:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Changes rebuild automatically; refresh to see them. No Gemini API key, Google AI Studio account or environment file is required.

For a production build and preview:

```sh
npm run build
npm run preview
```

The preview serves only `dist/`, not source or credentials. `PORT` and `HOST` override the local server address when needed.

## Files

| File | Purpose |
| --- | --- |
| `src/main.jsx` | Text, images, navigation, carousel, contact form and game integration |
| `src/styles.css` | Custom styles and Tailwind directives |
| `src/page.html` | Document shell, title and existing Google Fonts links |
| `tailwind.config.mjs` | Existing fonts, colours and utility settings |
| `media/` | Exact copies of original images; provenance in `sources.json` |
| `scripts/` | Cross-platform build and preview commands |
| `index.html`, `assets/` | Generated files used by Pages; commit after building |
| `CNAME`, `.nojekyll` | Custom domain and static publishing support |

The ignored `dist/` directory contains the deployable page, scripts, CSS, images, CNAME and `.nojekyll`. CI attaches this build for preview download.

## Checks

```sh
npx playwright install chromium
npm run lint
npm run build
npm run test:static
npm audit --audit-level=high
npm test
```

On Linux use `npx playwright install --with-deps chromium` if browser system dependencies are missing. `npm run test:static` checks the built output, real React rendering, local assets and preview-server boundaries without a browser. Browser tests cover desktop/mobile Chromium: runtime errors, icons, local images, horizontal overflow, navigation, internal links, carousel, game opening/closing, and contact success/failure. Formspree and the game response are mocked; no real messages are sent. Google Fonts is stubbed in CI to avoid making its availability a prerequisite.

The `Site checks` workflow's `validate` job runs on pull requests into `main`, pushes to `main` or `maintenance/**`, and manual dispatch. It checks lint, build reproducibility, dependency advisories and browser behaviour. It never deploys. Download `site-preview-<commit>` and `browser-test-report` from a successful run; the browser report includes desktop/mobile screenshots. Serve the extracted preview directory with a local static server or an approved preview host. This setup does not create automatic per-PR GitHub Pages preview URLs.

## Approval and publishing

1. Request a change in natural language.
2. The assistant prepares a separate branch and PR, runs checks and provides a preview/screenshots.
3. Review the exact version and approve publication in the chat.
4. The assistant merges that reviewed version into `main`, monitors Pages and checks the live result.

**Anything committed to `main` can publish immediately.** The confirmed configuration is **Deploy from a branch -> main -> /(root)**, custom domain **lobomotor.studio**, **Enforce HTTPS** enabled. GitHub's built-in `pages-build-deployment` workflow publishes it. No AI Studio action, Cloud Run deployment, DNS change or manual build button is needed for website updates.

The generated root `index.html`, `assets/` and original `media/` are ready to serve. Do not change Pages to `/docs` or GitHub Actions for this update. Build and commit generated output with every source change; CI rejects stale publishing files. After an approved merge, verify the Pages run and that the live HTML references the approved hashed assets. Passing tests alone do not prove a successful deployment.

### One-time owner setting: protect main

Branch protection is **not enabled by this PR**. The connector does not expose repository administration. The owner can configure Settings -> Rules -> Rulesets (or Branches -> branch protection) for `main`: require a PR and the `validate` status check after it has run once, block force pushes/deletion, and enforce passing checks without routine bypass. Keep the chat approval as the release gate. Requiring approval from the PR's own author does not work in a solo-owner workflow; avoid an impossible reviewer requirement.

### Rollback

Find the last good Pages release/commit. Create a branch reverting the bad release, including source AND generated `index.html`/`assets/` and changed media. Run checks, get approval and merge the revert PR. Do not reset or force-push `main`. Reverting the complete initial maintenance merge restores the old self-contained HTML and tooling together.

## External services

- **Google Fonts:** original Inter and Space Grotesk stylesheets; still external.
- **Formspree:** `https://formspree.io/f/mykbgqop`; delivery settings/limits belong to that account. Real delivery testing requires authorization. The public form ID is not a secret.
- **Ponganoid:** `https://ponganoid-777006893258.us-west1.run.app`; separately hosted game, outside this repository's code/billing/deployment.
- **LinkedIn and Sarjakuvakauppa:** existing outgoing links preserved.
- **Squarespace DNS / Google Workspace:** unchanged. Website publishing requires no email or DNS access.

Never commit credentials. GitHub Pages hosts static files; future backend/API features require separate review.
