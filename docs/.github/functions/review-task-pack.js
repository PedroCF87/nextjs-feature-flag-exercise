#!/usr/bin/env node
/**
 * review-task-pack.js
 *
 * Runs the recurring task-pack review workflow in one command:
 * 1) validate task files with validate-task-pack.js
 * 2) sync backlog-index.json with sync-backlog-index.js (optional)
 *
 * CLI:
 *   node "Docs/.github/functions/review-task-pack.js" <abs-agile-dir> [--story E0-S1] [--no-sync] [--sync-dry-run]
 *
 * Exit codes:
 *   0 => validation passed (and sync passed when enabled)
 *   1 => validation failed
 *   2 => sync failed
 */

'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

function usage() {
  console.error('Usage: node "Docs/.github/functions/review-task-pack.js" <abs-agile-dir> [--story E0-S1] [--no-sync] [--sync-dry-run]');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const agileDir = args[0];

  const storyIdx = args.indexOf('--story');
  const storyId = storyIdx !== -1 ? args[storyIdx + 1] : null;

  const noSync = args.includes('--no-sync');
  const syncDryRun = args.includes('--sync-dry-run');

  return {
    agileDir,
    storyId,
    noSync,
    syncDryRun,
  };
}

function runNode(scriptPath, scriptArgs) {
  const result = spawnSync('node', [scriptPath, ...scriptArgs], {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  return {
    code: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

/**
 * Execute task-pack review workflow.
 * @param {string} agileDir Absolute path to Docs/agile
 * @param {{storyId?: string|null, noSync?: boolean, syncDryRun?: boolean}} options
 * @returns {{validation: {code:number, stdout:string, stderr:string}, sync: null | {code:number, stdout:string, stderr:string}}}
 */
function reviewTaskPack(agileDir, options = {}) {
  const { storyId = null, noSync = false, syncDryRun = false } = options;

  const functionsDir = __dirname;
  const validateScript = path.join(functionsDir, 'validate-task-pack.js');
  const syncScript = path.join(functionsDir, 'sync-backlog-index.js');

  const validateArgs = [agileDir];
  if (storyId) {
    validateArgs.push('--story', storyId);
  }

  const validation = runNode(validateScript, validateArgs);

  let sync = null;
  if (validation.code === 0 && !noSync) {
    const syncArgs = [agileDir];
    if (syncDryRun) syncArgs.push('--dry-run');
    sync = runNode(syncScript, syncArgs);
  }

  return { validation, sync };
}

function main() {
  const { agileDir, storyId, noSync, syncDryRun } = parseArgs(process.argv);

  if (!agileDir || !path.isAbsolute(agileDir)) {
    usage();
    process.exit(1);
  }

  const result = reviewTaskPack(agileDir, { storyId, noSync, syncDryRun });

  process.stdout.write('=== validate-task-pack ===\n');
  process.stdout.write(result.validation.stdout);
  process.stderr.write(result.validation.stderr);

  if (result.validation.code !== 0) {
    process.stderr.write('\n❌ Task-pack validation failed.\n');
    process.exit(1);
  }

  if (result.sync) {
    process.stdout.write('\n=== sync-backlog-index ===\n');
    process.stdout.write(result.sync.stdout);
    process.stderr.write(result.sync.stderr);

    if (result.sync.code !== 0) {
      process.stderr.write('\n❌ Backlog sync failed after successful validation.\n');
      process.exit(2);
    }
  }

  process.stdout.write('\n✅ Task-pack review workflow completed successfully.\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  reviewTaskPack,
};
