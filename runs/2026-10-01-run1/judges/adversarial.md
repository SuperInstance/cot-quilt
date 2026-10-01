# adversarial.md — Hermes-3-405B attack on run 2026-10-01-run1

Judge model: NousResearch/Hermes-3-Llama-3.1-405B (deepinfra). Composers (flash x3 + typesafe) never judged their own nodes.

## Verdict
pass=true completeness=0.95
rationale: Graph covers key mechanisms but omits some failure modes like ID collisions when nesting. Overall quite thorough.

## Missing nodes (folded back as critique cells)
- C1 [P12] w=0.633 Organ nested via namespace exports — Sub-quilt imports organ under namespace prefix and maps only manifest exports. Host bypassing exports causes non-linearized cross-ledger writes.

## Faulty nodes (flagged in graph.json, never deleted)
- N07 (minor): Fails to mention that nested cell writes require namespacing to avoid ID collisions

## typesafe noul battery (same-phase judge, probability channel)
{
 "p_complete": {
  "type": "noul",
  "noul": 0.71
 },
 "p_implementable": {
  "type": "noul",
  "noul": 0.15
 },
 "p_missing_major": {
  "type": "noul",
  "noul": 0.24
 },
 "p_faulty": {
  "type": "noul",
  "noul": 0.27
 }
}
