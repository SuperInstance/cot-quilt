# JEV Doctrine — cot-quilt's typesafe oracle under SuperInstance/jev-quilt's R6 probe classes

cot-quilt's WIRE phase asks a typesafe.ai System-One battery (`jev-latest` model,
`POST /v1/systemone`, see `typesafe()` in `cot_decompose.py`) to score each
decomposed reasoning step for load-bearingness and to choose step dependencies.
That oracle is a **JEV** (judged-evidence value) consumer in exactly the sense the
fleet's JEV-hardening lane defines and probes live.

This document fixes the doctrine lineage: cot-quilt's WIRE battery routes through
the probe classes hardened in **SuperInstance/jev-quilt** (fleet repo, public).
It is a doctrine citation, not a code dependency — cot-quilt does not import
jev-quilt code, and this file makes no such claim.

## R6 live-probe classes (from SuperInstance/jev-quilt PR #24) mapped onto WIRE

| R6 class | jev-quilt verdict | cot-quilt WIRE handling today | honest state |
|---|---|---|---|
| hash-drift | REJECT — re-state the same evidence with a different digest and the judge must not silently follow | not applicable as a literal digest check (cot-quilt sends state text, not hashed evidence rows); doctrine import: a re-phrased-but-equivalent WIRE state must not produce materially different load scores for the same step | doctrine adopted; no live rephrase probe run yet |
| port-lies | REJECT — the judge claiming a port it does not have must be caught | `typesafe()` records the served model id (`out['served']`) next to the requested `jev-latest`, so served-vs-requested drift lands in the receipt rather than being laundered into evidence | receipted already; served≠requested is visible in every battery receipt |
| rephrased-true | ACCEPT — rephrasing that preserves truth must not change the verdict | WIRE truncates state at 20000 chars (`state[:20000]`); a truncation boundary is a rephrase-class risk for long CoTs — doctrine: scores near the boundary are evidence-of-partial-state, not evidence-of-whole-state | named as a limit; probe battery planned for run 2 |
| one-lie-among-five | DISCUSS — one corrupted item among honest ones must surface, not be averaged away | `merge()` keeps divergent routes as first-class ALTERNATE ROUTES instead of silently dropping minority steps; a single corrupted sample can therefore show up as a divergent entry rather than being averaged into a cluster | aligned in code; per-cell divergence audit is the run-1 AUDIT's job |

## Refusal / jev-unavailable semantics

jev-quilt's standing rule for judged evidence: **refusal is never faked and
absence is never laundered into zero-confidence evidence**. In cot-quilt terms:

- A non-200 battery response receipts `error` and leaves `answers: None`.
- `extract_graph()` then degrades: nodes are emitted with `load_score: None` and
  no edges are drawn from that battery.
- Downstream, `max_load` over cluster members stays `None` when no member had a
  score — absence propagates as absence.

Doctrine adopted: a dead battery must not read as "the model found nothing
load-bearing"; it reads as "the oracle was unavailable for this sample". The
per-sample receipt ledger is what makes that honest (every phase persists its
receipt incrementally, per the README).

## F1 calibration note

jev-quilt's F1 finding (calibration gap: judged scores cluster at the top of the
rubric regardless of step quality) is inherited as a standing caveat: WIRE
`load_expected` values are ordinal weights for attention allocation, not
calibrated probabilities. The rubric bands (`RUBRIC_LOAD`, 4-point) are wider
than jev-quilt's evidence supports treating as calibrated; budget is allocated
by rank, never by absolute score.

## Not done in this PR (honest list)

- No live R6 probe battery against the typesafe endpoint (requires `TYPESAFE_API_KEY`;
  run 2 can execute the four probes as receipted phases and append results here).
- No WIRE-phase code change: truncation, degradation, and served-model receipting
  were already correct against the doctrine; this document pins the alignment so
  future behavior changes have a standing reference.
- No referral-graph booking here; the graph ledger lives in SuperInstance/quilt-tools
  and books edges on merge per the weight law (VERIFIED = merged PR in the target
  repo cites the technique repo by name — this file is that citation).
