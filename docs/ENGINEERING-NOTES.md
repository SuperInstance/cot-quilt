# cot-quilt — Engineering Notes
> For engineers operating, reviewing, or building on the CoT-decomposition cell.

## Architecture

Two pipelines share one security/receipt spine. Python (`cot_decompose.py`) is the
multi-seed research instrument; Node (`scripts/run1_pipeline.mjs`) is the fleet-question
instrument with two decomposer arms and compose/test-separated judges.

```
                      ┌──────────────────────── providers ────────────────────────┐
                      │  deepseek (v4-pro / flash) · typesafe (jev) · DeepInfra    │
                      │  (Hermes-3-405B) · mothquantum (certified QRNG seeds)      │
                      └──────▲──────────────────────▲──────────────────────────────┘
                             │ receipted clients (scrub-at-choke-point, usage always)
   ┌─────────────────────────┴────────────┐   ┌─────────────────────────────────────┐
   │ Python: cot_decompose.py             │   │ Node: scripts/run1_pipeline.mjs     │
   │ 0 SEEDS   mothquantum bits (fail-    │   │ compose 1× v4-pro CoT (18,217 ch,   │
   │           closed → os.urandom+flag)  │   │   finish=stop, burn-guard)          │
   │ 1 COT     3× v4-pro under lenses     │   │ decompose ARM A flash ×3 temps      │
   │ 2 SPLIT   flash ≤8 typed steps       │   │   (0.2/0.7/1.1) + ARM B typesafe    │
   │ 3 WIRE    typesafe battery (loads,   │   │   jev-1.13.0 per-point noul battery │
   │           deps) per sample           │   │ merge    deterministic jaccard      │
   │ 4 MERGE   clusters + alt routes      │   │          (0.42, seed-vote) local    │
   │ 5 JUDGE   v4-pro 0–10 + gaps;        │   │ judges   typesafe battery + Hermes  │
   │           flash folds gaps in        │   │          adversarial (separated)    │
   │ 6 RECEIPT receipt.json + graph.json  │   │ foldback cells origin='adversarial- │
   └─────────────────────────┬────────────┘   │          critique'; export organ    │
                             │                └──────────────────┬──────────────────┘
                             ▼                                   ▼
        runs/<ts>-<slug>/{receipt.json, graph.json, seeds/ledger.jsonl (append-only),
        state/<phase>.json (atomic), sample-*-cot.md, judges/, AUDIT/REMEDIATION}
                             │
                             ▼
        exports/organ-candidate-rewind.json → export_organ_bundle.mjs (self-verify
        fail-closed) → organ store (HTTP 201, bootable:true) ; coverage-table.md
        diff vs quilt-jev-toolkit ORGAN BOOT v0
```

Security spine (cross-cutting): `.env.keys` outside the repo (mode 600, gitignored) →
env-read at runtime → `scrub()` on all error text → append-only receipts → pre-push
`keyscan.mjs` (HEAD + staged + worktree) → push with token discipline.

## Invariants

1. **No key material outside env/runtime memory.** Enforced by `.gitignore`, the
   env-read loaders (`KEYS` in `cot_decompose.py`; `needKey()` in `clients.mjs`), and
   the pre-push scan. One historical exception exists and is permanently receipted
   (commit `677484d`; the credential is rolled/inert; keyscan suppression with
   justification).
2. **Error text is hostile until scrubbed.** `scrub()` masks credential-shaped
   substrings (`gsk_`, `sk-`, `ghp_`, `github_pat_`, `apikey_`, `moth_`, `cfut_`) in
   every error/telemetry path before persistence — because Python exception text embeds
   offending values verbatim (the incident's root cause).
3. **Append-only ledgers.** `seeds/ledger.jsonl` never loses or rewrites rows; FAIL rows
   and operator notes are rows too; `graph.json.ledger_sha256` binds exports to the
   ledger that produced them.
4. **Compose/test separation.** Enforced structurally: judges are chosen from models
   that did not compose the judged set; adversarial judges must quote point ids.
5. **Fold-back, never delete.** Judge findings become new cells (0.8× weight) or
   `faulty_note`s; the graph only grows.
6. **Fail-closed externalities.** mothquantum seeds fall back to `os.urandom` with
   per-bit flags and `entropy_bits_true` counts; the organ uploader verifies its own
   bundle (stateHash re-derived, every receipt digest recomputed, chain genesis→tip)
   before any network call.

## Failure modes & blast radius

- **Credential exfiltration via exception strings** — realized 2026-10-01: an
  argument-order swap passed the credential where a URL was expected; the exception
  embedded it; the unscrubbed handler stored it; the receipt was committed. Window ≤
  ~2h; credential rolled; blast radius contained by the roll + the fact that receipts
  are content-addressable and the affected file is known (`receipt.json:1788` of the
  historical commit). Systemic containment: `scrub()` at both choke points, keyscan
  pre-push, `.gitignore` coverage, and the incident document.
- **Reasoner budget burn** — a v4-pro/flash call spends everything on hidden reasoning
  (`finish=length`, empty content). Contained by the burn-guard retry (3×); residual:
  cost, not correctness (retry is receipted).
- **Repair-path contamination** — a repair call without the verbatim CoT invented a
  generic plan, contaminating ~24% of the as-found graph; contained by fix-forward
  (restore the CoT) and the run-2 plan (post-repair faithfulness battery).
- **Output-budget truncation** — xreview truncated at 3000 tokens with 29 candidates
  pending; every verdict lost. Fix is contract-sized budgets + fail-closed verdict-count
  assertion.
- **Seed-parameter futility** — treating `seed` as a diversity mechanism yields
  correlated samples (endpoint ignores it). Contained by lenses/temperature; the ledger
  keeps seeds for provenance.
- **Ledger/receipt truncation on kill** — once produced a truncated receipt; contained
  by atomic writes (tmp + fsync + rename) and content-keyed runs.

## Performance & cost envelope

Measured (receipted):

- Run-1 all-in: 17 deepseek OK rows — 46,840 prompt + 156,159 completion tokens ≈
  **$0.098 declared** (receipted off-peak basis: cache-hit $0.003/1M, cache-miss
  $0.15/1M, output $0.6/1M); typesafe 3 batteries 13,758 in / 751 out; DeepInfra 2
  judge calls 19,411 in / 251 out (`cost_usd_declared: null` — no fleet price book).
- Planned vs actual calls: 10 planned → 24 OK + 2 FAIL across 3 processes; delta
  receipted (burns, dry-run FAILs).
- v4-pro CoT samples: 10–25k reasoning tokens each (~$0.01–0.03/sample class);
  judge ~2–4k tokens; flash phases seconds/cents.
- Resume economics: remediation of a dead incarnation = 4 receipted calls in ~70 s
  (phase-state caching).
- First multi-seed run: 3 CoTs at 50–95 KB each, 3/3 decomposed to 8 steps, 48/48
  quantum seed bits, judge 6/10.
- Estimates, labelled: per-run wall time for the Python pipeline is minutes-to-tens-of-
  minutes depending on burn retries — not receipted as a single number.

## Operations

- **Local**: Node ≥ 18 and Python ≥ 3.9; zero npm/pip dependencies. Keys via
  `/home/z/my-project/.env.keys` (outside the repo, mode 600) or process env; the organ
  uploader reads `WORKER_UPLOAD_TOKEN` from env and never echoes it.
- **Pre-push ritual**: `node scripts/keyscan.mjs` (must be CLEAN or only
  RECEIPTED-BENIGN rows; paste the summary line into the push receipt), then push with
  the token discipline (embed → push → ls-remote verify → scrub URL → unset helper).
- **CI**: none. Integrity is receipts + hashes: `graph.json.ledger_sha256`,
  `cot_sha256`, reasoning_content sha, request shas in the ledger — all recomputable by
  a stranger in seconds (the 63-a-r auditor did exactly this).
- **Live store**: the organ candidate is on the fleet's organ store (organ id
  `1e10ff0275abc461cbe9588344cc519962cb1b662a8124a1da41d59a0f49f21b`, HTTP 201,
  server-side verify bootable: true). Dialect note: toolkit `quilt.organ.manifest/v1`
  vs worker `quilt.organ.v1` field layouts differ; canonicalization agrees; unification
  parked.

## Design decisions & why

1. **Cheaper models decompose the big model's CoT.** The deliverable is the idea's
   cellular structure, not the prose; independent decomposers give agreement-as-evidence
   and disagreement-as-inventory. Tradeoff: merge noise (74 raw nodes → 48 clusters);
   run-2 tightens the merge rather than abandoning independence.
2. **Two pipelines (Python and Node)** instead of one. The Python one serves
   multi-seed orthogonality studies; the Node one served the fleet-question run with
   two-arm decomposition and strict judge separation. Tradeoff: duplicated client code —
   mitigated by shared conventions copied from `lode`/`qthe` receipted clients.
3. **History is never rewritten, even for secrets.** The leaked credential stays
   verbatim because it is inert and because rewriting a sealed receipt falsifies the
   record. Tradeoff: a permanently scannable historical string — contained by the
   suppression table + incident doc instead of deletion.
4. **Fold-back over re-generation.** Judge findings become cells with provenance
   (`origin='adversarial-critique'`, `origin='critique'`), keeping the graph append-only
   and auditable. Tradeoff: the graph accumulates volatile cells (26/49) — visible in
   stability stats rather than hidden.
5. **Certified entropy for seeds, honestly degraded.** mothquantum per-bit jobs with
   fail-closed fallback and `entropy_bits_true` flags. Tradeoff: the seeds provably do
   nothing for diversity (endpoint ignores them) — kept for provenance discipline, with
   the receipted finding attached so nobody mistakes book-keeping for mechanism.
6. **Self-verifying uploads.** The organ bundle re-derives its own stateHash and receipt
   digests, and cross-checks canonicalization against an independent implementation
   before upload. Tradeoff: a slower export; the payoff was a byte-exact id match with
   the server on the live upload.
