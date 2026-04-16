/**
 * sync-backlog-index.js
 *
 * Scans Docs/agile/stories/*.md and Docs/agile/tasks/*.md, extracts metadata
 * fields from each file's front-matter table, and writes/updates
 * Docs/agile/backlog-index.json.
 *
 * Reads the following pipe-table rows (case-insensitive key matching):
 *   | **ID**               | <value> |
 *   | **Priority**         | <value> |
 *   | **Status**           | <value> |
 *   | **Responsible agent**| <value> |
 *   | **Depends on**       | <value> |
 *   | **Blocks**           | <value> |
 *   | Created at           | <value> |
 *   | Last updated         | <value> |
 *   | **Epic**             | <value> |
 *
 * @module sync-backlog-index
 *
 * CLI usage:
 *   node "Docs/.github/functions/sync-backlog-index.js" <agile-dir> [--dry-run]
 *
 * Arguments:
 *   agile-dir  Absolute path to the Docs/agile directory containing
 *              stories/ and tasks/ subdirectories.
 *   --dry-run  Print the generated JSON to stdout without writing the file.
 *
 * Programmatic usage:
 *   const { syncBacklogIndex } = require('./sync-backlog-index');
 *   const index = syncBacklogIndex('/abs/path/to/Docs/agile', { dryRun: true });
 *   // returns the parsed index object; writes backlog-index.json when dryRun=false
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Remove markdown bold markers and backticks from a raw markdown cell value.
 * @param {string} raw
 * @returns {string}
 */
function stripMarkdown(raw) {
  return raw
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();
}

/**
 * Parse a comma-separated list of item IDs from a metadata cell value.
 * Handles:
 *   - `—` or `-` (empty) → []
 *   - markdown links: `[E0-S1 — Title](...)` → "E0-S1"
 *   - plain IDs with optional description: "E0-S2 — some text" → "E0-S2"
 *   - comma-separated variants of the above
 *
 * @param {string} raw  Raw cell value (already trimmed)
 * @returns {string[]}
 */
function parseIdList(raw) {
  const value = raw.replace(/\*\*/g, '').trim();

  // Empty marker
  if (value === '—' || value === '-' || value === '') {
    return [];
  }

  // Split by commas (may be inside or outside link text)
  // First, resolve markdown links to their display text
  const withLinksResolved = value.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  return withLinksResolved
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      // Accept only canonical backlog IDs (EPIC-n or En-...)
      const match = trimmed.match(/^(EPIC-\d+|E\d+(?:-[A-Z]\d+)*)/i);
      return match ? match[1].toUpperCase() : null;
    })
    .filter(Boolean);
}

/**
 * Parse a comma-separated list of agent names from a metadata cell value.
 * Backtick-wrapped: `` `agent-one`, `agent-two` `` → ["agent-one", "agent-two"]
 *
 * @param {string} raw  Raw cell value (already trimmed)
 * @returns {string[]}
 */
function parseAgentList(raw) {
  if (raw === '—' || raw === '-' || raw === '') {
    return [];
  }
  // Extract all backtick-wrapped values first
  const backtickMatches = [];
  const backtickRe = /`([^`]+)`/g;
  let m;
  while ((m = backtickRe.exec(raw)) !== null) {
    backtickMatches.push(m[1].trim());
  }
  if (backtickMatches.length > 0) {
    return backtickMatches;
  }
  // Fallback: plain comma list
  return raw.split(',').map((s) => s.replace(/\*\*/g, '').trim()).filter(Boolean);
}

/**
 * Extract the epic ID from a raw epic cell value.
 * "EPIC-0 — Environment Preparation..." → "EPIC-0"
 *
 * @param {string} raw
 * @returns {string}
 */
function parseEpicId(raw) {
  const withLinksResolved = raw.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  const match = withLinksResolved.trim().match(/^(EPIC-\d+)/i);
  return match ? match[1].toUpperCase() : withLinksResolved.trim();
}

/**
 * Infer the epic ID from the item ID.
 * "E0-S1" → "EPIC-0", "E1-S3" → "EPIC-1", "E2-T1" → "EPIC-2"
 *
 * @param {string} id
 * @returns {string}
 */
function inferEpicFromId(id) {
  const match = id.match(/^E(\d+)-/i);
  return match ? `EPIC-${match[1]}` : 'UNKNOWN';
}

/**
 * Parse one markdown file and return a backlog item object (or null if no ID found).
 *
 * @param {string} filePath  Absolute path to the .md file
 * @param {'story'|'task'} type  Item type
 * @returns {object|null}
 */
function parseMarkdownItem(filePath, type) {
  const content = fs.readFileSync(filePath, 'utf8');

  /** @type {Record<string, string>} */
  const fields = {};

  // Match pipe-table rows: | **Key** | Value | or | Key | Value |
  const rowRe = /^\|\s*\*{0,2}([^|*\n]+?)\*{0,2}\s*\|\s*(.*?)\s*\|/gm;
  let match;
  while ((match = rowRe.exec(content)) !== null) {
    const key = stripMarkdown(match[1]).toLowerCase().replace(/\s+/g, ' ');
    const value = match[2].trim();
    // Only capture first occurrence of each key
    if (!(key in fields)) {
      fields[key] = value;
    }
  }

  const id = stripMarkdown(fields['id'] || '');
  if (!id) return null;

  const epicRaw = fields['epic'] || '';
  const epicId = epicRaw ? parseEpicId(epicRaw) : inferEpicFromId(id);

  const priority = stripMarkdown(fields['priority'] || '');
  const status = stripMarkdown(fields['status'] || '');
  const responsibleAgents = parseAgentList(fields['responsible agent'] || '');
  const dependsOn = parseIdList(fields['depends on'] || '');
  const blocks = parseIdList(fields['blocks'] || '');
  const createdAt = fields['created at'] || '';
  const lastUpdated = fields['last updated'] || '';

  // Relative path from workspace root (Docs/agile/...)
  const workspaceRoot = path.resolve(__dirname, '../../..');
  const relPath = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');

  return {
    id: id.toUpperCase(),
    type,
    epic: epicId,
    priority,
    status,
    responsible_agent: responsibleAgents,
    depends_on: dependsOn,
    blocks,
    created_at: createdAt,
    last_updated: lastUpdated,
    [`${type}_file`]: relPath,
  };
}

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Scan the agile directory and produce a backlog index.
 *
 * @param {string} agileDir  Absolute path to the Docs/agile directory.
 * @param {{ dryRun?: boolean }} [options]
 * @returns {{ version: string, generated_at: string, items: object[] }}
 */
function syncBacklogIndex(agileDir, options = {}) {
  const { dryRun = false } = options;

  // Get current timestamp using the shared datetime function
  const datetimePath = path.join(__dirname, 'datetime.js');
  const { nowLocal } = require(datetimePath);
  const generatedAt = nowLocal();

  /** @type {object[]} */
  const items = [];

  const storiesDir = path.join(agileDir, 'stories');
  const tasksDir = path.join(agileDir, 'tasks');

  // Collect story items
  if (fs.existsSync(storiesDir)) {
    const storyFiles = fs.readdirSync(storiesDir)
      .filter((f) => f.endsWith('.md'))
      .sort();
    for (const file of storyFiles) {
      const item = parseMarkdownItem(path.join(storiesDir, file), 'story');
      if (item) items.push(item);
    }
  }

  // Collect task items
  if (fs.existsSync(tasksDir)) {
    const taskFiles = fs.readdirSync(tasksDir)
      .filter((f) => f.endsWith('.md'))
      .sort();
    for (const file of taskFiles) {
      const item = parseMarkdownItem(path.join(tasksDir, file), 'task');
      if (item) items.push(item);
    }
  }

  // Sort: stories first (by ID), then tasks (by ID)
  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'story' ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  const index = {
    version: '1.0.0',
    generated_at: generatedAt,
    items,
  };

  if (!dryRun) {
    const outPath = path.join(agileDir, 'backlog-index.json');
    fs.writeFileSync(outPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
    console.log(`✅  backlog-index.json written — ${items.length} items`);
  } else {
    console.log(JSON.stringify(index, null, 2));
  }

  return index;
}

// ---------------------------------------------------------------------------
// Validation — cycle detection
// ---------------------------------------------------------------------------

/**
 * Detect dependency cycles in the backlog index items.
 * Returns an array of cycle descriptions (empty if no cycles).
 *
 * @param {object[]} items
 * @returns {string[]}
 */
function detectCycles(items) {
  const idToItem = {};
  for (const item of items) idToItem[item.id] = item;

  const visited = new Set();
  const inStack = new Set();
  const cycles = [];

  function dfs(id, stack) {
    if (inStack.has(id)) {
      const cycleStart = stack.indexOf(id);
      cycles.push(stack.slice(cycleStart).concat(id).join(' → '));
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    inStack.add(id);
    stack.push(id);
    const item = idToItem[id];
    if (item) {
      for (const dep of item.depends_on) dfs(dep, stack);
    }
    stack.pop();
    inStack.delete(id);
  }

  for (const item of items) dfs(item.id, []);
  return cycles;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const positional = args.filter((a) => !a.startsWith('--'));

  if (positional.length === 0) {
    console.error('Usage: node sync-backlog-index.js <agile-dir> [--dry-run]');
    process.exit(1);
  }

  const agileDir = path.resolve(positional[0]);

  if (!fs.existsSync(agileDir)) {
    console.error(`❌  Directory not found: ${agileDir}`);
    process.exit(1);
  }

  const index = syncBacklogIndex(agileDir, { dryRun });

  const cycles = detectCycles(index.items);
  if (cycles.length > 0) {
    console.error('\n⚠️  Dependency cycles detected:');
    cycles.forEach((c) => console.error(`   ${c}`));
  } else if (!dryRun) {
    console.log(`🔗  No dependency cycles found (${index.items.length} items checked).`);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { syncBacklogIndex, detectCycles, parseMarkdownItem };
