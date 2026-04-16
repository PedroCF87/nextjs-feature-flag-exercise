# Friction Log — Epic 1 (Baseline Implementation)

<!-- artifact_id: epic1-friction-log -->
<!-- epic_id: EPIC-1 -->
<!-- produced_by: agile-exercise-planner -->

## Purpose

This log records friction points encountered during the execution of EPIC-1 stories (E1-S0 through E1-S4). These observations form the comparison baseline for Epic 2 (AI-assisted run).

**Impact classification:** high (>30 min delay or reverted work), medium (10–30 min or required external docs), low (<10 min, no blocking).

---

## Log

| # | Story | Timestamp | Description | Impact |
|---|---|---|---|---|
| 1 | E1-S1 | 2026-04-14 23:26:59 -03 | Cloud agent execution model failed — PR #29 reverted; required ADR and pivot to local execution model | high |
| 2 | E1-S2 | 2026-04-15 18:31:23 -03 | tsconfig baseUrl caused path resolution conflict after server filter implementation | low |
| 3 | E1-S2 | 2026-04-15 18:35:42 -03 | LIKE wildcards (%, _) not escaped in name filter — security-adjacent edge case | low |
| 4 | E1-S4 | 2026-04-15 21:07:00 -03 | No EPIC-1 entries in timeline.jsonl — metrics required manual computation from git log | medium |

---

## Summary

| Impact | Count |
|---|---|
| High | 1 |
| Medium | 1 |
| Low | 2 |
| **Total** | **4** |

### Key observations

1. **Cloud agent model failure (high):** The original GitHub Issue-driven execution model broke during E1-S1-T1, forcing a mid-epic pivot to local execution. This consumed ~30 min for revert, ADR creation, and process restructuring. Root cause: Copilot cloud environment limitations with SQL.js-specific toolchain.

2. **Post-green regressions (low × 2):** Two build/test regressions occurred after E1-S2 was initially considered complete — tsconfig path resolution and LIKE wildcard escaping. Both were quick fixes but highlight the value of comprehensive edge-case testing.

3. **Missing timeline tracking (medium):** EPIC-1 timeline entries were never recorded in timeline.jsonl, requiring fallback to git commit timestamps for metrics computation. Root cause: the agile automation hooks were configured for EPIC-0 only.
