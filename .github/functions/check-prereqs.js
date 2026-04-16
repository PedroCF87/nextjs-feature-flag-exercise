/**
 * check-prereqs.js — Exercise environment prerequisites checker
 *
 * CLI usage (with default expected branch "exercise-1"):
 *   node "Docs/.github/functions/check-prereqs.js"
 *
 * CLI usage with explicit expected branch:
 *   node "Docs/.github/functions/check-prereqs.js" exercise-1
 *
 * CLI usage with explicit branch and repo path:
 *   node "Docs/.github/functions/check-prereqs.js" exercise-1 /abs/path/to/repo
 *
 * Sample output (all pass):
 *   node      v20.12.0    ✅
 *   pnpm      9.1.0       ✅
 *   git       2.43.0      ✅
 *   branch    exercise-1  ✅
 *
 *   ✅ All prerequisites met.
 *
 * Sample output (failure):
 *   node      v16.20.0    🔴  ← Requires Node.js ≥ 18
 *   pnpm      (not found) 🔴  ← Install with: npm install -g pnpm
 *   ...
 *   🔴 Prerequisites check FAILED — resolve blockers before proceeding.
 *   (exits with code 1)
 *
 * Programmatic usage (CommonJS):
 *   const { checkPrereqs } = require('./check-prereqs.js');
 *   const { pass, checks } = checkPrereqs({ expectedBranch: 'exercise-1', repoPath: '/abs/path' });
 *   // checks[i]: { name, value, pass, note }
 *
 * Replaces the Phase 1 bash block in validate-exercise-environment/SKILL.md:
 *   node --version
 *   pnpm --version
 *   git branch --show-current
 *
 * Used by:
 *   - validate-exercise-environment/SKILL.md  (Phase 1 — prerequisites check)
 *   - story E0-S1-T2 sub-task 0               (first gate before pnpm install)
 *   - story E0-S1-T1 sub-task 3               (branch confirmation before remote setup)
 */

'use strict';

const { execSync } = require('child_process');

/**
 * Run a command and return trimmed stdout, or null on failure.
 * @param {string} cmd
 * @returns {string|null}
 */
function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

/**
 * Parse the major version number from a version string like "v20.12.0" or "20.12.0".
 * @param {string} v
 * @returns {number}
 */
function majorVersion(v) {
  const match = v.replace(/^v/, '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Check environment prerequisites for the exercise repository.
 *
 * @param {{
 *   expectedBranch?: string,   // Branch name to confirm (default: 'exercise-1')
 *   repoPath?:       string,   // Absolute path to the repo; uses cwd if omitted
 *   minNode?:        number    // Minimum Node.js major version (default: 18)
 * }} [opts]
 *
 * @returns {{
 *   pass:   boolean,
 *   checks: { name: string, value: string|null, pass: boolean, note: string }[]
 * }}
 */
function checkPrereqs(opts = {}) {
  const { expectedBranch = 'exercise-1', repoPath, minNode = 18 } = opts;
  const checks = [];

  // ── Node.js version ──────────────────────────────────────────────────────
  const nodeVer  = run('node --version');
  const nodePass = nodeVer !== null && majorVersion(nodeVer) >= minNode;
  checks.push({
    name:  'node',
    value: nodeVer,
    pass:  nodePass,
    note:  nodePass ? '' : `Requires Node.js ≥ ${minNode}`,
  });

  // ── pnpm ─────────────────────────────────────────────────────────────────
  const pnpmVer  = run('pnpm --version');
  const pnpmPass = pnpmVer !== null;
  checks.push({
    name:  'pnpm',
    value: pnpmVer,
    pass:  pnpmPass,
    note:  pnpmPass ? '' : 'Install with: npm install -g pnpm',
  });

  // ── git ──────────────────────────────────────────────────────────────────
  const gitRaw  = run('git --version');
  const gitVer  = gitRaw ? gitRaw.replace('git version ', '') : null;
  const gitPass = gitVer !== null;
  checks.push({
    name:  'git',
    value: gitVer,
    pass:  gitPass,
    note:  gitPass ? '' : 'git not found on PATH',
  });

  // ── Active branch ─────────────────────────────────────────────────────────
  const branchCmd = repoPath
    ? `git -C "${repoPath}" branch --show-current`
    : 'git branch --show-current';
  const branch     = run(branchCmd);
  const branchPass = branch === expectedBranch;
  checks.push({
    name:  'branch',
    value: branch,
    pass:  branchPass,
    note:  branchPass ? '' : `Expected '${expectedBranch}' — run: git checkout ${expectedBranch}`,
  });

  return { pass: checks.every((c) => c.pass), checks };
}

// CLI entry point
if (require.main === module) {
  const argv           = process.argv.slice(2);
  const expectedBranch = argv[0] || 'exercise-1';
  const repoPath       = argv[1] || undefined;

  const { pass, checks } = checkPrereqs({ expectedBranch, repoPath });

  // Align output columns
  const nameWidth  = Math.max(...checks.map((c) => c.name.length));
  const valueWidth = Math.max(...checks.map((c) => (c.value || '(not found)').length));

  for (const c of checks) {
    const name   = c.name.padEnd(nameWidth);
    const value  = (c.value || '(not found)').padEnd(valueWidth);
    const status = c.pass ? '✅' : '🔴';
    const note   = c.note ? `  ← ${c.note}` : '';
    console.log(`${name}  ${value}  ${status}${note}`);
  }

  if (!pass) {
    console.error('\n🔴 Prerequisites check FAILED — resolve blockers before proceeding.');
    process.exit(1);
  } else {
    console.log('\n✅ All prerequisites met.');
  }
}

module.exports = { checkPrereqs, run, majorVersion };
