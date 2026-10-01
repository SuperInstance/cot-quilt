# coverage-table.md — run-1 cellular graph vs ORGAN BOOT v0 (lane 63-c)

**Cross-feed consumer check (63-a-r):** which nodes of the run-1 organ candidate
(`exports/organ-candidate-rewind.json`, FLEET-Q-REWIND-ORGAN) does **ORGAN BOOT v0** in
SuperInstance/quilt-jev-toolkit @ `ecaf2e4` actually cover?

- **v0 side of record:** `src/organ/{manifest,snapshot,boot,nest}.mjs`, 23/23 tests,
  doctrine in `docs/REVERSE-ACTUALIZED-SPEC.md`, agent-facing summary in the toolkit README
  ("ORGAN BOOT v0 — what a zero-shot agent needs to know").
- **Graph side of record:** 23 included cells (8 core + 14 stable flash-consensus + 1
  adversarial-critique cell), 36 edges among them. Excluded from this table: the 26 volatile
  (1-seed) cells — not part of the organ candidate by the export's inclusion rule.
- **Verdict scale (honest):** `COVERED` = v0 implements the mechanism and a test proves it;
  `PARTIAL` = v0 implements the load-bearing half or represents it structurally; `UNCOVERED` =
  absent from v0 (parked-by-63-c list or new gap); `DOCTRINE` = the node is a limitation
  statement v0 agrees with by construction.

## A. One row per organ-candidate node

| node | point | w | stability | mechanism (compressed) | verdict | v0 evidence / gap |
|---|---|---|---|---|---|---|
| N03 | P3 | 0.95 | core | single-cell rewind = NEW receipt (before=tip.after, after=target.after), old receipts remain | **UNCOVERED (parked)** | v0 has no rewind op; host rewind to a pre-nest boundary is on 63-c's parked list ("represented: the nest receipt is a normal host receipt"). The node's append-only form is replay-compatible; nothing refuses it — it is just not built. |
| N04 | P4 | 0.85 | core | dependents marked stale on rewind via reverse-deps index; re-evaluate or rewind | **UNCOVERED** | v0 manifest carries `edges` but has no invalidation/staleness propagation. New gap (not on 63-c's parked list). |
| N07 | P7 | 0.80 | stable | nest an imported CELL: boundary adapter, host inputs become `cause: host_input` receipts, nested chain stays authoritative | **PARTIAL** | v0 nests ORGANS: `organ.nest` + `organ.credit` pointer receipts, organ keeps its own chain (nest.mjs) — same doctrine at organ granularity; the cell-level adapter is finer than v0's envelope. |
| N09 | P9 | 0.925 | stable | organ rewind two-phase: intent row → member rewinds → commit only when all tips match the cut | **UNCOVERED (parked)** | rewind family, explicitly parked by 63-c. v0 has no intent rows (see N37). |
| N10 | P10 | 0.85 | stable | organ snapshot = causal cut: write barrier, member tip vector, causally closed dependency cut | **PARTIAL** | v0 `snapshot()` pins exactly one `receiptRange {start,end,count}` — a causal cut for a SINGLE chain. Per-member tip vectors across parallel cell chains are not modeled (v0's toyQuilt has one ledger). |
| N11 | P11 | 0.883 | core | bootable drop-in: loader verifies every member chain + organ ledger hash, refuses boot on any mismatch | **COVERED** | this IS v0 `boot()`: manifest → per-receipt hash re-derivation → custody → replay assertion, fail-closed, never partially boots (boot.mjs; 23-test suite). |
| N14 | P14 | 0.883 | core | hierarchical rewind: every organ rewinds to its prior cut; global commit only when all organs+cells match | **UNCOVERED (parked)** | nesting exists, rewind-through-hierarchy does not (rewind family, parked). |
| N17 | P17 | 0.767 | core | nest a whole quilt: adapter exposes exports; parent pins child outputs by receipt hash in boundary ledger | **PARTIAL** | v0 pins the child by hash in the host ledger (`organ.nest` receipt carries `{organId, manifestHash, tipHash, organSeq}` — nest.mjs). Export-only mapping is NOT enforced (see N30/C01). |
| N18 | P19 | 0.75 | stable | rewind ripple: producer rewind supersedes consumer pins; append `dep_rewound` receipts or freeze | **UNCOVERED** | rewind + dependency-invalidation family. New gap. |
| N19 | P21 | 0.75 | core | external deps pinned by content hash (`external_pins` name/hash/version/URI), loader checks before wiring | **UNCOVERED** | v0 manifest has no external-pin field; `edges` to unknown cells are refused (`MANIFEST_INVALID`), so external wiring is out of the format entirely. New gap; representable as a manifest extension. |
| N20 | P24 | 0.60 | stable | hash-algo + schema tags on receipts; migrations are new receipts (`cause: schema_migration`) | **PARTIAL** | the schema-drift half is v0 law (`SCHEMA_DRIFT` refuses unknown `schemaVersion` before any field interpretation, manifest.mjs). `hash_algo` is fixed sha256; migration-as-receipt is not implemented. |
| N22 | P26 | 0.70 | core | namespacing prevents nested ID collisions: `subquilt_id + cell_id`, namespaced id inside receipt hashes | **PARTIAL** | v0 avoids collisions STRUCTURALLY (organ cells live on the organ's own chain; host stores only pointer receipts; `DUPLICATE_NEST` refused) but does not rewrite or hash namespaced ids. |
| N23 | P27 | 0.75 | core | parent-child composite snapshot: parent records child manifest hash + cut; child verified before parent dependents wire | **PARTIAL** | pin-by-hash exists (`organ.nest` receipt, `supersedes` lineage in re-snapshots); v0 host snapshots do not EMBED child bundles — the organ rides via pointer receipts, and boot order (child before parent wiring) is not encoded. |
| N24 | P28 | 0.80 | stable | save nondeterministic runtime state explicitly (RNG seeds, timers, queues, clocks as cells/manifest fields) or post-boot receipts diverge | **PARTIAL** | v0 reaches determinism by RESTRICTION: receipts carry no wall-clock, `seq` is time, canonical JSON, fixed op evaluator (spec I3). Capturing REAL runtime entropy is not implemented — v0 simply has none. |
| N25 | P29 | 0.975 | stable | repeated core invariants: append-only hash chains, changes are new receipts, content-addressed cuts, atomic group commits, verified boot | **COVERED (3/4)** | chains ✓ (verifyChain), changes-as-receipts ✓, content-addressed cuts ✓ (manifestHash/cellsSha256), verified boot ✓. Atomic GROUP commits ✗ — v0 has no transactions (see N37). |
| N26 | P30 | 0.70 | stable | receipts prove LOCAL history only; cross-cell consistency/access/liveness need organ+global ledgers, intent logs, pins, verifiers | **DOCTRINE** | v0 agrees by construction: one chain proves one ledger; the only cross-ledger check is the nesting double-entry audit (verifyDoubleEntry, verify-only, never auto-repairs). |
| N30 | P12 | 0.633 | stable | host imports organ under namespace prefix, maps ONLY manifest exports; bypassing exports → non-linearized cross-ledger writes | **PARTIAL** | v0 makes the failure mode structurally impossible (host ledger receives only pointer receipts — it cannot hold organ state), but v0 manifests have no `exports` list to map. |
| N31 | P13 | 0.825 | stable | quilt-level global cut: `quilt_ledger` rows carry cut vector + monotonic `global_epoch`; cut is one causal line, not wall-clock grouping | **UNCOVERED** | v0 sidesteps it: ONE chain, `seq` IS time (spec I3), so a global cut is trivially `receiptRange`. A per-cell-chain quilt (what N31 addresses) is beyond v0's substrate. |
| N34 | P20 | 0.80 | stable | crash-atomic fsync order: cell logs before organ commit, organ before global | **UNCOVERED** | v0 boots into memory and never partially succeeds, but durable-write ordering is out of scope (no persistence layer). |
| N35 | P22 | 0.80 | stable | canonical serialization stabilizes hashes: sorted keys + schema version → identical logical state → identical hash (node says CBOR) | **COVERED (JSON half)** | v0 `canonicalJson`: recursively sorted keys, UTF-8, no whitespace, refuses undefined/NaN/bigint (manifest.mjs) — with JSON, not CBOR. Binary encoding is on 63-c's parked list, so the CBOR half is honestly parked. |
| N36 | P23 | 0.725 | stable | concurrent snapshot linearization: per-cell mutexes + read leases → a cut no mutation straddles | **UNCOVERED** | v0 is single-threaded by design; concurrency is not represented. New gap. |
| N37 | P25 | 0.75 | stable | partial-commit reconciliation: multi-cell transactions in an intent log; recovery commits or compensates; no uncommitted intermediate tips | **UNCOVERED** | v0 has no transactions/intent log. Adjacent to 63-c's parked "partial-custody replay seeds" but distinct: this is write-side atomicity, that is read-side custody. |
| C01 | P12 | 0.506 | critique | (adversarial gap cell, Hermes-3-405B) organ nested via namespace exports; bypass → non-linearized cross-ledger writes | **PARTIAL** | same mechanism as N30 — and note the loop closure: the judge demanded the cell, and v0's pointer-receipt envelope is precisely the structural answer to the warned failure mode. |

**Verdict tally (23 rows):** COVERED 3 (N11, N25, N35-JSON) · DOCTRINE 1 (N26) · PARTIAL 8
(N07, N10, N17, N20, N22, N23, N24, N30, C01 — 9 rows incl. C01) · UNCOVERED 10
(N03, N04, N09, N14, N18, N19, N31, N34, N36, N37).

## B. The nine v0 coverage dimensions — which graph nodes feed each

| ORGAN BOOT v0 dimension | v0 status (tested) | feeding organ-candidate nodes | fit verdict |
|---|---|---|---|
| receipt-chain content addressing (I1) | COVERED (`manifestHash`/`cellsSha256`, canonical JSON) | N25, N35, N23 | graph and v0 agree; hashes are the identity |
| per-receipt hash verify (I2) | COVERED (`verifyChain` re-derives every digest) | N11, N25 | exact match |
| chain gaps (I2) | COVERED (`CHAIN_GAP` on seq/prev discontinuity) | N11, N25 | exact match |
| checkpoint custody (I2) | COVERED (`GENESIS` or pinned `{seq,hash}`; `CUSTODY_GAP` otherwise) | N17, N23 (pin-by-hash), N19 (pins, but external) | graph adds EXTERNAL pins — v0's checkpoint is internal-only |
| replay == state (I3) | COVERED (replay on empty cells, hash assert, `REPLAY_DIVERGENCE`) | N11, N24, N25 | N24 adds runtime-state capture v0 restricts away |
| tamper / forge detection | COVERED (state-byte, receipt-byte, self-consistent forged chain → replay catches) | N11, N20 | exact match |
| nesting double-entry (I5) | COVERED (`organ.nest`/`organ.credit`, `verifyDoubleEntry`, `DUPLICATE_NEST`) | N07, N17, N22, N30, C01 | strongest convergence: the judges' demanded cell (C01) is answered by v0's envelope |
| schema drift | COVERED (`SCHEMA_DRIFT` fail-closed before field interpretation) | N20 | graph extends to migration-as-receipt — v0 refuses instead of migrating (honest fail-closed) |
| snapshot identity across re-snapshots | COVERED (same organId, `supersedes` pinned, hash-stable round-trip) | N23, N35, N10 | exact match at organ granularity |

## C. Uncovered families (honest ledger for run-2 / next 63-c increment)

1. **Rewind family** (N03, N04, N09, N14, N18) — the QUESTION's first verb is the least built:
   v0 parks host rewind; dependency-ripple invalidation is a NEW gap beyond 63-c's parked list.
   First rewind probe already receipted by 63-c: boot a host, rewind its ledger to the pre-nest
   receipt, prove the organ still boots standalone.
2. **Write-side atomicity** (N25's 4th invariant, N37, N34) — intent logs, group commit,
   fsync ordering. v0's "boot never partially succeeds" is read-side; the write side has no
   equivalent law yet.
3. **Concurrency** (N36, N31) — linearized multi-chain cuts; v0's single-chain `seq`-is-time
   model sidesteps rather than solves.
4. **External custody** (N19) — content-hash pins for dependencies OUTSIDE the organ; v0's
   format refuses unknown endpoints entirely.
5. **Parked-by-63-c list, confirmed against the graph:** checkpoint signatures/PKI — no graph
   node demands it (honest: the CoT under-specifies trust roots; run-2 prompt should ask).
   Split/merge — likewise no node. Partial-custody replay seeds — adjacent to N37.
   Binary encoding — N35's CBOR half, parked.

**Bottom line:** v0 covers the *custody core* the graph's highest-weight stable cells converge on
(N11/N25/N35, plus the whole nesting cluster) — composer and implementer agree. The graph's
center of mass beyond v0 is **rewind + transactional write semantics**: exactly the mechanisms
the CoT spent its highest-weight points on and v0 (by design) has not built. The organ candidate
is therefore a faithful *demand signal* for organ-boot v1, and this table is the diff.
