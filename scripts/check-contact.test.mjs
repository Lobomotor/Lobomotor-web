import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import vm from 'node:vm';

const code = await readFile('backend/apps-script/Code.gs', 'utf8');

function backend({ quota = 10, failSend = false } = {}) {
  const mail = [];
  const cache = new Map();
  const properties = new Map();
  let releases = 0;
  const context = vm.createContext({
    MailApp: {
      getRemainingDailyQuota: () => quota,
      sendEmail: message => { if (failSend) throw new Error('Service unavailable'); mail.push(JSON.parse(JSON.stringify(message))); }
    },
    CacheService: { getScriptCache: () => ({ get: key => cache.get(key) || null, put: (key, value) => cache.set(key, value) }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key) || null, setProperty: (key, value) => properties.set(key, value) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => releases++ }) },
    Utilities: { DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' }, computeDigest: (algorithm, value) => [...createHash(algorithm).update(value).digest()] },
    HtmlService: { XFrameOptionsMode: { ALLOWALL: 'allow' }, createHtmlOutput: content => ({ content, setXFrameOptionsMode() { return this; } }) }
  });
  vm.runInContext(code, context);
  return { context, mail, cache, properties, released: () => releases };
}

function fields(overrides = {}) {
  return { name: 'Visitor', email: 'visitor@example.com', message: 'Hello Leo', website: '', requestId: randomUUID(), returnOrigin: 'https://lobomotor.studio', ...overrides };
}

test('contact backend sends only to Leo with the visitor address as reply-to', () => {
  const { context, mail } = backend();
  assert.equal(context.deliverContact_(fields({ to: 'other@example.com' }), 500).ok, true);
  assert.equal(mail.length, 1);
  assert.equal(mail[0].to, 'leo@lobomotor.studio');
  assert.equal(mail[0].replyTo, 'visitor@example.com');
  assert.match(mail[0].body, /Hello Leo/);
});

test('invalid fields, header injection, honeypots and oversized submissions send nothing', () => {
  const { context, mail } = backend();
  for (const invalid of [{ name: '' }, { name: 'Bad\nHeader' }, { email: 'bad\r\n@example.com' }, { message: 'x'.repeat(5001) }, { website: 'bot' }, { returnOrigin: 'https://other.example' }, { requestId: 'invalid' }]) {
    assert.equal(context.deliverContact_(fields(invalid), 500).ok, false);
  }
  assert.equal(context.deliverContact_(fields(), 33000).ok, false);
  assert.equal(mail.length, 0);
});

test('retrying the same request does not send a second email', () => {
  const { context, mail } = backend();
  const submission = fields();
  assert.equal(context.deliverContact_(submission, 500).ok, true);
  assert.equal(context.deliverContact_(submission, 500).ok, true);
  assert.equal(context.deliverContact_({ ...submission, message: 'Changed' }, 500).ok, false);
  assert.equal(mail.length, 1);
});

test('sender rate limit and exhausted mail quota return failures', () => {
  const { context, mail } = backend();
  for (let count = 0; count < 3; count++) assert.equal(context.deliverContact_(fields(), 500).ok, true);
  assert.equal(context.deliverContact_(fields(), 500).ok, false);
  assert.equal(mail.length, 3);
  const exhausted = backend({ quota: 0 });
  assert.equal(exhausted.context.deliverContact_(fields(), 500).ok, false);
  assert.equal(exhausted.mail.length, 0);
});

test('global hourly and daily limits are enforced', () => {
  for (const values of [{ hourly: 20, daily: 20 }, { hourly: 0, daily: 60 }]) {
    const { context, properties, mail } = backend();
    properties.set('contact-rate', JSON.stringify({ hour: Math.floor(Date.now() / 3600000), day: Math.floor(Date.now() / 86400000), ...values }));
    assert.equal(context.deliverContact_(fields(), 500).ok, false);
    assert.equal(mail.length, 0);
  }
});

test('Google service failure cannot return success or expose visitor data in the acknowledgement', () => {
  const { context, mail, released } = backend({ failSend: true });
  const submission = fields({ message: '<script>private message</script>' });
  const response = context.doPost({ parameter: submission, contentLength: 500 });
  assert.match(response.content, /"ok":false/);
  assert.doesNotMatch(response.content, /private message|visitor@example/);
  assert.equal(mail.length, 0);
  assert.equal(released(), 1);
});

test('acknowledgement targets the allowed website and carries a matching request id', () => {
  const { context } = backend();
  const submission = fields();
  const response = context.doPost({ parameter: submission, contentLength: 500 });
  assert.match(response.content, /"ok":true/);
  assert.ok(response.content.includes(submission.requestId));
  assert.ok(response.content.includes('"https://lobomotor.studio"'));
  assert.doesNotMatch(response.content, /visitor@example/);
});

test('authorization helper sends no test email', () => {
  const { context, mail } = backend();
  assert.equal(context.authorizeSender(), 10);
  assert.equal(mail.length, 0);
});
