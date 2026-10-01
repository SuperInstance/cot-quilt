# RUN-REPORT — how a cot-quilt run is constructed (run-1: FLEET-Q-REWIND-ORGAN)

Lane 63-a → 63-a-r (resume). Run directory: `runs/2026-10-01-run1/`. Pipeline:
`scripts/run1_pipeline.mjs` (zero deps, Node ≥ 18). This report is the zero-shot manual:
how such runs are built, what worked, what changes for run-2. Raw verdicts live in the run
dir (`graph.json`, `judges/`, `AUDIT-63a-r.md`, `REMEDIATION-63a-r.md`); this file is the WHY.

---

## 0. The shape of a run (one paragraph)

Pick a real fleet question → compose ONE extended chain-of-thought with a big reasoner →
have CHEAPER models decompose that CoT into atomic cellular nodes, independently, several
times (multi-seed) → merge the arms locally with deterministic clustering → let models that
never composed a node set judge it (probability battery + adversarial attack) → fold the
judges' demands back in as new cells (never delete) → export a merged cellular graph that a
consumer lane (63-c: organ boot) can diff against its implementation. Every HTTP call in
every phase appends a receipt row to an append-only ledger. That is the whole instrument.

## 1. Prompt design (compose phase)

- **One question, verbatim, in the artifact.** The fleet question (`FLEET-Q-REWIND-ORGAN`)
  is stored verbatim in the pipeline source, in `cot_raw.md`, and in `graph.json` — the CoT
  is always auditable against what was actually asked.
- **The trace is the deliverable, not the answer.** The composer is told its output "will be
  decomposed point-by-point by cheaper models" — this single sentence reshapes the model's
  output format (numbered, atomic, mechanical) without any few-shot examples.
- **Five hard properties in the system prompt:** EXTENDED (22–30 points `P1..Pn`, 2–6
  sentences each), MECHANISM-FIRST (name actual fields/ledgers/hashes, "never vibes"),
  COMPLETE over asked dimensions × granularities, HONEST (costs in the SAME point as the
  mechanism), SELF-CONTAINED (no meta).
- **Fleet context as ground truth:** a short TRUE paragraph about cells/receipt chains/organs
  is injected ("true; cite freely") so the CoT reasons about OUR substrate, not a generic
  database.
- **Budget reality:** v4-pro-class (`deepseek-reasoner` api id) burned 2×8192-token budgets on
  hidden reasoning before a 16384 budget produced 14,441 output tokens, `finish=stop`
  (18,217 chars). The burn-guard retry at 2× is part of the phase, not an exception path.

## 2. Decomposition (two independent arms)

- **Arm A — flash ×3 temperatures** (0.2 / 0.7 / 1.1). Same identical prompt prefix across
  seeds (prompt-cache hits); diversity comes from temperature because the endpoint IGNORES
  the `seed` parameter (receipted fleet finding — seeds stay as book-keeping, derived
  deterministically from the CoT hash so the ledger proves which CoT they belong to).
  Output contract: STRICT compact JSON array, 20–26 nodes, `{"point","title","content",
  "weight","deps"}`, content ≤ 20 words, no double quotes inside strings, array MUST be
  complete. A tolerant repair loop (one receipted retry) handles breakage.
- **Arm B — typesafe `jev-1.13.0` System-One battery.** One call scores EVERY CoT point with
  a noul probability: "p = this point states a load-bearing mechanism that MUST become a
  cell" (30 questions, one state). This arm is independent of Arm A's failure modes: it
  cannot hallucinate JSON structure (the wire returns typed answers), and it prices points
  the flash arm may have silently dropped.
- **Why two arms:** agreement between INDEPENDENT decomposers is evidence; disagreement is
  inventory. Arm B's per-point probabilities also give the merge a second, calibration-shaped
  weight source (`ts_load`) instead of one model's self-assessed weights.

## 3. Multi-seed merge (local, deterministic, no calls)

- Single-linkage clustering over token-Jaccard (threshold 0.42, ×1.15 bonus for same-point
  candidates) — deterministic given the same inputs, so the merge is reproducible offline.
- Cluster → one cell: content from the highest-weight member, weight = member mean,
  `seed_votes` = number of temperatures that produced a member, `deps` = union of member
  deps, `stability` = core (3 seeds) / stable (2) / volatile (1).
- Arm B folds in at the point level: jaccard match to an existing cell → same cell gains a
  `typesafe@jev-1.13.0` composer and averaged weight; no match → candidate cell.
- **Compose/test separation starts here:** flash cross-reviews the typesafe-only candidates
  (keep / duplicate_of / fix) BEFORE they can become cells. In the remediated run the
  verdict was 29/29 duplicate — the two arms converged, which is itself the finding.

## 4. Judge separation (the core discipline)

No model ever judges a node set it composed. The merged graph's composers are flash×3 +
typesafe; the judges are **typesafe** (probability battery: p_complete, p_implementable,
p_missing_major, p_faulty over the whole graph) and **Hermes-3-405B via DeepInfra**
(adversarial: list MISSING nodes with weights, FAULTY nodes with severity, pass/completeness/
rationale — hostile, must quote point ids). Judge demands are FOLDED BACK, never silently
applied: missing → new cells with `origin='adversarial-critique'` at 0.8× weight; faulty →
`faulty_note` on the flagged cell, which stays in the graph. Final numbers (remediated run):
typesafe p_complete 0.71 / p_implementable 0.15 / p_missing_major 0.24 / p_faulty 0.27;
Hermes pass=true completeness=0.95 → 1 missing (nesting ID-collision → cell C01) + 1 faulty
(N07, minor namespacing note).

## 5. Receipt format (what makes the run auditable)

- **`seeds/ledger.jsonl`, append-only.** One row per call attempt: per-process row ordinal,
  `ts_utc` (global order), phase, service, model_requested AND model_served, seed,
  temperature, purpose, status OK/FAIL, latency_ms, full usage, finish reason, declared cost
  + cost basis, request sha256 where meaningful, free-text notes. A dead call is still a row.
- **Honest failures are rows too:** the ledger holds 2 FAIL rows (an operator dry-run without
  env keys — fail-closed before any network I/O, zero spend) and a `note-1` operator row
  explaining them in place. Nothing is ever edited out; corrections are new rows.
- **State per phase** (`state/<phase>.json`, atomic tmp+rename writes): any phase re-enters
  cached; this is what made the resume+remediation cheap (see §7).
- **Artifact hashes bind the ledger to the exports:** `graph.json` carries
  `ledger_sha256` + `cot_sha256`; `cot_raw.md` carries the CoT sha and the provider-native
  `reasoning_content` sha. A future auditor recomputes both in seconds (this lane did —
  they matched, which is how the as-found export was trusted).
- **Spend of record for run-1, all-in including burned/wasted attempts** (17 deepseek OK
  rows): 46,840 prompt + 156,159 completion tokens ≈ **$0.098 declared** at the receipted
  off-peak basis; typesafe 3 batteries (13,758 in / 751 out) and DeepInfra 2 judge calls
  (19,411 in / 251 out) carry token receipts with `cost_usd_declared: null` (no fleet price
  book for those providers). Planned calls were 10; actual provider calls were 24 OK + 2
  FAIL across 3 processes — the delta is receipted, not hidden.

## 6. Run-1 final state (remediated, verified)

**49 active cells** (8 core / 14 stable / 26 volatile / 1 critique), **104 edges** (each with
`asserted_by` provenance and an asserted-by-fraction weight), seed-stability 45.8%, exported
organ candidate = 23 cells / 36 edges (`exports/organ-candidate-rewind.json`), cross-fed
against ORGAN BOOT v0 in `exports/coverage-table.md` (COVERED 3 / PARTIAL 9 / UNCOVERED 10 /
DOCTRINE 1 — the uncovered center of mass is rewind + write-side transactions).

## 7. What worked (and is worth keeping)

1. **Phase-state caching made resume-first cheap.** The prior incarnation died mid-flight;
   the resume audited hashes, found the export already produced, then fixed two seeds' worth
   of damage with FOUR new calls in 70 s because every healthy stage re-entered cached.
   Design your run so that any prefix can be reused: state per phase, receipts per call.
2. **Judge separation caught real, specific gaps** (a missing nesting-exports mechanism, a
   namespacing defect on N07) and the fold-back turned the attack into new cells — the graph
   demonstrably improves from being judged.
3. **Cross-decomposer unanimity is signal, not failure.** 29/29 "duplicate" cross-review
   verdicts mean the flash arm and the typesafe arm extracted the same cells from the same
   CoT — an independence check that money can't buy with a single model.
4. **Honest failure rows cost nothing and explain everything.** The ledger's FAIL rows +
   operator note + burned-attempt state file (`compose.json.burned-run1a`) made the audit a
   reading exercise instead of an archaeology.

## 8. What to change for run-2 (each receipted in run-1)

1. **Guard the decomposer's hidden-reasoning burn.** At t=0.7 flash spent ALL 16,384 tokens
   on hidden reasoning → empty content. Detect `finish=length && !content` explicitly and
   retry with a thinking budget cap (or a reasoning-off flag if the endpoint grows one)
   BEFORE the repair path.
2. **Repair prompts MUST carry the source document.** A repair call without the verbatim CoT
   invented a generic project plan ("Define Goal", "Identify Stakeholders"…) that contaminated
   ~24% of the as-found graph. Run-1's fix-forward restores the CoT; run-2 keeps it and adds
   a post-repair faithfulness check (noul battery on repaired nodes).
3. **Size output budgets to the CONTRACT, not hope.** xreview truncated at 3000 tokens with
   29 candidates pending → every verdict lost. Budget ≈ candidates × expected verdict tokens
   × margin, and assert the verdict count == candidate count (fail-closed, not best-effort).
4. **Tighten the merge or the nodes will multiply.** 74 raw nodes across 3 seeds → 48
   flash-derived clusters at jaccard 0.42; run the noul battery on MERGED candidates too, or
   lower the threshold / use LLM-adjudicated merge for near-boundary pairs.
5. **Decide the typesafe threshold policy once.** The decomposer computed "11 kept at
   noul≥0.5" but the merge folded all 30 points regardless. Keep-all is defensible (the
   battery prices, the cross-review filters) — but then don't log a threshold that does
   nothing; pick one policy and make the receipt show it.
6. **Edge provenance should record ALL asserters.** `asserted_by` currently takes the first
   composer, so `flash@0.2` dominates; the seed-vote fraction for EDGES should mirror the
   cell-level seed_votes treatment.
7. **Ask the question that probes trust roots.** The CoT barely covered checkpoint
   signatures/PKI (63-c parked it; the coverage table found no node demanding it). Run-2's
   prompt should explicitly ask about trust anchors so the graph demands them.

## 9. Bonus: the organ candidate is LIVE on the fleet's organ store

`scripts/export_organ_bundle.mjs` wraps the 23-cell organ candidate into the organ-boot-loader
store dialect and uploads it (token from env, never echoed; bundle self-verified fail-closed
before upload — stateHash re-derived, every receipt digest recomputed, chain linked
genesis→tip, cells↔receipts coverage). Canonicalization cross-checked IDENTICAL against
quilt-jev-toolkit's `canonicalJson()` before anything left the repo.

- **Uploaded 2026-10-02 → HTTP 201, organ id `1e10ff0275abc461cbe9588344cc519962cb1b662a8124a1da41d59a0f49f21b`**
  (23 cells / 23 receipts; id = server-derived sha256 of canonical manifest — the client's
  predicted id matched byte-for-byte).
- Server-side verify: `GET /organ/{id}/verify` → **bootable: true**, all four checks true
  (manifest digest == id; sha256(canonicalJSON(state)) == stateHash; receipt chain re-derives
  genesis→tip == receiptRange).
- Dialect finding receipted in the script header: the fleet has TWO organ-bundle dialects —
  the toolkit's `quilt.organ.manifest/v1` (receiptRange {start,end,count}, organId name@16hex,
  GENESIS) vs the worker's `quilt.organ.v1` (receiptRange = digest array, server-derived id,
  lowercase "genesis"). Canonicalization algorithms agree; field layouts differ. v1
  unification is a 63-c/63-e follow-up; this bundle targets the live store.

## 10. Reproduce / resume

```bash
set -a; . /home/z/my-project/.env.keys; set +a
node scripts/run1_pipeline.mjs [--run runs/2026-10-01-run1] [--redo-seed t07]
```

Phases re-enter cached (probe/compose/decompose/typesafe/merge/judges/export). `--redo-seed
<label>` re-calls ONE flash seed and reuses the rest — the remediation path. The ledger is
append-only across all of it; `graph.json.ledger_sha256` proves which ledger produced it.
