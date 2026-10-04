# cot-quilt — Knowledge Map
> The index of indexes. Verified against the working tree during wave-69 (task 69-doc-f).

## In this repo

- `README.md` — the 6-phase pipeline (SEEDS → COT → SPLIT → WIRE → MERGE → JUDGE),
  the first receipted run's numbers, the cell signature for dropping graphs into a
  quilt, receipted costs, the discipline list, wave-64 instrument lessons (seed ignored,
  burn-guard, atomic writes, per-bit entropy flags), and the v0.2 playtesters + routes.
- `RUN-REPORT.md` — the run-1 zero-shot manual: shape of a run, prompt design (trace as
  deliverable; five hard properties), two decomposer arms (flash ×3 temperatures +
  typesafe noul battery), deterministic merge (jaccard 0.42, seed votes), judge
  separation (typesafe battery + Hermes adversarial), receipt format (append-only
  ledger, honest FAIL rows, artifact hashes), run-1 final state, what worked, the
  7-item run-2 change list, the live organ upload receipt, reproduce/resume commands.
- `SECURITY-INCIDENT.md` — the 2026-10-01 incident record: what happened (credential
  string embedded via unsanitized exception text in a committed receipt — commit
  `677484d`, `receipt.json:1788`; file and JSON path named; the value itself is NOT in
  this document by design), exposure window (≤ ~2h, rolled 22:55Z), mitigation (roll,
  this document, keyscan, gitignore, code hardening), why the commit stays in history
  (never-delete-data law; inert credential; suppression table), prevention checklist.
  Note: the published branch's history was amended (wave-67/68 secret purge) to scrub
  the leaked credential — commit `677484d` and the leak-bearing receipt exist only in
  pre-purge private history; the public record begins at its successor `bbd8b5d`.
- `cot_decompose.py` (32 KB) — the Python pipeline: `.env.keys` loader, `scrub()`
  (incident law, KEY_PAT regex), mothquantum seed client (per-bit fail-closed),
  lens personas, burn-guard (12k→36k), strict-JSON split with repair loop, typesafe
  battery (loads + dependencies), merge with alternate routes, judge + fold-back,
  per-sample resume.
- `playtest_routes.py` — v0.2: cheap-model play-test battery (deepinfra chat client,
  role prompts) + jev-latest routes/conditional-environment emitter.
- `tools/build_cot_viewer.py` — v2 SVG viewer renderer (multi-line labels, corner-
  anchored divergent boxes, cluster→cluster edges, critique row; complete-runs-only
  sort so stray partial receipts cannot win).
- `tools_build_cot_viewer.py` — v1 viewer at root (lineage; superseded; differs).
- `scripts/keyscan.mjs` — the audit kit: scans HEAD tree + staged diff + worktree for
  credential classes (`gsk_`, `sk-`, `ghp_`, `github_pat_`, `apikey_`, `moth_`,
  `cfut_`), masks values in output, exit 0 only if clean or every hit is a suppression
  entry; the zero-shot pre-push ritual is documented in its header.
- `scripts/clients.mjs` — receipted HTTP clients (deepseek chat, typesafe systemone,
  deepinfra), price book (deepseek off-peak basis receipted), `scrub()` export,
  `needKey()` env discipline, fail-closed errors.
- `scripts/run1_pipeline.mjs` — run-1 orchestration (zero deps, Node ≥ 18): compose →
  ARM A/B decompose → merge → judges → fold-back → export; phase-state caching;
  `--run` / `--redo-seed` flags.
- `scripts/export_organ_bundle.mjs` — organ-store uploader: bundle wrap, fail-closed
  self-verification (stateHash re-derivation, receipt digest recompute, chain
  genesis→tip, cells↔receipts coverage), canonicalization cross-check, upload (token
  from env, never echoed); documents the two-dialect finding in its header.
- `runs/` — the receipt archive:
  - `20261001T185823Z-4bb8f5f5/` — first receipted run: `receipt.json`,
    `sample-0/1/2-cot.md` (50–95 KB CoTs), graph artifacts; 48/48 quantum bits,
    judge 6/10, graph v2 with critique cells.
  - `2026-10-01-run1/` — run-1: `graph.json` (49 nodes / 104 edges; keys: run,
    generated_at_utc, question, cot_sha256, pipeline, seeds, nodes, edges,
    stability_map, rejected, merge_notes, stats; `ledger_sha256` binding),
    `cot_raw.md`, `judges/`, `seeds/` (append-only ledger.jsonl), `state/`,
    `AUDIT-63a-r.md` (as-found audit), `REMEDIATION-63a-r.md` (4 receipted calls).
  - `20261001T195410Z-503b10b9/` — the run associated with the incident (commit
    `677484d`'s receipt lineage; current HEAD tree is keyscan-CLEAN; the inert string
    exists only in pre-purge private history — the published branch was amended in the
    wave-67/68 secret purge; the public record begins at successor `bbd8b5d`).
  - `20261001T183329Z/183810Z/184829Z-4bb8f5f5/`, `20261001T195410Z-503b10b9/`,
    `wave64-run2/`, `playtest-20261001T190939Z-4bb8f5f5.json` — earlier same-day
    attempts, run-2, and the playtest receipt.
- `exports/organ-candidate-rewind.json` (+ `.bundle.json`) — the 23-cell / 36-edge
  organ candidate; uploaded live 2026-10-02 (organ id
  `1e10ff0275abc461cbe9588344cc519962cb1b662a8124a1da41d59a0f49f21b`, bootable: true).
- `exports/coverage-table.md` — the honest verdict-scale diff of graph vs ORGAN BOOT v0
  (quilt-jev-toolkit @ ecaf2e4): COVERED 3 / PARTIAL 9 / UNCOVERED 10 / DOCTRINE 1.
- `.gitignore` — `.env`, `.env.*`, `.env.keys`, `*.env`, `__pycache__/`, `*.pyc` —
  "Credentials NEVER live in this repo".
- `docs/` — wave-69 package (ONBOARDING, USER-GUIDE, DEVELOPER-GUIDE,
  ENGINEERING-NOTES, CTO-BRIEF, KNOWLEDGE-MAP).

## Pre-existing docs (before wave-69)
- `README.md` — pipeline + results + discipline (the entry point).
- `RUN-REPORT.md` — run-1 methodology manual (§0–§10 as indexed above).
- `SECURITY-INCIDENT.md` — the incident record (the lesson document; no key material).
- `scripts/keyscan.mjs` header — the pre-push ritual as documentation.
- `scripts/export_organ_bundle.mjs` header — the dialect finding as documentation.
- `exports/coverage-table.md` — cross-feed analysis with verdict scale.
- `runs/2026-10-01-run1/AUDIT-63a-r.md` and `REMEDIATION-63a-r.md` — lane audit +
  remediation receipts (documentation-grade narratives of a real resume).

## In the fleet
- **SuperInstance/quilt-jev-toolkit** — ORGAN BOOT v0 (organ snapshot/boot, 23/23
  tests): the cross-feed counterparty and canonicalization reference. Sibling; the
  coverage table names it as v0-of-record.
- **SuperInstance/quilt-organ-workers** — the live organ store (CF Workers, free tier):
  the uploader's target; dialect counterpart (`quilt.organ.v1`).
- **SuperInstance/mothquantum** — certified quantum entropy for seeds (coin-toss jobs,
  per-bit fail-closed). Used-by.
- **SuperInstance/fleet-seeds** — lode engine; the receipted-client conventions
  (`systemone_client.mjs`) and deepseek guest patterns this repo honors. Sibling.
- **SuperInstance/quilt (upstream)** — the cellular runtime whose cell signature
  (`in/out`) the README targets. Upstream.
- **SuperInstance/superinstance-lab** — the journal; lanes 63-a/63-a-r and the wave-63
  summary receipt this repo's history.
- **Providers** (external): deepseek (v4-pro as `deepseek-reasoner`, flash), typesafe.ai
  (jev-latest / jev-1.13.0 System-One), DeepInfra (Hermes-3-405B, playtest models).

## In the journal
Source: SuperInstance/superinstance-lab → worklog.md (grep `cot-quilt`).
- **Wave-63 cross-feed note** (line ~896): `exports/organ-candidate-rewind.json` NOT
  PRESENT at lane-63-c time (63-a in flight); the v0 coverage table issued as
  PROVISIONAL with the COVERED/UNCOVERED list to be re-issued against 63-a's actual
  graph — which this repo's `exports/coverage-table.md` later did.
- **Lane 63-a-r resume task** (line 929): resume cot-quilt run-1
  (FLEET-Q-REWIND-ORGAN) — audit dead incarnation's state, fill gaps to designed
  end-state, cross-feed coverage table, RUN-REPORT methodology doc, optional organ
  store upload, push.
- **Resume receipt** (line 943): cot-quilt @ `0f360b9` remote==local VERIFIED; lineage
  `aa602c9` as-found+audit → `5a2f928` fix-forward+remediation → `0f360b9`
  cross-feed+report+store-upload, on top of the prior incarnation's `32663c8`.
- **Wave-63 principal summary** (line 974): cot-quilt `0f360b97` — incident doc +
  DeepSeek CoT→cellular graph live run: 49 cells/104 edges, dual decomposers
  cross-converged 29/29, Hermes adversarial judge pass 0.95, seed-stability 45.8%,
  contaminated seed caught+repaired, coverage table vs organ-boot v0, organ uploaded
  LIVE bootable:true; (same line records the deepseek key re-roll after the `677484d`
  leak).
- **Decomposition lane (labs family)** (lines 1185–1193): smoke — read README,
  run1_pipeline phases/budget lines, keyscan ritual/suppressions;
  `node scripts/keyscan.mjs` → CLEAN exit 0 (2 receipted-benign hits at that time);
  live pipeline NOT_RUN (needs keys + network, dog-food forbids); graph.json parses
  49 nodes/104 edges, judges p_complete 0.71.
- Note for future greps: the journal also records the deepseek key re-roll under
  wave-63; the credential is rolled/inert; no key material is reproduced anywhere in
  this repo's docs (verified by keyscan + manual review, wave-69).

## Receipts of record
- `runs/2026-10-01-run1/graph.json` — 49 cells / 104 edges with `ledger_sha256`
  binding; the run-1 deliverable (shape re-verified wave-69).
- `runs/2026-10-01-run1/seeds/ledger.jsonl` — append-only ledger, 27 rows incl. FAIL
  rows + operator note; the honesty substrate.
- `runs/2026-10-01-run1/AUDIT-63a-r.md` + `REMEDIATION-63a-r.md` — the resume-first
  economics proof (4 calls / ~70 s) and the contaminated-seed catch+repair.
- `runs/20261001T185823Z-4bb8f5f5/receipt.json` — the first multi-seed run: 48/48
  quantum bits, judge 6/10, five gaps → critique cells.
- `exports/coverage-table.md` — graph-vs-implementation diff (3/9/10/1 verdicts).
- `RUN-REPORT.md` §9 — the live upload receipt (HTTP 201; server verify bootable:true;
  client-predicted id matched byte-for-byte).
- `scripts/keyscan.mjs` output (wave-69 re-run) — CLEAN: 0 hits, HEAD+staged+worktree.
- `SECURITY-INCIDENT.md` — the incident receipt: window, roll, root-cause chain, and
  the pointer to the inert historical string (no value reproduced).

## How to search further
```bash
# The incident law in code (scrub at every choke point)
grep -n "scrub\|KEY_PAT" cot_decompose.py scripts/clients.mjs scripts/keyscan.mjs

# Every receipted provider call and its cost basis (run-1)
head -3 runs/2026-10-01-run1/seeds/ledger.jsonl
grep -c '"status":"OK"' runs/2026-10-01-run1/seeds/ledger.jsonl
# compact JSON — no space after the colon; expect 24 OK / 2 FAIL / 1 note row
# (the note row, "note-1", carries no "status" field at all)

# Judge verdicts and fold-back provenance
ls runs/2026-10-01-run1/judges/ && grep -o "origin[^,]*" runs/2026-10-01-run1/graph.json | sort | uniq -c

# The coverage gaps that define the next organ version
grep -n "UNCOVERED" exports/coverage-table.md

# The pre-push ritual (must be clean before any push)
node scripts/keyscan.mjs

# Journal history (from a clone of superinstance-lab)
grep -n "cot-quilt" worklog.md
```
