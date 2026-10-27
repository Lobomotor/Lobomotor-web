# Direct contact email using Google Workspace

Status: prepared for review, **not deployed or authorized**. `contact-config.json` deliberately has no endpoint. Do not merge/publish this change until the owner completes setup, the deployed endpoint is configured, and delivery is verified with the owner's permission.

The visitor fills in the existing website form and presses Send Message. A small script owned by Leo sends a plain-text email to **leo@lobomotor.studio** using Google's MailApp service. The visitor's email is Reply-To, so replying in Gmail addresses the visitor. The visitor needs no Google account, email application, or Formspree account. Mail still uses Google's infrastructure; the browser and GitHub Pages cannot send mail on their own.

## One-time setup for Leo

1. Sign into the Google Workspace account that should send the messages, ideally `leo@lobomotor.studio`, at https://script.google.com/ and create a new project named **Lobomotor website contact**.
2. Replace the initial `Code.gs` with this directory's `Code.gs`.
3. In Project Settings enable **Show appsscript.json manifest file in editor**. Replace the manifest with this directory's `appsscript.json`. It requests **send email only**, not permission to read your inbox.
4. Select `authorizeSender` in the function selector and click **Run**. Complete Google's authorization for your own script after reviewing the code and account. This helper checks the remaining sending quota; it sends no email. Do not share passwords or authorization codes with the assistant.
5. Choose **Deploy -> New deployment -> Web app**. Set **Execute as: Me** and **Who has access: Anyone**, including visitors who are not signed into Google. Authorizing the script and making this fixed-recipient handler publicly callable are owner actions. If the anonymous option is unavailable under Workspace policy, stop and discuss the account restriction; do not weaken your Workspace settings or substitute another account silently.
6. Copy the Web app URL ending in `/exec` and give that URL to the maintenance assistant. The URL is public configuration, not a password. Do not use `/dev`, an editor URL, or any OAuth token.

The assistant will put the URL in the root `contact-config.json`, test the integration, and prepare the final preview for approval. No DNS, MX, SPF, mailbox forwarding, or Squarespace changes are required by this implementation.

## Configure and verify before publishing

```json
{
  "endpoint": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
}
```

Run `npm run build` after configuration. The build copies the public JSON into `dist/`; GitHub Pages serves the root copy. No secret goes in this file or the browser bundle.

Tests mock the Google endpoint and MailApp: they never send actual mail. With Leo's explicit permission, use the reviewed preview at `http://localhost:8000` to send one clearly identified delivery test, then confirm the email arrived in Leo's mailbox and that Reply-To is correct. An acknowledgement means Google's mail call returned successfully; it is not independent proof that an email reached the inbox. Test the deployed endpoint in a signed-out browser to detect Google login restrictions before publishing. Real Google authorization, its redirect/sandbox behaviour, and inbox delivery remain unverified until this setup is complete.

After a script edit, use **Deploy -> Manage deployments -> Edit -> New version -> Deploy** to update the same deployment URL. Updating repository files alone does not update the script running on Google.

## Behaviour and safeguards

- Recipient and permitted return origins are fixed in `Code.gs`. The website posts over HTTPS to the configured Google Apps Script `/exec` URL; arbitrary endpoints are rejected.
- The handler validates lengths, email shape, request ID and honeypot, rejects header injection, and uses server-side sending limits (20/hour, 60/day, 3/hour per email) plus Google's remaining quota. These limits are adjustable in the script, are not IP-based, and do not guarantee complete bot prevention.
- The message is plain text. Visitor data is not written to a spreadsheet or echoed into the acknowledgement. The handler stores only counters and short-lived hashes for rate limiting and duplicate suppression.
- A repeated request ID with unchanged content normally returns success without resending for up to six hours. Google's cache may evict entries early, so this is best-effort duplicate suppression, not guaranteed exactly-once delivery.
- The hidden form/iframe transport follows Google's redirects and waits for a matching acknowledgement from the expected frame and a Google origin. It does not rely on `fetch(..., {mode:'no-cors'})` and cannot label an opaque response as a successful send.
- Only successful acknowledgement clears the visitor's form. Failure or a 30-second timeout preserves the message and offers Leo's email address. Retrying unchanged content reuses the request ID.
- Allowed acknowledgement targets are the live HTTPS domain and the two documented local preview origins. Add a new preview origin explicitly if needed; do not use a wildcard target.
- Google quotas and public-web-app availability depend on the authorizing account. Check deployment permissions and Apps Script Executions when investigating errors; avoid logging message bodies or visitor email addresses.

## References

- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/reference/mail/mail-app
- https://developers.google.com/apps-script/reference/html/html-output#setXFrameOptionsMode(XFrameOptionsMode)
