# SECURITY-INCIDENT — credential exposure in commit `677484d` (2026-10-01)

Status: **MITIGATED** (credential rolled by the principal; old credential is inert).
Reported by: lane 63-a (fleet subagent), 2026-10-01 ~23:10Z.
Classification: secret-material exposure via an error string written into a committed receipt.
This file contains **no key material** — the credential is referred to only as
"the rolled deepseek credential".

---

## 1. What happened

Commit `677484d6ca8c2f4a5d643d75e7c834b7a353804b` ("hardened provider ladder …, run-2
complete") committed a receipt file that embedded a live DeepSeek API credential string
in plaintext:

- **File:** `runs/20261001T195410Z-503b10b9/receipt.json`
- **Location:** line 1788, JSON path `…["receipt"]["fallback_reason"]`
- **Value class:** the rolled deepseek credential (a `sk-…` style key string)
- **Mechanism (root cause chain):**
  1. A caller passed the credential string where a **URL** was expected (argument-order
     swap into the `http(url, key, …)` helper in `cot_decompose.py`).
  2. Python's `urllib` raised `ValueError: unknown url type: '<the credential>'` —
     Python exception text for this error class **embeds the offending value verbatim**.
  3. `http()`'s broad `except Exception` handler stored `str(e)` unscrubbed into the
     result body (`cot_decompose.py`, line 85 at that commit).
  4. The orchestrator copied that error string into the run receipt's
     `fallback_reason` field, and the receipt was committed.

Lesson in one line: **error strings are a secret-exfiltration channel — scrub
credential-class patterns out of every exception before it can reach a receipt.**

## 2. Exposure window

- **Exposed (lower bound):** 2026-10-01T21:00:58Z — author timestamp of commit `677484d`
  (public push time was not receipted locally; it is ≥ the author time).
- **Mitigated:** 2026-10-01T22:55Z — the principal rolled the credential; the new
  credential was provisioned locally outside the repo (`.env.keys`, mode 600, gitignored).
- **Window:** ≤ ~2 hours from the earliest certain exposure to the roll.
- **Current state:** the old credential is **DEAD / inert** (rolled). The string remains
  in git history permanently (see §4).

## 3. Mitigation (already done or done by this incident response)

1. **Credential rolled by the principal** — the exposed key is dead and cannot
   authenticate. The replacement ("the rolled deepseek credential") lives only in
   `/home/z/my-project/.env.keys` (outside any repo, mode 600, gitignored), read at
   runtime via env — never printed, never written to any artifact.
2. **This document** — incident record committed to the repo so every future agent
   knows the history contains an inert credential string and why.
3. **Pre-push key-scan step** — `scripts/keyscan.mjs` (Node ≥ 18, zero deps):
   scans worktree + staged diff + HEAD tree for credential-class patterns
   (`gsk_`, `sk-`, `ghp_`, `github_pat_`, `apikey_`, `moth_`, `cfut_`), prints
   `file:line:class` only (matched values are masked in output), **exits non-zero on
   any un-receipted hit**. Every push of this repo MUST pass keyscan first (clean, or
   hits explicitly receipted as benign in its suppressions table).
4. **`.gitignore` coverage** — `.env`, `.env.*`, `.env.keys`, `*.env` are ignored;
   keys never live inside the repo.
5. **Code hardening (root-cause class)** — `cot_decompose.py` now scrubs
   credential-class patterns from exception text before it can be stored in any
   result/receipt (both the `http()` helper and the hard-deadline worker's error path).

## 4. Why the commit stays in history (fleet law: NEVER delete data)

Per fleet law — *never delete data* — and the receipt discipline (receipts are sealed
AS SAID; rewriting a sealed receipt falsifies it), commit `677484d` and the receipt
file remain in history **verbatim, including the inert credential string**. We do not
rewrite history, we do not mask the historical receipt, and we do not delete it:

- the credential is **inert** (rolled), so the residual risk of it remaining in
  history is nil;
- deleting or filtering it would falsify the historical record and violate the
  fleet's never-delete-data law;
- the string is registered in `scripts/keyscan.mjs`'s **suppressions table** with this
  file as justification, so future key-scans classify that single known hit as
  RECEIPTED-BENIGN instead of silently passing or repeatedly alarming.

If the fleet ever migrates hosts or archives the repo, this file is the pointer that
explains the inert string at `receipt.json:1788`.

## 5. Prevention checklist for future lanes (zero-shot)

- [x] `scripts/keyscan.mjs` exists and fails non-zero on un-receipted hits.
- [x] Run `node scripts/keyscan.mjs` **before every push** (worktree + staged + HEAD).
- [x] `.gitignore` covers `.env`, `.env.*`, `.env.keys`, `*.env`.
- [x] Exception text is scrubbed (`scrub()` in `cot_decompose.py`) — extend this
      pattern to any new HTTP/error path added to this repo.
- [x] Keys read from `/home/z/my-project/.env.keys` → process env at runtime only.
- [ ] When adding a new language/HTTP helper here, replicate the scrub-at-choke-point
      rule and the atomic receipt writes.
- [ ] Never paste credentials into commit messages, tickets, logs, or prompts.
      Refer to them by role ("the rolled deepseek credential"), never by value.
