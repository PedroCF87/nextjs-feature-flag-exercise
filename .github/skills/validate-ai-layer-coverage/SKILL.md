---
name: validate-ai-layer-coverage
description: Validate minimum AI Layer readiness coverage with a 6-item evidence checklist and gap action plan.
---

# Skill — Validate AI Layer Coverage

## Metadata

- **Created at:** 2026-04-09 22:14:39 -03
- **Last updated:** 2026-04-09 22:14:39 -03

---

## Description

Run the 6-item minimum readiness checklist from `ai-development-environment-catalog.md §6` against a target exercise fork and produce a structured pass/fail coverage report. Use this skill to confirm the AI Layer is complete before committing the deployment baseline.

Use this skill at the start and end of Task E0-S2-T5 to produce the signed readiness checklist required by AC-7.

---

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `fork_root` | string | ✅ | Absolute path to the fork root directory (e.g., `/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise`) |
| `workspace_root` | string | optional | Absolute path to the workspace Docs root — used to locate the codebase audit evidence |

---

## 6-Item Checklist

| # | Item | Expected evidence |
|---|---|---|
| 1 | Codebase audit completed | `{fork_root}/.agents/diagnosis/codebase-audit.md` exists (produced by E0-S1 via `produce-diagnosis-document` skill) |
| 2 | Migration plan produced | T0 artifact table in story `story-E0S2-minimum-ai-layer.md` or a `config-migration-plan` skill output document |
| 3 | Responsible agent for each macro phase | Agent files exist in `{fork_root}/.github/agents/` covering: methodology analysis, gap analysis, documentation, governance |
| 4 | Each phase has at least 1 operational skill | Skill directories with `SKILL.md` exist in `{fork_root}/.github/skills/` for: methodology (`analyze-rdh-workflow`), analysis (`gap-analysis`), documentation (`write-technical-manual`) |
| 5 | Instructions for review, documentation, and behavioral constraints | `{fork_root}/.github/instructions/feature-flag-exercise.instructions.md` and `{fork_root}/.github/instructions/coding-agent.instructions.md` exist |
| 6 | Setup validated by dry-run | A dry-run run ID is documented in the preparation friction log or in `.agents/` notes |

---

## Process

1. For each checklist item, determine the expected evidence path or condition.
2. Check if the evidence exists:
   - **File presence:** use `ls` or `find` to confirm files exist at the expected paths.
   - **Documentation:** look for a run ID or evidence string in the preparation friction log or `.agents/` directory notes.
3. Mark each item **✅** (evidence found) or **❌** (evidence missing), recording the actual path checked.
4. If any **❌** items exist, produce a gap action plan:
   - Which story or task is responsible for creating this evidence?
   - What is the blocking dependency?
   - What action is needed to resolve it?
5. Produce the coverage report table (format below).
6. Write the report to `{fork_root}/.agents/validation/ai-layer-coverage-report.md` (create the directory if needed).
7. Declare overall status: **READY** (all 6 ✅) or **NOT READY** (any ❌).

---

## Output format

### Coverage report table

```markdown
| # | Item | Expected evidence path | Found | Status |
|---|---|---|---|---|
| 1 | Codebase audit | `{fork_root}/.agents/diagnosis/codebase-audit.md` | ✅ / ❌ | PASS / FAIL |
| 2 | Migration plan | Story E0-S2 T0 artifact table or config-migration-plan output | ✅ / ❌ | PASS / FAIL |
| 3 | Agents per phase | `{fork_root}/.github/agents/*.agent.md` | ✅ (N files) / ❌ | PASS / FAIL |
| 4 | Skills per phase | `{fork_root}/.github/skills/*/SKILL.md` | ✅ (N dirs) / ❌ | PASS / FAIL |
| 5 | Instructions | `{fork_root}/.github/instructions/*.md` | ✅ (N files) / ❌ | PASS / FAIL |
| 6 | Dry-run validated | Preparation friction log — run ID present | ✅ / ❌ | PASS / FAIL |

**Overall status:** READY / NOT READY
**Report generated:** YYYY-MM-DD HH:MM:SS -HH
```

### Gap action plan (if any ❌)

For each failing item:

- **Gap:** `<item description>`
- **Blocking task:** `<task ID and name>`
- **Action:** `<what needs to be done>`
- **Owner:** `<agent responsible>`

---

## Quality checklist

- [ ] All 6 items checked against real file paths (not assumed).
- [ ] Evidence paths documented for both found and not-found items.
- [ ] Gap action plan produced for any ❌ item.
- [ ] Coverage report saved to `{fork_root}/.agents/validation/ai-layer-coverage-report.md`.
- [ ] Overall status declared: **READY** or **NOT READY**.
- [ ] If report already exists, append with a datestamp section header instead of overwriting.

---

## Do not

- Do not invent evidence — only mark ✅ if the file or documentation physically exists at the checked path.
- Do not skip items — all 6 must be checked even if some appear obvious from prior work.
- Do not overwrite an existing coverage report — append with a new datestamp section.
- Do not mark overall status **READY** if any single item is ❌.
