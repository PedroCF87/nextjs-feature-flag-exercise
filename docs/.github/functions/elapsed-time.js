/**
 * elapsed-time.js — elapsed time calculator between two formatted timestamps
 *
 * CLI usage:
 *   node "Docs/.github/functions/elapsed-time.js" "2026-04-09 10:00:00 -03" "2026-04-09 11:30:00 -03"
 *   → 90 min (1h 30m)
 *
 *   # With a label
 *   node "Docs/.github/functions/elapsed-time.js" "2026-04-09 10:00:00 -03" "2026-04-09 11:30:00 -03" "Exercise 1 implementation"
 *   → Exercise 1 implementation: 90 min (1h 30m)
 *
 * Programmatic usage (CommonJS):
 *   const { elapsedMinutes, elapsedFormatted } = require('./elapsed-time.js');
 *   const mins = elapsedMinutes('2026-04-09 10:00:00 -03', '2026-04-09 11:30:00 -03');
 *   console.log(elapsedFormatted(mins)); // "90 min (1h 30m)"
 *
 * Accepts timestamps produced by datetime.js (format: YYYY-MM-DD HH:MM:SS ±HH).
 * Used in baseline capture templates to compute implementation elapsed time
 * from start/end timestamps recorded during exercise execution.
 */

'use strict';

/**
 * Parse a timestamp string "YYYY-MM-DD HH:MM:SS ±HH" into a Date (UTC).
 * @param {string} ts
 * @returns {Date}
 */
function parseTimestamp(ts) {
  // Normalize "YYYY-MM-DD HH:MM:SS +HH" → ISO "YYYY-MM-DDTHH:MM:SS+HH:00"
  const match = ts.match(
    /^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})\s([+-]\d{2})$/
  );
  if (!match) {
    throw new Error(
      `Invalid timestamp format: "${ts}". Expected "YYYY-MM-DD HH:MM:SS ±HH"`
    );
  }
  const [, date, time, offset] = match;
  return new Date(`${date}T${time}${offset}:00`);
}

/**
 * Compute elapsed minutes between two timestamps (end − start).
 * Returns a positive integer; throws if end is before start.
 * @param {string} startTs  "YYYY-MM-DD HH:MM:SS ±HH"
 * @param {string} endTs    "YYYY-MM-DD HH:MM:SS ±HH"
 * @returns {number} elapsed minutes (rounded to nearest minute)
 */
function elapsedMinutes(startTs, endTs) {
  const start = parseTimestamp(startTs);
  const end = parseTimestamp(endTs);
  const diffMs = end - start;
  if (diffMs < 0) {
    throw new Error(`End timestamp is before start timestamp.\n  start: ${startTs}\n  end:   ${endTs}`);
  }
  return Math.round(diffMs / 60000);
}

/**
 * Format elapsed minutes as "N min (Xh Ym)".
 * If less than 60 minutes, omits the hours component: "N min".
 * @param {number} mins
 * @returns {string}
 */
function elapsedFormatted(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${mins} min (${h}h ${m}m)`;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      'Usage: node elapsed-time.js "<start-ts>" "<end-ts>" [label]\n' +
      'Timestamps must be in format: YYYY-MM-DD HH:MM:SS ±HH'
    );
    process.exit(1);
  }
  try {
    const mins = elapsedMinutes(args[0], args[1]);
    const formatted = elapsedFormatted(mins);
    const label = args[2] ? `${args[2]}: ` : '';
    console.log(`${label}${formatted}`);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exit(1);
  }
}

module.exports = { parseTimestamp, elapsedMinutes, elapsedFormatted };
