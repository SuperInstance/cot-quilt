# adversarial.md — Hermes-3-405B attack on run 2026-10-01-run1

Judge model: NousResearch/Hermes-3-Llama-3.1-405B (deepinfra). Composers (flash x3 + typesafe) never judged their own nodes.

## Verdict
pass=true completeness=0.98
rationale: The graph covers the key points of the CoT well, with only a minor omission around nested organ exports. The overall structure and invariants are represented accurately.

## Missing nodes (folded back as critique cells)
- C1 [P12] w=0.645 Nested organ exports — Sub-quilt imports organ under namespace prefix and maps only manifest exports. Host bypassing exports causes non-linearized cross-ledger writes.

## Faulty nodes (flagged in graph.json, never deleted)
- N07 (minor): Missing key details about nested cell imports and host interaction

## typesafe noul battery (same-phase judge, probability channel)
{
 "p_complete": {
  "type": "noul",
  "noul": 0.71
 },
 "p_implementable": {
  "type": "noul",
  "noul": 0.16
 },
 "p_missing_major": {
  "type": "noul",
  "noul": 0.29
 },
 "p_faulty": {
  "type": "noul",
  "noul": 0.37
 }
}
