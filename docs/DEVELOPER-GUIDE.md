# cot-quilt — Developer Guide
> For developers extending the decomposition pipeline or the receipt/security kit.

## Code layout (file-by-file map of the important paths)

```
README.md                     6-phase pipeline, first receipted run, cell signature,
                              receipted costs, discipline, v0.2 playtesters, run-1 summary
RUN-REPORT.md                 the zero-shot manual for run-1 (why, not just what):
                              prompt design, two arms, judge separation, ledger format,
                              what worked, the 7-item run-2 change list, organ upload
SECURITY-INCIDENT.md          the 2026-10-01 credential-exposure incident record:
                              root-cause chain, exposure window, mitigation, why the
                              commit stays in history, prevention checklist
cot_decompose.py              Python pipeline (6 receipted phases). Header = the owner
                              directive. Contains: KEYS load from .env.keys, scrub()
                              (incident law), burn-guard, JSON repair loop, mothquantum
                              seed client, resume-per-sample machinery
playtest_routes.py            v0.2 play-test battery (cheap cells judge the graph) +
                              routes/conditional-environments emitter (jev-latest)
tools/build_cot_viewer.py     v2 static SVG graph viewer (multi-line labels, cluster
                              ->cluster edges, critique row) — Pages-ready
tools_build_cot_viewer.py     v1 viewer kept at root (lineage; superseded)
scripts/
  keyscan.mjs                 the pre-push audit kit (HEAD + staged + worktree),
                              credential-class patterns, masked output, suppressions
  clients.mjs                 receipted HTTP clients (deepseek/typesafe/deepinfra),
                              scrub-at-choke-point, price book, fail-closed errors
  run1_pipeline.mjs           run-1 orchestration (zero deps): compose → 2 decomposer
                              arms → local merge → separated judges → fold-back → export
  export_organ_bundle.mjs     wraps the organ candidate in the store dialect, self-verifies
                              fail-closed, uploads (token from env, never echoed)
runs/
  20261001T185823Z-4bb8f5f5/  first receipted run: receipt.json, sample-*-cot.md
  2026-10-01-run1/            run-1: graph.json (49/104), cot_raw.md, judges/,
                              seeds/ledger.jsonl (append-only), state/, AUDIT-63a-r.md,
                              REMEDIATION-63a-r.md
  20261001T195410Z-503b10b9/  the run whose earlier committed receipt triggered the
                              security incident (current tree is clean; the inert string
                              lives in git history at commit 677484d, receipt.json:1788)
  playtest-20261001T190939Z-*.json   v0.2 playtest receipt
  wave64-run2/                wave-64 run-2 directory
exports/
  organ-candidate-rewind.json  the 23-cell / 36-edge organ candidate (uploaded live)
  coverage-table.md            graph-vs-ORGAN-BOOT-v0 diff (COVERED/PARTIAL/UNCOVERED/DOCTRINE)
```

## Core concepts (named as the code names them)

1. **Lens** — the orthogonality mechanism. Because the endpoint ignores `seed`
   (receipted), each sample gets a persona (skeptic / engineer / teacher) so the three
   CoTs diverge meaningfully; the requested seed is book-keeping that proves provenance.
2. **Burn-guard** — retry-at-higher-budget on `finish=length && !content` (a reasoner
   that spent the entire budget on hidden reasoning). Budget for v4-pro samples: 12k→36k.
3. **Compose/test separation** — no model ever judges a node set it composed: flash ×3 +
   typesafe compose; typesafe (probability battery: p_complete / p_implementable /
   p_missing_major / p_faulty) + Hermes-3-405B (adversarial, must quote point ids) judge.
4. **Fold-back** — judge demands become cells, never silent edits: missing → new cells
   `origin='adversarial-critique'` at 0.8× weight; faulty → `faulty_note` on the flagged
   cell, which stays. The graph grows its own missing cells.
5. **Append-only ledger** — `seeds/ledger.jsonl`: one row per call attempt (ordinal,
   ts_utc, phase, service, model_requested AND model_served, seed, temperature, purpose,
   status, latency, usage, finish reason, declared cost, request sha, notes). A dead call
   is still a row; corrections are new rows.
6. **scrub() / keyscan suppressions** — the incident-law pair: scrub masks
   credential-shaped substrings before any error text reaches a receipt; keyscan scans
   HEAD+staged+worktree pre-push and treats suppression entries as "known, inert,
   receipted".
7. **Phase-state caching** — `state/<phase>.json` (atomic tmp+rename): any phase
   re-enters cached; this is what made resume+remediation cost 4 calls in 70 s.

## How to extend

### Run a new decomposition (Python path)

1. Set the prompt inside `cot_decompose.py` (or its CLI args — read the arg parser first)
   and the three lens personas if you need different ones.
2. Run with keys in env. Every phase writes incrementally; interrupting is safe.
3. Read `runs/<ts>-<slug>/receipt.json` (calls), `graph.json` (v1+v2), `sample-*-cot.md`
   (the CoTs). Judge score + gaps are the payload — fold them in, don't just read them.

### Run a new Node-pipeline experiment

1. Copy the run-1 pattern, not the code: one question verbatim in the artifact; CoT as
   deliverable; two independent decomposer arms (JSON-contract arm + typed-wire arm);
   deterministic local merge; separated judges; fold-back.
2. Follow `RUN-REPORT.md` §8's change list — it is the receipted diff between run-1 and
   what run-2 should be (burn-guard before repair, faithfulness check after repair,
   fail-closed verdict counts, merge tightening, threshold policy, edge provenance,
   trust-roots prompt).
3. Every HTTP call goes through `scripts/clients.mjs` helpers — never a bare
   `fetch`/`urllib` — so usage, latency, scrubbing, and ledger rows are automatic.

### Add a new provider to the receipted clients

1. Add a `needKey('YOUR_API_KEY')`-based client in `scripts/clients.mjs`; keys come from
   process.env only, are never printed, never written to artifacts.
2. Return the usage receipt from every call; the orchestrator appends it to the ledger.
3. Fail closed: non-2xx/unparseable → throw with the HTTP status; the orchestrator
   converts to an honest FAIL row. Ensure the error path passes `scrub()`.

### Add a credential pattern (only if the fleet gains a new key class)

1. Add it in BOTH places: `scripts/keyscan.mjs` PATTERNS and the `KEY_PAT` regexes in
   `cot_decompose.py` + `scripts/clients.mjs`.
2. Length-guard so benign identifiers (e.g. the function name `moth_seeds`) do not match.
3. Output discipline: never print matched values — class + length + masked snippet only.

## Testing

There is no unit-test suite; the repo's guarantees are checked by the audit kit and by
recomputable hashes:

```bash
node scripts/keyscan.mjs                      # exit 0; CLEAN or only RECEIPTED-BENIGN rows
python3 - <<'EOF'
import json, hashlib
g = json.load(open("runs/2026-10-01-run1/graph.json"))
assert len(g["nodes"]) == 49 and len(g["edges"]) == 104
print("graph shape OK")
EOF
python3 tools/build_cot_viewer.py             # renders the latest complete run without errors
```

"Green" means: keyscan CLEAN, graph parses at the receipted shape (49/104), the ledger
parses line-by-line as JSONL, and artifact hashes (`graph.json.ledger_sha256`,
`cot_sha256`) recompute. For live runs, the honest check is the ledger itself: planned
vs actual calls, FAIL rows explained, spend of record matches usage rows.

## Conventions

- **Keys**: read at runtime from `/home/z/my-project/.env.keys` (Python loads it
  directly; Node uses process.env) or env vars; mode 600; gitignored (`.env`, `.env.*`,
  `.env.keys`, `*.env`). Refer to credentials by ROLE ("the rolled deepseek credential"),
  never by value — including in commit messages.
- **Receipts**: atomic writes (tmp + fsync + rename); append-only ledgers; every phase
  persists before proceeding; failures are rows.
- **Runs are content-keyed**, not wall-clock-keyed; run ids embed a content slug.
- **Commit messages are receipts** (see history: "hardened provider ladder …, run-2
  complete"). Security-relevant commits reference SECURITY-INCIDENT.md.
- **Viewer/tool versions**: v2 lives in `tools/`; root-level duplicates are lineage and
  must not be "modernized" silently.

## Gotchas for editors

- **Touching any HTTP/error path without `scrub()` is how the incident happened.** The
  `http()` helper's broad `except Exception` stored `str(e)` unscrubbed; keep the scrub
  between the exception and any persistence, including in new helpers.
- **Never rewrite history or mask the historical receipt** (`677484d` stays verbatim);
  the suppression table + SECURITY-INCIDENT.md are the only sanctioned references to it.
- **Never judge with a composer model** — if you add a judge, add it on the judge side
  of the separation, and quote point ids in adversarial verdicts.
- **Don't trust `seed` for diversity**; use lenses/temperature. Seeds are book-keeping.
- **Don't run repair calls without the verbatim source** — the contamination incident
  (~24% of the as-found graph) started exactly there.
- **`--redo-seed` exists for a reason**: re-call ONE seed, reuse the rest; wholesale
  re-runs burn budget and break hash chains for no informational gain.
