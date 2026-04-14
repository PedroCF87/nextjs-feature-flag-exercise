/**
 * append-friction-log.js
 *
 * Appends a new entry to the friction log markdown table at
 * `<repo-path>/.agents/templates/friction-log.md`.
 *
 * The friction log table format:
 *
 *   | # | Story | Timestamp | Description | Impact |
 *   |---|---|---|---|---|
 *   | 1 | E0-S1 | 2026-04-10 15:30:00 -03 | Description text | high |
 *
 * @module append-friction-log
 *
 * CLI usage:
 *   node "Docs/.github/functions/append-friction-log.js" \
 *     <repo-path> <story-id> "<description>" [--impact high|medium|low]
 *
 * Arguments:
 *   repo-path    Absolute path to the nextjs-feature-flag-exercise repository root.
 *   story-id     The story ID where the friction was encountered (e.g. E0-S1).
 *   description  A one-sentence description of the friction point. Quote it.
 *   --impact     Severity level: high | medium | low (default: medium).
 *
 * Programmatic usage:
 *   const { appendFrictionLog } = require('./append-friction-log');
 *   appendFrictionLog({
 *     repoPath: '/abs/path/to/nextjs-feature-flag-exercise',
 *     storyId:  'E0-S1',
 *     description: 'pnpm install failed due to missing lockfile',
 *     impact:   'high',
 *   });
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Default friction log path relative to repo root
const FRICTION_LOG_REL = '.agents/templates/friction-log.md';

// Table header used to locate the insertion point
const TABLE_HEADER_RE = /^\|\s*#\s*\|\s*Story\s*\|\s*Timestamp\s*\|\s*Description\s*\|\s*Impact\s*\|/m;

/**
 * Append a friction point entry to the friction log.
 *
 * @param {{
 *   repoPath: string,
 *   storyId: string,
 *   description: string,
 *   impact?: 'high'|'medium'|'low',
 *   logPath?: string,
 * }} options
 * @returns {number} The sequence number of the appended entry.
 */
function appendFrictionLog({ repoPath, storyId, description, impact = 'medium', logPath }) {
  const filePath = logPath || path.join(repoPath, FRICTION_LOG_REL);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Friction log not found: ${filePath}\nRun the template creation step first.`);
  }

  // Get current timestamp using datetime.js if available, else build manually
  let timestamp;
  try {
    const datetimePath = path.join(__dirname, 'datetime.js');
    const { nowLocal } = require(datetimePath);
    timestamp = nowLocal();
  } catch (_) {
    // Fallback: ISO-like local timestamp
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hh = pad(Math.floor(Math.abs(offset) / 60));
    const mm = pad(Math.abs(offset) % 60);
    timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${sign}${hh}`;
    if (mm !== '00') timestamp += mm;
  }

  // Read current content
  let content = fs.readFileSync(filePath, 'utf8');

  // Count existing data rows (exclude header and separator lines)
  const lines = content.split('\n');
  let rowCount = 0;
  let inTable = false;
  let separatorSeen = false;
  for (const line of lines) {
    if (!inTable && TABLE_HEADER_RE.test(line)) {
      inTable = true;
      continue;
    }
    if (inTable && !separatorSeen && /^\|[-| ]+\|/.test(line)) {
      separatorSeen = true;
      continue;
    }
    if (inTable && separatorSeen && line.trim().startsWith('|')) {
      rowCount++;
    }
  }

  // Sanitise description: replace pipes to avoid breaking the table
  const safeDescription = description.replace(/\|/g, '／').replace(/\n/g, ' ').trim();

  const newRow = `| ${rowCount + 1} | ${storyId} | ${timestamp} | ${safeDescription} | ${impact} |`;

  // Append new row — find last table row and insert after it
  // Strategy: split on lines, find last line that starts with | inside the table, append after it
  const updatedLines = [];
  let tableEnded = false;
  let lastTableLineIdx = -1;
  inTable = false;
  separatorSeen = false;

  for (let i = 0; i < lines.length; i++) {
    if (!inTable && TABLE_HEADER_RE.test(lines[i])) {
      inTable = true;
    }
    if (inTable && !separatorSeen && /^\|[-| ]+\|/.test(lines[i])) {
      separatorSeen = true;
    }
    if (inTable && separatorSeen && lines[i].trim().startsWith('|')) {
      lastTableLineIdx = i;
    }
    updatedLines.push(lines[i]);
  }

  if (lastTableLineIdx === -1) {
    throw new Error('Could not locate the friction log table in the file. Ensure the table header exists.');
  }

  // Insert new row after the last table row
  updatedLines.splice(lastTableLineIdx + 1, 0, newRow);

  fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');

  const seqNum = rowCount + 1;
  console.log(`✅  Friction point #${seqNum} appended (${storyId} | ${impact})`);
  console.log(`    ${safeDescription}`);
  return seqNum;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2);

  const impactIdx = args.indexOf('--impact');
  const impact = impactIdx !== -1 ? args[impactIdx + 1] : 'medium';
  const positional = args.filter((a, i) => !a.startsWith('--') && i !== impactIdx + 1);

  if (positional.length < 3) {
    console.error(
      'Usage: node append-friction-log.js <repo-path> <story-id> "<description>" [--impact high|medium|low]'
    );
    process.exit(1);
  }

  const [repoPath, storyId, description] = positional;
  const validImpacts = ['high', 'medium', 'low'];
  if (!validImpacts.includes(impact)) {
    console.error(`❌  Invalid impact level "${impact}". Must be: high | medium | low`);
    process.exit(1);
  }

  try {
    appendFrictionLog({ repoPath: path.resolve(repoPath), storyId, description, impact });
  } catch (err) {
    console.error(`❌  ${err.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { appendFrictionLog };
