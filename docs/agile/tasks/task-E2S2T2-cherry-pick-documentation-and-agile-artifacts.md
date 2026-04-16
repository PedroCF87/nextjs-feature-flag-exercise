# Task E2-S2-T2 — Copy documentation and agile artifacts to exercise-2

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T2 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `git-ops` |
| **Depends on** | E2-S2-T1 |
| **Blocks** | E2-S2-T3, E2-S2-T6 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 13:14:17 -03 |

---

## 1) Task statement

As a repository engineer, I want to copy pre-saved `docs/`, `manuals/`, and `.github/` folders from the exercise-1 backup into the `exercise-2` branch so that all planning, agile, documentation, and AI Layer artifacts are available for Exercise 2.

---

## 2) Verifiable expected outcome

- `docs/`, `manuals/`, and `.github/` directories are fully populated on `exercise-2` with artifacts from exercise-1.
- A commit exists on `exercise-2` with the message containing `[E2-S2-T2]`.
- Upstream `claude.yml` in `.github/workflows/` is preserved (not overwritten).
- Exercise-1 workflow files are present (cleanup deferred to T3).

---

## 3) Detailed execution plan

**Description:** Copy pre-saved `docs/`, `manuals/`, and `.github/` folders from the backup location outside the repository into the `exercise-2` branch. This replaces the original cherry-pick approach to avoid losing documents that exist on `exercise-1` but might not survive selective cherry-picks. The `.github/` artifacts will be reviewed on the `exercise-2` branch to decide which to keep or adjust.

**Backup source paths (already saved by the user):**
- `/delfos/Projetos/ITBC - Desafio RDH/docs`
- `/delfos/Projetos/ITBC - Desafio RDH/manuals`
- `/delfos/Projetos/ITBC - Desafio RDH/.github`

**Execution steps:**
1. Ensure `exercise-2` branch is checked out and clean (`git status`).
2. Copy the backup folders into the repository root:
   ```bash
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/docs" ./docs
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/manuals" ./manuals
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/.github" ./.github
   ```
3. Stage and verify the copied content:
   ```bash
   git add docs/ manuals/ .github/
   git status
   ```
4. Commit with traceability:
   ```bash
   git commit -m "docs: restore docs, manuals, and .github artifacts from exercise-1 backup [E2-S2-T2]"
   ```

**Note:** The `.github/` copy will bring AI Layer artifacts (instructions, skills, agents, copilot-instructions.md) and workflows from exercise-1. Workflow cleanup happens in T3; AI Layer review is deferred to E2-S1.

**Acceptance criteria:**
- **Given** the backup folders exist at the specified paths outside the repository
- **When** the folders are copied into the `exercise-2` branch and committed
- **Then** `docs/`, `manuals/`, and `.github/` directories are fully populated on `exercise-2` with planning, agile, documentation, and AI Layer artifacts from `exercise-1`

---

## 4) Architecture and security requirements

- Copy operation merges into existing `.github/` directory — must not overwrite upstream `claude.yml`.
- No secrets or credentials are included in the copied folders.
- AI Layer artifacts will be reviewed for exercise-2 fitness in E2-S1 (not this task).
- Rollback: `git reset --hard HEAD~1` to undo the commit if content is wrong.

---

## 5) Validation evidence

- **Command(s) executed:**
  1. `git checkout exercise-2 && git status --short` → clean tree confirmed
  2. `cp -r "/delfos/Projetos/ITBC - Desafio RDH/docs" ./docs`
  3. `cp -r "/delfos/Projetos/ITBC - Desafio RDH/manuals" ./manuals`
  4. `cp -r "/delfos/Projetos/ITBC - Desafio RDH/.github/." ./.github/` (merge into existing .github/)
  5. `git add docs/ manuals/ .github/ && git commit -m "docs: restore docs, manuals, and .github artifacts from exercise-1 backup [E2-S2-T2]"`
  6. `git checkout exercise-1 -- <30 agile files>` (sync task/story/epics that had been updated on exercise-1 after the backup was taken) → commit `fd65535`
  7. `git rm docs/agile/prompts/prompts-E2S1-claude-ai-layer-preparation.md` (removed renamed file leftover) → commit `7e90362`
- **Exit code(s):** All 0
- **Output summary:**
  - Commit `266a8da`: 313 files changed, 56659 insertions(+) — main copy of `docs/`, `manuals/`, `.github/`
  - Commit `fd65535`: 30 files changed — sync of agile artifacts (stories, tasks, backlog-index, epics, prompts) from exercise-1 to match latest state
  - Commit `7e90362`: 1 file deleted — removed `prompts-E2S1-claude-ai-layer-preparation.md` leftover from a rename on exercise-1
- **Files created/updated:** `docs/` (agile, epics, dashboard, manuals, references, images), `manuals/` (4 interview guides + epic2 prep), `.github/` (agents, instructions, skills, functions, hooks, workflows, copilot-instructions.md, copilot-mcp.json)
- **Risks found / mitigations:** Upstream `claude.yml` in `.github/workflows/` was preserved — the merge copy (`.github/.` → `.github/`) added exercise-1 workflow files alongside it without overwriting. Exercise-1 workflows will be cleaned up in T3.

### Given / When / Then checks

- **Given** backup folders exist at `/delfos/Projetos/ITBC - Desafio RDH/{docs,manuals,.github}` and exercise-2 branch is clean,
- **When** folders are copied into the repository (commit `266a8da`), synced to latest exercise-1 agile state (commit `fd65535`), and leftover renamed file removed (commit `7e90362`),
- **Then** `docs/`, `manuals/`, and `.github/` are fully populated on exercise-2 with all planning, agile, documentation, and AI Layer artifacts from exercise-1.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E2-S2-T1 (exercise-2 branch created at 04ea0ba)
- **Downstream items unblocked:** E2-S2-T3 (workflow cleanup — exercise-1 auto-* workflows now exist on exercise-2 and need removal), E2-S2-T6 (push + draft PR)
- **Open risks (if any):** The `.github/workflows/` directory now contains 7 workflow files (6 from exercise-1 + upstream claude.yml). T3 must remove the 6 exercise-1 files before pushing.
