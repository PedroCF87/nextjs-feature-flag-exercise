---
name: config-migration-plan
description: Produces an ordered migration plan for deploying AI Layer artifacts from a source directory (e.g., docs/.github/) to a target repository (e.g., fork .github/). Use this skill when you need a step-by-step plan with adaptation notes, dependency ordering, and rollback strategy before executing a batch of file writes.
---

## Purpose

Produce an ordered, dependency-aware migration plan that an executing agent can follow row by row without ambiguity. The plan drives which files are created, which are updated, and in what order — along with the adaptation required for each artifact.

## Process

1. **Consume the diff table** — this skill is always preceded by `copilot-layer-diff`. Read the diff table produced by that skill. Every row with `Status = missing` or `Status = outdated` becomes a step in the migration plan. Rows with `Status = current` are excluded.

2. **Determine dependency order** — apply these ordering rules:
   - `copilot-instructions.md` (global rules) must be written **first** — it provides context referenced by instructions.
   - `*.instructions.md` files must be written **before** any agent files that rely on those instructions being present and applicable in the target repository.
   - `SKILL.md` files must be written **before** the agents that reference them.
   - `.agent.md` files come **after** all their referenced skills and instructions.
   - `copilot-setup-steps.yml` is independent and can be placed last.

3. **Identify adaptation notes per artifact** — for each artifact to be deployed, determine:
   - Does the `applyTo` header reference workspace-level paths that need scope change?
   - Does the `description` or `## Project Context` section contain context from a different repository?
   - Are there hardcoded repo names, branch names, or file paths that need updating?

4. **Produce the migration plan table**:

   | Step | Artifact | Source path | Target path | Adaptation notes | Depends on step |
   |---|---|---|---|---|---|
   | 1 | `copilot-instructions.md` | `docs/.github/copilot-instructions.md` | `.github/copilot-instructions.md` | Scope to target repo; strip workspace context | — |
   | 2 | `coding-agent.instructions.md` | `docs/.github/instructions/coding-agent.instructions.md` | `.github/instructions/coding-agent.instructions.md` | Verify `applyTo` pattern is correct for target | 1 |
   | (continue per artifact) | | | | | |

5. **Produce the rollback strategy** — append after the migration plan table (see template below).

6. **Pre-flight checkpoint** — recommend creating a checkpoint branch in the target repository before starting any writes:
   ```bash
   git checkout -b migration-checkpoint
   git checkout -  # return to working branch
   ```
   If post-deploy validation fails, the entire batch can be reverted with `git checkout migration-checkpoint -- .` or `git reset --hard migration-checkpoint`.

## Migration plan table format

The table **must** include all columns. Rows must be ordered by execution sequence (respecting `Depends on step`). Use `—` for no dependency.

## Rollback strategy template

```markdown
## Rollback Strategy

| Scenario | Recovery action |
|---|---|
| Single file write fails mid-batch | `git checkout -- <file>` in target to restore the pre-write state of that file |
| Post-deploy validation fails (e.g., `check-ai-layer-files.js` exits non-zero) | `git reset HEAD <files>` to unstage; review errors; re-apply only the failing artifacts |
| Full batch must be reverted | `git reset --hard migration-checkpoint` to restore the pre-migration state (requires the checkpoint branch created in step 6) |
| Agent file references broken skill | Append the correct skill reference to the agent file; re-run cross-reference validation |
```

## Constraints

- This skill is read-only — it produces a plan, it does not write any files.
- Do not describe steps that are not present in the diff table (do not invent actions for `current` artifacts).
- Adaptation notes must be specific: name the exact field or string to change, not "update as needed".
- If the diff table has zero `missing` or `outdated` rows, output: "No migration required — all artifacts are current."
