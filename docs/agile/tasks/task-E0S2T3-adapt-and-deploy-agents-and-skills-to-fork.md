# Task E0-S2-T3 — Adapt and deploy agents and skills to fork

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S2-T3 |
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

> **Execution context:** T3 runs as a **GitHub Copilot cloud agent**, invoked via a GitHub Issue
> in the personal fork. The session is stateless — the T0 PR must be merged before this task starts
> (T3 may run in parallel with T1 and T2).
> Define `REPO_ROOT` once at the start of any shell session:
> ```bash
> REPO_ROOT="$(git rev-parse --show-toplevel)"
> ```
> T3 ends with a feature branch PR against `exercise-1`.

Create the `nextjs-feature-flag-exercise/.github/agents/` and `nextjs-feature-flag-exercise/.github/skills/` directories and deploy 3 adapted agents and 4 skills into them. Each agent must be adapted to remove workspace-level multi-repo context and to reference the exercise repository. Skills are methodology-agnostic and can be copied with no adaptation.

All files must be committed in this task — the execution plan ends with a commit and push to the fork.

**Artifacts to deploy (7 total):**

| Type | Source | Target | Adaptation |
|---|---|---|---|
| Agent | `docs/.github/agents/rdh-workflow-analyst.agent.md` | `.github/agents/rdh-workflow-analyst.agent.md` | Remove workspace context; scope methodology reference to `resident-health-workshop-resources` only |
| Agent | `docs/.github/agents/codebase-gap-analyst.agent.md` | `.github/agents/codebase-gap-analyst.agent.md` | Scope to `nextjs-feature-flag-exercise` vs Gold Standard comparison only |
| Agent | `docs/.github/agents/technical-manual-writer.agent.md` | `.github/agents/technical-manual-writer.agent.md` | Scope to generating exercise-specific technical manuals |
| Skill | `docs/.github/skills/analyze-rdh-workflow/SKILL.md` | `.github/skills/analyze-rdh-workflow/SKILL.md` | None — methodology-agnostic |
| Skill | `docs/.github/skills/gap-analysis/SKILL.md` | `.github/skills/gap-analysis/SKILL.md` | None — methodology-agnostic |
| Skill | `docs/.github/skills/write-technical-manual/SKILL.md` | `.github/skills/write-technical-manual/SKILL.md` | None — methodology-agnostic |
| Skill | `docs/.github/skills/system-evolution-retro/SKILL.md` | `.github/skills/system-evolution-retro/SKILL.md` | None — methodology-agnostic |

---

## 2) Verifiable expected outcome

1. All 3 agent files exist in `nextjs-feature-flag-exercise/.github/agents/`.
2. All 4 skill `SKILL.md` files exist in their respective subdirectories under `nextjs-feature-flag-exercise/.github/skills/`.
3. Each agent file contains a reference to the exercise repository (e.g., `nextjs-feature-flag-exercise`, or the exercise stack: Node.js/Express/SQL.js).
4. No workspace-relative paths remain in any deployed file (`docs/`, `resident-health-workshop-resources/` as a local path, `nextjs-ai-optimized-codebase/` as a local path).

Check all 7 artifacts exist:
```bash
node "docs/.github/functions/check-ai-layer-files.js" \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md"
```

Expected: all 7 lines show `✅`.

---

## 3) Detailed execution plan

### Step 0 — Confirm T0 outputs exist (hard dependency)

Before executing T3, confirm required source artifacts and adaptation skill are available:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md" \
  ".github/skills/adapt-artifact-to-fork-scope/SKILL.md"
```

🔴 **Stop if any item shows `❌`**. Return to T0 and complete missing artifacts first.

### Step 1 — Read source agents

Using `read_file`, read each of the 3 source agents in full:
1. `docs/.github/agents/rdh-workflow-analyst.agent.md`
2. `docs/.github/agents/codebase-gap-analyst.agent.md`
3. `docs/.github/agents/technical-manual-writer.agent.md`

For each agent, note:
- Lines that reference the workspace multi-repo setup (e.g., names of multiple workspace folders, references to `docs/.github/`, references to `agile/epics/`).
- Lines that reference agents or epics from the `docs/` workspace backlog.

**Stop condition:** all three agents read. Do not write adapted versions from memory.

### Step 2 — Adapt `rdh-workflow-analyst.agent.md`

Apply the `adapt-artifact-to-fork-scope` skill:
- Remove any sentence referencing the multi-repo workspace structure.
- Replace any mention of `resident-health-workshop-resources` as a local workspace path with a repository reference (e.g., "the `dynamous-business/resident-health-workshop-resources` repository commands and skills").
- Add or ensure the agent description references `nextjs-feature-flag-exercise` as the codebase context.

Write to `nextjs-feature-flag-exercise/.github/agents/rdh-workflow-analyst.agent.md`.

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

### Step 3 — Adapt `codebase-gap-analyst.agent.md`

Apply the `adapt-artifact-to-fork-scope` skill:
- Remove references to the multi-root workspace structure.
- Replace "compares `nextjs-feature-flag-exercise` (current state) against `nextjs-ai-optimized-codebase` (Gold Standard)" with a fork-scoped description referring to the exercise vs Gold Standard codebase comparison.
- Ensure the agent does not reference `docs/agile/` or `docs/epics/`.

Write to `nextjs-feature-flag-exercise/.github/agents/codebase-gap-analyst.agent.md`.

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

### Step 4 — Adapt `technical-manual-writer.agent.md`

Apply the `adapt-artifact-to-fork-scope` skill:
- Remove references to multi-repo context.
- Add a note that generated manuals are for the exercise scope only (Node.js/Express/SQL.js stack; not Next.js/Drizzle/Bun Gold Standard).

Write to `nextjs-feature-flag-exercise/.github/agents/technical-manual-writer.agent.md`.

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

### Step 5 — Read source skills

Using `read_file`, read each of the 4 source skills:
1. `docs/.github/skills/analyze-rdh-workflow/SKILL.md`
2. `docs/.github/skills/gap-analysis/SKILL.md`
3. `docs/.github/skills/write-technical-manual/SKILL.md`
4. `docs/.github/skills/system-evolution-retro/SKILL.md`

Confirm each is methodology-agnostic (no workspace-relative paths, no `docs/agile/` references).

### Step 6 — Copy skills to fork

For each skill, create the corresponding directory and write the `SKILL.md`:
- `nextjs-feature-flag-exercise/.github/skills/analyze-rdh-workflow/SKILL.md`
- `nextjs-feature-flag-exercise/.github/skills/gap-analysis/SKILL.md`
- `nextjs-feature-flag-exercise/.github/skills/write-technical-manual/SKILL.md`
- `nextjs-feature-flag-exercise/.github/skills/system-evolution-retro/SKILL.md`

Write each skill file with content = exact content read in Step 5 (no adaptation needed).

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

### Step 7 — Post-write validation

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md"
```

All 7 items must show `✅`.

### Step 8 — Commit and push

Commit and push all 7 deployed artifacts to the fork via a feature branch:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
git checkout -b exercise-1/deploy-agents-and-skills
git add .github/agents/ .github/skills/
git status  # confirm only agent/skill files are staged
git commit -m "feat(ai-layer): deploy adapted agents and skills to fork"
git push origin exercise-1/deploy-agents-and-skills
```

Open a Pull Request against `exercise-1` in the personal fork.

**Stop condition:** push succeeds. If `origin` is `dynamous-business/nextjs-feature-flag-exercise`, block — return to E0-S1-T1.

---

## 4) Architecture and security requirements

**Input validation:**
- Always read each source file with `read_file` before producing an adapted version. Never reconstruct agent content from memory — agent descriptions may have been updated since the story was written.
- After writing each adapted file, confirm no workspace-specific path patterns remain using `grep` or a mental scan.

**Secrets handling:**
- Agent files must not contain hardcoded secrets, tokens, or API keys.
- Skills are read-only methodology documents — no credential handling applies.

**Rollback/fallback:**
- Files live in `nextjs-feature-flag-exercise/` — outside `docs/agile/` — the VS Code Agent Hook does not cover them. No timeline entry needed.
- If an adapted agent has a structural error, rewrite it in place; if irrecoverably malformed, delete and recreate. Skills can be overwritten in place when needed.

**Architecture boundary:**
- Adapted agents must reference only artifacts deployable within the fork's `.github/` scope — they must not reference `docs/.github/agents/` or `docs/.github/skills/` as live runtime paths.
- Skills deployed to the fork are self-contained — they must not import or depend on `docs/.github/functions/` scripts that are not present in the fork.

---

## 5) Validation evidence

### Command — Full artifact existence check

```bash
node "docs/.github/functions/check-ai-layer-files.js" \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md"
```

**Expected exit code:** `0`
**Expected output:** all 7 lines show `✅`

### BDD verification signal

**Given** `nextjs-feature-flag-exercise/.github/agents/` and `.github/skills/` directories may or may not exist (fresh run or rework)
**When** I read each source artifact from `docs/.github/`, apply the `adapt-artifact-to-fork-scope` substitution map to the 3 agents, and copy the 4 skills unchanged
**Then** all 7 files exist in the fork `.github/` paths listed above
**And** `check-ai-layer-files.js` exits `0` with all 7 lines showing `✅`
**And** each of the 3 agent files contains a reference to `nextjs-feature-flag-exercise` or the exercise stack
**And** `grep -r "docs/agile/" nextjs-feature-flag-exercise/.github/agents/` returns no matches

**Affected files:**

| File | Action |
|---|---|
| `nextjs-feature-flag-exercise/.github/agents/rdh-workflow-analyst.agent.md` | Created (adapted) |
| `nextjs-feature-flag-exercise/.github/agents/codebase-gap-analyst.agent.md` | Created (adapted) |
| `nextjs-feature-flag-exercise/.github/agents/technical-manual-writer.agent.md` | Created (adapted) |
| `nextjs-feature-flag-exercise/.github/skills/analyze-rdh-workflow/SKILL.md` | Created (copied) |
| `nextjs-feature-flag-exercise/.github/skills/gap-analysis/SKILL.md` | Created (copied) |
| `nextjs-feature-flag-exercise/.github/skills/write-technical-manual/SKILL.md` | Created (copied) |
| `nextjs-feature-flag-exercise/.github/skills/system-evolution-retro/SKILL.md` | Created (copied) |

---

## 6) Definition of Done

- [x] `check-ai-layer-files.js` with all 7 fork paths exits `0` and shows `✅` for every path.
- [x] All 3 agent files reference `nextjs-feature-flag-exercise` or the exercise stack context.
- [x] No workspace-relative paths remain in any adapted agent (`docs/agile/`, local `resident-health-workshop-resources/` paths).
- [x] All 4 skill SKILL.md files are identical to their source counterparts (no accidental modifications).
- [x] Committed directly to `exercise-1` (Epic 0 local execution rule — no PR required).
- [x] Pushed to `origin exercise-1`.
