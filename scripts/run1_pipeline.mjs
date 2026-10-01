#!/usr/bin/env node
// scripts/run1_pipeline.mjs — cot-quilt RUN-1: DeepSeek CoT -> cellular graph
// (situational learning & development run, lane 63-a, dog-fooding fleet question
//  FLEET-Q-REWIND-ORGAN; cross-feeds lane 63-c as an organ-candidate spec).
//
// PHASES (each call receipted into runs/<run>/seeds/ledger.jsonl — append-only):
//   0 PROBE     deepseek GET /models + deepinfra GET /models (model-id discovery)
//   1 COMPOSE   1x deepseek-reasoner (v4-pro class): extended numbered CoT trace
//   2 DECOMP-F  3x deepseek-flash at temperatures 0.2/0.7/1.1 (seeds recorded;
//               identical prefix for prompt-cache hits, diversity via temperature)
//   3 DECOMP-T  1x typesafe jev-1.13.0 systemone battery: per-point noul load
//               probabilities -> the second, independent decomposer arm
//   4 MERGE     LOCAL deterministic cluster-merge + diff of the two arms (no call);
//               DAG repair receipted; then 1x flash cross-review of typesafe-only
//               nodes (compose/test separation: no model judges its own nodes)
//   5 JUDGE     (a) 1x typesafe noul probability battery on the merged graph,
//               (b) 1x deepinfra Hermes-3-405B adversarial attack (missing/faulty
//               nodes) -> judges/verdict.json + judges/adversarial.md; critique
//               folded back as origin='adversarial-critique' cells
//   6 EXPORT    graph.json + exports/organ-candidate-rewind.json + cot_raw.md
//               + README/RUN-REPORT scaffolding with the run's real numbers
//
// BUDGET: <= ~20 provider calls total (planned 10, reserves for JSON repair).
// Resume-safe: each phase writes state/<phase>.json atomically; re-run skips done.
//
// RUN:  set -a; . /home/z/my-project/.env.keys; set +a
//       node scripts/run1_pipeline.mjs [--run runs/2026-10-01-run1]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  deepseekChat, deepseekModels, systemone, deepinfraChat, deepinfraModels, sha256,
} from './clients.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const getArg = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const RUN = path.resolve(REPO, getArg('--run', 'runs/2026-10-01-run1'));
const LEDGER = path.join(RUN, 'seeds', 'ledger.jsonl');
const STATE = path.join(RUN, 'state');
for (const d of [RUN, path.join(RUN, 'seeds'), STATE, path.join(RUN, 'judges'), path.join(REPO, 'exports')]) {
  fs.mkdirSync(d, { recursive: true });
}

// ------------------------- atomic write (fleet lesson) -------------------------
function writeAtomic(file, text) {
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}
const loadState = (name) => {
  const f = path.join(STATE, `${name}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
};
const saveState = (name, obj) => writeAtomic(path.join(STATE, `${name}.json`), JSON.stringify(obj, null, 1));

// ------------------------- the receipted ledger -------------------------
let callCounter = 0;
function receipt(row) {
  callCounter += 1;
  const rec = {
    row: callCounter,
    ts_utc: new Date().toISOString(),
    run: path.basename(RUN),
    ...row,
  };
  fs.appendFileSync(LEDGER, JSON.stringify(rec) + '\n');
  console.log(`  receipt #${rec.row}: ${rec.phase} ${rec.service}/${rec.model_requested} status=${rec.status} ${rec.usage_summary ?? ''}`);
  return rec;
}

// ------------------------- the fleet question (verbatim) -------------------------
export const QUESTION_ID = 'FLEET-Q-REWIND-ORGAN';
export const QUESTION = 'How should a quilt system use its cells\' double-entry book-keeping (receipt chains) to rewind, snapshot, and save the state of individual cells, groups of cells (organs), or an entire quilt, so the saved state is a bootable drop-in that can nest inside another program or quilt? Specify the mechanisms, invariants, and failure modes.';

const SEEDS = [
  { temperature: 0.2, label: 't02' },
  { temperature: 0.7, label: 't07' },
  { temperature: 1.1, label: 't11' },
];

// Seed derivation: deterministic from the CoT content hash. HONESTY NOTE
// (receipted): NOT certified quantum entropy (mothquantum is outside this lane's
// budget envelope); the deepseek endpoint ignores `seed` anyway (receipted fleet
// finding) — seeds are book-keeping, temperature is the diversity mechanism.
function deriveSeeds(cotSha) {
  const h = sha256(`cot-quilt-run1-seeds:${cotSha}`);
  return SEEDS.map((s, i) => ({
    ...s,
    seed_int: parseInt(h.slice(i * 4, i * 4 + 4), 16),
    seed_hex: h.slice(i * 4, i * 4 + 4),
    source: 'sha256-derived (non-quantum, receipted)',
  }));
}

async function callAndReceipt(phase, service, model, fn, extra = {}) {
  try {
    const r = await fn();
    receipt({
      phase, service, model_requested: model, model_served: r.model_served ?? null,
      seed: extra.seed ?? null, temperature: extra.temperature ?? null,
      purpose: extra.purpose ?? phase, status: 'OK',
      latency_ms: r.latency_ms, usage: r.usage ?? null,
      usage_summary: r.usage ? `in=${r.usage.prompt_tokens ?? r.usage.input_tokens ?? '?'} out=${r.usage.completion_tokens ?? r.usage.output_tokens ?? '?'}` : '',
      finish: r.finish ?? null,
      cost_usd_declared: r.cost_usd_declared ?? null,
      cost_basis: r.cost_basis ?? null,
      request_sha256: extra.request_sha256 ?? null,
      notes: extra.notes ?? null,
    });
    return r;
  } catch (e) {
    receipt({
      phase, service, model_requested: model, model_served: null,
      seed: extra.seed ?? null, temperature: extra.temperature ?? null,
      purpose: extra.purpose ?? phase, status: 'FAIL', error: String(e.message || e).slice(0, 300),
      cost_usd_declared: null, cost_basis: 'failed call — still a row (honest failures receipted)',
      notes: extra.notes ?? null,
    });
    throw e;
  }
}

// =========================================================================
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), '-', ...a);

// ------------------------- PHASE 0: PROBE -------------------------
async function phaseProbe() {
  let st = loadState('probe');
  if (st) { log('probe: cached'); return st; }
  log('phase 0 PROBE (model-id discovery)');
  const ds = await callAndReceipt('probe', 'deepseek', 'GET /models', () => deepseekModels(), { purpose: 'model-id discovery' });
  const di = await callAndReceipt('probe', 'deepinfra', 'GET /models', () => deepinfraModels(), { purpose: 'model-id discovery' });
  const pick = (ids, prefs) => prefs.map((p) => ids.find((id) => p.test(id))).find(Boolean) ?? null;
  st = {
    ts_utc: new Date().toISOString(),
    deepseek_ids: ds.ids,
    deepinfra_id_count: di.ids.length,
    compose_model: pick(ds.ids, [/^deepseek-reasoner$/]) ?? pick(ds.ids, [/reasoner/, /v4-pro/]),
    flash_model: pick(ds.ids, [/^deepseek-chat$/]) ?? pick(ds.ids, [/flash/]),
    hermes_model: pick(di.ids, [/hermes-3.*405b/i, /hermes.*405b/i]),
    deepinfra_sample_ids: di.ids.slice(0, 40),
  };
  if (!st.compose_model || !st.flash_model) throw new Error(`fail-closed: deepseek models list lacks reasoner/flash ids: ${JSON.stringify(ds.ids)}`);
  if (!st.hermes_model) throw new Error(`fail-closed: no hermes-3-405b-class model on deepinfra (sample: ${JSON.stringify(st.deepinfra_sample_ids)})`);
  saveState('probe', st);
  log(`probe: compose=${st.compose_model} flash=${st.flash_model} hermes=${st.hermes_model}`);
  return st;
}

// ------------------------- PHASE 1: COMPOSE -------------------------
async function phaseCompose(probe) {
  let st = loadState('compose');
  if (st) { log('compose: cached'); return st; }
  log('phase 1 COMPOSE (1x v4-pro class CoT)');
  const system = `You are the CoT composer of the cot-quilt pipeline (SuperInstance fleet). Produce an EXTENDED chain-of-thought reasoning trace on the fleet question below. The trace itself is the deliverable: it will be decomposed point-by-point into a cellular graph by cheaper models, so it must be:
(1) EXTENDED: 22-30 numbered reasoning points, written as "P1." .. "Pn.", each 2-6 sentences, one idea per point;
(2) MECHANISM-FIRST: every mechanism is named with its concrete book-keeping — the actual fields, ledger rows, hashes, journal records, file formats — never vibes;
(3) COMPLETE over the three asked dimensions — mechanisms, invariants, failure modes — for each of: rewind, snapshot, save-as-bootable-drop-in, and nesting; at each of the three granularities: single cell, organ (named group of cells), whole quilt;
(4) HONEST: where a mechanism has a cost or a failure mode, say it in the SAME point;
(5) SELF-CONTAINED: no references to any conversation, no meta-commentary.

Fleet context (true; cite freely): a quilt is a reactive spreadsheet-like runtime whose state lives in CELLS. Each cell keeps DOUBLE-ENTRY BOOK-KEEPING: every state transition appends a receipt to that cell's hash-chained receipt log (the receipt chain); a receipt records what changed (before/after images), why (the triggering input or the exact dependency versions observed), and the hash of the previous receipt. Organs are named groups of cells acting as one unit; a quilt can nest inside another program or inside a larger quilt as a sub-quilt with its own exposed cells.`;
  const user = `FLEET QUESTION (answer it via the numbered reasoning trace):\n${QUESTION}\n\nBegin now. Format: a heading line "TRACE", then the numbered points P1..Pn, then a heading line "ANSWER" with a compact summary (<=200 words).`;
  const r = await callAndReceipt('compose', 'deepseek', probe.compose_model,
    () => deepseekChat({ model: probe.compose_model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 8192, timeout_ms: 600_000 }),
    { purpose: 'extended CoT on FLEET-Q-REWIND-ORGAN', notes: 'requested model name deepseek-v4-pro; api id per probe' });
  if (!r.content || r.finish === 'length') {
    // burn-guard (receipted finding: reasoner can spend the whole budget on reasoning)
    const r2 = await callAndReceipt('compose-retry', 'deepseek', probe.compose_model,
      () => deepseekChat({ model: probe.compose_model, messages: [{ role: 'system', content: system }, { role: 'user', content: user + '\n\nBUDGET GUARD: the trace must fit; be concise per point.' }], max_tokens: 8192, timeout_ms: 600_000 }),
      { purpose: 'burn-guard retry at 2x budget' });
    st = { r: r2, system_sha256: sha256(system), user_sha256: sha256(user) };
  } else {
    st = { r, system_sha256: sha256(system), user_sha256: sha256(user) };
  }
  saveState('compose', st);
  log(`compose: served=${st.r.model_served} finish=${st.r.finish} cot_chars=${(st.r.content ?? '').length} reasoning_chars=${(st.r.reasoning_content ?? '').length}`);
  return st;
}

// ------------------------- PHASE 2: DECOMPOSE-FLASH -------------------------
const FLASH_SYSTEM = `You are the flash decomposer of the cot-quilt pipeline. Input: an extended numbered chain-of-thought (points P1..Pn) answering a fleet question about cell rewind/snapshot/save via receipt chains. Output: STRICT JSON array decomposing it point-by-point into ATOMIC cellular nodes.
Schema per node: {"point":"P7","title":"<=6 words","content":"1-3 sentences, atomic, self-contained, faithful to the CoT","weight":0.75,"deps":["P3","P7"]}
- "weight" = how load-bearing this node is for the QUESTION's answer (0..1).
- "deps" = the points this node's correctness depends on (subset of points at or before its own point; DAG; no self-dependency).
Rules:
- ATOMIC: one mechanism / invariant / failure-mode per node; split compound points into multiple nodes.
- COVERAGE: every point P1..Pn yields at least one node (a purely transitional point may yield one node with weight < 0.2 saying it is transitional bookkeeping).
- 24-40 nodes total.
- Output ONLY the JSON array. No markdown fences, no prose, no trailing text.`;

function parseJsonArray(raw) {
  const s = raw.indexOf('['); const e = raw.lastIndexOf(']');
  if (s < 0 || e <= s) throw new Error('no JSON array found');
  const arr = JSON.parse(raw.slice(s, e + 1));
  if (!Array.isArray(arr) || !arr.length) throw new Error('empty/invalid array');
  return arr;
}

async function phaseDecomposeFlash(probe, compose, seeds) {
  let st = loadState('decompose_flash');
  if (st) { log('decompose_flash: cached'); return st; }
  log('phase 2 DECOMPOSE-FLASH (3 seeds, cache-friendly identical prefix)');
  const cot = compose.r.content ?? '';
  const userBase = `FLEET QUESTION:\n${QUESTION}\n\nCHAIN-OF-THOUGHT (verbatim):\n${cot}\n`;
  st = { model: probe.flash_model, system_sha256: sha256(FLASH_SYSTEM), runs: [] };
  for (const s of seeds) {
    const user = `${userBase}(seed book-keeping: temperature=${s.temperature}, seed=${s.seed_int}; decomposition diversity comes from temperature; stay faithful to the CoT.)`;
    let raw, r, repaired = false;
    try {
      r = await callAndReceipt('decompose_flash', 'deepseek', probe.flash_model,
        () => deepseekChat({ model: probe.flash_model, messages: [{ role: 'system', content: FLASH_SYSTEM }, { role: 'user', content: user }], temperature: s.temperature, seed: s.seed_int, max_tokens: 6000 }),
        { seed: s.seed_int, temperature: s.temperature, purpose: `flash decomposition seed t=${s.temperature}`, request_sha256: sha256(user), notes: 'identical prefix across seeds for prompt-cache hits' });
      raw = r.content;
      st.runs.push({ ...s, nodes: parseJsonArray(raw), raw_len: raw.length, repaired });
    } catch (e) {
      // JSON repair loop: one receipted retry (a dead call is still a row)
      log(`  seed ${s.temperature}: parse/HTTP issue -> receipted repair retry (${String(e.message).slice(0, 80)})`);
      r = await callAndReceipt('decompose_flash_repair', 'deepseek', probe.flash_model,
        () => deepseekChat({ model: probe.flash_model, messages: [{ role: 'user', content: `The following was supposed to be a STRICT JSON array of decomposition nodes but is broken or empty. Return the repaired STRICT JSON array ONLY.\n\n=== broken output ===\n${(r?.content ?? String(e.message)).slice(0, 6000)}\n\n=== original CoT (verbatim) ===\n${cot.slice(0, 40000)}\n\nRemind yourself of the schema: {"point","title","content","weight","deps"}.` }], temperature: 0.0, max_tokens: 6000 }),
        { seed: s.seed_int, temperature: 0.0, purpose: `JSON repair for seed t=${s.temperature}` });
      repaired = true;
      st.runs.push({ ...s, nodes: parseJsonArray(r.content), raw_len: r.content.length, repaired });
    }
    log(`  seed t=${s.temperature}: ${st.runs.at(-1).nodes.length} nodes`);
  }
  saveState('decompose_flash', st);
  return st;
}

// ------------------------- PHASE 3: DECOMPOSE-TYPESAFE -------------------------
function splitPoints(cot) {
  const lines = cot.split('\n');
  const marks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*P(\d+)[\.\):]/);
    if (m) marks.push({ n: Number(m[1]), line: i });
  }
  const points = [];
  for (let k = 0; k < marks.length; k++) {
    const end = k + 1 < marks.length ? marks[k + 1].line : lines.length;
    const text = lines.slice(marks[k].line, end).join('\n').trim();
    if (text.length > 0) points.push({ n: marks[k].n, text });
  }
  return points;
}

async function phaseDecomposeTypesafe(probe, compose) {
  let st = loadState('decompose_typesafe');
  if (st) { log('decompose_typesafe: cached'); return st; }
  log('phase 3 DECOMP-TYPESAFE (1x jev-1.13.0 noul battery: per-point load probabilities)');
  const cot = compose.r.content ?? '';
  const points = splitPoints(cot).slice(0, 48); // battery cap receipted in notes
  if (!points.length) throw new Error('fail-closed: no P<n> points found in CoT for typesafe decomposition');
  const questions = {};
  for (const p of points) {
    questions[`p_load_P${p.n}`] = {
      type: 'noul',
      instructions: `p = probability that CoT point P${p.n} (see STATE) states a load-bearing mechanism, invariant, or failure mode that MUST become a cell in the cellular graph (as opposed to transitional bookkeeping or repetition of an earlier point). Consider the full STATE. Reply with the probability only.`,
    };
  }
  const r = await callAndReceipt('decompose_typesafe', 'typesafe', 'jev-1.13.0',
    () => systemone({
      model: 'jev-1.13.0',
      state: { battery: 'cot-quilt-run1-decompose', topic: QUESTION, cot: cot.slice(0, 20000) },
      questions,
    }),
    { purpose: 'independent decomposer arm: per-point load-bearing noul probabilities', notes: `questions=${points.length}; state.cot truncated to 20000 chars (fleet precedent)` });
  st = { model: r.model_served, points, answers: r.answers, usage: r.usage };
  saveState('decompose_typesafe', st);
  const kept = points.filter((p) => (r.answers?.[`p_load_P${p.n}`]?.noul ?? 0) >= 0.5);
  log(`  typesafe arm: ${points.length} points scored, ${kept.length} kept at noul>=0.5`);
  return st;
}

// ------------------------- PHASE 4: MERGE (local, deterministic) -------------------------
const STOP = new Set('the a an and or of to in on for with by is are be as that this it its from at into not can must should when then if each per any all you your we they their will would could may might one two use used using via how what which who whose why where'.split(' '));
function tokens(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}
function jaccard(a, b) {
  const A = new Set(a); const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return uni ? inter / uni : 0;
}
const SIM_THRESHOLD = 0.42;

function clusterFlash(runs) {
  const items = [];
  runs.forEach((run, si) => {
    run.nodes.forEach((n, ni) => {
      items.push({
        seed: run.temperature, si, ni,
        point: String(n.point ?? '?').toUpperCase().replace(/^P?(\d+).*$/, 'P$1'),
        title: String(n.title ?? ''), content: String(n.content ?? ''),
        weight: Math.min(1, Math.max(0, Number(n.weight) || 0)),
        deps: Array.isArray(n.deps) ? n.deps.map(String) : [],
        toks: tokens(`${n.title} ${n.content}`),
      });
    });
  });
  // single-linkage, deterministic order
  const clusters = [];
  for (const it of items) {
    let best = null; let bestSim = 0;
    for (const c of clusters) {
      const samePoint = c.point === it.point ? 1.15 : 0.9;
      const sim = jaccard(c.toks, it.toks) * samePoint;
      if (sim > bestSim) { bestSim = sim; best = c; }
    }
    if (best && bestSim >= SIM_THRESHOLD) { best.members.push(it); }
    else clusters.push({ point: it.point, toks: it.toks, members: [it] });
  }
  return clusters;
}

function mergeArm(clusters, tsState) {
  const merged = clusters.map((c, i) => {
    const members = c.members;
    const top = [...members].sort((a, b) => b.weight - a.weight || b.content.length - a.content.length)[0];
    const seedSet = [...new Set(members.map((m) => m.seed))];
    const m = {
      id: `N${String(i + 1).padStart(2, '0')}`,
      point: c.point,
      title: top.title || `cell from ${c.point}`,
      content: top.content,
      weight: Math.round((members.reduce((s, x) => s + x.weight, 0) / members.length) * 1000) / 1000,
      seed_votes: seedSet.length,
      seeds: seedSet,
      composers: seedSet.map((t) => `flash@${t}`),
      stability: seedSet.length === 3 ? 'core' : seedSet.length === 2 ? 'stable' : 'volatile',
      origin: 'flash-decompose',
      status: 'active',
      _members: members,
      _toks: c.toks,
    };
    return m;
  });

  // typesafe arm folded in (independent decomposer, jev-1.13.0)
  const tsOnly = [];
  if (tsState) {
    for (const p of tsState.points) {
      const pLoad = tsState.answers?.[`p_load_P${p.n}`]?.noul;
      if (pLoad === undefined) continue;
      const first3 = p.text.split(/(?<=\.)\s+/).slice(0, 3).join(' ');
      const node = {
        id: `TS-P${p.n}`,
        point: `P${p.n}`,
        title: `point P${p.n} (jev load ${(Math.round(pLoad * 100) / 100)})`,
        content: first3,
        weight: Math.round(pLoad * 1000) / 1000,
        deps: [...p.text.matchAll(/P(\d+)/g)].map((m) => `P${m[1]}`)
          .filter((x) => Number(x.slice(1)) < p.n),
        seed_votes: 0,
        seeds: [],
        composers: ['typesafe@jev-1.13.0'],
        stability: 'typesafe-only',
        origin: 'typesafe-decompose',
        status: 'active',
        _toks: tokens(first3),
        _text: p.text,
      };
      const samePoint = merged.filter((m) => m.point === node.point);
      let best = null; let bestSim = 0;
      for (const m of samePoint) {
        const sim = jaccard(m._toks, node._toks);
        if (sim > bestSim) { bestSim = sim; best = m; }
      }
      if (best && bestSim >= SIM_THRESHOLD) {
        best.composers.push('typesafe@jev-1.13.0');
        best.weight = Math.round(((best.weight + node.weight) / 2) * 1000) / 1000;
        best.ts_load = node.weight;
      } else {
        tsOnly.push(node);
      }
    }
  }
  return { merged, tsOnly };
}

function resolveEdges(nodes, notes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges = new Map();
  for (const n of nodes) {
    const depPoints = [...new Set((n.deps ?? []).map((d) => String(d).toUpperCase().replace(/^P?(\d+).*$/, 'P$1')))];
    for (const dp of depPoints) {
      if (dp === n.point) continue; // no self-edge
      let target = nodes.filter((m) => m.id !== n.id && m.point === dp)
        .sort((a, b) => (b.weight + (b.seed_votes ?? 0) * 0.1) - (a.weight + (a.seed_votes ?? 0) * 0.1))[0];
      if (!target) {
        // inferred-chain fallback: depend on the strongest node of the numerically
        // previous point (receipted as inferred, not asserted)
        const prevNum = Number(n.point.slice(1)) - 1;
        target = nodes.filter((m) => m.point === `P${prevNum}` && m.id !== n.id)
          .sort((a, b) => b.weight - a.weight)[0];
        if (target) notes.push(`inferred-chain edge ${target.id}->${n.id} (dep point ${dp} had no node)`);
      }
      if (!target) { notes.push(`dropped dep ${dp} of ${n.id}: no target`); continue; }
      const k = `${target.id}->${n.id}`;
      if (!edges.has(k)) edges.set(k, { from: target.id, to: n.id, asserted_by: [] });
      edges.get(k).asserted_by.push(n.composers[0]);
    }
  }
  const list = [...edges.values()].map((e) => ({
    ...e,
    weight: Math.round((e.asserted_by.length / Math.max(1, byId.get(e.to).composers.length)) * 1000) / 1000,
  }));
  // DAG repair: Kahn's algorithm; break cycles at the lowest-weight edge
  const adj = new Map(list.map((e) => [e.from, []]));
  list.forEach((e) => adj.get(e.from).push(e));
  const indeg = new Map(nodes.map((n) => [n.id, 0]));
  list.forEach((e) => indeg.set(e.to, indeg.get(e.to) + 1));
  const q = nodes.filter((n) => indeg.get(n.id) === 0).map((n) => n.id);
  const seen = new Set();
  while (q.length) {
    const u = q.shift();
    seen.add(u);
    for (const e of (adj.get(u) ?? [])) {
      indeg.set(e.to, indeg.get(e.to) - 1);
      if (indeg.get(e.to) === 0) q.push(e.to);
    }
  }
  const cyc = nodes.filter((n) => !seen.has(n.id)).map((n) => n.id);
  if (cyc.length) {
    const cycSet = new Set(cyc);
    const back = list.filter((e) => cycSet.has(e.from) && cycSet.has(e.to))
      .sort((a, b) => a.weight - b.weight)[0];
    if (back) {
      list.splice(list.indexOf(back), 1);
      notes.push(`DAG repair: dropped lowest-weight cycle edge ${back.from}->${back.to} (w=${back.weight})`);
    }
  }
  return list;
}

async function phaseMerge(probe, flashState, tsState) {
  let st = loadState('merge');
  if (st) { log('merge: cached'); return st; }
  log('phase 4 MERGE (local deterministic clustering + flash cross-review of the other arm)');
  const notes = [];
  const { merged, tsOnly } = mergeArm(clusterFlash(flashState.runs), tsState);

  // --- compose/test separation guard: flash cross-reviews typesafe's own nodes ---
  let xreview = null;
  if (tsOnly.length) {
    const existing = merged.map((m) => `${m.id} [${m.point}] ${m.title}`).join('\n');
    const cands = tsOnly.map((t) => `${t.id} [${t.point}] ${t.content}`).join('\n');
    const sys = 'You are the cross-reviewer of the cot-quilt pipeline. Another model (typesafe jev-1.13.0) extracted candidate nodes point-wise from the same CoT. Adjudicate each candidate against the EXISTING nodes of the merged graph: is it genuinely new, a duplicate, or salvageable with a fix? Output STRICT JSON only.';
    const usr = `EXISTING NODES:\n${existing}\n\nCANDIDATES:\n${cands}\n\nReturn STRICT JSON array: [{"id":"TS-P12","verdict":"keep|duplicate|fix","duplicate_of":"N07","corrected_content":"..."}] — duplicate_of only for duplicates, corrected_content only for fixes.`;
    const r = await callAndReceipt('merge_xreview', 'deepseek', probe.flash_model,
      () => deepseekChat({ model: probe.flash_model, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], temperature: 0.0, max_tokens: 3000 }),
      { purpose: 'cross-model adjudication of typesafe-only nodes (compose/test separation)' });
    let verdicts = [];
    try { verdicts = parseJsonArray(r.content); } catch (e) {
      notes.push(`xreview parse failed (${String(e.message).slice(0, 60)}) — candidates kept with status 'unadjudicated'`);
    }
    xreview = { verdicts, model: r.model_served };
    for (const v of verdicts) {
      const t = tsOnly.find((x) => x.id === v.id);
      if (!t) continue;
      if (v.verdict === 'duplicate' && v.duplicate_of) {
        t.status = 'dropped-duplicate';
        t.duplicate_of = v.duplicate_of;
        const m = merged.find((x) => x.id === v.duplicate_of);
        if (m) m.composers.push('typesafe@jev-1.13.0(dup)');
      } else if (v.verdict === 'fix' && v.corrected_content) {
        t.content = String(v.corrected_content);
        t.xreview = 'fixed by flash cross-review';
      } else {
        t.xreview = 'kept';
      }
    }
  }
  const active = [...merged, ...tsOnly.filter((t) => t.status === 'active')];
  const edges = resolveEdges(active, notes);
  // clean internal fields
  const clean = (n) => {
    const { _members, _toks, _text, ...rest } = n;
    return rest;
  };
  st = {
    nodes: active.map(clean),
    edges,
    rejected: tsOnly.filter((t) => t.status !== 'active').map(clean),
    notes,
    xreview,
    sim_threshold: SIM_THRESHOLD,
  };
  saveState('merge', st);
  log(`merge: ${st.nodes.length} active nodes (${st.nodes.filter((n) => n.stability === 'core').length} core), ${st.edges.length} edges, ${st.rejected.length} rejected`);
  return st;
}

// ------------------------- PHASE 5: JUDGE -------------------------
async function phaseJudgeTypesafe(probe, mergeState) {
  let st = loadState('judge_typesafe');
  if (st) { log('judge_typesafe: cached'); return st; }
  log('phase 5a JUDGE-typesafe (noul probability battery on the merged graph)');
  const gsum = mergeState.nodes.map((n) => `${n.id} [${n.point}] w=${n.weight} ${n.stability}: ${n.title}`).join('\n');
  const questions = {
    p_complete: { type: 'noul', instructions: 'p = probability that this cellular graph covers the chain-of-thought completely enough to implement the rewind/snapshot/save mechanisms from it (see STATE: the node list; the CoT is in the state).' },
    p_implementable: { type: 'noul', instructions: 'p = probability that a zero-shot agent, given ONLY these nodes+edges (no CoT), can implement a bootable drop-in save format for cells, organs, and whole quilts.' },
    p_missing_major: { type: 'noul', instructions: 'p = probability that at least one load-bearing mechanism of the CoT has NO corresponding node in the graph.' },
    p_faulty: { type: 'noul', instructions: 'p = probability that at least one node in the graph contradicts the CoT or states a wrong invariant.' },
  };
  const r = await callAndReceipt('judge_typesafe', 'typesafe', 'jev-1.13.0',
    () => systemone({
      model: 'jev-1.13.0',
      state: { battery: 'cot-quilt-run1-judge', topic: QUESTION, graph: gsum, cot: (loadState('compose').r.content ?? '').slice(0, 20000) },
      questions,
    }),
    { purpose: 'adversarial-adjacent probability battery on merged graph (judge != any composer of a given node set)' });
  st = { answers: r.answers, usage: r.usage, model: r.model_served, graph_summary_sha256: sha256(gsum) };
  saveState('judge_typesafe', st);
  log(`  typesafe verdicts: ${JSON.stringify(r.answers)}`);
  return st;
}

async function phaseJudgeHermes(probe, compose, mergeState) {
  let st = loadState('judge_hermes');
  if (st) { log('judge_hermes: cached'); return st; }
  log('phase 5b JUDGE-hermes (deepinfra Hermes-3-405B adversarial attack)');
  const sys = `You are the ADVERSARIAL judge of the cot-quilt pipeline. The graph's composers never judge their own work; you attack it. Find: (a) MISSING load-bearing nodes — mechanisms/invariants/failure-modes present in the CoT but absent from the graph; (b) FAULTY nodes — nodes that contradict the CoT, state wrong invariants, or would mislead a zero-shot implementer; (c) an overall verdict. Be hostile and specific; quote point ids (P1..Pn).`;
  const graphCompact = JSON.stringify({
    nodes: mergeState.nodes.map(({ id, point, title, content, weight, stability, origin }) => ({ id, point, title, content, weight, stability, origin })),
    edges: mergeState.edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight })),
  });
  const usr = `FLEET QUESTION:\n${QUESTION}\n\nCHAIN-OF-THOUGHT (verbatim, authoritative):\n${(compose.r.content ?? '').slice(0, 30000)}\n\nCELLULAR GRAPH UNDER REVIEW (JSON):\n${graphCompact}\n\nReturn STRICT JSON ONLY:\n{"missing":[{"point":"P12","title":"<=6 words","content":"1-2 sentences","weight":0.8}],"faulty":[{"id":"N07","problem":"what is wrong","severity":"major|minor"}],"verdict":{"pass":true,"completeness":0.82,"rationale":"<=80 words"}}`;
  let r = await callAndReceipt('judge_hermes', 'deepinfra', probe.hermes_model,
    () => deepinfraChat({ model: probe.hermes_model, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], temperature: 0.4, max_tokens: 4096 }),
    { purpose: 'adversarial completeness/quality attack on merged graph' });
  let parsed;
  try { parsed = JSON.parse(r.content.slice(r.content.indexOf('{'), r.content.lastIndexOf('}') + 1)); } catch {
    r = await callAndReceipt('judge_hermes_repair', 'deepinfra', probe.hermes_model,
      () => deepinfraChat({ model: probe.hermes_model, messages: [{ role: 'user', content: `Repair to STRICT JSON matching the schema (missing/faulty/verdict). Broken output was:\n${(r?.content ?? '').slice(0, 4000)}` }], temperature: 0.0, max_tokens: 4096 }),
      { purpose: 'JSON repair of adversarial verdict' });
    parsed = JSON.parse(r.content.slice(r.content.indexOf('{'), r.content.lastIndexOf('}') + 1));
  }
  st = { verdict: parsed, model: r.model_served, usage: r.usage, graph_sha256: sha256(graphCompact) };
  saveState('judge_hermes', st);
  log(`  hermes verdict: pass=${parsed?.verdict?.pass} completeness=${parsed?.verdict?.completeness} missing=${parsed?.missing?.length ?? 0} faulty=${parsed?.faulty?.length ?? 0}`);
  return st;
}

// ------------------------- PHASE 6: EXPORT -------------------------
async function phaseExport(probe, compose, flashState, tsState, mergeState, jt, jh, seeds) {
  const cot = compose.r.content ?? '';
  const cotSha = sha256(cot);
  // fold adversarial critique back in as new cells (fleet pattern), never delete
  const nodes = [...mergeState.nodes];
  const notes = [];
  for (const m of (jh.verdict?.missing ?? [])) {
    const id = `C${String(nodes.filter((n) => n.origin === 'adversarial-critique').length + 1).padStart(2, '0')}`;
    nodes.push({
      id, point: String(m.point ?? '?').toUpperCase(), title: String(m.title ?? 'gap'),
      content: String(m.content ?? ''), weight: Math.round((Number(m.weight) || 0.5) * 0.8 * 1000) / 1000,
      deps: [], seed_votes: 0, seeds: [], composers: [`judge@${jh.model}`],
      stability: 'critique', origin: 'adversarial-critique', status: 'active',
    });
    notes.push(`folded critique node ${id} from hermes missing-list (${m.point})`);
  }
  for (const f of (jh.verdict?.faulty ?? [])) {
    const n = nodes.find((x) => x.id === f.id);
    if (n) { n.faulty_note = `${f.severity}: ${f.problem}`; notes.push(`flagged faulty node ${f.id}`); }
  }
  const edges = resolveEdges(nodes, notes);
  const active = nodes.filter((n) => n.status === 'active');
  const core = active.filter((n) => n.stability === 'core');
  const stable = active.filter((n) => n.stability === 'stable');
  const volatile = active.filter((n) => n.stability === 'volatile');
  const tsOnly = active.filter((n) => n.stability === 'typesafe-only');
  const crit = active.filter((n) => n.stability === 'critique');
  const flashDerived = core.length + stable.length + volatile.length;

  const graph = {
    run: path.basename(RUN),
    generated_at_utc: new Date().toISOString(),
    question: { id: QUESTION_ID, text: QUESTION },
    cot_sha256: cotSha,
    pipeline: {
      composer: `${probe.compose_model} (deepseek-v4-pro class)`,
      decomposers: [`deepseek-flash x3 seeds (${flashState.runs.map((r) => r.temperature).join('/')})`, 'typesafe jev-1.13.0 (per-point noul load battery)'],
      judges: [`typesafe jev-1.13.0 noul battery`, `${jh.model} (deepinfra, adversarial)`],
      compose_test_separation: 'no model judges a node set it composed; flash cross-reviewed typesafe-only nodes; typesafe+hermes judged flash-merged nodes',
    },
    seeds,
    nodes,
    edges,
    stability_map: {
      core: core.map((n) => n.id),
      stable: stable.map((n) => n.id),
      volatile: volatile.map((n) => n.id),
      typesafe_only: tsOnly.map((n) => n.id),
      critique: crit.map((n) => n.id),
    },
    rejected: mergeState.rejected,
    merge_notes: [...mergeState.notes, ...notes],
    stats: {
      nodes_total: active.length,
      edges_total: edges.length,
      flash_derived_nodes: flashDerived,
      seed_stability_pct: flashDerived ? Math.round(((core.length + stable.length) / flashDerived) * 1000) / 10 : 0,
      core_pct: flashDerived ? Math.round((core.length / flashDerived) * 1000) / 10 : 0,
      counts: { core: core.length, stable: stable.length, volatile: volatile.length, typesafe_only: tsOnly.length, critique: crit.length },
    },
    judges: {
      typesafe: jt.answers,
      hermes: { pass: jh.verdict?.verdict?.pass ?? null, completeness: jh.verdict?.verdict?.completeness ?? null, rationale: jh.verdict?.verdict?.rationale ?? null, missing_count: jh.verdict?.missing?.length ?? 0, faulty_count: jh.verdict?.faulty?.length ?? 0 },
    },
    ledger_sha256: sha256(fs.readFileSync(LEDGER, 'utf8')),
  };
  writeAtomic(path.join(RUN, 'graph.json'), JSON.stringify(graph, null, 1) + '\n');

  // organ-candidate export for lane 63-c (bootable drop-in spec consumer)
  const organIds = new Set([...core, ...stable, ...crit].map((n) => n.id));
  const organ = {
    organ_candidate: 'cell-rewind-organ',
    exported_at_utc: new Date().toISOString(),
    source: { repo: 'SuperInstance/cot-quilt', run: graph.run, question_id: QUESTION_ID, graph_sha256: sha256(JSON.stringify(graph)) },
    consumer_lane: '63-c',
    drop_in_contract: {
      node_semantics: 'each node = a cell; content = the mechanism/invariant/failure-mode the cell must implement or assert',
      edge_semantics: 'from -> to = dependency; weight = asserted-by fraction of composers',
      inclusion_rule: 'core+stable flash-consensus nodes plus adversarial-critique cells (gaps the judges demanded)',
    },
    nodes: nodes.filter((n) => organIds.has(n.id)),
    edges: edges.filter((e) => organIds.has(e.from) && organIds.has(e.to)),
    judges: graph.judges,
  };
  writeAtomic(path.join(REPO, 'exports', 'organ-candidate-rewind.json'), JSON.stringify(organ, null, 1) + '\n');

  // cot_raw.md (verbatim AS SAID)
  const cotMd = [
    `# cot_raw — run ${path.basename(RUN)}`,
    `- composed by: ${compose.r.model_served} (requested: ${probe.compose_model} = deepseek-v4-pro class)`,
    `- finish: ${compose.r.finish}; usage: ${JSON.stringify(compose.r.usage)}`,
    `- content sha256: ${cotSha}`,
    `- reasoning_content (provider-native hidden trace) sha256: ${sha256(compose.r.reasoning_content ?? '')}`,
    '',
    '## QUESTION (verbatim)',
    QUESTION,
    '',
    '## TRACE + ANSWER (verbatim `content`)',
    cot,
    '',
    '## REASONING_CONTENT (provider-native, verbatim, included per never-delete-data)',
    compose.r.reasoning_content ?? '(none returned)',
    '',
  ].join('\n');
  writeAtomic(path.join(RUN, 'cot_raw.md'), cotMd);

  // judges artifacts
  writeAtomic(path.join(RUN, 'judges', 'verdict.json'), JSON.stringify({
    run: path.basename(RUN),
    judges_used: { typesafe: 'jev-1.13.0 noul battery', adversarial: jh.model },
    separation_receipt: graph.pipeline.compose_test_separation,
    typesafe_battery: { answers: jt.answers, usage: jt.usage },
    hermes: jh.verdict,
    numbers: {
      p_complete: jt.answers?.p_complete?.noul ?? null,
      p_implementable: jt.answers?.p_implementable?.noul ?? null,
      p_missing_major: jt.answers?.p_missing_major?.noul ?? null,
      p_faulty: jt.answers?.p_faulty?.noul ?? null,
      hermes_pass: jh.verdict?.verdict?.pass ?? null,
      hermes_completeness: jh.verdict?.verdict?.completeness ?? null,
    },
  }, null, 1) + '\n');

  const adv = [
    `# adversarial.md — Hermes-3-405B attack on run ${path.basename(RUN)}`,
    '',
    `Judge model: ${jh.model} (deepinfra). Composers (flash x3 + typesafe) never judged their own nodes.`,
    '',
    '## Verdict',
    `pass=${jh.verdict?.verdict?.pass} completeness=${jh.verdict?.verdict?.completeness}`,
    `rationale: ${jh.verdict?.verdict?.rationale}`,
    '',
    '## Missing nodes (folded back as critique cells)',
    ...(jh.verdict?.missing ?? []).map((m, i) => `- C${i + 1} [${m.point}] w=${m.weight} ${m.title} — ${m.content}`),
    '',
    '## Faulty nodes (flagged in graph.json, never deleted)',
    ...(jh.verdict?.faulty ?? []).map((f) => `- ${f.id} (${f.severity}): ${f.problem}`),
    '',
    '## typesafe noul battery (same-phase judge, probability channel)',
    JSON.stringify(jt.answers, null, 1),
    '',
  ].join('\n');
  writeAtomic(path.join(RUN, 'judges', 'adversarial.md'), adv);
  return graph;
}

// ------------------------- main -------------------------
(async () => {
  const t0 = Date.now();
  log(`run1 pipeline start -> ${path.relative(REPO, RUN)}`);
  const probe = await phaseProbe();
  const compose = await phaseCompose(probe);
  const cotSha = sha256(compose.r.content ?? '');
  const seeds = deriveSeeds(cotSha);
  const flashState = await phaseDecomposeFlash(probe, compose, seeds);
  const tsState = await phaseDecomposeTypesafe(probe, compose);
  const mergeState = await phaseMerge(probe, flashState, tsState);
  const jt = await phaseJudgeTypesafe(probe, mergeState);
  const jh = await phaseJudgeHermes(probe, compose, mergeState);
  const graph = await phaseExport(probe, compose, flashState, tsState, mergeState, jt, jh, seeds);
  log(`DONE in ${Math.round((Date.now() - t0) / 1000)}s: nodes=${graph.stats.nodes_total} edges=${graph.stats.edges_total} seed-stability=${graph.stats.seed_stability_pct}% core=${graph.stats.counts.core}`);
})().catch((e) => {
  console.error('PIPELINE FAIL-CLOSED:', String(e.message || e));
  process.exit(1);
});
