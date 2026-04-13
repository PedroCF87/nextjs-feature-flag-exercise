/**
 * file-stats.js — filesystem timestamp helpers
 *
 * CLI usage:
 *   node "Docs/.github/functions/file-stats.js" "/absolute/path/to/file"
 *   → prints:
 *       birthtime: YYYY-MM-DD HH:MM:SS ±HH
 *       mtime:     YYYY-MM-DD HH:MM:SS ±HH
 *
 * Programmatic usage (CommonJS):
 *   const { fileTimestamps } = require('./file-stats.js');
 *   const { birthtime, mtime } = fileTimestamps('/abs/path/to/file');
 *
 * Replaces the repeated inline snippet from file-timestamps and timeline-tracker skills:
 *   node -e "const fs=require('fs'); const stats=fs.statSync('<PATH>'); ..."
 *
 * Linux caveat: on ext4/xfs, birthtime reflects ctime (inode change time).
 * Accept it as the best available proxy for creation time.
 */

'use strict';

const fs = require('fs');
const { formatDate } = require('./datetime.js');

/**
 * Return birthtime and mtime of a file as formatted strings.
 * @param {string} absPath  Absolute filesystem path to the file.
 * @returns {{ birthtime: string, mtime: string }}
 */
function fileTimestamps(absPath) {
  const stats = fs.statSync(absPath);
  return {
    birthtime: formatDate(stats.birthtime),
    mtime: formatDate(stats.mtime),
  };
}

/**
 * Return birthtime and mtime for multiple files at once.
 * @param {string[]} paths  Array of absolute paths.
 * @returns {{ path: string, birthtime: string, mtime: string, error?: string }[]}
 */
function batchTimestamps(paths) {
  return paths.map((p) => {
    try {
      const { birthtime, mtime } = fileTimestamps(p);
      return { path: p, birthtime, mtime };
    } catch (e) {
      return { path: p, birthtime: null, mtime: null, error: e.message };
    }
  });
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node file-stats.js <absolute-path> [<absolute-path> ...]');
    process.exit(1);
  }
  if (args.length === 1) {
    try {
      const { birthtime, mtime } = fileTimestamps(args[0]);
      console.log(`birthtime: ${birthtime}`);
      console.log(`mtime:     ${mtime}`);
    } catch (e) {
      console.error(`ERROR: ${e.message}`);
      process.exit(1);
    }
  } else {
    const results = batchTimestamps(args);
    for (const r of results) {
      console.log(`\nFile: ${r.path}`);
      if (r.error) {
        console.error(`  ERROR: ${r.error}`);
      } else {
        console.log(`  birthtime: ${r.birthtime}`);
        console.log(`  mtime:     ${r.mtime}`);
      }
    }
  }
}

module.exports = { fileTimestamps, batchTimestamps };
