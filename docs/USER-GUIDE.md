# cot-quilt — User Guide
> For an agent or researcher who wants to decompose a chain-of-thought into a cellular
> graph — or consume an existing one — without becoming a pipeline developer.

## What you get

1. **A decomposer.** Give it a prompt; it samples a large reasoner's chain-of-thought
   multiple ways, decomposes each CoT with cheaper models, merges the decompositions
   into one cellular graph (nodes = reasoning steps, edges = dependencies with
   probabilities, weights = cross-seed agreement), judges the graph with models that
   never composed it, and folds the critique back in as new cells.
2. **A graph you can drop into a quilt.** Cell signature (from the README):
   `in : {prompt, n_seeds?=3, lenses?[]}` →
   `out: {graph_v1[], graph_v2{clusters, divergent, critique_nodes}, judge{score, gaps,
   verdict}, receipts}`. graph_v1 nodes → value cells; edges → links with `p` as dial
   weight; judge.gaps → question-cells; critique nodes → the already-written next
   generation (`origin="critique"`).
3. **Routes and conditional environments** (v0.2): for future prompts "with a similar
   ask", the graph emits entry points (e.g. full design ask → enter at *Task
   definition*, p=0.89; starvation-freedom-only ask → *No-starvation fairness claim*,
   p=0.97).
4. **A play-test battery** (`playtest_routes.py`): cheap models beta-test the graph —
   "would it help YOU implement? which cell is missing?" — with distinct roles
   (court jester, racehorse) that produce honest, pointed criticism.
5. **Receipts for every call.** Model requested AND served, usage, latency, finish
   reason, declared cost, request hashes — an append-only ledger per run. Failures are
   rows too.

## Install

```bash
git clone https://github.com/SuperInstance/cot-quilt
cd cot-quilt
node --version    # >= 18 for the Node pipeline and keyscan
python3 --version # >= 3.9 for the Python pipeline
```

Credentials (not included, never committed): `DEEPSEEK_API_KEY`, `TYPESAFE_API_KEY`,
`DEEPINFRA_API_KEY` — read from process env or `/home/z/my-project/.env.keys`
(mode 600, gitignored). The organ uploader additionally needs `WORKER_UPLOAD_TOKEN`.

## First success in 5 minutes

You cannot run the live pipeline in five minutes (it makes ~24 metered LLM calls), but
you can inspect a completed, hash-bound run immediately:

```bash
node scripts/keyscan.mjs   # CLEAN — the pre-push ritual, also your sanity check
python3 - <<'EOF'
import json
g = json.load(open("runs/2026-10-01-run1/graph.json"))
core = [n for n in g["nodes"] if n.get("stability") == "core"]
print(f"graph: {len(g['nodes'])} cells / {len(g['edges'])} edges / {len(core)} core")
print("sample cell:", core[0]["title"])
EOF
```

Expected:

```
---
keyscan summary: 0 hit(s): 0 receipted-benign, 0 UNRECEIPTED; scopes=HEAD+staged+worktree at ...
verdict: CLEAN (all hits receipted or none found)
graph: 49 cells / 104 edges / 8 core
sample cell: <a reasoning-step title from the FLEET-Q-REWIND-ORGAN graph>
```

## Everyday usage

### 1. Run the multi-seed Python pipeline (costs metered API spend)

```bash
set -a; . /home/z/my-project/.env.keys; set +a   # or export the three keys yourself
python3 cot_decompose.py
# 6 phases: SEEDS (mothquantum bits, fail-closed) → COT (3× v4-pro under lenses)
# → SPLIT (flash ≤8 typed steps) → WIRE (typesafe battery: loads + deps)
# → MERGE (clusters + alternate routes) → JUDGE (v4-pro scores gaps; flash folds in)
# Artifacts land in runs/<ts>-<slug>/: receipt.json, graph.json, sample-*-cot.md
```

### 2. Resume an interrupted run (first-class, per-sample)

```bash
python3 cot_decompose.py --resume runs/<ts>-<slug>
```

Every phase persists incrementally and re-enters cached; a resume redoes only what is
missing.

### 3. Run the run-1 Node pipeline (two decomposer arms, separated judges)

```bash
set -a; . /home/z/my-project/.env.keys; set +a
node scripts/run1_pipeline.mjs [--run runs/2026-10-01-run1] [--redo-seed t07]
# --redo-seed re-calls ONE flash seed and reuses everything else (the remediation path)
```

### 4. Play-test a finished graph with cheap models

```bash
python3 playtest_routes.py
# seed-2.0-mini as court jester, granite-4.2-3b as racehorse, Muse-Glimmer-30B;
# then jev-latest distills routing rules (entry points with probabilities)
```

### 5. Render a run as a static SVG viewer page

```bash
python3 tools/build_cot_viewer.py    # v2 renderer (multi-line labels, cluster edges)
```

### 6. Export + upload an organ candidate (fail-closed self-verify first)

```bash
node scripts/export_organ_bundle.mjs
# re-derives stateHash, recomputes every receipt digest, links the chain genesis→tip,
# cross-checks canonicalization against quilt-jev-toolkit, THEN uploads.
# Reference receipt: HTTP 201, organ id 1e10ff0275ab…f21b, server verify bootable:true.
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `KeyError: 'DEEPSEEK_API_KEY'` (Python) or the pipeline's fail-closed dry-run FAIL rows | Keys not in env | `set -a; . /home/z/my-project/.env.keys; set +a` (or export the three key vars); the two FAIL rows in run-1's ledger are exactly this — operator dry-run without keys |
| Sample returns empty content with `finish=length` | The reasoner burned the whole budget on hidden reasoning | The burn-guard retries at 3× automatically; if you call models yourself, budget 12k→36k and check `finish_reason` |
| Decomposed JSON is broken/malformed | Model output drifted from the strict compact-JSON contract | The repair loop retries once — but run-1's lesson: repair prompts MUST carry the verbatim CoT, or you get generic contamination |
| Cross-review verdicts truncated/lost | Output budget too small for the candidate count | Budget ≈ candidates × expected verdict tokens × margin; assert verdict count == candidate count |
| keyscan exits 1 | An un-receipted credential-shaped string appeared | Do not push. Scrub the value; if it is a known inert receipted artifact, add a suppression WITH justification pointing at SECURITY-INCIDENT.md |
| Seed has no effect on sample diversity | Receipted: the deepseek endpoint ignores `seed` | Use lens personas (skeptic/engineer/teacher) or temperature; keep the seed in the ledger as book-keeping |
| Two viewer outputs differ | Root `tools_build_cot_viewer.py` is the old v1 | Use `tools/build_cot_viewer.py` (v2) |
| Resume seems to re-run everything | The old run dir had a truncated receipt | Runs are content-keyed; the resume creates a fresh run id inside the old directory — this is receipted behavior, not data loss |

## FAQ

**What exactly is a "cell" here?** One atomic reasoning step from the decomposed CoT:
a title, ≤20-word content, a kind (PREMISE | INFERENCE | CHECK | DECISION |
CONCLUSION), a weight, dependencies, and provenance (`origin`, `seed_votes`,
stability = core/stable/volatile from how many seeds produced it).

**Why cheaper models decomposing a bigger model?** Because the payload is the big
model's *idea structure*, not its prose: agreement between independent cheap decomposers
is evidence (29/29 duplicate verdicts in run-1 = the two arms converged), disagreement
is inventory (alternate routes), and the big model itself judges what the cheap ones
missed (judge 6/10 on the first run — its gaps became graph v2's critique cells).

**What did run-1 actually produce?** 49 cells / 104 edges (8 core / 14 stable /
26 volatile / 1 critique), seed-stability 45.8%; an exported 23-cell organ candidate
that was uploaded live (HTTP 201, bootable: true) and diffed against ORGAN BOOT v0
(coverage: 3 COVERED / 9 PARTIAL / 10 UNCOVERED / 1 DOCTRINE — the uncovered center of
mass is rewind + write-side transactions).

**What is the security story?** One live credential leaked in wave-63/64 via an
unsanitized exception string committed in a receipt (commit `677484d`); it was rolled
within ~2 hours and is inert. The repo keeps the incident record (`SECURITY-INCIDENT.md`),
scrubs credential-shaped patterns out of all error text (`scrub()`), scans before every
push (`scripts/keyscan.mjs`), and reads keys from outside the repo at runtime only.
The historical string stays in history verbatim by fleet law (never delete data) and is
suppressed in the scanner as receipted-benign. Never copy it anywhere.

**How much does a run cost?** Receipted, not guessed: run-1 (all-in, 17 deepseek OK
rows, 24 OK + 2 FAIL calls) ≈ **$0.098 declared** (46,840 prompt + 156,159 completion
tokens at the receipted off-peak basis); typesafe 3 batteries (13,758 in / 751 out) and
DeepInfra 2 judge calls (19,411 in / 251 out) carry token receipts with
`cost_usd_declared: null` (no fleet price book). Repeated prompts hit the deepseek
prompt cache, so iterative runs get cheaper.

**Can I use the graph without running anything?** Yes — `runs/2026-10-01-run1/graph.json`
is the finished, hash-bound artifact (49/104), and `exports/organ-candidate-rewind.json`
is the exportable subset. Cite the ledger sha (`graph.json.ledger_sha256`) when you
build on it.
