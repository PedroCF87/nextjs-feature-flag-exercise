#!/usr/bin/env node
/**
 * validate-task-pack.js
 *
 * Validates quality, completeness, and safety signals of agile task files.
 *
 * CLI:
 *   node "Docs/.github/functions/validate-task-pack.js" <abs-agile-dir> [--story E0-S1]
 *
 * Exit codes:
 *   0 => all checks passed
 *   1 => at least one task failed validation
 */

'use strict';

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node "Docs/.github/functions/validate-task-pack.js" <abs-agile-dir> [--story E0-S1]');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const agileDir = args[0];
  const storyIdx = args.indexOf('--story');
  const storyId = storyIdx !== -1 ? args[storyIdx + 1] : null;
  return { agileDir, storyId };
}

function requiredMetaRows() {
  return [
    '**ID**',
    '**Priority**',
    '**Status**',
    '**Responsible agent**',
    '**Depends on**',
    '**Blocks**',
    'Created at',
    'Last updated',
  ];
}

function requiredSections() {
  return [
    '## 1) Task statement',
    '## 2) Verifiable expected outcome',
    '## 3) Detailed execution plan',
    '## 4) Architecture and security requirements',
    '## 5) Validation evidence',
    '## 6) Definition of Done',
  ];
}

function placeholderRegex() {
  return /\b(TODO|TBD|<placeholder>|\.{3})\b/i;
}

/**
 * Strip inline code spans (backtick-delimited) and fenced code blocks before
 * checking for placeholder patterns. This avoids false positives where `...`
 * appears inside URLs or code literals (e.g., `compare/exercise-1...exercise-2`).
 */
function stripCodeSpans(md) {
  // Remove fenced code blocks (``` ... ```)
  let stripped = md.replace(/```[\s\S]*?```/g, '');
  // Remove inline code spans (` ... `)
  stripped = stripped.replace(/`[^`\n]+`/g, '');
  return stripped;
}

function hasGwt(md) {
  return /Given[\s\S]*When[\s\S]*Then/i.test(md);
}

function hasSecuritySignals(md) {
  // Extract section 4 content specifically to avoid trivially matching
  // 'validation' from section headers like '## 2) Verifiable expected outcome'.
  const section4Match = md.match(/## 4\).*?(?=## 5\)|$)/s);
  const scope = section4Match ? section4Match[0].toLowerCase() : md.toLowerCase();
  const signals = ['parameterized', 'secrets', 'rollback', 'validation', 'security', 'injection', 'sanitize'];
  const matched = signals.filter(s => scope.includes(s));
  return matched.length >= 2;
}

function validateFile(filePath, storyId) {
  const md = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  if (storyId && !md.includes(`| **Story** | [${storyId}`)) {
    errors.push(`Story link does not match --story ${storyId}`);
  }

  for (const row of requiredMetaRows()) {
    if (!md.includes(`| ${row} |`)) {
      errors.push(`Missing metadata row: ${row}`);
    }
  }

  if (!/\| \*\*Status\*\* \| (Draft|In Progress|Done|Blocked) \|/i.test(md)) {
    errors.push('Invalid or missing status value');
  }

  if (!/\| \*\*Priority\*\* \| P[0-3] \|/i.test(md)) {
    errors.push('Invalid or missing priority value');
  }

  for (const s of requiredSections()) {
    if (!md.includes(s)) {
      errors.push(`Missing section: ${s}`);
    }
  }

  if (placeholderRegex().test(stripCodeSpans(md))) {
    errors.push('Contains placeholders (TODO/TBD/<placeholder>/...)');
  }

  if (!hasSecuritySignals(md)) {
    errors.push('Missing security-related guidance signals');
  }

  if (!hasGwt(md)) {
    errors.push('Missing Given/When/Then validation structure');
  }

  return errors;
}

function main() {
  const { agileDir, storyId } = parseArgs(process.argv);
  if (!agileDir || !path.isAbsolute(agileDir)) {
    usage();
    process.exit(1);
  }

  const tasksDir = path.join(agileDir, 'tasks');
  if (!fs.existsSync(tasksDir)) {
    console.error(`❌ Tasks directory not found: ${tasksDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(tasksDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(tasksDir, f));

  if (files.length === 0) {
    console.error('❌ No task markdown files found.');
    process.exit(1);
  }

  // When --story is provided, validate only tasks that belong to that story.
  const scopedFiles = storyId
    ? files.filter((file) => {
      const md = fs.readFileSync(file, 'utf8');
      return md.includes(`| **Story** | [${storyId}`);
    })
    : files;

  if (storyId && scopedFiles.length === 0) {
    console.error(`❌ No task files found for --story ${storyId}.`);
    process.exit(1);
  }

  let failCount = 0;
  let passCount = 0;

  for (const file of scopedFiles) {
    const errs = validateFile(file, storyId);
    if (errs.length === 0) {
      console.log(`✅ ${path.basename(file)}`);
      passCount++;
    } else {
      console.log(`❌ ${path.basename(file)}`);
      for (const err of errs) {
        console.log(`   - ${err}`);
      }
      failCount++;
    }
  }

  console.log(`\nSummary: pass=${passCount} fail=${failCount}`);
  if (failCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateFile };
