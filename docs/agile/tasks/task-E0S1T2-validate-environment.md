# Task E0-S1-T2 — Validate Local Execution Environment

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S1-T2 |
| **Story** | [E0-S1 — Repository Diagnosis and Readiness](../stories/story-E0S1-repository-diagnosis.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `environment-validator` |
| **Depends on** | [E0-S1-T1 — Fork repository and configure remotes](task-E0S1T1-fork-configure-remotes.md) |
| **Blocks** | E0-S1-T3 |
| Created at | 2026-04-10 17:45:54 -03 |
| Last updated | 2026-04-12 14:15:15 -03 |

---

## 1) Task statement

> **Execution context:** T2 runs as a **GitHub Copilot cloud agent**, invoked via a GitHub Issue
> in the personal fork. The session is stateless — no local state carries over. The agent checks
> out the fork, which must already contain `docs/` committed by T1 Step 9. All paths in this task
> are discovered dynamically using `REPO_ROOT="$(git rev-parse --show-toplevel)"`. T2 ends with a
> feature branch commit and a PR against `exercise-1`.

Install all server and client dependencies using `pnpm`, then run the complete validation suite (`build + lint + test` for the server, `build + lint` for the client). Capture each command's exit code individually. Produce a structured evidence report that confirms the `exercise-1` baseline is clean and can serve as the starting point for EPIC-1 implementation. Any non-zero exit code is a blocker — do not proceed to T3 until all commands pass.

**Companion skill:** [`validate-exercise-environment`](../../.github/skills/validate-exercise-environment/SKILL.md)

---

## 2) Verifiable expected outcome

1. `pnpm install` completes with exit code `0` in both `server/` and `client/`.
2. `pnpm run build` exits `0` in `server/` (TypeScript type check passes).
3. `pnpm run lint` exits `0` in `server/` (zero ESLint errors).
4. `pnpm test` exits `0` in `server/` (all Vitest tests pass).
5. `pnpm run build` exits `0` in `client/` (tsc + Vite build passes).
6. `pnpm run lint` exits `0` in `client/` (zero ESLint errors).
7. A structured validation report table exists with all 7 command results and their individual exit codes.

---

## 3) Detailed execution plan

### Phase 0 — Pre-flight: prerequisites and branch confirmation

```bash
# Discover repo root (works in GitHub Codespace and local environments)
REPO_ROOT="$(git rev-parse --show-toplevel)"
echo "Repo root: $REPO_ROOT"

node "$REPO_ROOT/docs/.github/functions/check-prereqs.js" "exercise-1" "$REPO_ROOT"
```

Checks performed:
- Node.js ≥ 18 installed
- `pnpm` installed
- `git` installed
- Active branch is `exercise-1`

🔴 **Stop immediately if any check fails.** Resolve the blocked prerequisite before installing anything.

### Phase 1 — Install server dependencies

```bash
cd "$REPO_ROOT/server"
pnpm install
```

**Expected:** `node_modules/` created, lockfile `pnpm-lock.yaml` unchanged (no new packages added). Exit code `0`.
> **node_modules pre-existence check:** Even if `server/node_modules/` already exists on disk, confirm the pnpm virtual store is present before skipping install:
> ```bash
> ls server/node_modules/.pnpm 2>/dev/null && echo "pnpm ok" || echo "re-install needed"
> ```
> An empty `node_modules/` directory without `.pnpm/` means dependencies are **not** installed — run `pnpm install` regardless.
> **SQL.js WASM note:** `sql.js` installs a WASM binary during `pnpm install`. If this step hangs or fails in a network-restricted environment, the binary fetch is the likely cause. Resolution: ensure `https://registry.npmjs.org` is reachable and retry.

### Phase 2 — Install client dependencies

```bash
cd "$REPO_ROOT/client"
pnpm install
```

**Expected:** `node_modules/` created, lockfile unchanged. Exit code `0`.

> **client/node_modules state (current workspace):** `client/node_modules/` exists as an empty directory without a `.pnpm` virtual store — dependencies are **not installed**. `pnpm install` in `client/` is mandatory regardless of directory presence.

> **pnpm workspace note:** There is no `pnpm-workspace.yaml` at the repository root. Do NOT run `pnpm install` from the root. Run installs from `server/` and `client/` separately.

### Phase 3 — Server validation suite

Run each command separately to capture individual exit codes:

```bash
# Step 3a — TypeScript type check
cd "$REPO_ROOT/server"
pnpm run build
echo "build exit: $?"

# Step 3b — ESLint
pnpm run lint
echo "lint exit: $?"

# Step 3c — Vitest test suite
pnpm test
echo "test exit: $?"
```

**Expected for all three:** exit code `0`, no error output.

### Phase 4 — Client validation suite

```bash
# Step 4a — TypeScript + Vite build
cd "$REPO_ROOT/client"
pnpm run build
echo "build exit: $?"

# Step 4b — ESLint
pnpm run lint
echo "lint exit: $?"
```

**Expected for both:** exit code `0`.

### Phase 5 — Capture evidence

```bash
# Get branch reference for the report header
node "$REPO_ROOT/docs/.github/functions/git-info.js" "$REPO_ROOT" --branch-ref
```

Fill in the validation report table in Section 5 with each command and its exit code.

### Phase 6 — Blocker resolution (if needed)

If any command fails, consult the blocker triage table below before escalating:

| Failure | Likely cause | Resolution |
|---|---|---|
| `pnpm install` fails with ENOENT | `pnpm` not installed globally | `npm install -g pnpm` |
| `pnpm install` fails with WASM download error | Network restriction | Add npm registry to firewall allowlist |
| `pnpm run build` fails with TS errors | Corrupted install | `rm -rf node_modules && pnpm install` |
| `pnpm run lint` fails with ESLint parse error | Node version mismatch | Ensure Node.js ≥ 18; current env is v22 — use `nvm use 22` if version switching is needed |
| `pnpm test` fails with `Cannot find module 'sql.js'` | Missing WASM binary | Reinstall: `pnpm install sql.js` |
| `pnpm test` fails with existing test assertions | Pre-existing code bug | Document as a blocker; do not modify test code |
| `pnpm run build` (client) fails with Vite error | Vite version mismatch | Check `client/package.json` and `node` version |

### Phase 7 — Commit and push evidence

After filling in the validation report table in Section 5, commit the updated task file and append the timeline entry:

```bash
# Append timeline entry
TIMELINE="$REPO_ROOT/docs/agile/timeline.jsonl"
ID=$(node "$REPO_ROOT/docs/.github/functions/timeline-id.js" "$TIMELINE")
TS=$(node "$REPO_ROOT/docs/.github/functions/datetime.js")
echo "{\"id\":$ID,\"action\":\"updated\",\"artifact_type\":\"task\",\"artifact_id\":\"E0-S1-T2\",\"file\":\"docs/agile/tasks/task-E0S1T2-validate-environment.md\",\"timestamp\":\"$TS\",\"epic\":\"EPIC-0\",\"story\":\"E0-S1\",\"note\":\"T2 completed: environment validation evidence captured\"}" >> "$TIMELINE"

# Create feature branch, commit, push
cd "$REPO_ROOT"
git checkout -b exercise-1/validate-environment
git add docs/agile/tasks/task-E0S1T2-validate-environment.md docs/agile/timeline.jsonl
git commit -m "docs(E0-S1-T2): add environment validation evidence report"
git push origin exercise-1/validate-environment
```

Open a Pull Request against `exercise-1` in the personal fork. Wait for it to be **merged** before starting T3, since T3 reads this file's filled-in evidence table.

---

## 4) Architecture and security requirements

### Input validation
- Only run `pnpm install` from `server/` or `client/` — never from the root unless `pnpm-workspace.yaml` is confirmed present.
- Never run `pnpm install --force` or `pnpm install --shamefully-hoist` without explicit justification.

### Secrets handling
- No environment variables or secrets are required for this task.
- Do not create `.env` files during install — the validation suite does not require a live database connection (SQL.js uses in-memory SQLite).

### Rollback / fallback
- If `node_modules` becomes corrupted: `rm -rf server/node_modules client/node_modules && pnpm install` in each directory.
- If lockfiles diverge: `pnpm install --frozen-lockfile` to enforce the committed lockfile versions.
- If a pre-existing test failure is found, **do not fix it in this task** — document it as a blocker and add it to the risk register in T3.

### Architecture boundary rules
- This task is validation-only; do NOT make code changes to make tests pass.
- If a test legitimately fails, it is a signal that the repository baseline is broken — escalate to the story owner before continuing.
- Do not add new test files, configuration files, or dependencies during this task.

---

## 5) Validation evidence

### BDD verification

**Given** dependencies are installed in both `server/` and `client/`,  
**When** I run the complete validation suite (5 commands: server build + lint + test; client build + lint),  
**Then** all 5 commands exit with code `0` and zero errors are reported.

**Given** the validation suite passes,  
**When** I run `git-info.js --branch-ref` against the repository,  
**Then** it prints `exercise-1 @ <sha>`, confirming the correct branch is active.

### Validation report table

#### Validation Report — nextjs-feature-flag-exercise

**Date:** 2026-04-13 18:28:55 +00
**Branch:** copilot/e0-s1-t2-validate-local-execution-environment @ 0638867
**Required baseline branch reference (`exercise-1`):** origin/exercise-1 @ 77c8d73
**Node.js:** v24.14.1
**pnpm:** 10.33.0

| # | Command | Working dir | Exit code | Status |
|---|---|---|---|---|
| 1 | `pnpm install` | `server/` | 0 | ✅ |
| 2 | `pnpm install` | `client/` | 0 | ✅ |
| 3 | `pnpm run build` | `server/` | 0 | ✅ |
| 4 | `pnpm run lint` | `server/` | 0 | ✅ |
| 5 | `pnpm test` | `server/` | 0 | ✅ |
| 6 | `pnpm run build` | `client/` | 0 | ✅ |
| 7 | `pnpm run lint` | `client/` | 1 | 🔴 |

**Overall: BLOCKED ⛔ — the validation suite did not pass because `client` lint failed with exit code `1`.**
**BDD verification status:** Blocked; this run is **not** a passing baseline for downstream tasks until the client lint failure is resolved.

### Failure — Step 7: `pnpm run lint`
**Exit code:** 1
**First 30 lines of stderr/stdout:**
```
> client@0.0.0 lint /home/runner/work/nextjs-feature-flag-exercise/nextjs-feature-flag-exercise/client
> eslint .

/home/runner/work/nextjs-feature-flag-exercise/nextjs-feature-flag-exercise/client/src/components/flag-form-modal.tsx
  76:7  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

/home/runner/work/nextjs-feature-flag-exercise/nextjs-feature-flag-exercise/client/src/components/flag-form-modal.tsx:76:7
  74 |   useEffect(() => {
  75 |     if (open) {
> 76 |       setFormData(initialData)
     |       ^^^^^^^^^^^ Avoid calling setState() directly within an effect
  77 |       setTagsInput(initialTags)
  78 |     }
  79 |   }, [open, initialData, initialTags])  react-hooks/set-state-in-effect

✖ 1 problem (1 error, 0 warnings)

 ELIFECYCLE  Command failed with exit code 1.
EXIT_CODE:1
```
**Blocker severity:** P0 — must be resolved before proceeding to E0-S1-T3.

Reference table (legacy format):

| # | Command | Directory | Exit code | Notes |
|---|---|---|---|---|
| 1 | `pnpm install` | `server/` | 0 | success |
| 2 | `pnpm install` | `client/` | 0 | success |
| 3 | `pnpm run build` | `server/` | 0 | success |
| 4 | `pnpm run lint` | `server/` | 0 | success |
| 5 | `pnpm test` | `server/` | 0 | success (16/16 tests) |
| 6 | `pnpm run build` | `client/` | 0 | success (`dist/` generated) |
| 7 | `pnpm run lint` | `client/` | 1 | react-hooks/set-state-in-effect in `flag-form-modal.tsx:76` |

**Branch:** `copilot/e0-s1-t2-validate-local-execution-environment @ 0638867`  
**Date:** `2026-04-13 18:28:55 +00` | **Operator:** `environment-validator`

---

## 6) Definition of Done

- [x] `pnpm install` exits `0` in `server/`.
- [x] `pnpm install` exits `0` in `client/`.
- [x] `pnpm run build` exits `0` in `server/`.
- [x] `pnpm run lint` exits `0` in `server/`.
- [x] `pnpm test` exits `0` in `server/` (all tests green).
- [x] `pnpm run build` exits `0` in `client/`.
- [ ] `pnpm run lint` exits `0` in `client/`.
- [x] Validation report table filled with all 7 exit codes.
- [x] Branch reference captured via `git-info.js --branch-ref`.
- [ ] No code changes made to the repository during validation.
- [ ] Feature branch `exercise-1/validate-environment` pushed to fork.
- [ ] PR opened against `exercise-1` and **merged** before T3 starts.
- [ ] Timeline entry appended to `docs/agile/timeline.jsonl`.
