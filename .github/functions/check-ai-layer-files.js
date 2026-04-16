/**
 * check-ai-layer-files.js — AI Layer artifact existence checker
 *
 * Checks whether the expected AI Layer files (agents, skills, instructions,
 * workflows, global rules) exist at a target repository path. Produces a
 * structured pass/fail report useful for coverage checklists and DoD verification.
 *
 * CLI usage — inline file list:
 *   node "Docs/.github/functions/check-ai-layer-files.js" <base-path> \
 *     .github/copilot-instructions.md \
 *     .github/instructions/coding-agent.instructions.md \
 *     .github/agents/codebase-gap-analyst.agent.md \
 *     .github/skills/gap-analysis/SKILL.md \
 *     .github/workflows/copilot-setup-steps.yml
 *
 * CLI usage — JSON manifest file:
 *   node "Docs/.github/functions/check-ai-layer-files.js" <base-path> \
 *     --manifest <abs-path-to-manifest.json>
 *
 *   The manifest JSON must be an array of relative paths, e.g.:
 *   [
 *     ".github/copilot-instructions.md",
 *     ".github/instructions/coding-agent.instructions.md"
 *   ]
 *
 * CLI usage — table output (Markdown):
 *   node "Docs/.github/functions/check-ai-layer-files.js" <base-path> \
 *     --table .github/copilot-instructions.md ...
 *
 * Sample console output (default):
 *   Base: /path/to/nextjs-feature-flag-exercise
 *
 *   ✅  .github/copilot-instructions.md
 *   ✅  .github/instructions/feature-flag-exercise.instructions.md
 *   ❌  .github/instructions/coding-agent.instructions.md        ← missing
 *   ✅  .github/agents/rdh-workflow-analyst.agent.md
 *   ❌  .github/agents/codebase-gap-analyst.agent.md             ← missing
 *   ✅  .github/skills/analyze-rdh-workflow/SKILL.md
 *   ...
 *
 *   Summary: 8 / 11 present — 3 missing.
 *   (exits with code 1 if any file is missing)
 *
 * Sample table output (--table flag):
 *   | File | Status |
 *   |---|---|
 *   | `.github/copilot-instructions.md` | ✅ present |
 *   | `.github/instructions/coding-agent.instructions.md` | ❌ missing |
 *
 * Programmatic usage (CommonJS):
 *   const { checkAiLayerFiles } = require('./check-ai-layer-files.js');
 *   const { pass, results } = checkAiLayerFiles('/abs/base', [
 *     '.github/copilot-instructions.md',
 *     '.github/workflows/copilot-setup-steps.yml',
 *   ]);
 *   // results[i]: { relativePath, absolutePath, exists }
 *
 * Replaces manual file existence evaluation repeated across:
 *   - story E0-S2 T0 "Current state vs target" table evaluation
 *   - story E0-S2 T5 sub-task 1 (AI Layer coverage checklist — items 3, 4, 5)
 *   - validate-ai-layer-coverage/SKILL.md  (steps 3–5: agents, skills, instructions)
 *   - Definition of Done checklist verification (E0-S2 §6)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Check whether a list of relative paths exist under a base directory.
 *
 * @param {string}   basePath       Absolute path to the repository root.
 * @param {string[]} relativePaths  Array of paths relative to `basePath`.
 * @returns {{
 *   pass:    boolean,
 *   present: number,
 *   missing: number,
 *   results: { relativePath: string, absolutePath: string, exists: boolean }[]
 * }}
 */
function checkAiLayerFiles(basePath, relativePaths) {
  const abs = path.resolve(basePath);

  const results = relativePaths.map((rel) => {
    const absolute = path.join(abs, rel);
    return {
      relativePath: rel,
      absolutePath: absolute,
      exists:       fs.existsSync(absolute),
    };
  });

  const present = results.filter((r) => r.exists).length;
  const missing = results.length - present;

  return {
    pass:    missing === 0,
    present,
    missing,
    results,
  };
}

/**
 * Format results as a Markdown table string.
 * @param {{ relativePath: string, exists: boolean }[]} results
 * @returns {string}
 */
function toMarkdownTable(results) {
  const rows = results.map((r) => {
    const status = r.exists ? '✅ present' : '❌ missing';
    return `| \`${r.relativePath}\` | ${status} |`;
  });
  return ['| File | Status |', '|---|---|', ...rows].join('\n');
}

// CLI entry point
if (require.main === module) {
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    console.error(
      'Usage:\n' +
      '  node check-ai-layer-files.js <base-path> <rel-path> [<rel-path> ...]\n' +
      '  node check-ai-layer-files.js <base-path> --manifest <manifest.json>\n' +
      '  node check-ai-layer-files.js <base-path> --table <rel-path> [...]'
    );
    process.exit(1);
  }

  const basePath   = argv[0];
  const tableMode  = argv.includes('--table');
  const manifestIdx = argv.indexOf('--manifest');

  let relativePaths = [];

  if (manifestIdx !== -1) {
    const manifestPath = argv[manifestIdx + 1];
    if (!manifestPath || !fs.existsSync(manifestPath)) {
      console.error(`ERROR: manifest file not found: ${manifestPath}`);
      process.exit(1);
    }
    try {
      relativePaths = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!Array.isArray(relativePaths)) throw new Error('Manifest must be a JSON array of strings.');
    } catch (e) {
      console.error(`ERROR: cannot read manifest: ${e.message}`);
      process.exit(1);
    }
  } else {
    // All remaining args that are not flags are relative paths
    relativePaths = argv.slice(1).filter((a) => !a.startsWith('--'));
  }

  if (relativePaths.length === 0) {
    console.error('ERROR: no relative paths provided.');
    process.exit(1);
  }

  let result;
  try {
    result = checkAiLayerFiles(basePath, relativePaths);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exit(1);
  }

  const { pass, present, missing, results } = result;

  if (tableMode) {
    console.log(toMarkdownTable(results));
  } else {
    const abs = path.resolve(basePath);
    console.log(`Base: ${abs}\n`);

    const maxLen = Math.max(...results.map((r) => r.relativePath.length));
    for (const r of results) {
      const padded = r.relativePath.padEnd(maxLen);
      const status = r.exists ? '✅' : '❌';
      const note   = r.exists ? '' : '  ← missing';
      console.log(`  ${status}  ${padded}${note}`);
    }

    const total   = results.length;
    const summary = `\nSummary: ${present} / ${total} present — ${missing} missing.`;
    if (!pass) {
      console.error(summary);
    } else {
      console.log(summary);
    }
  }

  if (!pass) process.exit(1);
}

module.exports = { checkAiLayerFiles, toMarkdownTable };
