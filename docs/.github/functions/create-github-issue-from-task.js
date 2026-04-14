#!/usr/bin/env node
/**
 * create-github-issue-from-task.js
 *
 * Creates a GitHub Issue from a task markdown file.
 *
 * CLI usage:
 *   node create-github-issue-from-task.js <task-file> <owner/repo> [--dry-run]
 *
 * Examples:
 *   node "docs/.github/functions/create-github-issue-from-task.js" \
 *     docs/agile/tasks/task-E1S1T1-foo.md dynamous-business/nextjs-feature-flag-exercise
 *
 *   node "docs/.github/functions/create-github-issue-from-task.js" \
 *     docs/agile/tasks/task-E1S1T1-foo.md dynamous-business/nextjs-feature-flag-exercise --dry-run
 *
 * Programmatic usage (CommonJS):
 *   const { parseTaskFile, buildIssueBody, createIssue } = require('./create-github-issue-from-task.js');
 *
 * Returns JSON:
 *   { "issueNumber": 42, "issueUrl": "https://github.com/...", "dryRun": false }
 *
 * Security note:
 *   Issue title and labels are passed as discrete argv elements to `gh` via spawnSync
 *   (not interpolated into a shell string) to prevent command injection from
 *   user-controlled task file content.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a task markdown file and extract issue-relevant fields.
 *
 * @param {string} filePath  Absolute or relative path to the task MD file.
 * @returns {{ id: string|null, title: string|null, priority: string,
 *             storyId: string|null, epicId: string|null,
 *             statement: string, outcome: string, plan: string,
 *             filePath: string }}
 */
function parseTaskFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Task ID from metadata table row "| **ID** | E0-S5-T3 |"
  const idMatch = content.match(/\|\s*\*\*ID\*\*\s*\|\s*([^\|]+)\s*\|/);
  const id = idMatch ? idMatch[1].trim() : null;

  // Title from H1 "# Task E0-S5-T3 — Some Title"
  const titleMatch = content.match(/^#\s*Task\s+[^\u2014]+\u2014\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Priority: P0–P3
  const priorityMatch = content.match(/\|\s*\*\*Priority\*\*\s*\|\s*(P[0-3])\s*\|/);
  const priority = priorityMatch ? priorityMatch[1].trim() : 'P2';

  // Story ID from metadata link text e.g. "[E0-S5 — Execution Automation…]"
  const storyLinkMatch = content.match(/\|\s*\*\*Story\*\*\s*\|\s*\[([^\]]+)\]/);
  const storyId = storyLinkMatch ? (storyLinkMatch[1].match(/E\d+-S\d+/) || [])[0] ?? null : null;

  // Epic ID derived from story ID (e.g. "E0-S5" → "E0")
  const epicId = storyId ? storyId.split('-')[0] : null;

  // Task statement — section 1
  const statementMatch = content.match(/## 1\)\s*Task statement\s*\n+([\s\S]*?)(?=\n## 2\)|\n---)/);
  const statement = statementMatch ? statementMatch[1].trim() : '';

  // Expected outcome — section 2
  const outcomeMatch = content.match(/## 2\)\s*Verifiable expected outcome\s*\n+([\s\S]*?)(?=\n## 3\)|\n---)/);
  const outcome = outcomeMatch ? outcomeMatch[1].trim() : '';

  // Execution plan summary — section 3 (first 500 chars)
  const planMatch = content.match(/## 3\)\s*Detailed execution plan\s*\n+([\s\S]*?)(?=\n## 4\)|\n---|\n## [0-9])/);
  const planFull = planMatch ? planMatch[1].trim() : '';
  const plan = planFull.length > 500 ? planFull.substring(0, 500) + '…' : planFull;

  return { id, title, priority, storyId, epicId, statement, outcome, plan, filePath };
}

// ---------------------------------------------------------------------------
// Body builder
// ---------------------------------------------------------------------------

/**
 * Compose the GitHub Issue markdown body from parsed task fields.
 *
 * @param {{ id: string|null, title: string|null, priority: string,
 *            storyId: string|null, epicId: string|null,
 *            statement: string, outcome: string, plan: string,
 *            filePath: string }} task
 * @returns {string}
 */
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

// ---------------------------------------------------------------------------
// Label helpers
// ---------------------------------------------------------------------------

/**
 * Attempt to create a gh label (idempotent — ignores errors if it already exists).
 *
 * @param {string} label  Label name, e.g. "epic:E0".
 * @param {string} repo   "owner/repo" string.
 */
function ensureLabel(label, repo) {
  // spawnSync avoids shell interpolation for user-supplied repo and label values
  spawnSync('gh', ['label', 'create', label, '--repo', repo], { stdio: 'pipe' });
  // Ignore exit code — the label may already exist
}

// ---------------------------------------------------------------------------
// Issue creation
// ---------------------------------------------------------------------------

/**
 * Create (or dry-run) a GitHub Issue from parsed task data.
 *
 * @param {{ id: string|null, title: string|null, priority: string,
 *            storyId: string|null, epicId: string|null,
 *            statement: string, outcome: string, plan: string,
 *            filePath: string }} task
 * @param {string}  repo    "owner/repo" string.
 * @param {boolean} dryRun  When true, print and return without creating.
 * @returns {string}  JSON string with { issueNumber, issueUrl, dryRun }.
 */
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

  // Ensure labels exist (errors silently ignored for existing labels)
  for (const label of labels) {
    ensureLabel(label, repo);
  }

  // Write body to a temp file so it never touches the shell command line
  const bodyFile = path.join(os.tmpdir(), `issue-body-${Date.now()}.md`);
  fs.writeFileSync(bodyFile, issueBody, 'utf-8');

  try {
    // Build argv array — no shell interpolation of user-controlled content
    const argv = [
      'issue', 'create',
      '--repo', repo,
      '--title', issueTitle,
      '--body-file', bodyFile,
    ];
    for (const label of labels) {
      argv.push('--label', label);
    }

    const result = spawnSync('gh', argv, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });

    if (result.status !== 0) {
      const errMsg = (result.stderr || '').trim();
      throw new Error(`gh issue create failed (exit ${result.status}): ${errMsg}`);
    }

    const issueUrl = result.stdout.trim();
    const issueNumber = parseInt(issueUrl.split('/').pop(), 10);

    return JSON.stringify({ issueNumber, issueUrl, dryRun: false }, null, 2);
  } finally {
    // Always clean up the temp file
    try { fs.unlinkSync(bodyFile); } catch { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filteredArgs = args.filter((a) => a !== '--dry-run');

  if (filteredArgs.length < 2) {
    console.error(
      'Usage: node create-github-issue-from-task.js <task-file> <owner/repo> [--dry-run]'
    );
    process.exit(1);
  }

  const [taskFile, repo] = filteredArgs;

  // Validate repo format (owner/repo — no shell metacharacters)
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
    console.error(`Invalid repo format: "${repo}". Expected "owner/repo".`);
    process.exit(1);
  }

  if (!fs.existsSync(taskFile)) {
    console.error(`Task file not found: ${taskFile}`);
    process.exit(1);
  }

  const task = parseTaskFile(taskFile);

  if (!task.id || !task.title) {
    console.error('Could not parse task ID or title from file. Check H1 and metadata table.');
    process.exit(1);
  }

  console.log(createIssue(task, repo, dryRun));
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { parseTaskFile, buildIssueBody, createIssue };
