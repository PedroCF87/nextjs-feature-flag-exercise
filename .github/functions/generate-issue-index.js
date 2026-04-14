#!/usr/bin/env node
/**
 * generate-issue-index.js
 *
 * Generates (or regenerates) `.github/issue-index.json` by reading all task
 * markdown files in the agile tasks directory and cross-referencing open/closed
 * GitHub Issues to resolve their numbers.
 *
 * CLI usage:
 *   node generate-issue-index.js <agile-dir> <owner/repo> [--dry-run]
 *
 * Examples:
 *   node "docs/.github/functions/generate-issue-index.js" \
 *     docs/agile PedroCF87/nextjs-feature-flag-exercise
 *
 *   node "docs/.github/functions/generate-issue-index.js" \
 *     docs/agile PedroCF87/nextjs-feature-flag-exercise --dry-run
 *
 * Programmatic usage (CommonJS):
 *   const { generateIssueIndex } = require('./generate-issue-index.js');
 *
 * Returns JSON written to `.github/issue-index.json` (or stdout on --dry-run):
 *   {
 *     "tasks": [
 *       { "epic": 0, "story": 6, "task": 6, "issue": 42, "title": "...",
 *         "status": "open", "agent": "task-implementer" }
 *     ]
 *   }
 *
 * Security note:
 *   All gh CLI calls use spawnSync with discrete argv — no shell interpolation
 *   of user-supplied content.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a task markdown file and extract index-relevant fields.
 *
 * @param {string} filePath  Path to the task MD file.
 * @returns {{ taskId: string|null, epic: number|null, story: number|null,
 *             task: number|null, title: string|null, agent: string }} | null
 */
function parseTaskFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }

  // Task ID — from metadata row "| **ID** | E0-S6-T6 |"
  const idMatch = content.match(/\|\s*\*\*ID\*\*\s*\|\s*([^\|]+)\s*\|/);
  const taskId = idMatch ? idMatch[1].trim() : null;
  if (!taskId) return null;

  // Extract numeric epic/story/task from ID like "E0-S6-T6"
  const numMatch = taskId.match(/E(\d+)-S(\d+)-T(\d+)/i);
  if (!numMatch) return null;
  const epic = parseInt(numMatch[1], 10);
  const story = parseInt(numMatch[2], 10);
  const task = parseInt(numMatch[3], 10);

  // Title from H1 "# Task E0-S6-T6 — Some Title"
  const titleMatch = content.match(/^#\s*Task\s+[^\u2014]+\u2014\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : null;
  if (!title) return null;

  // Agent from metadata row "| **Responsible agent** | `copilot-env-specialist` |"
  const agentMatch = content.match(/\|\s*\*\*Responsible agent\*\*\s*\|\s*`?([^`|\s]+)`?\s*\|/);
  const agent = agentMatch ? agentMatch[1].trim() : 'task-implementer';

  return { taskId, epic, story, task, title, agent };
}

/**
 * Fetch all GitHub Issues (open + closed) for a repo and return an array of
 * { number, title, state } objects.
 *
 * @param {string} repo  "owner/repo"
 * @returns {Array<{ number: number, title: string, state: string }>}
 */
function fetchGitHubIssues(repo) {
  const result = spawnSync('gh', [
    'issue', 'list',
    '--repo', repo,
    '--state', 'all',
    '--limit', '500',
    '--json', 'number,title,state',
  ], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });

  if (result.status !== 0) {
    const errMsg = (result.stderr || '').trim();
    console.error(`Warning: could not fetch issues from GitHub (${errMsg}). Issue numbers will be null.`);
    return [];
  }

  try {
    return JSON.parse(result.stdout || '[]');
  } catch {
    console.error('Warning: could not parse gh issue list output. Issue numbers will be null.');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

/**
 * Generate the issue index from task files in agileDir, cross-referencing
 * GitHub Issues for the given repo.
 *
 * @param {string}  agileDir  Path to the agile directory (contains tasks/).
 * @param {string}  repo      "owner/repo"
 * @param {boolean} dryRun    When true, return JSON string without writing.
 * @returns {string}  JSON string of { tasks: [...] }
 */
function generateIssueIndex(agileDir, repo, dryRun) {
  const tasksDir = path.join(agileDir, 'tasks');

  if (!fs.existsSync(tasksDir)) {
    throw new Error(`Tasks directory not found: ${tasksDir}`);
  }

  // Read and parse all task files
  const files = fs.readdirSync(tasksDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(tasksDir, f));

  const parsed = files
    .map(parseTaskFile)
    .filter(Boolean);

  // Sort by epic → story → task
  parsed.sort((a, b) =>
    a.epic !== b.epic ? a.epic - b.epic :
    a.story !== b.story ? a.story - b.story :
    a.task - b.task
  );

  // Fetch existing issues for cross-reference
  let ghIssues = [];
  if (!dryRun) {
    ghIssues = fetchGitHubIssues(repo);
  }

  // Build index entries
  const tasks = parsed.map((t) => {
    // Match by title format: "[E0-S6-T6] <title>"
    const expectedIssueTitle = `[${t.taskId}] ${t.title}`;
    const matched = ghIssues.find(
      (i) => i.title === expectedIssueTitle || i.title.startsWith(`[${t.taskId}]`)
    );

    const issueNumber = matched ? matched.number : null;
    const status = matched
      ? (matched.state === 'closed' ? 'done' : 'open')
      : 'open';

    return {
      epic: t.epic,
      story: t.story,
      task: t.task,
      issue: issueNumber,
      title: t.title,
      status,
      agent: t.agent,
    };
  });

  const output = JSON.stringify({ tasks }, null, 2);

  if (dryRun) {
    console.log('=== DRY RUN — would write to .github/issue-index.json ===');
    console.log(output);
    return output;
  }

  // Write to .github/issue-index.json relative to repo root (two levels up from agileDir)
  const repoRoot = path.resolve(agileDir, '..', '..');
  const indexPath = path.join(repoRoot, '.github', 'issue-index.json');
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, output + '\n', 'utf-8');
  console.log(`✅  Written ${tasks.length} entries to ${indexPath}`);

  return output;
}

// ---------------------------------------------------------------------------
// Append helper (used by create-github-issue-from-task.js)
// ---------------------------------------------------------------------------

/**
 * Append (or update) a single entry in `.github/issue-index.json`.
 * Creates the file if it doesn't exist. Maintains sort order (epic → story → task).
 *
 * @param {string} indexPath  Absolute path to issue-index.json.
 * @param {{ epic: number, story: number, task: number, issue: number,
 *            title: string, status: string, agent: string }} entry
 */
function appendToIssueIndex(indexPath, entry) {
  let index = { tasks: [] };

  if (fs.existsSync(indexPath)) {
    try {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      if (!Array.isArray(index.tasks)) index.tasks = [];
    } catch {
      index = { tasks: [] };
    }
  }

  // Remove existing entry for same epic/story/task (idempotent)
  index.tasks = index.tasks.filter(
    (t) => !(t.epic === entry.epic && t.story === entry.story && t.task === entry.task)
  );

  index.tasks.push(entry);

  // Sort by epic → story → task
  index.tasks.sort((a, b) =>
    a.epic !== b.epic ? a.epic - b.epic :
    a.story !== b.story ? a.story - b.story :
    a.task - b.task
  );

  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf-8');
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
      'Usage: node generate-issue-index.js <agile-dir> <owner/repo> [--dry-run]'
    );
    process.exit(1);
  }

  const [agileDir, repo] = filteredArgs;

  // Validate repo format (owner/repo — no shell metacharacters)
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
    console.error(`Invalid repo format: "${repo}". Expected "owner/repo".`);
    process.exit(1);
  }

  if (!fs.existsSync(agileDir)) {
    console.error(`Agile directory not found: ${agileDir}`);
    process.exit(1);
  }

  try {
    generateIssueIndex(agileDir, repo, dryRun);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { generateIssueIndex, appendToIssueIndex, parseTaskFile };
