const RESULT_TYPE = 'lobomotor-contact-result';
const TIMEOUT_MESSAGE = 'Delivery could not be confirmed. Your message is still here. Please retry or email leo@lobomotor.studio.';

function isGoogleOrigin(origin) {
  return origin === 'https://script.google.com'
    || origin === 'https://script.googleusercontent.com'
    || /^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(origin);
}

function belongsToFrame(source, frame) {
  try {
    for (let depth = 0; source && depth < 4; depth++) {
      if (source === frame.contentWindow) return true;
      if (source === window || source.parent === source) break;
      source = source.parent;
    }
  } catch { /* A message outside this frame cannot confirm delivery. */ }
  return false;
}

export async function sendContactMessage(fields, requestId) {
  let endpoint;
  try {
    const response = await fetch('./contact-config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Configuration unavailable');
    ({ endpoint } = await response.json());
  } catch {
    throw new Error('The contact form is unavailable. Please email leo@lobomotor.studio.');
  }
  if (typeof endpoint !== 'string' || !/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(endpoint)) {
    throw new Error('The contact form is not configured yet. Please email leo@lobomotor.studio.');
  }

  // A native POST works across Google's redirects without exposing mail credentials
  // or treating an opaque no-cors response as proof of sending.
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    const transport = document.createElement('form');
    frame.name = `contact-${requestId}`;
    frame.title = 'Contact message delivery';
    frame.hidden = true;
    transport.method = 'POST';
    transport.action = endpoint;
    transport.target = frame.name;
    transport.hidden = true;
    const values = { ...fields, requestId, returnOrigin: window.location.origin };
    for (const [name, value] of Object.entries(values)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      transport.append(input);
    }
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      frame.remove();
      transport.remove();
    };
    const onMessage = event => {
      const data = event.data;
      if (!isGoogleOrigin(event.origin) || !belongsToFrame(event.source, frame)
        || !data || data.type !== RESULT_TYPE || data.requestId !== requestId || typeof data.ok !== 'boolean') return;
      cleanup();
      if (data.ok) resolve();
      else reject(new Error(typeof data.message === 'string' ? data.message : 'Your message could not be sent. Please retry.'));
    };
    const timer = setTimeout(() => { cleanup(); reject(new Error(TIMEOUT_MESSAGE)); }, 30000);
    window.addEventListener('message', onMessage);
    document.body.append(frame, transport);
    try { HTMLFormElement.prototype.submit.call(transport); }
    catch { cleanup(); reject(new Error(TIMEOUT_MESSAGE)); }
  });
}
