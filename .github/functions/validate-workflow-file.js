/**
 * validate-workflow-file.js — GitHub Actions `copilot-setup-steps.yml` structure validator
 *
 * Validates that a copilot-setup-steps workflow file satisfies the four mandatory
 * structural requirements enforced by the copilot-env-specialist agent:
 *   1. Job name is exactly "copilot-setup-steps" (GitHub Copilot picks it up by this string)
 *   2. `environment: copilot` is declared at job level (required for COPILOT_MCP_* secrets)
 *   3. `timeout-minutes` is present and its value is ≤ 59 (GitHub enforces a hard cap of 59)
 *   4. `workflow_dispatch` trigger is present (required for manual dry-run validation)
 *
 * Does NOT require a YAML parser — uses targeted regex on the raw file text, which is
 * sufficient for the known structure of copilot-setup-steps files.
 *
 * CLI usage:
 *   node "Docs/.github/functions/validate-workflow-file.js" <abs-path-to-yml>
 *
 * Sample output (all pass):
 *   job name:        copilot-setup-steps  ✅
 *   environment:     copilot              ✅
 *   timeout-minutes: 15                  ✅  (≤ 59)
 *   trigger:         workflow_dispatch    ✅
 *
 *   ✅ Workflow file is valid for Copilot setup.
 *
 * Sample output (failures):
 *   job name:        my-job  🔴  ← Must be exactly 'copilot-setup-steps'
 *   environment:     (not found)  🔴  ← Add 'environment: copilot' to the job definition
 *   timeout-minutes: 90          🔴  ← Must be ≤ 59 (GitHub hard cap)
 *   trigger:         workflow_dispatch  ✅
 *
 *   🔴 Workflow validation FAILED — 3 issue(s) found.
 *   (exits with code 1)
 *
 * Programmatic usage (CommonJS):
 *   const { validateWorkflowFile } = require('./validate-workflow-file.js');
 *   const { pass, checks } = validateWorkflowFile('/abs/path/to/copilot-setup-steps.yml');
 *   // checks[i]: { name, value, pass, note }
 *
 * Replaces / prevents the manual structural review repeated across:
 *   - story E0-S2 T4 sub-task 3 (post-write verification before staging)
 *   - story E0-S2 T5 sub-task 4 (pre-trigger confirmation before dry-run)
 *   - copilot-env-setup/SKILL.md  (post-creation validation step)
 *   - copilot-env-specialist agent anti-patterns (structural rules)
 */

'use strict';

const fs = require('fs');

/**
 * Validate a copilot-setup-steps workflow YAML file.
 *
 * @param {string} filePath  Absolute path to the .yml file.
 * @returns {{
 *   pass:   boolean,
 *   checks: { name: string, value: string|null, pass: boolean, note: string }[]
 * }}
 */
function validateWorkflowFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const checks = [];

  // ── 1. Job name ────────────────────────────────────────────────────────────
  // Match a YAML mapping key at the jobs level, e.g.:
  //   jobs:
  //     copilot-setup-steps:
  // The job name is the first key under "jobs:" that is followed by ":"
  const jobNameMatch = raw.match(/^jobs:\s*\n\s+(\S+):/m);
  const jobName      = jobNameMatch ? jobNameMatch[1] : null;
  const jobPass      = jobName === 'copilot-setup-steps';
  checks.push({
    name:  'job name',
    value: jobName,
    pass:  jobPass,
    note:  jobPass ? '' : "Must be exactly 'copilot-setup-steps' — GitHub Copilot identifies it by this string",
  });

  // ── 2. environment: copilot ───────────────────────────────────────────────
  // Match "environment: copilot" at any indentation level (job property)
  const envMatch = raw.match(/^\s+environment:\s+(\S+)/m);
  const envValue = envMatch ? envMatch[1] : null;
  const envPass  = envValue === 'copilot';
  checks.push({
    name:  'environment',
    value: envValue,
    pass:  envPass,
    note:  envPass ? '' : "Add 'environment: copilot' to the job definition — required for COPILOT_MCP_* secrets",
  });

  // ── 3. timeout-minutes ≤ 59 ───────────────────────────────────────────────
  const timeoutMatch = raw.match(/^\s+timeout-minutes:\s+(\d+)/m);
  const timeoutRaw   = timeoutMatch ? timeoutMatch[1] : null;
  const timeoutVal   = timeoutRaw ? parseInt(timeoutRaw, 10) : null;
  const timeoutPass  = timeoutVal !== null && timeoutVal <= 59;
  checks.push({
    name:  'timeout-minutes',
    value: timeoutRaw,
    pass:  timeoutPass,
    note:  timeoutPass
      ? ''
      : timeoutVal === null
        ? "Add 'timeout-minutes: <N>' to the job (max 59)"
        : `Value ${timeoutVal} exceeds GitHub's hard cap of 59`,
  });

  // ── 4. workflow_dispatch trigger ──────────────────────────────────────────
  const hasDispatch = /workflow_dispatch/.test(raw);
  checks.push({
    name:  'trigger',
    value: hasDispatch ? 'workflow_dispatch' : null,
    pass:  hasDispatch,
    note:  hasDispatch ? '' : "Add 'workflow_dispatch:' under 'on:' — required for manual dry-run validation",
  });

  return { pass: checks.every((c) => c.pass), checks };
}

// CLI entry point
if (require.main === module) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node validate-workflow-file.js <absolute-path-to-yml>');
    process.exit(1);
  }

  let result;
  try {
    result = validateWorkflowFile(filePath);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exit(1);
  }

  const { pass, checks } = result;

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

  const failCount = checks.filter((c) => !c.pass).length;
  if (!pass) {
    console.error(`\n🔴 Workflow validation FAILED — ${failCount} issue(s) found.`);
    process.exit(1);
  } else {
    console.log('\n✅ Workflow file is valid for Copilot setup.');
  }
}

module.exports = { validateWorkflowFile };
