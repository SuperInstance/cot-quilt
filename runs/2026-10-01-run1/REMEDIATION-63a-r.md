# REMEDIATION-63a-r — what was reused vs newly called (run 2026-10-01-run1)

Follow-up receipt to `AUDIT-63a-r.md`. Remediation executed 2026-10-01T23:47:28–23:48:38Z
(70 s wall) via `node scripts/run1_pipeline.mjs --redo-seed t07`.

## REUSED verbatim (zero new provider calls)

- `state/probe.json` — model-id discovery (deepseek + deepinfra), cached.
- `state/compose.json` — the CoT of record (deepseek-v4-pro, 14,441 out, finish=stop,
  sha256 7f0a25e0…) and therefore `cot_raw.md` byte-identical content.
- `state/decompose_typesafe.json` — the jev-1.13.0 per-point noul battery (30 points,
  6,447 in / 595 out) — its input (same CoT) and output are unchanged.
- flash seed runs t=0.2 (seed 62135, 26 nodes) and t=1.1 (seed 5788, 26 nodes) — carried
  into the new `decompose_flash.json` with `reused: true` + explicit `reuse_note`.
  As-found bytes preserved at `state/decompose_flash.json.pre-63a-r`.

## NEWLY CALLED (4 rows appended to seeds/ledger.jsonl, rows 24–27)

| # | phase | service/model | usage | latency | finish | why |
|---|---|---|---|---|---|---|
| 24 | decompose_flash (t=0.7 redo) | deepseek/deepseek-flash | 4555 in / 13,889 out | 286 ms | stop | replace the hallucinated t07 run (audit F2); identical prompt + seed book-keeping (59707) → prompt-cache class input |
| 25 | merge_xreview | deepseek/deepseek-flash | 3105 in / 3,732 out | 156 ms | stop | cross-review must adjudicate on the remediated merge (audit F3; budget now 6000) |
| 26 | judge_typesafe | typesafe/jev-1.13.0 | 5631 in / 78 out | 368 ms | — | judges judge the FINAL edged graph (input_tokens/output_tokens field names) |
| 27 | judge_hermes | deepinfra/Hermes-3-Llama-3.1-405B | 8690 in / 124 out | 8,445 ms | stop | adversarial judge on the FINAL edged graph |

## Script fixes (fix-forward, same file — no rewrite)

- **F1**: `mergeArm()` now carries the union of member `deps` → `resolveEdges()` has edge
  sources; as-found graph had 0/90 nodes with deps, remediated graph has edges.
- **F2**: flash repair prompt regains the verbatim CoT (the prior uncommitted diff had
  removed it — the direct cause of the t=0.7 hallucination).
- **F3**: xreview `max_tokens` 3000→6000 + explicit "array MUST be complete" constraint.
- **New**: `--redo-seed <label>` remediation flag (per-seed re-call with receipted reuse
  of sibling seeds).

## Result delta (as-found → remediated)

| metric | as-found | remediated |
|---|---|---|
| active nodes | 90 | 49 |
| edges | **0** | **104** (asserted_by + weights) |
| core (3-seed) cells | 0 | 8 |
| stable (2-seed) cells | 14 | 14 |
| volatile cells | 46 | 26 |
| typesafe-only cells | 29 (all unadjudicated) | 0 (29/29 adjudicated duplicate by flash cross-review — independent-arm convergence) |
| critique cells | 1 | 1 (C01, P12 namespace exports) |
| seed-stability (core+stable)/flash | 23.3% | 45.8% |
| hermes verdict | pass, 0.98 | pass, 0.95 (missing: nesting ID-collision → folded as C01) |
| typesafe p_faulty / p_missing_major | 0.37 / 0.29 | 0.27 / 0.24 |
| t07 content | generic project plan ("Define Goal"…) | faithful receipt-chain mechanisms, weights 0.6–0.95, 0 garbage-pattern nodes |

State rotations (as-found bytes preserved): `merge.json.pre-63a-r`,
`judge_typesafe.json.pre-63a-r`, `judge_hermes.json.pre-63a-r`,
`decompose_flash.json.pre-63a-r`. Ledger stays append-only (23 → 27 rows).
