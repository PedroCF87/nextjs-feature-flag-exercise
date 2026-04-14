# Task E0-S2-T2 — Adapt and deploy instructions to fork

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S2-T2 |
| **Story** | [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-config-refactor` |
| **Skill** | `adapt-artifact-to-fork-scope` |
| **Depends on** | [E0-S2-T0 — Bootstrap AI Layer management artifacts](task-E0S2T0-bootstrap-ai-layer-management-artifacts.md) |
| **Blocks** | E0-S2-T5 |
| Created at | 2026-04-11 15:14:45 -03 |
| Last updated | 2026-04-14 17:30:00 -03 |

---

## 1) Task statement

> **Execution context:** T2 runs **locally in VS Code** (Epic 0 local execution model — no PR required).
> T0 artifacts must exist before this task starts
> (T2 may run in parallel with T1; it depends only on T0 artifacts).
> Define `REPO_ROOT` once at the start of any shell session:
> ```bash
> REPO_ROOT="$(git rev-parse --show-toplevel)"
> ```
> T2 ends with a direct commit and push to `exercise-1`.

Create the `nextjs-feature-flag-exercise/.github/instructions/` directory and deploy two adapted instruction files into it:

1. `feature-flag-exercise.instructions.md` — adapted from `docs/.github/instructions/feature-flag-exercise.instructions.md` with the `applyTo` header updated from the workspace-relative path to a fork-root-relative path.
2. `coding-agent.instructions.md` — copied directly from the file created in T0 (`docs/.github/instructions/coding-agent.instructions.md`), with no further adaptation needed since it was written for the exercise scope.

Both files must be committed in this task — the execution plan ends with a commit and push to the fork.

---

## 2) Verifiable expected outcome

1. `nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md` exists.
2. `nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md` exists.
3. Both files contain a valid YAML front matter `applyTo` header as the first block (`---\napplyTo: ...\n---`).
4. `feature-flag-exercise.instructions.md` `applyTo` value is `**` or a fork-valid glob (not `../nextjs-feature-flag-exercise/**`).
5. No workspace-relative path strings appear in either file (`docs/`, `resident-health-workshop-resources/`, `nextjs-ai-optimized-codebase/`).

Commands that confirm expected outcome (exit code `0`):
```bash
ls -la "nextjs-feature-flag-exercise/.github/instructions/"
# Expected: 2 files listed

grep -c "applyTo" "nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md"
# Expected: 1

grep -c "applyTo" "nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md"
# Expected: 1
```

---

## 3) Detailed execution plan

### Step 0 — Confirm T0 outputs exist (hard dependency)

Before executing T2, confirm the required artifacts from T0 exist:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
	"$REPO_ROOT/docs" \
	".github/skills/adapt-artifact-to-fork-scope/SKILL.md" \
	".github/instructions/coding-agent.instructions.md" \
	".github/instructions/copilot-config-governance.instructions.md"
```

🔴 **Stop if any item shows `❌`**. Return to T0 and complete missing artifacts first.

### Step 1 — Read the source instruction file

Read `docs/.github/instructions/feature-flag-exercise.instructions.md` using `read_file` (full file). Identify:
- The current `applyTo` value (likely `../nextjs-feature-flag-exercise/**`).
- Any workspace-specific references (absolute paths, multi-repo context).
- The SQL.js constraint sections (must be preserved).

**Stop condition:** full file content understood. Do not produce the adapted version from memory.

### Step 2 — Apply the `adapt-artifact-to-fork-scope` skill

Using the skill at `docs/.github/skills/adapt-artifact-to-fork-scope/SKILL.md`, apply the following substitution map:

| Pattern | Replacement |
|---|---|
| Any `applyTo` value containing workspace traversal (`../nextjs-feature-flag-exercise/**` or equivalent) | `applyTo: "**"` |
| Any absolute path referencing `docs/` | Remove or replace with relative fork path |
| Any sentence referencing the multi-repo workspace | Remove entirely |

After substitution, verify the quality checklist from the skill:
- [ ] `applyTo` header is fork-valid.
- [ ] No workspace-relative paths remain.
- [ ] Exercise stack context is present (SQL.js constraints, shared/types.ts pattern).
- [ ] Diff summary produced (list every substitution applied).

### Step 3 — Write the adapted instruction file

Write `nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md` with the adapted content.

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

### Step 4 — Read the coding-agent instruction from T0

Read `docs/.github/instructions/coding-agent.instructions.md` using `read_file`. Confirm:
- `applyTo` header is `"**/*.ts,**/*.tsx,**/routes/**,**/services/**"` (fork-valid — no adaptation needed).
- No workspace-relative paths.

### Step 5 — Copy coding-agent instructions to fork

Write `nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md` with the same content read in Step 4.

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

**Important:** Do not adapt; copy verbatim. This file was authored for the exercise scope in T0.

### Step 6 — Post-write validation

Run the following checks:
```bash
ls -la "nextjs-feature-flag-exercise/.github/instructions/"
grep "applyTo" "nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md"
grep "applyTo" "nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md"
grep -r "docs/" "nextjs-feature-flag-exercise/.github/instructions/" || echo "No workspace paths found"
```

All checks must pass before marking Done.

### Step 7 — Commit and push

Commit and push both instruction files directly to `exercise-1`:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
git add .github/instructions/feature-flag-exercise.instructions.md .github/instructions/coding-agent.instructions.md
git status  # confirm only these 2 files are staged
git commit -m "feat(ai-layer): deploy adapted instructions to fork"
git push origin exercise-1
```

**Stop condition:** push succeeds. If `origin` is `dynamous-business/nextjs-feature-flag-exercise`, block — return to E0-S1-T1.

---

## 4) Architecture and security requirements

**Input validation:**
- Always read the source file with `read_file` before adapting — never reconstruct content from memory.
- After writing each file, read it back with `read_file` to confirm the content was written correctly.
- Validate `applyTo` value with a regex mentally: must not contain `../` (workspace-relative traversal).

**Secrets handling:**
- Instruction files must not contain hardcoded secrets or API keys.
- References to credentials must use environment variable names only.

**Rollback/fallback:**
- If a file is written with incorrect `applyTo`, rewrite it in place; if irrecoverably malformed, delete and recreate.
- These files live in `nextjs-feature-flag-exercise/` — outside `docs/agile/` — so the VS Code Agent Hook does not cover them. No timeline entry needed for these files.

**Architecture boundary:**
- Instruction files in `nextjs-feature-flag-exercise/.github/instructions/` must apply only to the exercise repository. They must not reference agents or skills that exist only in `docs/.github/`.
- The SQL.js constraints section must survive the adaptation — it is a critical execution guardrail for EPIC-1.

---

## 5) Validation evidence

### Command — Validate both files exist with applyTo

```bash
ls -la "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/.github/instructions/"
grep "applyTo" "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md"
grep "applyTo" "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md"
```

**Expected:** 2 files listed; each `grep` returns the `applyTo:` line.

### BDD verification signal

**Given** `nextjs-feature-flag-exercise/.github/instructions/` does not exist
**When** I read `docs/.github/instructions/feature-flag-exercise.instructions.md`, apply the `adapt-artifact-to-fork-scope` substitution map, and create both instruction files in the fork
**Then** both files exist in `nextjs-feature-flag-exercise/.github/instructions/`
**And** both contain a valid `applyTo:` front matter header
**And** `grep -r "../nextjs-feature-flag-exercise" nextjs-feature-flag-exercise/.github/instructions/` returns no matches (no workspace traversal paths)
**And** `grep -r "docs/" nextjs-feature-flag-exercise/.github/instructions/` returns no matches (no workspace-relative paths)

**Affected files:**

| File | Action |
|---|---|
| `nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md` | Created and committed |
| `nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md` | Created and committed |

---

## 6) Definition of Done

- [x] Both files exist in `nextjs-feature-flag-exercise/.github/instructions/`.
- [x] Both files have a valid YAML `applyTo` front matter header.
- [x] `feature-flag-exercise.instructions.md` `applyTo` does not contain `../` traversal.
- [x] No workspace-relative path strings remain in either file.
- [x] SQL.js constraints section is present in `feature-flag-exercise.instructions.md`.
- [x] Committed directly to `exercise-1` (Epic 0 local execution rule — no PR required).
- [x] Pushed to `origin exercise-1`.
