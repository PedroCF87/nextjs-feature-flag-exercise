---
name: validate-exercise-environment
description: Full validation process for the nextjs-feature-flag-exercise local environment. Checks Node.js and pnpm prerequisites, installs server and client dependencies via pnpm, runs the complete build + lint + test suite capturing individual exit codes, and produces a structured evidence report. Use this skill when validating a fresh clone, confirming a dependency install, or generating the environment-state section of the E0-S1 diagnosis document.
---

## Objective

Run all required validation commands for the exercise repository and produce an evidence report confirming the environment is in a known-good state, ready for Exercise 1 implementation. The report must be included as Section 1 of the E0-S1 codebase audit diagnosis document.

---

## Inputs

| Input | Required | Description |
|---|---|---|
| `repo_path` | ✅ | Absolute path to `nextjs-feature-flag-exercise` on disk |
| `expected_branch` | ✅ | Expected active branch name (default: `exercise-1`) |
| `output_path` | ✅ | Absolute path where the validation evidence report will be saved |

---

## Outputs

| Output | Format | Description |
|---|---|---|
| Validation evidence report | Markdown (`.md`) | Structured report with per-step exit codes, branch + SHA, and overall pass/fail |
| Quality checklist | Signed checkboxes in the document | Confirms all 8 quality gates passed |

---

## Prerequisites

- Node.js ≥ 18 installed and on PATH
- pnpm installed globally (`npm install -g pnpm` or Corepack)
- Active branch: `exercise-1`
- Network connectivity (first-time install only — WASM binary is cached after first `pnpm install`)

---

## Process

### Phase 1 — Prerequisites check

Use the shared function to verify all prerequisites in a single step:

```bash
node "docs/.github/functions/check-prereqs.js" exercise-1 /path/to/nextjs-feature-flag-exercise
```

Expected output:
```
node    v20.12.0    ✅
pnpm    9.1.0       ✅
git     2.43.0      ✅
branch  exercise-1  ✅

✅ All prerequisites met.
```

🔴 **Stop and report as P0 blocker if** the script exits with code 1 (any row shows 🔴).

> **Fallback (if `docs/.github/functions/` is not available):**
> ```bash
> node --version              # Expect: v18.x.x or higher
> pnpm --version              # Expect: any recent version
> git branch --show-current   # Expect: exercise-1
> ```

---

### Phase 2 — Install server dependencies

```bash
cd /path/to/nextjs-feature-flag-exercise/server
pnpm install
```

- Expected: exits with code 0, no unresolved peer dependency errors.
- ⚠️ If WASM-related install errors appear: ensure network is open and retry once.
- ⚠️ Do NOT run from the repo root — `server/` and `client/` are independent packages.

---

### Phase 3 — Install client dependencies

```bash
cd /path/to/nextjs-feature-flag-exercise/client
pnpm install
```

- Expected: exits with code 0.

---

### Phase 4 — Server validation suite

Run each command **individually** to capture separate exit codes:

```bash
# Step 4a — TypeScript type check
cd server && pnpm run build
# Exit 0 = ✅ | Non-zero = 🔴 (TypeScript errors — must fix before proceeding)

# Step 4b — ESLint
cd server && pnpm run lint
# Exit 0 = ✅ | Exit 1 = 🔴 (lint errors)

# Step 4c — Vitest tests
cd server && pnpm test
# Exit 0 = ✅ | Non-zero = 🔴 (test failures)
```

**SQL.js test note:** Tests use an in-memory SQLite database via SQL.js WASM. If tests fail unexpectedly:
- Check for `initSqlJs` errors in the trace (WASM not loaded — re-run `pnpm install` with open network).
- Verify `_resetDbForTesting()` is called in `beforeEach` in the test file (isolation pattern).

---

### Phase 5 — Client validation suite

```bash
# Step 5a — TypeScript + Vite build
cd client && pnpm run build
# Exit 0 = ✅ | Non-zero = 🔴

# Step 5b — ESLint
cd client && pnpm run lint
# Exit 0 = ✅ | Exit 1 = 🔴
```

---

### Phase 6 — Produce the evidence report

First, capture the branch reference for the report header:

```bash
# Produces: "exercise-1 @ <7-char SHA>"
node "docs/.github/functions/git-info.js" /path/to/nextjs-feature-flag-exercise --branch-ref
```

Then compile the report using the output format below with actual values (no placeholders).

---

## Output Format

```markdown
## Validation Report — nextjs-feature-flag-exercise

**Date:** YYYY-MM-DD HH:MM:SS -HH
**Branch:** exercise-1 @ <7-char SHA>
**Node.js:** vXX.X.X
**pnpm:** X.X.X

| # | Command | Working dir | Exit code | Status |
|---|---|---|---|---|
| 1 | `pnpm install` | `server/` | 0 | ✅ |
| 2 | `pnpm install` | `client/` | 0 | ✅ |
| 3 | `pnpm run build` | `server/` | 0 | ✅ |
| 4 | `pnpm run lint` | `server/` | 0 | ✅ |
| 5 | `pnpm test` | `server/` | 0 | ✅ |
| 6 | `pnpm run build` | `client/` | 0 | ✅ |
| 7 | `pnpm run lint` | `client/` | 0 | ✅ |

**Overall: ALL PASS ✅ — environment is ready for Exercise 1 implementation.**
```

For any failing step, append:
```markdown
### Failure — Step N: `<command>`
**Exit code:** N
**First 30 lines of stderr/stdout:**
```
<error output here>
```
**Blocker severity:** P0 — must be resolved before proceeding to E0-S1-T3.
```

---

## Blocker Triage

| Symptom | Likely cause | Resolution |
|---|---|---|
| `pnpm: command not found` | pnpm not installed | `npm install -g pnpm` |
| `Cannot find module 'sql.js'` | Deps not installed | Re-run `pnpm install` in `server/` |
| `WASM loading failed` / `initSqlJs` error | Network-restricted first install | Run with open network; WASM is bundled post-install |
| TypeScript errors in `server/` | Existing type issues in baseline | Document the error — do NOT attempt to fix implementation issues during E0 |
| Vitest test failures | Test isolation issue | Check `_resetDbForTesting()` is in `beforeEach` in `flags.test.ts` |
| Vite build fails | Path alias misconfiguration | Read trace; likely `@shared/*` not resolved — check `vite.config.ts` aliases |
| ESLint parse errors | Wrong TypeScript parser version | `cd server && pnpm install` to ensure exact lockfile deps |

---

## Quality Checklist

- [ ] All 7 commands run individually (not chained — need separate exit codes)
- [ ] Node.js version ≥ 18 confirmed before install
- [ ] `pnpm install` run from `server/` AND `client/` separately
- [ ] SQL.js Vitest tests pass with exit code 0
- [ ] Client Vite build exits with code 0 and produces `dist/` directory
- [ ] Report includes branch name + 7-char SHA for traceability
- [ ] Report saved as evidence for E0-S1 AC-4 (all validation commands pass)
- [ ] Report included as Section 1 of the codebase audit diagnosis document
