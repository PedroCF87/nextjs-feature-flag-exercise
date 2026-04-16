/**
 * timeline-query.js
 *
 * Queries Docs/agile/timeline.jsonl to compute elapsed time per epic or story,
 * and produce summary tables for preparation-time measurement and cross-exercise comparison.
 *
 * Usage (CLI):
 *   node "Docs/.github/functions/timeline-query.js" <abs-path-to-timeline.jsonl> [options]
 *
 * Options:
 *   --epic   <EPIC-ID>    Filter entries by epic_id and compute total elapsed minutes
 *   --story  <STORY-ID>   Filter entries by story_id or story field and compute total elapsed minutes
 *   --summary             Print a markdown summary table of all epics and stories
 *   --table               Alias for --summary
 *
 * Examples:
 *   node "Docs/.github/functions/timeline-query.js" "/path/to/timeline.jsonl" --epic EPIC-0
 *   node "Docs/.github/functions/timeline-query.js" "/path/to/timeline.jsonl" --story E0-S1
 *   node "Docs/.github/functions/timeline-query.js" "/path/to/timeline.jsonl" --summary
 *
 * @module timeline-query
 */

const fs = require('fs');
const path = require('path');

/**
 * Parses a datetime string of the form "YYYY-MM-DD HH:MM:SS ±HH" into a Date.
 * @param {string} ts
 * @returns {Date}
 */
function parseTs(ts) {
  // Normalize offset: "2026-04-10 12:08:50 -03" → "2026-04-10T12:08:50-03:00"
  const m = ts.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})$/);
  if (m) {
    return new Date(`${m[1]}T${m[2]}${m[3]}:00`);
  }
  // Try full offset "±HH:MM"
  return new Date(ts);
}

/**
 * Reads and parses all entries from a timeline.jsonl file.
 * @param {string} jsonlPath - Absolute path to timeline.jsonl
 * @returns {object[]} Array of parsed JSONL entry objects
 */
function readTimeline(jsonlPath) {
  if (!fs.existsSync(jsonlPath)) {
    throw new Error(`timeline.jsonl not found: ${jsonlPath}`);
  }
  const lines = fs.readFileSync(jsonlPath, 'utf8').trim().split('\n').filter(Boolean);
  return lines.map((line, i) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      throw new Error(`Parse error on line ${i + 1}: ${line}`);
    }
  });
}

/**
 * Computes total elapsed minutes between the earliest and latest `timestamp`
 * (or `created_at` / `updated_at`) among the filtered entries.
 * Returns null if there are no entries or timestamps are missing.
 * @param {object[]} entries
 * @returns {{ minutes: number|null, startTs: string|null, endTs: string|null }}
 */
function computeElapsed(entries) {
  // Accept `timestamp` (primary schema field) as well as `created_at`/`updated_at`
  const withTs = entries.filter(e => e.timestamp || e.created_at || e.updated_at);
  if (withTs.length === 0) return { minutes: null, startTs: null, endTs: null };

  let earliest = null;
  let latest = null;

  for (const e of withTs) {
    const candidates = [e.timestamp, e.created_at, e.updated_at].filter(Boolean).map(parseTs);
    const tMin = candidates.reduce((a, b) => a < b ? a : b);
    const tMax = candidates.reduce((a, b) => a > b ? a : b);
    if (!earliest || tMin < earliest) earliest = tMin;
    if (!latest || tMax > latest) latest = tMax;
  }

  if (!earliest || !latest) return { minutes: null, startTs: null, endTs: null };

  const minutes = Math.round((latest - earliest) / 60000);
  const startTs = earliest.toISOString();
  const endTs = latest.toISOString();
  return { minutes, startTs, endTs };
}

/**
 * Filters timeline entries by epic_id.
 * @param {object[]} entries
 * @param {string} epicId - e.g. "EPIC-0"
 * @returns {object[]}
 */
function filterByEpic(entries, epicId) {
  return entries.filter(e =>
    e.epic_id === epicId ||
    e.epic === epicId ||
    (e.story_id && e.story_id.startsWith(epicId.replace('EPIC-', 'E').replace(/^E(\d+)$/, 'E$1-'))) ||
    (e.story && e.story.startsWith(epicId.replace('EPIC-', 'E').replace(/^E(\d+)$/, 'E$1-')))
  );
}

/**
 * Filters timeline entries by story_id.
 * Accepts both the original schema (`story_id`) and the hook-generated schema (`story`).
 * @param {object[]} entries
 * @param {string} storyId - e.g. "E0-S1"
 * @returns {object[]}
 */
function filterByStory(entries, storyId) {
  return entries.filter(e => e.story_id === storyId || e.story === storyId);
}

/**
 * Groups entries by epic_id and story_id and returns a summary structure.
 * @param {object[]} entries
 * @returns {object} { byEpic: { [epicId]: { stories: { [storyId]: { minutes, count } }, minutes, count } } }
 */
function buildSummary(entries) {
  const byEpic = {};

  for (const e of entries) {
    const epicId = e.epic_id || e.epic || '(unknown)';
    const storyId = e.story_id || e.story || '(unknown)';

    if (!byEpic[epicId]) byEpic[epicId] = { stories: {}, entries: [] };
    byEpic[epicId].entries.push(e);

    if (!byEpic[epicId].stories[storyId]) byEpic[epicId].stories[storyId] = { entries: [] };
    byEpic[epicId].stories[storyId].entries.push(e);
  }

  // Compute elapsed for each scope
  for (const epicId of Object.keys(byEpic)) {
    const epicElapsed = computeElapsed(byEpic[epicId].entries);
    byEpic[epicId].minutes = epicElapsed.minutes;
    byEpic[epicId].count = byEpic[epicId].entries.length;

    for (const storyId of Object.keys(byEpic[epicId].stories)) {
      const storyElapsed = computeElapsed(byEpic[epicId].stories[storyId].entries);
      byEpic[epicId].stories[storyId].minutes = storyElapsed.minutes;
      byEpic[epicId].stories[storyId].count = byEpic[epicId].stories[storyId].entries.length;
    }
  }

  return { byEpic };
}

/**
 * Renders a markdown summary table of all epics and stories.
 * @param {object} summary - from buildSummary()
 * @returns {string}
 */
function renderMarkdownTable(summary) {
  const lines = [];
  lines.push('| Epic | Story | Entries | Elapsed (min) |');
  lines.push('|------|-------|---------|---------------|');

  for (const epicId of Object.keys(summary.byEpic)) {
    const epic = summary.byEpic[epicId];
    lines.push(`| **${epicId}** | *(total)* | ${epic.count} | **${epic.minutes ?? '—'}** |`);
    for (const storyId of Object.keys(epic.stories)) {
      const story = epic.stories[storyId];
      lines.push(`| | ${storyId} | ${story.count} | ${story.minutes ?? '—'} |`);
    }
  }

  return lines.join('\n');
}

// ─── Programmatic API ────────────────────────────────────────────────────────

/**
 * Returns elapsed minutes for all entries matching a given epic_id.
 * @param {string} jsonlPath
 * @param {string} epicId
 * @returns {{ minutes: number|null, entryCount: number, startTs: string|null, endTs: string|null }}
 */
function queryEpicElapsed(jsonlPath, epicId) {
  const entries = readTimeline(jsonlPath);
  const filtered = filterByEpic(entries, epicId);
  const elapsed = computeElapsed(filtered);
  return { ...elapsed, entryCount: filtered.length };
}

/**
 * Returns elapsed minutes for all entries matching a given story_id.
 * @param {string} jsonlPath
 * @param {string} storyId
 * @returns {{ minutes: number|null, entryCount: number, startTs: string|null, endTs: string|null }}
 */
function queryStoryElapsed(jsonlPath, storyId) {
  const entries = readTimeline(jsonlPath);
  const filtered = filterByStory(entries, storyId);
  const elapsed = computeElapsed(filtered);
  return { ...elapsed, entryCount: filtered.length };
}

/**
 * Returns a markdown summary table of all epics and stories in the timeline.
 * @param {string} jsonlPath
 * @returns {string}
 */
function querySummaryTable(jsonlPath) {
  const entries = readTimeline(jsonlPath);
  const summary = buildSummary(entries);
  return renderMarkdownTable(summary);
}

module.exports = { queryEpicElapsed, queryStoryElapsed, querySummaryTable, readTimeline, buildSummary, renderMarkdownTable };

// ─── CLI entry point ─────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node timeline-query.js <abs-path-to-timeline.jsonl> [--epic <ID> | --story <ID> | --summary]');
    process.exit(1);
  }

  const jsonlPath = args[0];
  const flagIdx = (flag) => args.indexOf(flag);

  try {
    if (flagIdx('--summary') !== -1 || flagIdx('--table') !== -1) {
      console.log(querySummaryTable(jsonlPath));
    } else if (flagIdx('--epic') !== -1) {
      const epicId = args[flagIdx('--epic') + 1];
      if (!epicId) { console.error('Missing epic ID after --epic'); process.exit(1); }
      const result = queryEpicElapsed(jsonlPath, epicId);
      if (result.minutes === null) {
        console.log(`${epicId}: no timestamped entries found (${result.entryCount} total entries)`);
      } else {
        console.log(`${epicId}: ${result.minutes} min | ${result.entryCount} entries | ${result.startTs} → ${result.endTs}`);
      }
    } else if (flagIdx('--story') !== -1) {
      const storyId = args[flagIdx('--story') + 1];
      if (!storyId) { console.error('Missing story ID after --story'); process.exit(1); }
      const result = queryStoryElapsed(jsonlPath, storyId);
      if (result.minutes === null) {
        console.log(`${storyId}: no timestamped entries found (${result.entryCount} total entries)`);
      } else {
        console.log(`${storyId}: ${result.minutes} min | ${result.entryCount} entries | ${result.startTs} → ${result.endTs}`);
      }
    } else {
      // Default: print summary
      console.log(querySummaryTable(jsonlPath));
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
