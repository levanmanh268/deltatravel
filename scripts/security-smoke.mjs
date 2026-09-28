#!/usr/bin/env node

const API = (process.env.LIVE_API_URL || 'https://delta-travel-api.onrender.com/api/v1').replace(
  /\/$/,
  '',
);
const WEB = (process.env.LIVE_WEB_URL || 'https://delta-travel-web.onrender.com').replace(
  /\/$/,
  '',
);

async function raw(path, init = {}) {
  const response = await fetch(API + path, { redirect: 'manual', ...init });
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {}
  return { response, body, text };
}

function expectStatus(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  console.log(`PASS  ${label}  HTTP ${actual}`);
}

let result = await raw('/admin/summary');
expectStatus('anonymous admin access denied', result.response.status, 401);

result = await raw('/bookings');
expectStatus('anonymous bookings access denied', result.response.status, 401);

result = await raw('/admin/summary', {
  headers: { Authorization: 'Bearer forged.invalid.token' },
});
expectStatus('forged bearer token rejected', result.response.status, 401);

result = await raw('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://evil.invalid',
    'X-CSRF-Protection': '1',
  },
  body: JSON.stringify({
    name: 'Security Probe',
    email: `security-probe-${Date.now()}@example.com`,
    password: 'SecurityProbe!123456789',
  }),
});
expectStatus('cross-origin registration blocked by CSRF', result.response.status, 403);

result = await raw('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: WEB,
    'X-CSRF-Protection': '1',
  },
  body: JSON.stringify({
    name: 'Security Probe',
    email: `security-role-${Date.now()}@example.com`,
    password: 'SecurityProbe!123456789',
    role: 'ADMIN',
  }),
});
expectStatus('role injection rejected by strict schema', result.response.status, 400);

result = await raw('/health/ready', {
  headers: { Origin: 'https://evil.invalid' },
});
if (result.response.headers.get('access-control-allow-origin') === 'https://evil.invalid') {
  throw new Error('Untrusted Origin was reflected by CORS');
}
console.log('PASS  untrusted Origin not granted by CORS');

result = await raw('/payments/webhooks/vnpay');
if (result.response.status !== 200 || typeof result.body !== 'object' || result.body === null) {
  throw new Error('VNPay invalid callback did not fail closed in protocol response');
}
if (result.body.RspCode === '00') {
  throw new Error('Empty VNPay callback was incorrectly accepted');
}
console.log(`PASS  invalid VNPay callback rejected  RspCode=${result.body.RspCode}`);

console.log('\nSECURITY_SMOKE_PASS');
