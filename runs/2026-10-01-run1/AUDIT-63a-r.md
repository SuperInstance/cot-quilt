# AUDIT-63a-r — resume audit of run 2026-10-01-run1 (lane 63-a → 63-a-r)

Resume-first discipline: everything below was **re-verified on disk**, nothing trusted from the
hand-off note. No data deleted; the as-found bytes of every artifact are preserved in git by the
commit that carries this file.

## 1. Resume-state correction

The hand-off claimed `exports/` was EMPTY. Reality on disk: `exports/organ-candidate-rewind.json`
(7,886 bytes, mtime 23:36) **exists** — the prior incarnation finished the export phase moments
before dying. The resume claim was stale; this audit supersedes it.

## 2. What the prior incarnation left (all verified)

- `state/`: `probe.json`, `compose.json` (+ `compose.json.burned-run1a` — the burned first
  attempt, preserved), `decompose_flash.json`, `decompose_typesafe.json`, `merge.json`,
  `judge_typesafe.json`, `judge_hermes.json`. Phases 0–5 all have state.
- `cot_raw.md` (64,517 B), `graph.json` (45,699 B), `judges/verdict.json`, `judges/adversarial.md`,
  `exports/organ-candidate-rewind.json` — phase 6 outputs exist.
- `scripts/run1_pipeline.mjs` uncommitted diff (+30/−12): max_tokens 8192→16384 (compose) and
  6000→16384 (decompose/repair), timeouts 600s→540s, JSON-parse hardening (smart quotes, trailing
  commas, last-resort object salvage), failed-raw persistence — **but it also REMOVED the
  original CoT from the flash repair prompt** (see finding F2).

## 3. Ledger audit (`seeds/ledger.jsonl`, 23 rows, append-only)

The `row` field is a **per-process ordinal** (documented in the ledger's own `note-1` row); global
order is `ts_utc`. Three real processes + one operator dry-run:

| proc | window (UTC) | rows | outcome |
|---|---|---|---|
| 1 | 23:21:34–23:25:19 | 7 | probe OK; compose burned 2× at 8192 (`finish=length`, empty content); t=0.2 seed parsed; t=0.7/t=1.1 hit `length` at old 6000 budget → aborted; state `compose.json.burned-run1a` preserved |
| 2 | 23:28:35–23:29:49 | 2 | compose OK (14,441 out, `stop`) with the raised 16384 budget — **this is the CoT of record**; t=0.2 `length` + repair `length` → fail-closed exit |
| — | 23:30:31 | 2 FAIL + note-1 | operator dry-run without env file: fail-closed before any network I/O, zero spend, note-1 receipted in place |
| 3 | 23:31:42–23:36:21 | 12 | full success: 3 flash seeds, typesafe battery, xreview, 2 judges, export |

Every OK row carries model_served / usage / latency / finish / cost basis; every FAIL row is an
honest row (`cost_basis: "failed call — still a row"`). **Receipts complete per call: YES.**

## 4. Hash verification (recomputed, not trusted)

- `sha256(ledger.jsonl)` = `ce105223…9154` == `graph.json.ledger_sha256` → **MATCH** (export ran
  after the last ledger row; no hidden later appends).
- `sha256(compose.r.content)` = `7f0a25e0…10f6` == `graph.json.cot_sha256` → **MATCH**
  (cot_raw.md carries the same content; 18,217 chars, served `deepseek-v4-pro`, `finish=stop`).
- Seeds of record derive from that CoT hash: t=0.2→62135, t=0.7→59707, t=1.1→5788 — exactly the
  seeds in process-3 rows (book-keeping only; the endpoint ignores `seed`, receipted finding).

## 5. Findings (gaps vs the designed end-state)

- **F1 — `edges_total = 0`.** The designed end-state is a graph WITH edges. Root cause found in
  the committed script: `mergeArm()` builds merged nodes without carrying member `deps` (the flash
  runs DO have them — t=0.2 run: 25/26 nodes carry `deps` like `["P1","P2"]`), and typesafe-arm
  deps derive from in-text `P<n>` cross-references which the CoT barely uses → `resolveEdges()`
  gets no deps to resolve. 0/90 nodes carry a non-empty `deps` in the as-found graph.
- **F2 — t=0.7 seed contaminated (hallucinated repair).** First t=0.7 call returned 16,384 output
  tokens with `finish=length` and EMPTY `content` (hidden-reasoning burn — the flash class can
  burn the whole budget too, extending the receipted reasoner-burn finding). The repair call then
  got no broken content (empty) and **no CoT** (removed by the uncommitted diff) → it invented a
  generic project-planning decomposition ("Define Goal", "Identify Stakeholders", "Gather
  Requirements", "Validate Plan", "Report Status", …). 22 graph nodes (~24%) carry composer
  `flash@0.7` only; seed-stability measurement is corrupted by them (core=0, 46 volatile).
- **F3 — cross-review never adjudicated.** `merge_xreview` hit `max_tokens=3000`
  (`finish=length`) → parse failed → all 29 typesafe-only nodes kept `unadjudicated`. The
  compose/test separation step produced no verdicts.
- **F4 — semantic note (not fixed here).** The typesafe decomposer logs "11 kept at noul>=0.5"
  but `mergeArm()` folds ALL 30 scored points regardless of threshold → 29 typesafe-only nodes,
  most with weight < 0.5. Receipted as a run-2 design decision (threshold vs keep-all).

## 6. Judges (as-found, preserved verbatim in judges/)

- typesafe battery: p_complete 0.71, **p_implementable 0.16** (honest — a zero-shot implementer
  gets nodes but ZERO edges), p_missing_major 0.29, p_faulty 0.37.
- Hermes-3-405B adversarial: pass=true, completeness=0.98, 1 missing (P12 nested organ exports →
  folded back as critique cell C01), 1 faulty (N07, minor).

## 7. Remediation decision (this lane, receipted in the next commits)

Fill gaps, don't re-run the good parts:

1. Fix-forward the script (small, surgical): (a) `mergeArm` carries the union of member deps →
   edges exist; (b) repair prompt regains the CoT context (undoes F2's root cause); (c) xreview
   budget 3000→6000 with an explicit completeness constraint (F3).
2. Re-call ONLY the contaminated t=0.7 seed (same prompt, same seed book-keeping, prompt-cache
   hit) via a receipted `--redo-seed` flag; t=0.2 and t=1.1 runs are REUSED verbatim.
3. Re-run phases merge → judges → export from cached state. New provider calls: 1 (t=0.7 redo,
   +repairs if needed) + 1 xreview + 2 judges. Compose / probe / typesafe-decompose REUSED, no
   new calls.
4. As-found artifacts stay in git history (this commit) and as `state/*.pre-63a-r` rotations in
   the remediation commit.

— lane 63-a-r, 2026-10-02
