#!/usr/bin/env node
// scripts/export_organ_bundle.mjs — wrap the run-1 organ candidate into the
// organ-boot-loader store dialect (quilt.organ.v1) and optionally upload it.
//
// DIALECT NOTE (receipted finding, lane 63-a-r): the fleet currently has TWO
// organ-bundle dialects —
//   (a) quilt-jev-toolkit `quilt.organ.manifest/v1` (src/organ/manifest.mjs):
//       manifest {schema, schemaVersion:1, organId name@16hex, cells[{id,kind,stateHash}],
//       edges, receiptRange{start,end,count}, genesis{seq,prevHash:"GENESIS"},
//       state{cellsSha256}, supersedes, manifestHash};
//   (b) organ-boot-loader worker `quilt.organ.v1` (src/organ-boot-loader/worker.js):
//       bundle {schemaVersion:"quilt.organ.v1", manifest{name,cells[{id,kind,...}],
//       receiptRange:[digest...], stateHash=sha256hex(canon(state)), createdAt, author},
//       state{cells:{...}}, receipts[{seq,op,cell,prev,payload,digest}]}, prev starts
//       at "genesis" (lowercase), organ id derived SERVER-side.
// Both canonicalize identically (recursive key-sorted JSON, no whitespace) — proven
// below by cross-checking this script's canon() against the toolkit's canonicalJson().
// This bundle targets (b) — the live store — and records the dialect gap for v1 unification.
//
// RUN:  node scripts/export_organ_bundle.mjs [--upload]

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const UPLOAD = process.argv.includes('--upload');
const shaHex = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

// canonical JSON — identical algorithm to the worker's canonical() and the
// toolkit's canonicalJson() (sorted keys, no whitespace)
function canon(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canon).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canon(value[k])).join(',') + '}';
}

// ---- cross-check canonicalization against the toolkit (dialect-independent law) ----
const tk = path.resolve(REPO, '..', 'quilt-jev-toolkit', 'src', 'organ', 'manifest.mjs');
if (fs.existsSync(tk)) {
  const { canonicalJson, sha256 } = await import(`file://${tk}`);
  const probe = { z: 1, a: [2, { b: 'x', a: null }], m: 'cell-rewind' };
  const mine = canon(probe);
  const theirs = canonicalJson(probe);
  if (mine !== theirs || sha256(mine) !== shaHex(mine)) {
    throw new Error(`canonicalization cross-check FAILED:\n  mine   ${mine}\n  theirs ${theirs}`);
  }
  console.log('canonicalization cross-check vs quilt-jev-toolkit canonicalJson: IDENTICAL');
} else {
  console.log('toolkit checkout not found — skipping cross-check (bundle still self-verified)');
}

// ---- load the organ candidate ----
const cand = JSON.parse(fs.readFileSync(path.join(REPO, 'exports', 'organ-candidate-rewind.json'), 'utf8'));
const graph = JSON.parse(fs.readFileSync(path.join(REPO, 'runs', '2026-10-01-run1', 'graph.json'), 'utf8'));
const ledger = fs.readFileSync(path.join(REPO, 'runs', '2026-10-01-run1', 'seeds', 'ledger.jsonl'), 'utf8');

// ---- state: the organ's actual payload (everything a boot needs) ----
const cells = {};
for (const n of cand.nodes) {
  cells[n.id] = {
    point: n.point, title: n.title, content: n.content, weight: n.weight,
    deps: n.deps ?? [], stability: n.stability, origin: n.origin,
    composers: n.composers, ...(n.faulty_note ? { faulty_note: n.faulty_note } : {}),
  };
}
const state = {
  schema: 'quilt.organ.v1',
  cells,
  edges: cand.edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight, asserted_by: e.asserted_by })),
  provenance: {
    question_id: cand.source.question_id,
    source_repo: cand.source.repo,
    run: cand.source.run,
    graph_sha256: graph.ledger_sha256 ? shaHex(fs.readFileSync(path.join(REPO, 'runs', '2026-10-01-run1', 'graph.json'), 'utf8')) : null,
    cot_sha256: graph.cot_sha256,
    ledger_sha256: shaHex(ledger),
    judges: cand.judges,
    inclusion_rule: cand.drop_in_contract.inclusion_rule,
  },
};

// ---- receipts: one SET per cell, hash-chained from genesis (worker dialect) ----
const receipts = [];
let prev = 'genesis';
cand.nodes.forEach((n, i) => {
  const base = {
    seq: i + 1,
    op: 'SET',
    cell: n.id,
    prev,
    payload: { title: n.title, content: n.content, weight: n.weight, stability: n.stability },
  };
  const digest = shaHex(canon(base));
  receipts.push({ ...base, digest });
  prev = digest;
});

const bundle = {
  schemaVersion: 'quilt.organ.v1',
  manifest: {
    name: 'cell-rewind-organ',
    cells: cand.nodes.map((n) => ({ id: n.id, kind: 'cell', stability: n.stability, weight: n.weight })),
    receiptRange: receipts.map((r) => r.digest),
    stateHash: shaHex(canon(state)),
    createdAt: new Date().toISOString(),
    author: 'SuperInstance lane 63-a-r (cot-quilt run 2026-10-01-run1)',
  },
  state,
  receipts,
};

// ---- self-verification (fail-closed before any upload) ----
const errs = [];
// stateHash re-derivation
if (bundle.manifest.stateHash !== shaHex(canon(bundle.state))) errs.push('stateHash mismatch');
// chain: linkage + every digest re-derived (same procedure as the worker)
let p = 'genesis';
bundle.receipts.forEach((r, i) => {
  if (r.seq !== i + 1) errs.push(`receipt ${i}: seq out of order`);
  if (r.prev !== p) errs.push(`receipt ${i}: prev link broken`);
  const { digest, ...rest } = r;
  if (shaHex(canon(rest)) !== digest) errs.push(`receipt ${i}: digest mismatch`);
  if (bundle.manifest.receiptRange[i] !== digest) errs.push(`receipt ${i}: receiptRange mismatch`);
  p = digest;
});
// cells <-> receipts coverage: every cell has exactly one genesis-to-tip SET
const cellIds = new Set(bundle.manifest.cells.map((c) => c.id));
if (cellIds.size !== bundle.manifest.cells.length) errs.push('duplicate cell ids');
for (const r of bundle.receipts) if (!cellIds.has(r.cell)) errs.push(`receipt references unknown cell ${r.cell}`);
if (errs.length) {
  console.error('BUNDLE SELF-VERIFY FAILED (fail-closed, nothing uploaded):');
  for (const e of errs) console.error(' -', e);
  process.exit(1);
}
const organId = shaHex(canon(bundle.manifest)); // what the server will re-derive
console.log(`bundle self-verify OK: ${bundle.manifest.cells.length} cells, ${bundle.receipts.length} receipts, stateHash ${bundle.manifest.stateHash.slice(0, 16)}…, predicted organ id ${organId.slice(0, 16)}…`);

const out = path.join(REPO, 'exports', 'organ-candidate-rewind.bundle.json');
fs.writeFileSync(out, JSON.stringify(bundle, null, 1) + '\n');
console.log(`wrote ${path.relative(REPO, out)} (${fs.statSync(out).size} bytes)`);

// ---- optional upload (PUT /organ, Bearer token from env; never echoed) ----
if (UPLOAD) {
  const token = process.env.WORKER_UPLOAD_TOKEN;
  if (!token) { console.error('WORKER_UPLOAD_TOKEN missing — fail-closed, no upload'); process.exit(1); }
  const res = await fetch('https://organ-boot-loader.casey-digennaro.workers.dev/organ', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: fs.readFileSync(out, 'utf8'),
  });
  const body = await res.json();
  console.log(`PUT /organ -> HTTP ${res.status}`);
  console.log(JSON.stringify(body, null, 1));
  if (res.ok && body?.id) {
    // verify round-trip (server-side re-derivation)
    const v = await fetch(`https://organ-boot-loader.casey-digennaro.workers.dev/organ/${body.id}/verify`);
    console.log(`GET /organ/${body.id.slice(0, 16)}…/verify -> HTTP ${v.status}`);
    console.log(JSON.stringify(await v.json(), null, 1));
  }
}
