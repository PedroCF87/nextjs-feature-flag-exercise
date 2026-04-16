/**
 * git-info.js — Git repository state helpers
 *
 * CLI usage:
 *   node "Docs/.github/functions/git-info.js" [/path/to/repo]
 *   → prints:
 *       branch:   exercise-1
 *       sha:      abc1234
 *       origin:   https://github.com/<user>/nextjs-feature-flag-exercise.git
 *       upstream: https://github.com/<owner>/nextjs-feature-flag-exercise.git
 *
 * With --branch-ref flag (short format for document headers):
 *   node "Docs/.github/functions/git-info.js" [/path/to/repo] --branch-ref
 *   → exercise-1 @ abc1234
 *
 * Programmatic usage (CommonJS):
 *   const { gitInfo, branchRef } = require('./git-info.js');
 *   const info = gitInfo('/abs/path/to/repo');
 *   // info.branch, info.sha, info.origin, info.upstream
 *   const ref  = branchRef('/abs/path/to/repo');
 *   // → "exercise-1 @ abc1234"
 *
 * Replaces repeated inline git commands scattered across skills and story tasks:
 *   git rev-parse --short HEAD
 *   git branch --show-current
 *   git remote get-url origin
 *   git remote get-url upstream
 *
 * Used by:
 *   - validate-exercise-environment/SKILL.md   (report header: Branch field)
 *   - produce-diagnosis-document/SKILL.md       (document header: Branch field)
 *   - project-context-audit/SKILL.md            (document metadata: Branch field)
 *   - fork-and-configure-remotes/SKILL.md       (Step 6 verification output)
 *   - story E0-S1-T2 sub-task 0                 (evidence report header)
 *   - story E0-S1-T4 sub-task 2                 (diagnosis document header)
 */

'use strict';

const { execSync } = require('child_process');

/**
 * Run a git command in the given directory and return trimmed stdout.
 * Throws if the command fails.
 * @param {string} cmd   Shell command to run
 * @param {string} cwd   Working directory
 * @returns {string}
 */
function gitRun(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

/**
 * Return the current git state for a repository.
 *
 * @param {string} [repoPath]  Absolute path to the repository root. Defaults to process.cwd().
 * @returns {{
 *   branch:   string,        // Current branch name (e.g. "exercise-1")
 *   sha:      string,        // 7-character short commit SHA (e.g. "abc1234")
 *   origin:   string|null,   // HTTPS/SSH URL of the 'origin' remote, or null if not set
 *   upstream: string|null    // HTTPS/SSH URL of the 'upstream' remote, or null if not set
 * }}
 */
function gitInfo(repoPath) {
  const cwd = repoPath || process.cwd();

  const branch = gitRun('git branch --show-current', cwd);
  const sha    = gitRun('git rev-parse --short HEAD', cwd);

  let origin   = null;
  let upstream = null;

  try { origin   = gitRun('git remote get-url origin',   cwd); } catch { /* remote not set */ }
  try { upstream = gitRun('git remote get-url upstream', cwd); } catch { /* remote not set */ }

  return { branch, sha, origin, upstream };
}

/**
 * Return a short branch reference string suitable for document headers.
 * Format: "<branch> @ <sha>"  e.g. "exercise-1 @ abc1234"
 *
 * @param {string} [repoPath]  Absolute path to the repository root. Defaults to process.cwd().
 * @returns {string}
 */
function branchRef(repoPath) {
  const { branch, sha } = gitInfo(repoPath);
  return `${branch} @ ${sha}`;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const flagIndex = args.indexOf('--branch-ref');
  const shortMode = flagIndex !== -1;
  const pathArg   = args.filter((a) => !a.startsWith('--'))[0];
  const repoPath  = pathArg || process.cwd();

  try {
    if (shortMode) {
      console.log(branchRef(repoPath));
    } else {
      const { branch, sha, origin, upstream } = gitInfo(repoPath);
      const pad = 8; // align colons
      console.log(`branch:   ${branch}`);
      console.log(`sha:      ${sha}`);
      console.log(`origin:   ${origin   || '(not set)'}`);
      console.log(`upstream: ${upstream || '(not set)'}`);
    }
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exit(1);
  }
}

module.exports = { gitInfo, branchRef, gitRun };
