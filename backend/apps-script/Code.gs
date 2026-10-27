/* Deploy as the owner, with public access. Requires only script.send_mail. */
const CONTACT_SETTINGS = Object.freeze({
  recipient: 'leo@lobomotor.studio',
  origins: ['https://lobomotor.studio', 'http://localhost:8000', 'http://127.0.0.1:3000'],
  hourlyLimit: 20,
  dailyLimit: 60,
  perEmailHourlyLimit: 3
});

function authorizeSender() {
  // Request Google authorization without sending a test email.
  return MailApp.getRemainingDailyQuota();
}

function doGet() {
  return HtmlService.createHtmlOutput('Lobomotor Studio contact endpoint. Submit messages from https://lobomotor.studio/.');
}

function doPost(event) {
  const fields = event && event.parameter || {};
  const requestId = typeof fields.requestId === 'string' ? fields.requestId : '';
  const origin = CONTACT_SETTINGS.origins.indexOf(fields.returnOrigin) >= 0
    ? fields.returnOrigin : CONTACT_SETTINGS.origins[0];
  let result;
  try {
    result = deliverContact_(fields, Number(event && event.contentLength || 0));
  } catch (_) {
    result = { ok: false, message: 'Your message could not be sent. Please retry or email leo@lobomotor.studio.' };
  }
  const payload = JSON.stringify({
    type: 'lobomotor-contact-result',
    requestId: /^[a-f0-9-]{36}$/i.test(requestId) ? requestId : '',
    ok: result.ok,
    message: result.message || ''
  }).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>window.top.postMessage('
    + payload + ',' + JSON.stringify(origin) + ');</script></body></html>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function digest_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (byte) { return ('0' + ((byte + 256) % 256).toString(16)).slice(-2); }).join('');
}

function deliverContact_(fields, contentLength) {
  const invalid = { ok: false, message: 'Please check your name, email and message, then try again.' };
  if (contentLength < 1 || contentLength > 32000
    || CONTACT_SETTINGS.origins.indexOf(fields.returnOrigin) < 0
    || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(fields.requestId || '')
    || fields.website || typeof fields.name !== 'string' || typeof fields.email !== 'string'
    || typeof fields.message !== 'string') return invalid;
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  if (!name || name.length > 100 || /[\r\n]/.test(name)
    || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
    || !message || message.length > 5000) return invalid;

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { ok: false, message: 'The contact form is busy. Please try again shortly.' };
  try {
    const cache = CacheService.getScriptCache();
    const fingerprint = digest_(JSON.stringify([name, email, message]));
    const sentKey = 'sent:' + fields.requestId;
    const previous = cache.get(sentKey);
    if (previous) return previous === fingerprint ? { ok: true } : invalid;
    const now = Date.now();
    const hour = Math.floor(now / 3600000);
    const day = Math.floor(now / 86400000);
    const properties = PropertiesService.getScriptProperties();
    const previousRate = JSON.parse(properties.getProperty('contact-rate') || '{}');
    const rate = {
      hour: hour, day: day,
      hourly: previousRate.hour === hour ? previousRate.hourly || 0 : 0,
      daily: previousRate.day === day ? previousRate.daily || 0 : 0
    };
    const emailKey = 'email:' + hour + ':' + digest_(email.toLowerCase());
    const emailCount = Number(cache.get(emailKey) || 0);
    if (rate.hourly >= CONTACT_SETTINGS.hourlyLimit || rate.daily >= CONTACT_SETTINGS.dailyLimit
      || emailCount >= CONTACT_SETTINGS.perEmailHourlyLimit || MailApp.getRemainingDailyQuota() < 1) {
      return { ok: false, message: 'The contact form has reached its sending limit. Please email leo@lobomotor.studio.' };
    }
    // Count attempts too, to limit abuse if Google's mail service is unavailable.
    rate.hourly++;
    rate.daily++;
    properties.setProperty('contact-rate', JSON.stringify(rate));
    cache.put(emailKey, String(emailCount + 1), 3600);
    MailApp.sendEmail({
      to: CONTACT_SETTINGS.recipient,
      replyTo: email,
      name: 'Lobomotor Studio website',
      subject: 'Website message from ' + name,
      body: 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message
    });
    cache.put(sentKey, fingerprint, 21600);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
