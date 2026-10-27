# Lobomotor Studio website maintenance

## Scope and approval

- Preserve the existing visual design and text unless Leo requests a change.
- Work on a separate branch and prepare a pull request with a tested preview.
- Never merge into `main`, push directly to `main`, or publish without Leo's explicit approval of the specific reviewed version. Approval to prepare fixes is not approval to publish.
- Never change Squarespace DNS, the custom domain, Google Workspace mail records, Formspree configuration or the separate Ponganoid deployment without explicit authorization.
- Mock contact form test submissions and MailApp. Actual delivery testing requires Leo's explicit authorization.
- For the Google contact handler, do not merge or publish until the owner has authorized/deployed it, `contact-config.json` has its real `/exec` URL, and the integration has been verified. See `backend/apps-script/README.md`.
- Do not add paid hosting, accounts, analytics or tracking without approval.

## Implementation

- Source: `src/main.jsx`, `src/styles.css`, `src/page.html`, `tailwind.config.mjs`.
- Image originals: `media/`; provenance is recorded in `media/sources.json`.
- `index.html` and `assets/` are generated publishing files. Do not hand-edit them. Run `npm run build` and commit output with source changes.
- Use Node 24 and `npm ci`. Keep dependencies pinned and the lockfile committed.
- Keep the current React 18 / Tailwind 3 design until a separately reviewed upgrade is justified. Do not restore CDN JavaScript or browser-side Babel.
- Production is GitHub Pages, `main` -> `/(root)`, `lobomotor.studio`, HTTPS enforced. Keep `CNAME` and `.nojekyll`.

## Verification and delivery

1. Fetch current `main`; inspect changes and repository instructions.
2. Implement the request on a branch.
3. Run `npm run lint`, `npm run build`, `npm audit --audit-level=high`, and `npm test`.
4. Review desktop/mobile screenshots, content preservation and affected external links. Distinguish deterministic tests from external service availability.
5. Prepare a PR describing changes, validation, preview/screenshots and limitations. CI attaches a downloadable `site-preview-<commit>` and browser report.
6. Await approval of the exact head commit. Additional changes require renewed review before publication.
7. After approval, merge the reviewed commit with checks passing. Monitor Pages and verify live HTTPS, approved asset hashes, content and affected interactions.
8. If needed, prepare a revert restoring known-good source AND generated assets. Get approval to publish it unless already explicitly authorized. Never force-push `main`.

## Access limits

Account permissions do not imply connector administration permissions. Do not claim branch protection is enabled until verified. README documents the one-time owner setting. Do not change the Pages publishing mode for this maintenance update.
