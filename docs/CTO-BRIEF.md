# cot-quilt — CTO Brief
> Executive summary. Read time: ~5 minutes.

## One-paragraph value statement

cot-quilt converts the opaque prose reasoning of a frontier model into an auditable
cellular graph — typed steps, priced dependencies, cross-seed stability, and judge-found
gaps folded back in as new cells — at commodity cost (~$0.10 per receipted run). It is
both a reusable instrument (decompose any CoT into cells a quilt can consume) and the
fleet's reference implementation of receipted multi-model orchestration with
compose/test separation. It also carries the account's most instructive security
incident and the mitigation kit built from it, which has become fleet-standard practice.

## What it does & for whom

- **For quilt builders**: cell-compatible output — nodes become value cells, edges
  become links with dial weights, judge gaps become question-cells; a quilt can grow its
  own missing cells from `origin="critique"` nodes.
- **For researchers**: visibility into where a large model's multi-seed reasoning
  converges vs diverges (first run: convergence on potential/resistance priority + token
  walk; aging carried only by divergent samples) — per-cell, not per-essay.
- **For organ/agent-infrastructure lanes**: run-1 produced a 23-cell organ candidate for
  the fleet-rewind question, uploaded live (HTTP 201, server-verified bootable: true)
  and diffed against ORGAN BOOT v0 into a COVERED/PARTIAL/UNCOVERED coverage table —
  i.e., the graph is a machine-generated demand signal for the next organ version.
- **For every future lane**: the security kit — scrub-at-choke-point, pre-push keyscan,
  env-read credentials, append-only honest ledgers — as working code.

## Maturity assessment

**Working instrument at prototype-plus grade; security posture hardened post-incident.**

Evidence for: two independently receipted pipelines ran end-to-end (first run: 48/48
quantum bits, 3/3 decompositions, judge 6/10 → graph v2; run-1: 49 cells / 104 edges,
dual decomposers cross-converged 29/29, Hermes pass 0.95, typesafe p_complete 0.71,
all-in spend $0.098 declared, resume+remediation exercised for real); the organ upload
was server-verified byte-exact; the incident was contained within ~2 hours and the
mitigation kit is committed and testable offline (keyscan CLEAN verified wave-69).

Evidence against: the decomposition quality is explicitly mid (judge 6/10 on run one;
completeness 1.15/3 as a routing table — "reusable WITH the critique cells"); the merge
is loose (74 raw nodes → 48 clusters); seven receipted improvement items await run-2;
two organ-bundle dialects remain unified only at the canonicalization layer.

## Risks

| Risk | Severity | Mitigation status |
|---|---|---|
| Credential leakage through artifacts (the realized incident class) | High | Mitigated: credential rolled (inert), scrub() on all error paths, pre-push keyscan with suppression discipline, env-read-only keys, .gitignore coverage; residual: new HTTP helpers must replicate the pattern (open checklist item) |
| Historical inert credential string in git history | Low | Accepted and receipted: never-delete-data law; suppression table + SECURITY-INCIDENT.md as the pointer; credential is dead |
| Inert seed parameters misleading operators into false confidence about diversity | Medium | Mitigated: receipted finding + lens/temperature mechanism; seeds kept as provenance only |
| Model-output contamination (repair paths, budget truncation) | Medium | Partially mitigated: fix-forward receipted; run-2 items (faithfulness check, fail-closed verdict counts) pending |
| Cost creep via burn retries on premium reasoners | Low-Medium | Mitigated: burn-guard + receipted per-call usage and declared costs; prompt-cache reuse for iterative runs |
| Single-provider coupling (deepseek-centric pipeline) | Medium | Accepted for now; the typesafe/DeepInfra arms already provide independence; porting is untested |

## Cost profile

Deliberately cheap and fully receipted. Run-1: $0.098 declared deepseek (off-peak
basis), plus metered typesafe (13,758 in / 751 out) and DeepInfra (19,411 in / 251 out)
tokens with no fleet price book. Infrastructure cost is zero — no servers, no CI, no
databases; artifacts are files, the organ store is fleet-shared and free-tier
(Cloudflare Workers). The dominant cost is attention per run (hours), and phase-state
caching makes resumes nearly free (4 calls / ~70 s for the run-1 remediation).

## Strategic options

- **Invest (recommended, small)**: fund run-2 per the receipted §8 list — the seven
  changes are cheap, directly raise graph trustworthiness (faithfulness checks,
  fail-closed verdict counts, merge tightening, trust-roots prompt), and the coverage
  table gives the next organ version a machine-generated requirements list.
- **Maintain**: keep as the fleet's reference for receipted multi-model orchestration
  and the security kit; no scheduled spend.
- **Harvest learnings**: export three patterns fleet-wide — (1) scrub-at-choke-point +
  pre-push keyscan (already spreading), (2) compose/test separation for any
  model-judges-model workflow, (3) phase-state caching / resume-first economics.
- **Retire**: not recommended — the repo is the only fleet artifact that converts
  reasoning traces into testable cellular structure, and its incident record has
  ongoing protective value.

## Integration surface

- **quilt-jev-toolkit**: ORGAN BOOT v0 — the counterparty of the coverage-table
  cross-feed; canonicalization cross-checked against its `canonicalJson()`.
- **quilt-organ-workers**: the live organ store (bootable upload receipted); dialect
  unification is the parked follow-up.
- **mothquantum**: certified-entropy seed source (per-bit fail-closed).
- **fleet-seeds (lode)**: the receipted-client conventions this repo follows
  (pricing-first, fail-closed, ledger rows).
- **superinstance-lab journal**: lanes 63-a/63-a-r and the incident are recorded there
  (grep `cot-quilt`).
- **Upstream models**: deepseek v4-pro/flash, typesafe jev, DeepInfra Hermes-3-405B,
  seed-2.0-mini / granite-4.2-3b / Muse-Glimmer-30B (playtesters).
