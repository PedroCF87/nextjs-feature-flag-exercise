# PR #35 Review Evidence — Epic 2

## Metadata

| Field | Value |
|---|---|
| **PR** | [#35 — feat(flags): add server-side filtering with query params and filter UI [E2]](https://github.com/PedroCF87/nextjs-feature-flag-exercise/pull/35) |
| **Branch** | `exercise-2` → `main` |
| **State** | Open |
| **Produced at** | 2026-04-16 17:22:36 -03 |

---

## Review Summary

| Reviewer | Type | Files Reviewed | Issues Found | Issues Resolved |
|----------|------|---------------|--------------|-----------------|
| `claude` | Automated (`pr-review.yml` / `security-review.yml`) | 11 feature files | 4 | 4 ✅ |
| `copilot-pull-request-reviewer` | Automated (Copilot PR review) | 11 feature files | Informational | N/A |
| Human | Manual code review | — | — | Pending |

---

## Workflow Trigger Evidence

| Workflow | Event | Status | Conclusion | Run ID |
|----------|-------|--------|------------|--------|
| PR Review | `pull_request` | completed | success | [24530634583](https://github.com/PedroCF87/nextjs-feature-flag-exercise/actions/runs/24530634583) |
| Security Review | `pull_request` | completed | success | [24530634589](https://github.com/PedroCF87/nextjs-feature-flag-exercise/actions/runs/24530634589) |
| PR Review (earlier run) | `pull_request` | completed | success | [24530510621](https://github.com/PedroCF87/nextjs-feature-flag-exercise/actions/runs/24530510621) |
| Security Review (earlier run) | `pull_request` | completed | success | [24530510605](https://github.com/PedroCF87/nextjs-feature-flag-exercise/actions/runs/24530510605) |

Both `pr-review.yml` and `security-review.yml` triggered on `pull_request` event and completed successfully.

---

## Claude Bot Review Comments

Three Claude task completions on PR #35, triggered by `pull_request_review_comment` events:

| # | Timestamp (UTC) | Duration | Trigger |
|---|-----------------|----------|---------|
| 1 | 2026-04-16 19:26:23 | 2m 5s | PR review comment (code review) |
| 2 | 2026-04-16 19:46:37 | 1m 26s | PR review comment (fix verification) |
| 3 | 2026-04-16 19:49:19 | 1m 14s | PR review comment (re-review) |

---

## Copilot Review

- **Author:** `copilot-pull-request-reviewer`
- **State:** COMMENTED
- **Note:** "Copilot was unable to run its full agentic suite" due to 341 files in the PR (including `docs/agile/` planning artifacts). It still reviewed all 11 feature files and provided inline comments.

---

## Review Issues and Resolutions

| # | Issue | Severity | Resolution | Status |
|---|-------|----------|------------|--------|
| 1 | Timer `useEffect` missing cleanup on unmount | Medium | Added cleanup return function in `useEffect` to clear interval | ✅ Fixed |
| 2 | `latestFiltersRef` stale-read — updated during render instead of `useEffect` | Medium | Changed to direct synchronous assignment of ref value | ✅ Fixed |
| 3 | Zod `.max(200)` missing on `owner` and `name` string fields | Low | Added `.max(200)` length cap to both fields in validation schema | ✅ Fixed |
| 4 | Owner exact-match asymmetry (server uses `=` while name uses `LIKE`) | Low | Documented as intentional design choice — owner is an exact identifier, name is a search term | ✅ Documented |

All 4 issues were fixed in a single commit and pushed to `exercise-2`. The subsequent PR Review and Security Review workflow re-runs completed successfully with no new findings.

---

## Pending

- T1–T5 measurement/closure documentation artifacts are locally complete but will be committed in the story-end batch commit alongside T6–T8. These artifacts do not affect the feature code reviewed by PR #35.
