# Task E0-S3-T0 — Bootstrap AI Layer artifacts for this story

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S3-T0 |
| **Story** | [E0-S3 — Definition of Measurement Baseline](../stories/story-E0S3-measurement-baseline.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Draft |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md) |
| **Blocks** | E0-S3-T1, E0-S3-T2, E0-S3-T3 |
| Created at | 2026-04-11 16:43:15 -03 |
| Last updated | 2026-04-11 16:49:00 -03 |

---

## 1) Task statement

Verify and register the four AI Layer artifacts required for E0-S3 execution (template generation and time-zero snapshot), and confirm that their references are present in the catalog and shared-functions documentation. This task is a hard gate for E0-S3-T1, E0-S3-T2, and E0-S3-T3.

> **Execution context:** T0 runs locally in VS Code (`agile-exercise-planner` mode). All verified artifacts reside in the exercise fork's `docs/` folder (moved from the workspace root `Docs/` in E0-S1-T1). Define `REPO_ROOT` at the start of each shell block: `REPO_ROOT="$(git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" rev-parse --show-toplevel)"`. If all checks pass without changes, no commit is required. If any catalog or shared-function registration was missing and patched, commit and push the fix to the fork.

---

## 2) Verifiable expected outcome

1. The following 4 artifacts exist and are readable:
	- `docs/.github/functions/elapsed-time.js`
	- `docs/.github/skills/generate-measurement-template/SKILL.md`
	- `docs/.github/skills/record-time-zero-snapshot/SKILL.md`
	- `docs/.github/instructions/measurement-baseline.instructions.md`
2. `docs/ai-development-environment-catalog.md` includes:
	- `generate-measurement-template` in section 3 (Skills)
	- `record-time-zero-snapshot` in section 3 (Skills)
	- an E0-S3 coverage row in section 4
3. `docs/.github/copilot-instructions.md` includes `elapsed-time.js` in the Shared Functions table.
4. Validation evidence section in this task contains command outputs and pass/fail statements with file references.

---

## 3) Detailed execution plan

**Goal:** verify and register the four AI Layer artifacts required to execute T2 and T3 of this story.

**Context:** T2 delegates to `generate-measurement-template` to produce the 9-section template; T3 delegates to `record-time-zero-snapshot` to fill it and sign the go/no-go checklist. Both skills use `elapsed-time.js` for elapsed-time computation. `measurement-baseline.instructions.md` enforces always-on behavioral rules across T2 and T3. All four artifacts were created by the `agile-exercise-planner` agent during E0-S3 story authoring.

**Agents:** `agile-exercise-planner` (bootstrap), `environment-validator` (T3 — validation suite), `git-ops` (T3 — commit)

**Artifacts:**

| Artifact | Path | Used in | Purpose |
|---|---|---|---|
| Function | `docs/.github/functions/elapsed-time.js` | T3 (via `record-time-zero-snapshot`) | Computes elapsed minutes between two `datetime.js` timestamps — used in the Time Capture section of the baseline template |
| Skill | `docs/.github/skills/generate-measurement-template/SKILL.md` | T2 | Generates the complete 9-section baseline capture template, parameterized by exercise name, fork root, and validation commands |
| Skill | `docs/.github/skills/record-time-zero-snapshot/SKILL.md` | T3 | 6-phase time-zero capture: confirm prerequisites → run validation suite → verify AI Layer files → fill template → sign go/no-go → commit |
| Instruction | `docs/.github/instructions/measurement-baseline.instructions.md` | T2, T3 | Always-on behavioral rules: timestamp format, prompt/rework boundary, elapsed-time calculation, confidence scale anchors, go/no-go signing, commit rules |

### Step 0 - Confirm upstream story dependency

Read `docs/agile/stories/story-E0S2-minimum-ai-layer.md` and confirm status progression is compatible with starting E0-S3 (minimum AI Layer baseline already prepared).

Stop condition: dependency status understood and no critical blocker flagged.

### Step 1 - Verify existence of the 4 required artifacts

Run:

```bash
REPO_ROOT="$(git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
	"$REPO_ROOT/docs" \
	".github/functions/elapsed-time.js" \
	".github/skills/generate-measurement-template/SKILL.md" \
	".github/skills/record-time-zero-snapshot/SKILL.md" \
	".github/instructions/measurement-baseline.instructions.md"
```

Stop condition: all 4 lines show `✅`.

### Step 2 - Verify catalog registrations for E0-S3

Run:

```bash
grep -n "generate-measurement-template\|record-time-zero-snapshot\|E0-S3" \
	"$REPO_ROOT/docs/ai-development-environment-catalog.md"
```

Stop condition: output contains entries for both skills and the E0-S3 coverage row.

### Step 3 - Verify shared function registration

Run:

```bash
grep -n "elapsed-time.js" "$REPO_ROOT/docs/.github/copilot-instructions.md"
```

Stop condition: output contains a Shared Functions table row for `elapsed-time.js`.

### Step 4 - Apply missing registrations only if needed

If any verification from Steps 1-3 fails, update only the missing entries in:
- `docs/ai-development-environment-catalog.md`
- `docs/.github/copilot-instructions.md`

Then re-run Steps 1-3 until all checks pass.

### Step 5 - Record validation evidence in this task

Populate section 5 with:
- Commands executed
- Exit codes
- Output summary
- Affected files
- Risk assessment (if any)

Stop condition: section 5 is complete and auditable.

---

## 4) Architecture and security requirements

- Keep scope limited to AI Layer documentation/governance artifacts; do not edit implementation code.
- Validate file existence and catalog references using shared functions/scripts before declaring success.
- Never hardcode secrets, tokens, or credential values in any output.
- Do not modify unrelated rows in catalog or copilot-instructions tables.
- If a required entry is missing, apply the smallest possible patch and re-run verification commands.

---

## 5) Validation evidence

### Commands and expected pass signals

1. Artifact existence check

```bash
REPO_ROOT="$(git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
	"$REPO_ROOT/docs" \
	".github/functions/elapsed-time.js" \
	".github/skills/generate-measurement-template/SKILL.md" \
	".github/skills/record-time-zero-snapshot/SKILL.md" \
	".github/instructions/measurement-baseline.instructions.md"
```

Expected: exit code `0`, summary `4 / 4 present`.

2. Catalog registration check

```bash
grep -n "generate-measurement-template\|record-time-zero-snapshot\|E0-S3" \
	"$REPO_ROOT/docs/ai-development-environment-catalog.md"
```

Expected: lines for both skills and E0-S3 row.

3. Shared function row check

```bash
grep -n "elapsed-time.js" "$REPO_ROOT/docs/.github/copilot-instructions.md"
```

Expected: at least one line in Shared Functions table.

### Output summary template

- Command 1 result: PASS/FAIL
- Command 2 result: PASS/FAIL
- Command 3 result: PASS/FAIL
- Files updated (if any):
- Residual risks:

### Given / When / Then checks

- **Given** E0-S2 is available as upstream dependency and the 4 baseline AI artifacts are required for E0-S3 execution,
- **When** I run the three verification commands and all return the expected signals,
- **Then** E0-S3-T0 is complete and E0-S3-T1/T2/T3 can proceed without missing AI Layer prerequisites.

---

## 6) Definition of Done

- [ ] Step 1 command confirms all 4 required artifacts exist (`4 / 4 present`).
- [ ] Step 2 command confirms both E0-S3 skills and the E0-S3 coverage row in catalog.
- [ ] Step 3 command confirms `elapsed-time.js` row in shared functions table.
- [ ] Section 5 contains executable command evidence and pass/fail outcomes.
- [ ] Any missing registration found during the task has been patched and re-verified.
- [ ] If patches were applied: patched files are committed and pushed to the fork.
- [ ] E0-S3-T1, E0-S3-T2, and E0-S3-T3 are explicitly unblocked.
