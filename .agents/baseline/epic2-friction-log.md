# Friction Log — Epic 2 (AI-Assisted Run — PIV Loop)

<!-- artifact_id: epic2-friction-log -->
<!-- epic_id: EPIC-2 -->
<!-- produced_by: agile-exercise-planner -->

## Purpose

This log records friction points encountered during the execution of EPIC-2 stories (E2-S0 through E2-S5). These observations are compared against the Epic 1 friction log (`.agents/baseline/epic1-friction-log.md`) to assess whether the PIV Loop preparation reduced execution friction.

**Impact classification:** high (>30 min delay or reverted work), medium (10–30 min or required external docs), low (<10 min, no blocking).

---

## Log

| # | Story | Timestamp | Description | Impact | System Evolution |
|---|---|---|---|---|---|
| 1 | E2-S2 | 2026-04-16 12:29–15:07 -03 | GitHub Actions CI wait time — ~38 min across multiple workflow trigger runs and CI validation during E2-S2-T6/T7; work was parallelized locally but wall-clock time inflated | low | — |
| 2 | E2-S4 | 2026-04-16 ~16:10 -03 | **Radix UI `SelectItem` value="" crash** — `SelectItem` with empty string value caused runtime crash after build/lint/test all passed green. Required sentinel value `"all"` and filter logic in `onChange` handler. ~15 min to diagnose and fix. | medium | `[SYSTEM-EVOLUTION]` — **Pattern B (Emergent):** Radix UI constraint (empty string value crashes `SelectItem`) was not documented in any on-demand context doc. Added to `frontend-patterns.md` reference to prevent recurrence. |
| 3 | E2-S4 | 2026-04-16 ~16:45 -03 | **Claude PR review found 4 issues post-green** — After all local validation passed, automated Claude review on PR #35 identified: (a) timer unmount cleanup missing in `useEffect`, (b) stale-read on `latestFiltersRef` updated during render instead of in `useEffect`, (c) missing `.max(200)` length cap on Zod `owner`/`name` string fields, (d) owner exact-match asymmetry (server uses `=` while name uses `LIKE`). All 4 fixed in a single commit (~20 min). | medium | `[SYSTEM-EVOLUTION]` — **Pattern A (Preventable):** The `/review` or `/security-review` Claude commands could have caught these issues before creating the PR. Lesson: run `/review` locally before pushing to trigger PR review automation. |
| 4 | E2-S4 | 2026-04-16 ~16:50 -03 | **Copilot "unable to run full agentic suite"** — PR #35 had 341 files (including `docs/agile/`), causing GitHub Copilot to skip full automated review. It still reviewed all 11 feature files manually. | low | — |
| 5 | E2-S1→S2 | 2026-04-16 03:58–12:29 -03 | **Sleep break fragmented sessions** — ~8.5h gap between E2-S1 (AI Layer) and E2-S2 (Repo config) required context reload on resume. No rework but added ~5 min to refamiliarize with task state. | low | — |

---

## `[SYSTEM-EVOLUTION]` Entries Detail

### SE-1: Radix UI SelectItem constraint (Pattern B — Emergent)

- **Trigger:** `FlagsFilterControls` component crashed at runtime when `SelectItem` received `value=""`.
- **Root cause:** Radix UI's `Select` component treats empty string as "no value" and crashes internally. This is an undocumented constraint — TypeScript types accept `string`, not `string & { length > 0 }`.
- **Classification:** Pattern B (Emergent) — this could not have been prevented by existing AI Layer artifacts because the constraint was unknown prior to encountering it.
- **Resolution:** Changed sentinel from `""` to `"all"` and filtered in `onChange` handler.
- **System improvement:** Added Radix SelectItem constraint to `.agents/reference/frontend-patterns.md` so future implementations avoid the same trap.
- **Time cost:** ~15 min.

### SE-2: Local review commands underused (Pattern A — Preventable)

- **Trigger:** Claude PR review on PR #35 found 4 code quality issues that local build/lint/test did not catch.
- **Root cause:** The `/review` and `/security-review` Claude commands were available but not invoked before creating the PR. These commands perform deeper semantic analysis than `tsc + eslint + vitest`.
- **Classification:** Pattern A (Preventable) — the capability existed; the workflow simply did not include the step.
- **Resolution:** Applied all 4 fixes in a single commit.
- **System improvement:** Add a step to the implementation workflow: "Run `/review` locally before creating a PR" — this would shift review feedback from async (PR delay) to sync (immediate fix).
- **Time cost:** ~20 min.

---

## Summary

| Impact | Count |
|---|---|
| High | 0 |
| Medium | 2 |
| Low | 3 |
| **Total** | **5** |

### Impact comparison with Epic 1

| Impact | Epic 1 (Baseline) | Epic 2 (PIV Loop) | Delta |
|---|---|---|---|
| High | 1 | 0 | −1 |
| Medium | 1 | 2 | +1 |
| Low | 2 | 3 | +1 |
| **Total** | **4** | **5** | +1 |
| **Total rework time** | ~43 min | ~35 min | **−8 min** |

### Key observations

1. **Zero high-impact friction.** Epic 1's highest-impact event (cloud agent model failure, ~30 min revert + ADR) had no equivalent in Epic 2. The PIV Loop's "Prepare" phase front-loaded infrastructure decisions (local execution, Claude Code stack, CI configuration) into E2-S1/S2, eliminating the class of friction that comes from discovering infrastructure limitations mid-implementation.

2. **Friction shifted from infrastructure to quality.** Epic 1's friction came from infrastructure failures (cloud agent, tsconfig paths) and missing safety nets (LIKE escaping, timeline tracking). Epic 2's friction came from quality polish issues (Radix runtime constraint, PR review findings) — a qualitatively different, less costly category. The PIV Loop successfully moved the friction boundary from "can the code compile and run?" to "is the code production-quality?"

3. **System Evolution entries are actionable.** Both SE entries have clear mitigations: SE-1 (emergent) was resolved by updating the reference docs; SE-2 (preventable) identified a workflow gap (missing local `/review` step). The "3+ times = command" heuristic from Excal-3 does not trigger yet — each pattern occurred once — but if the `/review` skip recurs, it should be encoded as a mandatory pre-PR gate in the workflow.
