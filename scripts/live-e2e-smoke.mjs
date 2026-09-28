import { randomBytes } from 'node:crypto';

const API = 'https://delta-travel-api.onrender.com/api/v1';
const WEB = 'https://delta-travel-web.onrender.com';
const pass = (name, detail = '') => console.log('PASS', name, detail);
const info = (name, value) => console.log('INFO', name, JSON.stringify(value));

async function retry(url, options = {}) {
  let last;
  for (let i = 0; i < 12; i += 1) {
    try {
      const res = await fetch(url, options);
      if (res.status < 500) return res;
      last = new Error('HTTP ' + res.status);
    } catch (error) {
      last = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw last;
}

async function request(path, { method = 'GET', token, body, expectedStatus } = {}) {
  const response = await retry(API + path, {
    method,
    headers: {
      Origin: WEB,
      'X-CSRF-Protection': '1',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {}
  if (expectedStatus !== undefined) {
    if (response.status !== expectedStatus) {
      throw new Error(path + ' expected ' + expectedStatus + ', got ' + response.status + ': ' + text.slice(0, 500));
    }
    return parsed;
  }
  if (!response.ok) {
    throw new Error(path + ' -> ' + response.status + ': ' + text.slice(0, 700));
  }
  return parsed?.data;
}

async function page(path) {
  const response = await retry(WEB + path, { redirect: 'follow' });
  const html = await response.text();
  if (!response.ok) throw new Error('WEB ' + path + ' -> ' + response.status);
  if (/Application error|Internal Server Error/i.test(html)) throw new Error('WEB ' + path + ' rendered an error');
  pass('web ' + path, 'HTTP ' + response.status + ', bytes=' + html.length);
  return html;
}

await page('/');
const assistantPage = await page('/assistant');
if (!/AI|Agent|Trợ lý/i.test(assistantPage)) throw new Error('/assistant lacks AI/Agent content');
await page('/tours');

const live = await request('/health/live');
if (live?.status !== 'ok') throw new Error('health/live not ok');
pass('health/live');

const ready = await request('/health/ready');
if (ready?.status !== 'ok') throw new Error('health/ready not ok');
pass('health/ready');

const integrations = await request('/health/integrations');
info('integrations', integrations);

const providerStatus = await request('/assistant/provider-status');
info('assistant provider', providerStatus);

const capabilities = await request('/payments/providers/status');
const byProvider = Object.fromEntries((capabilities?.providers || []).map((item) => [item.provider, item]));
for (const provider of ['CASH', 'VNPAY', 'MOMO', 'ZALOPAY']) {
  if (!byProvider[provider]) throw new Error('missing capability ' + provider);
}
if (!byProvider.CASH.available || byProvider.CASH.environment !== 'INTERNAL') {
  throw new Error('CASH capability is not live/internal');
}
for (const provider of ['VNPAY', 'MOMO', 'ZALOPAY']) {
  const item = byProvider[provider];
  if (item.available && !['SANDBOX', 'PRODUCTION'].includes(item.environment)) {
    throw new Error(provider + ' is available without a real environment');
  }
  if (!item.available && item.environment !== 'UNCONFIGURED') {
    throw new Error(provider + ' unavailable state is not fail-closed');
  }
}
pass('payment capability', capabilities.providers.map((x) => x.provider + ':' + x.environment).join(', '));

const chat = await request('/assistant/chat', {
  method: 'POST',
  body: {
    message: 'Tìm một tour nội địa Việt Nam cho 1 người lớn, chỉ dùng dữ liệu thật trong hệ thống.',
    lang: 'vi',
    history: [],
  },
});
if (!chat?.mode || !Array.isArray(chat.sources)) throw new Error('assistant/chat malformed');
pass('assistant/chat', 'mode=' + chat.mode + ', sources=' + chat.sources.length);

const suffix = Date.now() + '-' + randomBytes(3).toString('hex');
const email = 'live-smoke-' + suffix + '@example.com';
const password = 'Smoke!' + randomBytes(12).toString('hex') + 'Aa1';
const auth = await request('/auth/register', {
  method: 'POST',
  body: { name: 'Live Smoke Test', email, password },
});
if (!auth?.accessToken || auth?.user?.email !== email) throw new Error('register/session mismatch');
const token = auth.accessToken;
pass('auth/register');

const me = await request('/auth/me', { token });
if (me?.email !== email || me?.role !== 'CUSTOMER') throw new Error('auth/me mismatch');
pass('auth/me');

const tours = await request('/tours?page=1&pageSize=100');
let chosen = null;
for (const tour of tours?.items || []) {
  const schedules = await request('/tours/' + tour.id + '/schedules?page=1&pageSize=100');
  const schedule = (schedules?.items || []).find(
    (item) =>
      item.status === 'OPEN' &&
      item.availableSeats >= 1 &&
      new Date(item.departureAt).getTime() - Date.now() >= 72 * 60 * 60 * 1000,
  );
  if (schedule) {
    chosen = { tour, schedule };
    break;
  }
}
if (!chosen) throw new Error('no future OPEN schedule with inventory');
pass('catalog schedule', chosen.tour.title);

let plan = await request('/assistant/agent/plans', {
  method: 'POST',
  token,
  body: {
    message: 'Tôi muốn đặt đúng lịch tour đã chọn cho 1 người lớn. Không tạo booking trước khi tôi duyệt.',
    lang: 'vi',
    adults: 1,
    children: 0,
    scheduleId: chosen.schedule.id,
  },
});
if (plan.booking || plan.payment) throw new Error('agent side effect happened before approval');
if (plan.status !== 'NEEDS_INPUT') throw new Error('expected NEEDS_INPUT, got ' + plan.status);
if (!plan.missingFields.includes('CONTACT_PHONE') || !plan.missingFields.includes('PAYMENT_METHOD')) {
  throw new Error('agent missing-field gate is incomplete');
}
pass('agent pre-approval', plan.missingFields.join(','));

plan = await request('/assistant/agent/plans/' + plan.id, {
  method: 'PATCH',
  token,
  body: { contactPhone: '0901234567', provider: 'CASH', scheduleId: chosen.schedule.id },
});
if (!['READY_FOR_APPROVAL', 'REAPPROVAL_REQUIRED'].includes(plan.status)) {
  throw new Error('agent not ready for approval: ' + plan.status);
}
if (!plan.checkpoint?.requiresExplicitApproval || plan.booking || plan.payment) {
  throw new Error('explicit approval checkpoint invariant failed');
}
pass('agent checkpoint', 'version=' + plan.version);

if (plan.version > 1) {
  const stale = await request('/assistant/agent/plans/' + plan.id + '/approve', {
    method: 'POST',
    token,
    body: { approved: true, version: plan.version - 1 },
    expectedStatus: 409,
  });
  if (stale?.error?.code !== 'AGENT_STALE_APPROVAL') throw new Error('stale approval was not rejected safely');
  const unchanged = await request('/assistant/agent/plans/' + plan.id, { token });
  if (unchanged.booking || unchanged.payment) throw new Error('stale approval created a side effect');
  pass('stale approval rejected');
}

let executed = await request('/assistant/agent/plans/' + plan.id + '/approve', {
  method: 'POST',
  token,
  body: { approved: true, version: plan.version },
});
if (executed.status === 'REAPPROVAL_REQUIRED') {
  pass('price-change reapproval', 'version=' + executed.version);
  executed = await request('/assistant/agent/plans/' + plan.id + '/approve', {
    method: 'POST',
    token,
    body: { approved: true, version: executed.version },
  });
}
if (executed.status !== 'COMPLETED') throw new Error('CASH agent did not complete: ' + executed.status);
if (executed.booking?.status !== 'AWAITING_CASH') throw new Error('booking is not AWAITING_CASH');
if (executed.payment?.provider !== 'CASH' || executed.payment?.status !== 'INITIATED' || executed.payment?.checkoutUrl !== null) {
  throw new Error('CASH payment incorrectly reports online-payment semantics');
}
pass('agent booking + CASH', executed.booking.id);

const replay = await request('/assistant/agent/plans/' + plan.id + '/approve', {
  method: 'POST',
  token,
  body: { approved: true, version: executed.version },
});
if (replay.booking?.id !== executed.booking.id) throw new Error('approval replay created a second booking');
pass('agent approval idempotent');

const cancelled = await request('/bookings/' + executed.booking.id + '/cancel', {
  method: 'POST',
  token,
  body: { reason: 'Automated live smoke cleanup' },
});
if (cancelled?.status !== 'CANCELLED') throw new Error('booking cleanup failed');
pass('booking cleanup');

console.log('LIVE_E2E_SMOKE=PASS');
console.log('AI=' + providerStatus.preferredProvider);
console.log('PAYMENTS=' + capabilities.providers.map((x) => x.provider + ':' + x.environment).join(','));
