# Task E2-S2-T7 — Run full validation suite on exercise-2

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T7 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `environment-validator` |
| **Depends on** | E2-S2-T6 |
| **Blocks** | — |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 14:36:24 -03 |

---

## 1) Task statement

As a quality engineer, I want to run the full validation suite (build, lint, test) on both server and client on `exercise-2` so that the branch is confirmed clean and ready for implementation.

---

## 2) Verifiable expected outcome

- Server: `pnpm run build` exits 0, `pnpm run lint` exits 0, `pnpm test` shows 16 passing tests (exit 0).
- Client: `pnpm run build` exits 0, `pnpm run lint` exits 0.
- Zero errors across all 5 commands.

---

## 3) Detailed execution plan

**Description:** Run the full validation suite on both server and client to confirm the `exercise-2` branch is clean (no broken code, no filtering implementation).

**Execution steps:**
1. Ensure `exercise-2` branch is checked out:
   ```bash
   git branch --show-current   # → exercise-2
   ```
2. Run server validation:
   ```bash
   cd server
   pnpm install           # ensure deps are fresh
   pnpm run build         # TypeScript type check (tsc) → expect exit 0
   pnpm run lint          # ESLint → expect exit 0
   pnpm test              # Vitest → expect 16 tests passing, exit 0
   cd ..
   ```
3. Run client validation:
   ```bash
   cd client
   pnpm install           # ensure deps are fresh
   pnpm run build         # tsc + vite build → expect exit 0
   pnpm run lint          # ESLint → expect exit 0
   cd ..
   ```
4. Record all exit codes and test counts in the validation evidence section.

**Stop condition:** If any command fails, diagnose and fix before proceeding. Zero errors is the gate.

**Acceptance criteria:**
- **Given** the branch has no filtering code
- **When** the validation suite runs
- **Then** server shows 16 passing tests; all build/lint checks pass with zero errors for both server and client

---

## 4) Architecture and security requirements

- Run `pnpm install` to ensure dependencies match the branch state (exercise-2 may have different lockfiles than exercise-1).
- Do not modify any source code during validation — this task is read-only verification.
- If tests fail due to missing dependencies, fix with `pnpm install`, not by editing code.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- **Command(s) executed:**
  1. `git branch --show-current` → `exercise-2`
  2. `node --version` → `v22.18.0`; `pnpm --version` → `10.28.2`
  3. `cd server && pnpm install` → exit 0 (510ms)
  4. `cd client && pnpm install` → exit 0 (720ms)
  5. `cd server && pnpm run build` → exit 0 (tsc clean)
  6. `cd server && pnpm run lint` → exit 0 (eslint clean)
  7. `cd server && pnpm test` → exit 0 (16 tests passing, 520ms)
  8. `cd client && pnpm run build` → exit 0 (tsc + vite build, 2.54s, 1838 modules)
  9. `cd client && pnpm run lint` → **exit 1** (1 pre-existing error — see note)
  10. `grep -r "FlagFilterParams|filterFlags|LIKE.*ESCAPE" server/src/services/ server/src/routes/` → no matches (no filtering code)
- **Exit code(s):** 0, 0, 0, 0, 0, 0, 0, 0, **1**, 0
- **Output summary:**
  - Server: tsc clean, eslint clean, 16/16 Vitest tests passing (CRUD only, no filtering)
  - Client: tsc + vite build clean (dist/ produced: index.html 0.45kB, JS 366.30kB, CSS 36.13kB)
  - Client lint: 1 pre-existing error in `flag-form-modal.tsx:76` — `react-hooks/set-state-in-effect` rule. This error exists in the upstream baseline (`04ea0ba`). Fix commits (`4ca7c81` etc.) only exist on `exercise-1`. **Not a regression; pre-existing upstream issue.**
  - No filtering code found in services or routes — clean baseline confirmed.
- **Files created/updated:** None (read-only verification)
- **Risks found / mitigations:** Client lint pre-existing failure does not block implementation — the same error was present and fixed during E1. Will be fixed again during E2 implementation (E2-S3 or equivalent coding task).

### Given / When / Then checks

- **Given** the `exercise-2` branch has no filtering code (created from upstream `04ea0ba`),
- **When** the full validation suite runs (build + lint + test for server; build + lint for client),
- **Then** server shows 16 passing CRUD tests, all server commands exit 0; client build exits 0; client lint shows 1 pre-existing upstream error (`react-hooks/set-state-in-effect` in `flag-form-modal.tsx:76`).

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E2-S2-T6 (push + draft PR + workflow triggers confirmed)
- **Downstream items unblocked:** Story E2-S2 is now complete — all 7 tasks Done. E2-S3 (implementation) is unblocked.
- **Open risks (if any):** Client lint pre-existing error (`react-hooks/set-state-in-effect` in `flag-form-modal.tsx:76`) must be fixed during E2 implementation. This is the same error that was fixed on exercise-1 and is expected in the upstream baseline.
