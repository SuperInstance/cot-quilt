# cot-quilt

**The CoT-decomposition cell: a large model's chain-of-thought becomes a cellular graph.**

A chain-of-thought from `deepseek-v4-pro` is decomposed — by cheaper models — into the
cellular graph of the larger model's idea: nodes are reasoning steps, edges are
typesafe-inferred dependencies, cross-seed agreement is weight, divergences are
alternate routes, and the larger model itself judges how thorough the decomposition
has become and what is missing. The critique is folded back in as new cells.

## Pipeline (one run = 6 receipted phases)

```
0 SEEDS    3×16 TRUE quantum bits from mothquantum coin-toss jobs (per-bit, parallel,
           fail-closed to os.urandom with per-bit flags). Receipted finding: the
           deepseek endpoint ignores `seed` — so seeds are book-keeping and each
           sample also gets a LENS persona to guarantee orthogonality.
1 COT      3× deepseek-v4-pro (api id deepseek-reasoner) samples of the same prompt
           under three lenses: skeptic / engineer / teacher. CoT + answer + usage
           + finish_reason captured per sample. Burn-guard: if the reasoner spends
           the whole budget on reasoning (finish=length, no content), retry at 3×.
2 SPLIT    deepseek-flash compresses each CoT into ≤8 typed steps
           (PREMISE | INFERENCE | CHECK | DECISION | CONCLUSION). JSON repair loop.
3 WIRE     typesafe.ai (jev-latest) battery per sample: load-bearing score per step
           (rubric 0–3, expectation = Σpᵢ·i) + dependency choice per step
           (which earlier step feeds this one) → edges with probabilities.
4 MERGE    deepseek-flash aligns steps across samples into clusters; occurrence
           count = cross-seed weight; kept-out divergences become ALTERNATE ROUTES
           ("more neural-networks of logic" — same prompt, orthogonal paths).
5 JUDGE    deepseek-v4-pro judges the merged graph against the original prompt:
           thoroughness 0–10 + up to 5 gaps. deepseek-flash folds the gaps back in
           as origin="critique" cells → graph v2.
```

Every phase persists its receipt incrementally (`runs/<ts>-<slug>/receipt.json`) and
resumes per-sample — foreground chunk mode is a first-class citizen:

```bash
python3 cot_decompose.py --resume runs/<ts>-<slug>   # continue an interrupted run
```

## First receipted run (2026-10-01T185823Z, prompt: local budget-grant rule for a cellular graph)

- Seeds 52840 / 25780 / 24417 — 48/48 bits from mothquantum, zero fail-closed.
- 3/3 samples decomposed to 8 steps; 3 CoTs at 50–95 KB each (`sample-*-cot.md`).
- Merge: 6 clusters (3× Task definition, 3× Local urgency score p/r, 3× Token holder
  moves locally, 2× Service lowers future priority, 3× Starvation risk, 3× Fairness
  claim) + 4 divergent routes (global-max impossibility, tie-breaking/backoff,
  randomized token walk [2 samples], aging-based deterministic token).
- Judge: **6/10** — "captures the high-level components but omits the key aging,
  tie-breaking, and proof mechanisms". The five gaps became five critique cells
  (aging λa term, tie-breaking CHECK, irreducible-walk INFERENCE, formal
  no-starvation proof CHECK) → graph v2.

The judge finding is itself the payload: v4-pro's own multi-seed reasoning
converged on *potential/resistance priority + token walk* but only diverged
samples carried *aging* — the decomposition made the convergence/divergence
structure of a large model's idea visible, per-cell.

## Cell signature (drop into a quilt)

```
in : {prompt, n_seeds?=3, lenses?[]}
out: {graph_v1[], graph_v2{clusters, divergent, critique_nodes}, judge{score, gaps, verdict}, receipts}
```

- **graph_v1 nodes** → value cells; **edges** → links with `p` as dial weight.
- **judge.gaps** → question-cells for the next iteration (little LLMs make the questions).
- **critique nodes** → the already-written next generation, `origin="critique"` —
  a quilt that grows its own missing cells.
- **typesafe load-scores** → cell resolution policy (agentically optimized
  resolution: spend attention where load_expected is high).

## Costs (receipted)

- 3× v4-pro CoT: 10–25k reasoning tokens each (~$0.01–0.03/sample class).
- 3× flash split + 1 flash merge + 1 flash refine: seconds, cents.
- 3× typesafe batteries: n≈20 questions each.
- 1× v4-pro judge: ~2–4k tokens.
- Caching: repeated prompts on the same topic hit deepseek prompt cache —
  iterative runs on a topic get cheaper (book-keeping keeps `prompt_cache_hit_tokens`).

## Discipline

- No key ever on disk outside `.env.keys` (chmod 600, gitignored).
- Every HTTP call receipted: model served, usage, latency, finish_reason.
- Failure paths receipted, not hidden: burn-guard retries, JSON repair loop,
  mothquantum per-bit fail-closed with `entropy_bits_true` count.
- Seeds recorded even though the endpoint ignores them — book-keeping is the point.

## Wave-64 instrument lessons (receipted)

- The deepseek `seed` parameter is accepted but ignored (probe: seed=42 → 347, then 42 → 7).
  Diversity is enforced by lenses; seeds stay in the ledger as book-keeping.
- A reasoner call can burn the whole `max_tokens` on reasoning (`finish=length`, empty
  content). The burn-guard retries at 3× budget; budget for v4-pro samples is 12k→36k.
- Receipt writes are atomic (tmp + fsync + rename): a mid-write kill once truncated a
  receipt and the resume created a fresh run id inside the old directory — harmless but
  receipted; runs are keyed by content, not by wall clock.
- mothquantum per-bit jobs give TRUE 16-bit seeds (48/48 quantum bits in the flagship run);
  any fallback bit is flagged `entropy_bits_true < 16`.

## v0.2 — play-testers + routes/conditional environments (receipted)

- **Play-test battery** (cheap cells judge the graph, `playtest_routes.py`):
  - seed-2.0-mini as court jester: "flabby indecision — dithers over random walks,
    tiebreaks, aging without nailing a concrete rule"; the one right thing: dropping
    priority post-service stops hogging. (Poignant mockery — exactly the goating role.)
  - granite-4.2-3b as racehorse: "Yes — supplies a concrete local rule; first blocker
    is Local-max starvation risk."
  - Muse-Glimmer-30B: reasoner-style burn (finish=length, reasoning-only) — receipted,
    retry with bigger budget queued.
- **Routes + conditional environments** (jev-latest): for future prompts "with a
  similar ask" —
  - full design ask → enter at **Task definition** (p=0.89)
  - starvation-freedom-only ask → enter at **No-starvation fairness claim** (p=0.97)
  - generalization noul 0.38 (honest uncertainty outside allocation-rule domain)
  - completeness score 1.15/3 ≈ "reusable WITH the critique cells" — matches the
    v4-pro judge's own gap list; the graph is not yet a general routing table.

## run-1 (2026-10-01, lane 63-a/63-a-r): FLEET-Q-REWIND-ORGAN — the Node pipeline

`scripts/run1_pipeline.mjs` (zero deps): 1× deepseek-v4-pro CoT (18,217 chars, `finish=stop`)
→ **two independent decomposer arms** (flash ×3 temperatures 0.2/0.7/1.1 + typesafe
jev-1.13.0 per-point noul battery) → deterministic local cluster-merge (jaccard 0.42,
seed-vote stability) → **compose/test-separated judges** (typesafe probability battery +
Hermes-3-405B adversarial attack on DeepInfra; no model judges nodes it composed) → critique
folded back as cells → `graph.json` + `exports/organ-candidate-rewind.json`.

- Final (remediated) graph: **49 cells / 104 edges**, 8 core + 14 stable + 26 volatile +
  1 critique; seed-stability 45.8%. Judges: hermes pass=true completeness 0.95 (its missing
  mechanism became cell C01); typesafe p_complete 0.71, p_faulty 0.27.
- Resume discipline exercised for real: the run was interrupted, audited on-disk
  (`runs/2026-10-01-run1/AUDIT-63a-r.md`), then remediated with 4 receipted calls reusing
  every healthy stage (`REMEDIATION-63a-r.md`) — ledger append-only 27 rows, all-in spend
  $0.098 deepseek-declared.
- Cross-feed: `exports/coverage-table.md` diffs the graph's organ candidate against ORGAN
  BOOT v0 (quilt-jev-toolkit @ ecaf2e4): custody core COVERED, rewind + write-side
  transactions UNCOVERED — the graph is organ-boot v1's demand signal.
- Methodology (how such runs are constructed) is documented for zero-shot readers in
  [`RUN-REPORT.md`](RUN-REPORT.md).

## Documentation (wave-69 doc package)

Route by audience — every file is complete and current as of wave-69:

- Just cloned, zero context (agents): [docs/ONBOARDING.md](docs/ONBOARDING.md) —
  identity, verify-it-works commands (incl. the keyscan ritual), gotchas, frontier.
- Running decompositions (users): [docs/USER-GUIDE.md](docs/USER-GUIDE.md) — install,
  first success, everyday tasks (run/resume/play-test/viewer/upload), troubleshooting,
  FAQ (incl. the security story).
- Extending the code (developers): [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md) —
  code layout, core concepts (lens, burn-guard, judge separation, fold-back, ledger),
  how to add providers/patterns safely, gotchas.
- Operating/reviewing the system (engineers):
  [docs/ENGINEERING-NOTES.md](docs/ENGINEERING-NOTES.md) — architecture, invariants
  (env-read keys, scrub(), append-only ledgers), failure modes incl. the realized
  incident, receipted cost envelope, design decisions.
- Deciding investment (executives): [docs/CTO-BRIEF.md](docs/CTO-BRIEF.md) — maturity,
  risks, cost profile, strategic options.
- The index of indexes (everyone): [docs/KNOWLEDGE-MAP.md](docs/KNOWLEDGE-MAP.md) —
  every file, run, receipt, journal task ID, and the security-incident pointer.
