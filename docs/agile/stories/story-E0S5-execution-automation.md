# Story E0-S5 — Execution Automation for Epic 1

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S5 |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `prompt-engineer`, `agile-exercise-planner` |
| **Skills** | `create-specialist-agent`, `create-story-task-pack`, `audit-agile-artifacts` |
| **Instructions** | `agile-planning.instructions.md`, `coding-agent.instructions.md` |
| **Depends on** | [E0-S1-T2 — Validate local execution environment](../tasks/task-E0S1T2-validate-environment.md) |
| **Blocks** | EPIC-1 planning automation |
| Created at | 2026-04-12 21:52:11 -03 |
| Last updated | 2026-04-13 20:59:09 -03 |
| **Reorder note** | Moved ahead of E0-S1-T3. Original dependency on E0-S2 was administrative, not technical — all S5 artifacts target `docs/.github/` and require no fork AI Layer or codebase audit. Reorder saves ~100+ min of manual Issue/PR overhead across ~16 remaining tasks. |

---

## 1) User story

**As a** candidate executing the workshop interview exercises,
**I want to** have automation artifacts that generate story MDs from epic outlines, create GitHub Issues from task files, execute tasks via agent sessions, and review agile documents with inline suggestions,
**so that** Epic 1 can be planned and executed in a fully automated, Issue-driven workflow with minimal manual intervention and consistent quality gates.

---

## 2) Scope

### In scope

1. Create `story-task-reviewer` agent that:
   - Reviews story and task markdown files for structure, metadata, and acceptance criteria completeness.
   - Creates inline suggestions as PR review comments (not just a report).
   - Runs validation scripts (`validate-task-pack.js`, `sync-backlog-index.js --dry-run`) as quality gates.
   - Produces a review verdict (approve, request-changes) with evidence.

2. Create `scaffold-stories-from-epic` skill that:
   - Parses an epic file's section 7 (Candidate stories) to extract story outlines.
   - Generates detailed story MD files with all required sections (metadata, user story, scope, ACs, tasks placeholder).
   - Writes files to `docs/agile/stories/` with proper naming convention (`story-E<n>S<m>-<slug>.md`).
   - Updates the epic file to link to the generated story files.

3. Create `create-github-issue-from-task` function (`docs/.github/functions/create-github-issue-from-task.js`) that:
   - Reads a task MD file and extracts title, statement, expected outcome, and execution plan.
   - Creates a GitHub Issue in the target repository via `gh issue create`.
   - Returns the Issue number and URL.
   - Supports dry-run mode for validation.

4. Create `execute-task-from-issue` skill that:
   - Reads the task file path from the Issue body.
   - Invokes the responsible agent to execute the task.
   - Commits changes to a feature branch.
   - Creates a PR with task reference in the title.
   - Documents manual validation checkpoint for story-final tasks.

5. Validate the automation by:
   - Generating at least one story MD from Epic 1 section 7 as a dry-run.
   - Creating one test Issue from a generated task (can be closed immediately after validation).

### Out of scope

1. Actual execution of Epic 1 tasks (this story only creates the automation tools).
2. Full Epic 1 planning (story/task generation for all E1-S* stories).
3. MCP server integration for GitHub tools (use `gh` CLI directly).

---

## 3) Acceptance criteria

### AC-1 — `story-task-reviewer` agent created

- **Given** I need to review agile documents created by another agent
- **When** I invoke `story-task-reviewer`
- **Then** it:
  - Validates story/task structure against governance rules.
  - Runs `validate-task-pack.js` and `sync-backlog-index.js --dry-run` as quality gates.
  - Produces inline suggestions as PR review comments (not just a text report).
  - Returns a review verdict: `approve` or `request-changes` with evidence paths.

### AC-2 — `scaffold-stories-from-epic` skill created

- **Given** an epic file with section 7 containing story outlines (titles + descriptions)
- **When** I invoke the skill with the epic file path
- **Then** it:
  - Generates one story MD file per outline in `docs/agile/stories/`.
  - Each story file includes: metadata table (ID, Priority, Status, agents, skills, instructions), user story, scope, ACs (placeholder or derived), tasks placeholder.
  - Updates the epic file to convert plain-text story headings into markdown links to the generated files.
  - Logs generated files to stdout.

### AC-3 — `create-github-issue-from-task` function created

- **Given** a task MD file path and a target repository (`owner/repo`)
- **When** I run `node create-github-issue-from-task.js <task-path> <repo> [--dry-run]`
- **Then** it:
  - Extracts: task ID, title, statement, expected outcome, and execution plan summary.
  - Creates a GitHub Issue with title `[<task-id>] <title>` and body containing the extracted content.
  - Adds labels: `epic:<id>`, `story:<id>`, `priority:<P0-P3>`.
  - Returns JSON with `{ issueNumber, issueUrl, dryRun }`.
  - In dry-run mode, prints the Issue content without creating it.

### AC-4 — `execute-task-from-issue` skill created

- **Given** a GitHub Issue created from a task file
- **When** I invoke the skill from the Issue
- **Then** it:
  - Reads the task file path from the Issue body.
  - Invokes the task's `Responsible agent` to execute the task.
  - Creates a feature branch: `task/<task-id>`.
  - Commits changes with message: `<type>(<scope>): <description>` following Conventional Commits.
  - Opens a PR with title: `[<task-id>] <task-title>`.
  - For story-final tasks (last task in a story), adds a comment requesting manual validation.

### AC-5 — Dry-run validation completed

- **Given** all 4 automation artifacts are created
- **When** I run a dry-run validation
- **Then**:
  - `scaffold-stories-from-epic` generates at least one story MD from Epic 1 section 7.
  - The generated story has all required sections and valid metadata.
  - `create-github-issue-from-task` produces valid Issue content in dry-run mode for one generated task.
  - Evidence of dry-run execution is documented.

---

## 4) Tasks

### ✅ [Task E0-S5-T1 — Create `story-task-reviewer` agent](../tasks/task-E0S5T1-create-story-task-reviewer-agent.md)

**Goal:** create an agent specialized in reviewing agile documents (stories and tasks) and producing inline suggestions via PR review comments.

**Agent:** `prompt-engineer` | **Skill:** `create-specialist-agent`

**Artifacts to create:**
- `docs/.github/agents/story-task-reviewer.agent.md`

**Sub-tasks:**

1. Read `docs/.github/agents/agile-quality-auditor.agent.md` as the reference for review methodology.
2. Read `docs/.github/skills/audit-agile-artifacts/SKILL.md` to understand the validation gates.
3. Create `story-task-reviewer.agent.md` with:
   - **Purpose:** independent review of agile documents with inline suggestions.
   - **Core responsibilities:**
     - Validate story/task structure against `backlog-governance.instructions.md`.
     - Check metadata completeness (ID, Priority, Status, Responsible agent, Depends on, Blocks).
     - Verify acceptance criteria format (Given/When/Then).
     - Run `validate-task-pack.js` and `sync-backlog-index.js --dry-run`.
     - Create inline suggestions as PR review comments.
   - **Output format:** PR review with inline suggestions + verdict (approve/request-changes).
   - **Anti-patterns:**
     - Never approve without running script-based validation.
     - Never create suggestions without evidence paths.
     - Never review artifacts you just authored in the same session.
4. Commit the agent file.

**Acceptance:** agent file exists with review methodology, validation gates, inline suggestion format, and anti-patterns.

**depends_on:** E0-S1-T2 completed

---

### ✅ [Task E0-S5-T2 — Create `scaffold-stories-from-epic` skill](../tasks/task-E0S5T2-create-scaffold-stories-from-epic-skill.md)

**Goal:** create a skill that parses an epic's section 7 and generates detailed story MD files.

**Agent:** `agile-exercise-planner` | **Skill:** `create-exercise-backlog`

**Artifacts to create:**
- `docs/.github/skills/scaffold-stories-from-epic/SKILL.md`

**Sub-tasks:**

1. Read `docs/.github/skills/create-exercise-backlog/SKILL.md` for backlog structure patterns.
2. Read `docs/.github/skills/create-story-task-pack/SKILL.md` for file naming conventions.
3. Read `docs/agile/stories/story-E0S1-repository-diagnosis.md` as the template for generated stories.
4. Create `scaffold-stories-from-epic/SKILL.md` with:
   - **Purpose:** generate story MD files from epic section 7 outlines.
   - **Inputs:** `EPIC_FILE` (absolute path to epic markdown).
   - **Process:**
     1. Read the epic file.
     2. Parse section 7 to extract story outlines (heading + description + key outputs).
     3. For each story outline:
        - Generate story ID: `E<epic>-S<n>` (sequential).
        - Generate file name: `story-E<epic>S<n>-<slug>.md` (slug from title).
        - Fill template sections: metadata, user story, scope (derived from description), ACs (placeholder or derived), tasks placeholder.
        - Write to `docs/agile/stories/`.
     4. Update the epic file: convert plain-text story headings to markdown links.
     5. Log all generated files.
   - **Outputs:** story MD files, updated epic file.
   - **Template:** include the full story template as a code block.
   - **Constraints:**
     - Never generate a story without at least: ID, Priority, Status, Responsible agent (placeholder OK).
     - Always set `Status: Draft` for new stories.
     - Always include a `## 4) Tasks` section header (even if empty).
5. Commit the skill file.

**Acceptance:** skill file exists with process, template, and constraints; template matches existing story structure.

**depends_on:** T1 completed

---

### ✅ [Task E0-S5-T3 — Create `create-github-issue-from-task` function](../tasks/task-E0S5T3-create-create-github-issue-from-task-function.md)

**Goal:** create a Node.js function that creates a GitHub Issue from a task MD file.

**Agent:** `agile-exercise-planner` | **Skill:** n/a (coding task)

**Artifacts to create:**
- `docs/.github/functions/create-github-issue-from-task.js`

**Sub-tasks:**

1. Read `docs/.github/functions/timeline-id.js` as a reference for function file structure.
2. Read `docs/agile/tasks/task-E0S1T0-bootstrap-ai-layer.md` to understand task file structure.
3. Create `create-github-issue-from-task.js`:

```javascript
#!/usr/bin/env node
/**
 * create-github-issue-from-task.js
 * 
 * Creates a GitHub Issue from a task markdown file.
 * 
 * Usage:
 *   node create-github-issue-from-task.js <task-file> <owner/repo> [--dry-run]
 * 
 * Example:
 *   node create-github-issue-from-task.js docs/agile/tasks/task-E1S1T1-foo.md owner/repo
 *   node create-github-issue-from-task.js docs/agile/tasks/task-E1S1T1-foo.md owner/repo --dry-run
 * 
 * Returns JSON:
 *   { "issueNumber": 42, "issueUrl": "https://github.com/...", "dryRun": false }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseTaskFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract ID from metadata table
  const idMatch = content.match(/\|\s*\*\*ID\*\*\s*\|\s*([^\|]+)\s*\|/);
  const id = idMatch ? idMatch[1].trim() : null;
  
  // Extract title from H1
  const titleMatch = content.match(/^#\s*Task\s+[^\—]+\—\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : null;
  
  // Extract priority
  const priorityMatch = content.match(/\|\s*\*\*Priority\*\*\s*\|\s*(P[0-3])\s*\|/);
  const priority = priorityMatch ? priorityMatch[1].trim() : 'P2';
  
  // Extract story ID
  const storyMatch = content.match(/\|\s*\*\*Story\*\*\s*\|\s*\[([^\]]+)\]/);
  const storyId = storyMatch ? storyMatch[1].match(/E\d+-S\d+/)?.[0] : null;
  
  // Extract epic ID
  const epicId = storyId ? storyId.split('-')[0] : null;
  
  // Extract task statement (section 1)
  const statementMatch = content.match(/## 1\)\s*Task statement\s*\n+([\s\S]*?)(?=\n## 2\)|\n---)/);
  const statement = statementMatch ? statementMatch[1].trim() : '';
  
  // Extract expected outcome (section 2)
  const outcomeMatch = content.match(/## 2\)\s*Verifiable expected outcome\s*\n+([\s\S]*?)(?=\n## 3\)|\n---)/);
  const outcome = outcomeMatch ? outcomeMatch[1].trim() : '';
  
  // Extract execution plan summary (section 3, first 500 chars)
  const planMatch = content.match(/## 3\)\s*Detailed execution plan\s*\n+([\s\S]*?)(?=\n## 4\)|\n---|\n## [0-9]|\Z)/);
  const plan = planMatch ? planMatch[1].trim().substring(0, 500) + (planMatch[1].length > 500 ? '...' : '') : '';
  
  return { id, title, priority, storyId, epicId, statement, outcome, plan, filePath };
}

function buildIssueBody(task) {
  return `## Task File
\`${task.filePath}\`

## Task Statement
${task.statement}

## Expected Outcome
${task.outcome}

## Execution Plan (Summary)
${task.plan}

---
*This issue was generated from \`${path.basename(task.filePath)}\`.*
`;
}

function createIssue(task, repo, dryRun) {
  const issueTitle = `[${task.id}] ${task.title}`;
  const issueBody = buildIssueBody(task);
  
  const labels = [];
  if (task.epicId) labels.push(`epic:${task.epicId}`);
  if (task.storyId) labels.push(`story:${task.storyId}`);
  labels.push(`priority:${task.priority}`);
  
  if (dryRun) {
    console.log('=== DRY RUN ===');
    console.log('Title:', issueTitle);
    console.log('Labels:', labels.join(', '));
    console.log('Body:');
    console.log(issueBody);
    return JSON.stringify({ issueNumber: null, issueUrl: null, dryRun: true }, null, 2);
  }
  
  // Create labels if they don't exist (ignore errors)
  for (const label of labels) {
    try {
      execSync(`gh label create "${label}" --repo ${repo} 2>/dev/null || true`, { stdio: 'pipe' });
    } catch (e) { /* ignore */ }
  }
  
  // Create issue
  const labelArgs = labels.map(l => `--label "${l}"`).join(' ');
  const bodyFile = `/tmp/issue-body-${Date.now()}.md`;
  fs.writeFileSync(bodyFile, issueBody);
  
  const cmd = `gh issue create --repo ${repo} --title "${issueTitle}" --body-file "${bodyFile}" ${labelArgs}`;
  const result = execSync(cmd, { encoding: 'utf-8' }).trim();
  
  fs.unlinkSync(bodyFile);
  
  // Parse URL to get issue number
  const issueNumber = parseInt(result.split('/').pop(), 10);
  
  return JSON.stringify({ issueNumber, issueUrl: result, dryRun: false }, null, 2);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filteredArgs = args.filter(a => a !== '--dry-run');
  
  if (filteredArgs.length < 2) {
    console.error('Usage: node create-github-issue-from-task.js <task-file> <owner/repo> [--dry-run]');
    process.exit(1);
  }
  
  const [taskFile, repo] = filteredArgs;
  
  if (!fs.existsSync(taskFile)) {
    console.error(`Task file not found: ${taskFile}`);
    process.exit(1);
  }
  
  const task = parseTaskFile(taskFile);
  
  if (!task.id || !task.title) {
    console.error('Could not parse task ID or title from file');
    process.exit(1);
  }
  
  console.log(createIssue(task, repo, dryRun));
}

module.exports = { parseTaskFile, buildIssueBody, createIssue };
```

4. Make the file executable: `chmod +x create-github-issue-from-task.js`.
5. Test with dry-run on an existing task file.
6. Commit the function file.

**Acceptance:** function file exists, parsable by Node.js, dry-run mode works, creates Issue with correct structure.

**depends_on:** T2 completed

---

### ✅ [Task E0-S5-T4 — Create `execute-task-from-issue` skill](../tasks/task-E0S5T4-create-execute-task-from-issue-skill.md)

**Goal:** create a skill that orchestrates the full Issue → agent execution → PR → merge workflow.

**Agent:** `agile-exercise-planner`

**Artifacts to create:**
- `docs/.github/skills/execute-task-from-issue/SKILL.md`

**Sub-tasks:**

1. Read `docs/.github/copilot-instructions.md` section "Task Execution Model" for the one-Issue-per-task workflow.
2. Create `execute-task-from-issue/SKILL.md`:

```markdown
---
name: execute-task-from-issue
description: Orchestrates the full workflow from GitHub Issue to merged PR for a single task.
---

# Skill: execute-task-from-issue

## Purpose

Execute a single task from its corresponding GitHub Issue, producing a merged PR with all artifacts committed.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| Issue number | GitHub Issue | The Issue created from a task file |
| Repository | GitHub | `owner/repo` where the Issue was created |
| Task file path | From Issue body | Extracted from the "Task File" section |

---

## Process

### Phase 1 — Read task context

1. Read the Issue body to extract the task file path.
2. Read the task file to extract:
   - Task ID (for branch naming)
   - Responsible agent(s)
   - Input files (from Depends on + execution plan)
   - Expected outcome (for validation)
3. Read all input files mentioned in the task.

### Phase 2 — Prepare branch

1. Ensure working directory is clean (`git status`).
2. Checkout the base branch (`exercise-1`).
3. Pull latest changes.
4. Create feature branch: `task/<task-id>` (e.g., `task/E1-S1-T1`).

### Phase 3 — Execute task

1. Invoke the task's `Responsible agent` with the task statement and execution plan.
2. Follow the execution plan step by step.
3. After each step, run validation commands if applicable.
4. Stop on first validation failure — do not accumulate broken state.

### Phase 4 — Commit and push

1. Stage all relevant changes.
2. Commit with Conventional Commits format:
   ```
   <type>(<scope>): <description>
   
   Closes #<issue-number>
   ```
3. Push the feature branch to origin.

### Phase 5 — Create PR

1. Create a PR with:
   - Title: `[<task-id>] <task-title>`
   - Body: Reference to the Issue (`Closes #<issue-number>`)
   - Base: `exercise-1`
   - Head: `task/<task-id>`
2. If this is the last task in a story, add a comment requesting manual validation.

### Phase 6 — Manual checkpoint (for story-final tasks)

For tasks that are the last in a story (e.g., E1-S1-T5 if the story has 5 tasks):

1. Add a PR comment: "⏸️ Manual validation checkpoint — please review before merge."
2. Wait for human approval (do not auto-merge).

---

## Outputs

| Output | Location |
|---|---|
| Feature branch | `origin/task/<task-id>` |
| PR | GitHub PR linked to Issue |
| Committed artifacts | All files created/modified by the task |

---

## Error handling

| Error | Recovery |
|---|---|
| Validation failure | Stop execution, update Issue with failure details, do not create PR |
| Git conflict | Stop execution, update Issue requesting manual resolution |
| Agent failure | Log error to Issue, allow retry from same point |

---

## Constraints

- Never merge without at least one successful CI check (if CI is configured).
- Never skip Phase 6 checkpoint for story-final tasks.
- Never commit partial work — each PR must represent a complete task.
```

3. Commit the skill file.

**Acceptance:** skill file exists with all 6 phases, error handling, and constraints documented.

**depends_on:** T3 completed

---

### ✅ [Task E0-S5-T5 — Validate automation with dry-run](../tasks/task-E0S5T5-validate-automation-with-dry-run.md)

**Goal:** test the automation artifacts by generating one story from Epic 1 and one Issue from a task.

**Agent:** `agile-exercise-planner`

**Sub-tasks:**

1. Read [Epic 1 section 7](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md#7-candidate-stories-for-the-epic).
2. Invoke `scaffold-stories-from-epic` skill on Epic 1 to generate **ONE** story MD as a test (e.g., E1-S1).
3. Validate the generated story has all required sections using `validate-task-pack.js` (it can validate stories too).
4. Invoke `create-story-task-pack` skill on the generated story to produce task files.
5. Run `create-github-issue-from-task.js` in dry-run mode on one generated task.
6. Document the dry-run evidence:
   - Generated story file path and key metadata.
   - Generated task file paths.
   - Dry-run Issue content.
7. Commit all generated files as a dry-run package (can be deleted or kept as planning baseline).

**Acceptance:**
- At least one story MD generated from Epic 1.
- At least one task MD generated from the story.
- Dry-run Issue output valid and correctly formatted.
- Evidence documented in the story or preparation friction log.

**depends_on:** T4 completed

---

### ✅ [Task E0-S5-T6 — Commit and sign readiness](../tasks/task-E0S5T6-commit-and-sign-readiness.md)

**Goal:** commit all E0-S5 artifacts and sign the automation readiness checklist.

**Agent:** `git-ops`

**Sub-tasks:**

1. Verify all 4 automation artifacts exist:
   - [ ] `docs/.github/agents/story-task-reviewer.agent.md`
   - [ ] `docs/.github/skills/scaffold-stories-from-epic/SKILL.md`
   - [ ] `docs/.github/functions/create-github-issue-from-task.js`
   - [ ] `docs/.github/skills/execute-task-from-issue/SKILL.md`
2. Verify dry-run evidence exists (from T5).
3. Commit any uncommitted files with message: `feat(automation): add Epic 1 execution automation artifacts`.
4. Push to fork (`git push origin exercise-1`).
5. Sign the automation readiness checklist:
   ```
   ## E0-S5 Automation Readiness Checklist
   
   | # | Item | Status | Evidence |
   |---|---|---|---|
   | 1 | `story-task-reviewer` agent created | [ ] | `.github/agents/story-task-reviewer.agent.md` |
   | 2 | `scaffold-stories-from-epic` skill created | [ ] | `.github/skills/scaffold-stories-from-epic/SKILL.md` |
   | 3 | `create-github-issue-from-task` function created | [ ] | `.github/functions/create-github-issue-from-task.js` |
   | 4 | `execute-task-from-issue` skill created | [ ] | `.github/skills/execute-task-from-issue/SKILL.md` |
   | 5 | Dry-run evidence documented | [ ] | `<evidence-path>` |
   | 6 | All artifacts committed | [ ] | Commit SHA: `<sha>` |
   
   **Signed by:** `agile-exercise-planner`
   **Date:** `<timestamp>`
   ```
6. Append timeline entry for story completion.

**Acceptance:** all artifacts committed, checklist signed (all items checked), timeline entry recorded.

**depends_on:** T5 completed

---

## 5) Technical notes

### Integration with existing automation

- The `create-story-task-pack` skill already exists and handles task generation from stories.
- The `scaffold-stories-from-epic` skill fills the gap of story generation from epics.
- Together they form the complete Epic → Stories → Tasks pipeline.

### GitHub CLI requirements

- `gh` CLI must be installed and authenticated.
- Required permissions: `repo` scope for Issue creation and label management.
- Test with `gh auth status` before running the function.

### Manual validation checkpoints

The workflow includes explicit manual checkpoints at the end of each story to allow human review before proceeding. This ensures quality gates are preserved even in automated flows.

---

## 6) References

- [docs/.github/copilot-instructions.md — Task Execution Model](../../.github/copilot-instructions.md#task-execution-model)
- [docs/.github/skills/create-story-task-pack/SKILL.md](../../.github/skills/create-story-task-pack/SKILL.md)
- [docs/.github/skills/audit-agile-artifacts/SKILL.md](../../.github/skills/audit-agile-artifacts/SKILL.md)
- [docs/.github/agents/agile-quality-auditor.agent.md](../../.github/agents/agile-quality-auditor.agent.md)
