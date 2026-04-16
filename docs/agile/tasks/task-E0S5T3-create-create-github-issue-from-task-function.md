# Task E0-S5-T3 — Create `create-github-issue-from-task` function

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S5-T3 |
| **Story** | [E0-S5 — Execution Automation for Epic 1](../stories/story-E0S5-execution-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | E0-S5-T2 |
| **Blocks** | — |
| Created at | 2026-04-13 13:23:32 -03 |
| Last updated | 2026-04-13 20:59:09 -03 |

---

## 1) Task statement

Create `docs/.github/functions/create-github-issue-from-task.js` — a Node.js CLI function that reads a task MD file, extracts its ID, title, statement, outcome, and execution plan, then creates (or dry-runs) a GitHub Issue via `gh issue create` with labels `epic:<id>`, `story:<id>`, `priority:<Pn>`.

---

## 2) Verifiable expected outcome

1. File `docs/.github/functions/create-github-issue-from-task.js` exists and is parseable by Node.js (`node --check` exits 0).
2. `node create-github-issue-from-task.js <task-file> <repo> --dry-run` exits with code `0`.
3. Dry-run output contains: Issue title in format `[<task-id>] <title>`, labels list, and body with `## Task Statement`, `## Expected Outcome`, `## Execution Plan (Summary)` sections.
4. `module.exports` exposes `{ parseTaskFile, buildIssueBody, createIssue }` for programmatic use.
5. Uses `gh issue create` via `execSync` (not direct HTTPS calls) to create the Issue.
6. Function file includes JSDoc header and CLI `if (require.main === module)` entry point.

---

## 3) Detailed execution plan

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

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed:
- Exit code(s):
- Output summary:
- Files created/updated:
- Risks found / mitigations:

### Given / When / Then checks

- **Given** a task MD file (e.g., `task-E0S5T1-create-story-task-reviewer-agent.md`) is available,
- **When** I run `node create-github-issue-from-task.js <task-file> dynamous-business/Docs --dry-run`,
- **Then** it exits 0 and prints a valid Issue title `[E0-S5-T1] Create story-task-reviewer agent`, correct labels, and a body with the three content sections.

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
