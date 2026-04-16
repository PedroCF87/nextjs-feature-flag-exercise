# Task E2-S2-T7 — Run full validation suite on exercise-2

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T7 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `environment-validator` |
| **Depends on** | E2-S2-T6 |
| **Blocks** | — |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 12:20:22 -03 |

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

- Command(s) executed:
- Exit code(s):
- Output summary:
- Files created/updated:
- Risks found / mitigations:

### Given / When / Then checks

- **Given** all task dependencies are available and validated,
- **When** this task execution plan is completed and evidence is collected,
- **Then** the task outcome is reproducible, secure, and auditable by another agent.

---

## 6) Definition of Done

- [ ] Expected outcome is objectively verifiable.
- [ ] Dependencies are explicit and valid.
- [ ] Security and architecture checks were performed.
- [ ] Validation evidence is attached.
- [ ] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved:
- Downstream items unblocked:
- Open risks (if any):
