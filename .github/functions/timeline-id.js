/**
 * timeline-id.js — next timeline.jsonl entry ID resolver
 *
 * CLI usage:
 *   node "Docs/.github/functions/timeline-id.js" "/abs/path/to/timeline.jsonl"
 *   → prints next entry ID, e.g. "20260409-030"
 *
 * Programmatic usage (CommonJS):
 *   const { nextTimelineId } = require('./timeline-id.js');
 *   const id = nextTimelineId('/abs/path/to/Docs/agile/timeline.jsonl');
 *
 * Replaces the manual "read last line, extract id, increment" pattern
 * described in the timeline-tracker skill.
 *
 * ID format: YYYYMMDD-NNN
 *   - YYYYMMDD = today's local date
 *   - NNN      = zero-padded sequence within today (001, 002, …)
 *   - If no entries exist for today, sequence starts at 001.
 */

'use strict';

const fs = require('fs');

/**
 * Compute the next timeline entry ID for today's date.
 * @param {string} jsonlPath  Absolute path to Docs/agile/timeline.jsonl.
 * @returns {string}  e.g. "20260409-030"
 */
function nextTimelineId(jsonlPath) {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePrefix =
    today.getFullYear() +
    pad(today.getMonth() + 1) +
    pad(today.getDate());

  if (!fs.existsSync(jsonlPath)) {
    return `${datePrefix}-001`;
  }

  const content = fs.readFileSync(jsonlPath, 'utf8').trimEnd();
  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return `${datePrefix}-001`;

  let maxSeq = 0;
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.id && entry.id.startsWith(datePrefix)) {
        const seq = parseInt(entry.id.split('-')[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    } catch {
      // Malformed line — skip
    }
  }

  return `${datePrefix}-${String(maxSeq + 1).padStart(3, '0')}`;
}

/**
 * Peek at the last N entry IDs in the file (for debugging/verification).
 * @param {string} jsonlPath
 * @param {number} n
 * @returns {string[]}
 */
function lastIds(jsonlPath, n = 5) {
  if (!fs.existsSync(jsonlPath)) return [];
  const lines = fs
    .readFileSync(jsonlPath, 'utf8')
    .trimEnd()
    .split('\n')
    .filter((l) => l.trim());
  return lines
    .slice(-n)
    .map((l) => {
      try {
        return JSON.parse(l).id;
      } catch {
        return '(malformed)';
      }
    });
}

// CLI entry point
if (require.main === module) {
  const jsonlPath = process.argv[2];
  if (!jsonlPath) {
    console.error(
      'Usage: node timeline-id.js <absolute-path-to-timeline.jsonl>'
    );
    process.exit(1);
  }
  console.log(nextTimelineId(jsonlPath));
}

module.exports = { nextTimelineId, lastIds };
