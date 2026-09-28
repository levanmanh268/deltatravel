#!/usr/bin/env node

const API = (process.env.LIVE_API_URL || 'https://delta-travel-api.onrender.com/api/v1').replace(
  /\/$/,
  '',
);
const TOTAL = Number(process.env.BURST_REQUESTS || 60);
const CONCURRENCY = Number(process.env.BURST_CONCURRENCY || 10);
const P95_LIMIT_MS = Number(process.env.BURST_P95_LIMIT_MS || 15000);

const targets = ['/health/ready', '/tours?page=1&pageSize=20'];

async function one(index) {
  const path = targets[index % targets.length];
  const started = performance.now();
  const response = await fetch(API + path);
  await response.arrayBuffer();
  const ms = performance.now() - started;
  return { path, status: response.status, ms };
}

for (let i = 0; i < 4; i++) await one(i);

const results = [];
let cursor = 0;
async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= TOTAL) return;
    results.push(await one(index));
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

const failures = results.filter((r) => r.status >= 500 || r.status < 200 || r.status >= 400);
if (failures.length) {
  throw new Error(
    `Burst smoke had ${failures.length}/${TOTAL} non-2xx responses: ${JSON.stringify(failures.slice(0, 5))}`,
  );
}

const sorted = results.map((r) => r.ms).sort((a, b) => a - b);
const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
const p50 = percentile(0.5);
const p95 = percentile(0.95);
const max = sorted[sorted.length - 1];

console.log(
  `BURST_METRICS total=${TOTAL} concurrency=${CONCURRENCY} p50_ms=${p50.toFixed(1)} p95_ms=${p95.toFixed(1)} max_ms=${max.toFixed(1)}`,
);

if (p95 > P95_LIMIT_MS) {
  throw new Error(`p95 ${p95.toFixed(1)}ms exceeded smoke threshold ${P95_LIMIT_MS}ms`);
}

console.log('BURST_SMOKE_PASS');
