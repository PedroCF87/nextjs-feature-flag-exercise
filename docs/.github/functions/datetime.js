/**
 * datetime.js — shared date/time formatting helpers
 *
 * CLI usage:
 *   node "Docs/.github/functions/datetime.js"
 *   → prints current local timestamp as: YYYY-MM-DD HH:MM:SS ±HH
 *
 * Programmatic usage (CommonJS):
 *   const { nowLocal, formatDate } = require('./datetime.js');
 *   console.log(nowLocal());          // e.g. "2026-04-09 22:55:04 -03"
 *   console.log(formatDate(new Date('2026-01-01T10:00:00')));
 */

'use strict';

/**
 * Zero-pad a number to 2 digits.
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Format a Date object as "YYYY-MM-DD HH:MM:SS ±HH".
 * The timezone offset is derived from the Date object itself.
 * @param {Date} d
 * @returns {string}
 */
function formatDate(d) {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' + pad(d.getMonth() + 1) +
    '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) +
    ':' + pad(d.getMinutes()) +
    ':' + pad(d.getSeconds()) +
    ' ' + sign + h
  );
}

/**
 * Return the current local datetime as "YYYY-MM-DD HH:MM:SS ±HH".
 * Replaces the repeated inline one-liner:
 *   node -e "const d=new Date();..."
 * @returns {string}
 */
function nowLocal() {
  return formatDate(new Date());
}

// CLI entry point
if (require.main === module) {
  console.log(nowLocal());
}

module.exports = { pad, formatDate, nowLocal };
