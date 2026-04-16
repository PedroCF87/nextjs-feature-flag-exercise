# Task E2-S2-T1 — Create exercise-2 branch from upstream state

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T1 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `git-ops` |
| **Depends on** | — |
| **Blocks** | E2-S2-T2 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 12:30:18 -03 |

---

## 1) Task statement

As a repository engineer, I want to create the `exercise-2` branch from the upstream original state (`f73979ed~1`) so that Exercise 2 implementation starts from a clean baseline with zero Exercise 1 code.

---

## 2) Verifiable expected outcome

- The `exercise-2` branch exists locally at commit `04ea0ba` (parent of first fork commit).
- `git log --oneline -1` on `exercise-2` shows the upstream base commit.
- No filtering code (`FlagFilterParams`, `getAllFlags.*filter`, `LIKE.*ESCAPE`) is found in `server/src/`.
- Server tests show exactly 16 passing tests (CRUD only, no filtering tests).

---

## 3) Detailed execution plan

**Description:** Create `exercise-2` branch from `f73979ed~1` (parent of first fork commit). This ensures the implementation starts from the original upstream state with zero Exercise 1 implementation code.

**Execution steps:**
1. Identify the correct base commit — the parent of the first fork-specific commit:
   ```bash
   git log --oneline f73979ed~1 -1
   ```
2. Create the branch from that commit:
   ```bash
   git checkout -b exercise-2 f73979ed~1
   ```
3. Verify the branch HEAD is at the expected upstream commit:
   ```bash
   git log --oneline -3
   ```
4. Confirm no Exercise 1 filtering code exists:
   ```bash
   grep -r "FlagFilterParams\|getAllFlags.*filter\|LIKE.*ESCAPE" server/src/ || echo "No filtering code found"
   ```
5. Run server tests to confirm CRUD-only baseline:
   ```bash
   cd server && pnpm install && pnpm test
   ```
   Expected: 16 tests passed (CRUD only, no filtering tests).

**Acceptance criteria:**
- **Given** the fork history is available
- **When** `exercise-2` is created from `f73979ed~1`
- **Then** the branch exists; `git log --oneline -1` shows the correct parent commit; no filtering code is present

---

## 4) Architecture and security requirements

- Branch creation is a local-only operation — no remote side effects until T6 push.
- The base commit must be verified to contain zero Exercise 1 implementation code.
- No secrets or credentials are involved in this task.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed:
  ```
  git checkout -b exercise-2 f73979ed~1
  git log --oneline -3
  grep -r "FlagFilterParams|getAllFlags.*filter|LIKE.*ESCAPE" server/src/
  cd server && pnpm install && pnpm test
  ```
- Exit code(s): all 0
- Output summary:
  - Branch created: `exercise-2` at commit `04ea0ba` ("Add Claude Code interactive workflow to default branch")
  - No filtering code found in `server/src/` — correct
  - Server tests: 16 passed (16), 0 failed — CRUD only, no filtering tests
- Files created/updated: new branch `exercise-2` (local only, not yet pushed)
- Risks found / mitigations: none — branch is clean, correct base commit confirmed

### Given / When / Then checks

- **Given** the fork history includes `f73979ed` as the first fork-specific commit,
- **When** `exercise-2` branch is created from `f73979ed~1` and server tests are run,
- **Then** the branch HEAD is at `04ea0ba`, zero filtering code is found in `server/src/`, and 16 CRUD-only tests pass.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: none (first task in chain)
- Downstream items unblocked: E2-S2-T2 (copy documentation and artifacts)
- Open risks (if any): branch exists locally only — will be pushed in T6
