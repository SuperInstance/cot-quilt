# cot-quilt — Agent Onboarding
> Zero-shot entry point. Clone → competent in ~10 minutes.

## Identity (2 sentences)

cot-quilt is the CoT-decomposition cell: a chain-of-thought from a large reasoner
(`deepseek-v4-pro`, api id `deepseek-reasoner`) is decomposed by cheaper models
(deepseek-flash, typesafe jev, granite, Hermes) into a cellular graph of the larger
model's idea — nodes are reasoning steps, edges are inferred dependencies, cross-seed
agreement is weight, and divergences become alternate routes. Two independent pipelines
exist: the Python `cot_decompose.py` (6 receipted phases, multi-seed) and the Node
`scripts/run1_pipeline.mjs` (run-1: FLEET-Q-REWIND-ORGAN, two decomposer arms +
compose/test-separated judges).

## Why it exists (the fleet problem it solves)

The fleet reasons in cells (elementary, independently-operating parts of an idea), but
large models emit prose reasoning, not cells. This repo (wave-64, owner directive
receipted in the `cot_decompose.py` header) is the converter: it makes the
convergence/divergence structure of a large model's thinking visible per-cell, prices
each step with an independent judge model, and folds critiques back in as new cells so
"a quilt that grows its own missing cells". Run-1 aimed the instrument at a real fleet
question (FLEET-Q-REWIND-ORGAN) and produced the organ candidate that was diffed
against ORGAN BOOT v0 and uploaded LIVE to the fleet's organ store (HTTP 201,
server-verified bootable: true). The repo is also the fleet's hardest-won security
lesson in artifact form: a live credential leaked through an unsanitized exception
string into a committed receipt in wave-63/64 (commit `677484d`, documented in
`SECURITY-INCIDENT.md`, mitigated by roll), and the mitigation kit built here
(scrub-at-choke-point, pre-push key-scan, env-read pattern) is now the pattern other
repos copy.

## Verify it works (exact commands)

Offline checks (no keys, no network) — verified wave-69:

```bash
# 1. The pre-push security ritual. Must print CLEAN (or only RECEIPTED-BENIGN rows). Exit 0.
node scripts/keyscan.mjs

# 2. The run-1 graph is intact and hash-bound: 49 nodes / 104 edges, ledger sha present.
python3 - <<'EOF'
import json
g = json.load(open("runs/2026-10-01-run1/graph.json"))
assert len(g["nodes"]) == 49 and len(g["edges"]) == 104, (len(g["nodes"]), len(g["edges"]))
print("OK", len(g["nodes"]), "nodes /", len(g["edges"]), "edges / ledger",
      g["ledger_sha256"][:16])
EOF

# 3. Parse-check the exports and receipt ledgers.
python3 - <<'EOF'
import json
json.load(open("exports/organ-candidate-rewind.json"))
json.load(open("runs/20261001T185823Z-4bb8f5f5/receipt.json"))
print("OK exports+receipt parse")
EOF
```

What CANNOT run without credentials and network: every live pipeline
(`python3 cot_decompose.py`, `python3 playtest_routes.py`,
`node scripts/export_organ_bundle.mjs`). They need `DEEPSEEK_API_KEY`,
`TYPESAFE_API_KEY`, `DEEPINFRA_API_KEY`, and `MOTHQUANTUM_API_KEY` (a hard module-level
requirement — `cot_decompose.py:71` KeyErrors without it; `WORKER_UPLOAD_TOKEN` is also
needed for the organ upload). The Python pipeline reads keys ONLY from the key file
(`/home/z/my-project/.env.keys` pattern — zero `os.environ` reads); Node clients
(`scripts/clients.mjs`) also read process env. Proof they ran: the committed
receipts — `runs/20261001T185823Z-4bb8f5f5/receipt.json` (first receipted run: 48/48
quantum seed bits, judge 6/10, graph v2), `runs/2026-10-01-run1/` (AUDIT + REMEDIATION
reports, ledger append-only, all-in spend $0.098 declared), and the organ upload
receipt in `RUN-REPORT.md` §9.

`node scripts/run1_pipeline.mjs` is NOT in that list: it runs fully OFFLINE (replays
committed state caches) — but note: the replay rewrites two sealed artifacts
(`runs/2026-10-01-run1/graph.json` generated_at_utc + `exports/organ-candidate-rewind.json`),
invalidating their recorded graph_sha256; `git checkout` restores them.

## Reading order (paths, not vibes)

1. `README.md` — the 6-phase pipeline diagram, the first receipted run's numbers, the
   cell signature, receipted costs, and the discipline list.
2. `SECURITY-INCIDENT.md` — the leak, the root cause chain, the mitigation kit, and the
   prevention checklist. Read it before touching receipts or HTTP paths.
3. `RUN-REPORT.md` — the zero-shot manual for run-1: prompt design, two decomposer
   arms, judge separation, ledger format, what worked, what changes for run-2.
4. `cot_decompose.py` (header + `scrub()`) — the Python pipeline and the incident law
   in code.
5. `scripts/run1_pipeline.mjs` — the Node pipeline (zero deps) with phase-state caching.
6. `exports/coverage-table.md` — the graph-vs-implementation diff discipline.

## The things that will bite you (gotchas)

- **Error strings are a secret-exfiltration channel.** Python's
  `ValueError: unknown url type: '<value>'` embeds the offending value verbatim; the
  incident happened exactly that way. Every HTTP/error path must pass through
  `scrub()` (`cot_decompose.py`, `scripts/clients.mjs`) before a receipt can store it.
  Replicate this in any new helper you add.
- **Run keyscan before every push** (`node scripts/keyscan.mjs`): HEAD tree + staged
  diff + worktree, exits non-zero on any un-receipted hit. A suppression entry means
  "known, inert, receipted" (there is exactly one, justified by SECURITY-INCIDENT.md);
  it never means "ignore the future".
- **The deepseek endpoint ignores `seed`.** Receipted probe (seed=42 → 347, then 42 →
  7). Diversity comes from LENS personas (skeptic/engineer/teacher) or temperature; the
  requested seed stays in the ledger as book-keeping only.
- **Reasoner burn: a call can spend the entire `max_tokens` on hidden reasoning**
  (`finish=length`, empty content). The burn-guard retries at 3× budget (12k→36k for
  v4-pro samples). Size output budgets to the output contract, not hope (run-1 §8.3).
- **Repair prompts must carry the source document.** A repair call without the verbatim
  CoT invented a generic plan and contaminated ~24% of the as-found graph — fixed
  forward and receipted; run-2 must add a post-repair faithfulness check.
- **No model judges a node set it composed.** The judges are typesafe (probability
  battery) + Hermes-3-405B adversarial; the composers are flash ×3 + typesafe. Breaking
  this invalidates the graph's trust structure.
- **Never delete receipt data.** The leaked credential stays in history verbatim
  (commit `677484d`, `receipt.json:1788`) because it is inert (rolled) and history is
  never rewritten — corrections are new rows; the string is keyscan-suppressed with
  justification. Note: the published branch's history was amended (wave-67/68 secret
  purge) to scrub the leaked credential — commit `677484d` and the leak-bearing receipt
  exist only in pre-purge private history; the public record begins at its successor
  `bbd8b5d`. The never-rewrite law applies to receipts as claims; history rewrites for
  secret purges are receipted exceptions (see SECURITY-INCIDENT.md). DO NOT copy that
  string anywhere; refer to it by role only.
- **`tools_build_cot_viewer.py` (root) is the older v1 viewer**; `tools/build_cot_viewer.py`
  is the v2 (multi-line labels, cluster→cluster edges). Use the tools/ one; the root
  copy is lineage.
- **Resume creates a fresh run id inside the old directory** if a receipt was truncated
  mid-write (atomic tmp+fsync+rename writes since); runs are keyed by content, not wall
  clock — harmless but receipted.

## Where deeper knowledge lives

- Knowledge map: [docs/KNOWLEDGE-MAP.md](./KNOWLEDGE-MAP.md)
- Fleet journal: SuperInstance/superinstance-lab → worklog.md (grep `cot-quilt`;
  lanes 63-a/63-a-r and the incident receipt are recorded there).
- `runs/2026-10-01-run1/` — AUDIT-63a-r.md (as-found audit), REMEDIATION-63a-r.md
  (4 receipted calls fixing 2 seeds), seeds/ledger.jsonl (append-only, 27 rows),
  state/ (per-phase caches), judges/ (typesafe + Hermes verdicts).
- Related repos: `quilt-jev-toolkit` (ORGAN BOOT v0 — the cross-feed counterparty),
  `quilt-organ-workers` (the live organ store the candidate was uploaded to),
  `fleet-seeds` (lode — the receipted-client conventions this repo follows),
  `mothquantum` (the certified-entropy seed source).

## Current frontier (what is open right now)

From `RUN-REPORT.md` §8 (each item receipted in run-1) and the incident checklist:

1. Guard the decomposer's hidden-reasoning burn explicitly before the repair path.
2. Post-repair faithfulness check (noul battery on repaired nodes) after any repair call.
3. Assert verdict count == candidate count (fail-closed) instead of best-effort budgets.
4. Tighten the merge (noul battery on merged candidates, or LLM-adjudicated merge) —
   74 raw nodes → 48 flash clusters at jaccard 0.42 is loose.
5. Decide the typesafe threshold policy once (battery prices vs threshold that does
   nothing) and make the receipt show it.
6. Edge provenance should record ALL asserters (mirror cell-level seed_votes).
7. Run-2's prompt should ask about trust anchors (checkpoint signatures/PKI) — the
   coverage table found no node demanding them.
8. Open security checklist items: replicate scrub-at-choke-point + atomic writes in any
   new HTTP helper; never paste credentials into commits, tickets, logs, or prompts.
9. Organ dialect unification: `quilt.organ.manifest/v1` (toolkit) vs `quilt.organ.v1`
   (worker store) field layouts differ; canonicalization agrees — v1 unification is the
   parked 63-c/63-e follow-up.
