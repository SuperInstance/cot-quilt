// scripts/clients.mjs — receipted HTTP clients for the run-1 pipeline (cot-quilt).
//
// Fleet conventions honored (see lode/engine/systemone_client.mjs, qthe deepseek_guest.mjs):
//   - pricing-first: EVERY call returns a usage receipt; the orchestrator appends it
//     to the run's seeds/ledger.jsonl. No receipt, no call count.
//   - fail-closed: non-2xx / unparseable -> throw with the HTTP status; the
//     orchestrator converts to an honest FAIL row. A dead call is still a row.
//   - key discipline: keys from process.env only; never printed, never written to
//     any receipt or artifact. Error strings are scrubbed of credential-shaped
//     substrings before they can reach a receipt (incident 2026-10-01).
//
// Zero dependencies. Node >= 18.

import crypto from 'node:crypto';

// --------------------- error-string scrubber (incident law) ---------------------
const KEY_PAT = /(gsk_[A-Za-z0-9_-]{8,}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|apikey_[A-Za-z0-9_]{8,}|moth_[A-Za-z0-9]{8,}|cfut_[A-Za-z0-9_-]{8,})/g;
export function scrub(text) {
  return String(text).replace(KEY_PAT, (m) => `[${m.slice(0, 4).replace(/[-_]+$/, '')}-REDACTED]`);
}

// ------------------------------ price book ------------------------------
// Declared bases (receipted, not assumed):
//   deepseek off-peak schedule receipted by the fleet on 2026-09-27 (waves 33-c/45-b):
//     input cache-hit $0.003/1M, cache-miss $0.15/1M, output $0.6/1M (off-peak).
//   2026-10-01T23:xxZ is outside the Mon-Fri peak windows (01-04, 06-10 UTC) => off-peak.
//   No USD price book is receipted in fleet records for typesafe.ai or deepinfra:
//   those rows carry token receipts with cost_usd_declared = null.
const DS_OFFPEAK = { in_hit_per_1m: 0.003, in_miss_per_1m: 0.15, out_per_1m: 0.6 };
export function deepseekCost(usage) {
  if (!usage) return { cost_usd_declared: null, cost_basis: 'no usage' };
  const hit = usage.prompt_cache_hit_tokens ?? 0;
  const miss = (usage.prompt_tokens ?? 0) - hit;
  const out = usage.completion_tokens ?? 0;
  const usd = (hit / 1e6) * DS_OFFPEAK.in_hit_per_1m
            + (miss / 1e6) * DS_OFFPEAK.in_miss_per_1m
            + (out / 1e6) * DS_OFFPEAK.out_per_1m;
  return {
    cost_usd_declared: Math.round(usd * 1e6) / 1e6,
    cost_basis: 'deepseek off-peak schedule (fleet receipt 2026-09-27); reasoner-class rows are LOWER-BOUND approximations at the flash basis — token counts are provider-native',
  };
}
export const NO_USD_BASIS = { cost_usd_declared: null, cost_basis: 'no USD price book receipted for this provider in fleet records; token receipt only' };

// ------------------------------ helpers ------------------------------
async function timedFetch(url, opts, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  const t0 = process.hrtime.bigint();
  try {
    const res = await fetch(url, { ...opts, signal: ac.signal });
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const text = await res.text();
    let body; try { body = JSON.parse(text); } catch { body = { _raw: text.slice(0, 500) }; }
    return { res, body, ms };
  } finally { clearTimeout(t); }
}

function needKey(name) {
  const k = process.env[name];
  if (!k) throw new Error(`${name} missing — channel closed (fail-closed)`);
  return k;
}

// ------------------------------ deepseek ------------------------------
// Endpoint https://api.deepseek.com (OpenAI-compatible). Receipted fleet finding:
// requesting the legacy alias 'deepseek-chat' is served by deepseek-flash
// (DeepSeek-V4.1-Flash); 'deepseek-reasoner' is the api id of the v4-pro class.
export async function deepseekChat({ model, messages, temperature, seed, max_tokens = 8192, timeout_ms = 300_000 }) {
  const key = needKey('DEEPSEEK_API_KEY');
  const body = { model, messages, max_tokens };
  if (temperature !== undefined) body.temperature = temperature;
  if (seed !== undefined) body.seed = seed; // recorded; endpoint ignores it (receipted finding)
  const { res, body: resp, ms } = await timedFetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': 'cot-quilt/run1' },
    body: JSON.stringify(body),
  }, timeout_ms);
  if (!res.ok) {
    throw new Error(`deepseek HTTP ${res.status}: ${scrub(JSON.stringify(resp)).slice(0, 300)}`);
  }
  const ch = resp.choices?.[0]?.message ?? {};
  return {
    model_requested: model,
    model_served: resp.model ?? null,
    system_fingerprint: resp.system_fingerprint ?? null,
    finish: resp.choices?.[0]?.finish_reason ?? null,
    content: ch.content ?? null,
    reasoning_content: ch.reasoning_content ?? null,
    usage: resp.usage ?? null,
    latency_ms: Math.round(ms * 100) / 100,
    ...deepseekCost(resp.usage),
  };
}

export async function deepseekModels() {
  const key = needKey('DEEPSEEK_API_KEY');
  const { res, body: resp, ms } = await timedFetch('https://api.deepseek.com/models', {
    method: 'GET', headers: { Authorization: `Bearer ${key}` },
  }, 30_000);
  if (!res.ok) throw new Error(`deepseek models HTTP ${res.status}`);
  return { ids: (resp.data ?? []).map((m) => m.id), latency_ms: Math.round(ms * 100) / 100 };
}

// ------------------------------ typesafe.ai ------------------------------
// POST /v1/systemone  {model, state:{battery,topic}, questions:{name:{type:'noul',instructions}}}
// -> {model, answers:{name:{type:'noul',noul:<0..1>} | {type:'choice',...}}, usage:{input_tokens,output_tokens}}
// Wire shape proven by jev-garden P-G6 + the wave-48 r8 calibration battery.
export async function systemone({ state, questions, model = 'jev-1.13.0', timeout_ms = 240_000 }) {
  const key = needKey('TYPESAFE_API_KEY');
  const { res, body: resp, ms } = await timedFetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': 'cot-quilt/run1' },
    body: JSON.stringify({ model, state, questions }),
  }, timeout_ms);
  if (!res.ok) {
    throw new Error(`systemone HTTP ${res.status}: ${scrub(JSON.stringify(resp)).slice(0, 300)}`);
  }
  return {
    model_requested: model,
    model_served: resp.model ?? model,
    answers: resp.answers ?? null,
    usage: resp.usage ?? null,
    latency_ms: Math.round(ms * 100) / 100,
    ...NO_USD_BASIS,
  };
}

// ------------------------------ deepinfra ------------------------------
// Endpoint https://api.deepinfra.com/v1/openai (OpenAI-compatible chat/completions).
export async function deepinfraChat({ model, messages, temperature = 0.4, max_tokens = 4096, timeout_ms = 240_000 }) {
  const key = needKey('DEEPINFRA_API_KEY');
  const { res, body: resp, ms } = await timedFetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': 'cot-quilt/run1' },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  }, timeout_ms);
  if (!res.ok) {
    throw new Error(`deepinfra HTTP ${res.status}: ${scrub(JSON.stringify(resp)).slice(0, 300)}`);
  }
  const ch = resp.choices?.[0]?.message ?? {};
  return {
    model_requested: model,
    model_served: resp.model ?? model,
    finish: resp.choices?.[0]?.finish_reason ?? null,
    content: ch.content ?? null,
    usage: resp.usage ?? null,
    latency_ms: Math.round(ms * 100) / 100,
    ...NO_USD_BASIS,
  };
}

export async function deepinfraModels() {
  const key = needKey('DEEPINFRA_API_KEY');
  const { res, body: resp, ms } = await timedFetch('https://api.deepinfra.com/v1/openai/models', {
    method: 'GET', headers: { Authorization: `Bearer ${key}` },
  }, 30_000);
  if (!res.ok) throw new Error(`deepinfra models HTTP ${res.status}`);
  return { ids: (resp.data ?? []).map((m) => m.id), latency_ms: Math.round(ms * 100) / 100 };
}

export function sha256(s) { return crypto.createHash('sha256').update(s, 'utf8').digest('hex'); }
