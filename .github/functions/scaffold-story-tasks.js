#!/usr/bin/env node
/**
 * scaffold-story-tasks.js
 *
 * Creates a complete task-file pack from a story file section "## 4) Tasks".
 * It extracts each heading:
 *   ### Task E0-S1-T0 — Title
 *
 * and writes detailed task markdown files to Docs/agile/tasks/.
 *
 * CLI:
 *   node "Docs/.github/functions/scaffold-story-tasks.js" <abs-story-file> <abs-agile-dir> [--dry-run] [--overwrite]
 *
 * Example:
 *   node "Docs/.github/functions/scaffold-story-tasks.js" \
 *     "/workspace/Docs/agile/stories/story-E0S1-repository-diagnosis.md" \
 *     "/workspace/Docs/agile" --overwrite
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function usage() {
  console.error('Usage: node "Docs/.github/functions/scaffold-story-tasks.js" <abs-story-file> <abs-agile-dir> [--dry-run] [--overwrite]');
}

function getNow(datetimeJsPath) {
  try {
    return cp.execFileSync('node', [datetimeJsPath], { encoding: 'utf8' }).trim();
  } catch {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const hh = pad(Math.floor(Math.abs(off) / 60));
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${sign}${hh}`;
  }
}

function extractMeta(md, key) {
  const re = new RegExp(`\\|\\s*\\*\\*${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\*\\*\\s*\\|\\s*(.*?)\\s*\\|`, 'i');
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

function extractStoryTitle(md) {
  const m = md.match(/^#\s+Story\s+(E\d+-S\d+)\s+—\s+(.+)$/m);
  if (!m) return { id: '', title: '' };
  return { id: m[1], title: m[2].trim() };
}

function normalizeDependsOn(raw) {
  const value = (raw || '').trim();
  if (!value || value === '—') return '—';
  return value;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sanitizeAgentList(value) {
  if (!value) return '`agile-exercise-planner`';
  return value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .map(v => v.startsWith('`') ? v : `\`${v.replace(/`/g, '')}\``)
    .join(', ');
}

function parseTaskBlocks(storyMd) {
  const lines = storyMd.split('\n');
  const tasks = [];

  let i = 0;
  while (i < lines.length) {
    const heading = lines[i].match(/^###\s+Task\s+(E\d+-S\d+-T\d+)\s+—\s+(.+)$/);
    if (!heading) {
      i++;
      continue;
    }

    const id = heading[1].trim();
    const title = heading[2].trim();
    const start = i;
    i++;

    while (i < lines.length && !/^###\s+Task\s+E\d+-S\d+-T\d+\s+—\s+/.test(lines[i]) && !/^##\s+5\)/.test(lines[i])) {
      i++;
    }

    const block = lines.slice(start, i).join('\n').trim();
    tasks.push({ id, title, block });
  }

  return tasks;
}

function extractFieldFromBlock(block, fieldName) {
  const re = new RegExp(`^\\*\\*${fieldName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}:\\\*\\*\\s*(.+)$`, 'im');
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

function buildTaskFileContent({
  task,
  storyRelPath,
  storyId,
  storyTitle,
  epic,
  priority,
  responsibleAgent,
  createdAt,
}) {
  const goal = extractFieldFromBlock(task.block, 'Goal') || 'Deliver the task outcomes exactly as specified in the parent story.';
  const dependsOn = normalizeDependsOn(extractFieldFromBlock(task.block, 'depends_on'));

  // Keep the source content with strong detail, but strip heading to avoid duplication.
  const sourceBody = task.block
    .replace(/^###\s+Task\s+E\d+-S\d+-T\d+\s+—\s+.+\n?/m, '')
    .trim();

  return `# Task ${task.id} — ${task.title}

## Metadata

| Field | Value |
|---|---|
| **ID** | ${task.id} |
| **Story** | [${storyId} — ${storyTitle}](${storyRelPath}) |
| **Epic** | ${epic || '—'} |
| **Priority** | ${priority || 'P1'} |
| **Status** | Draft |
| **Responsible agent** | ${responsibleAgent} |
| **Depends on** | ${dependsOn} |
| **Blocks** | — |
| Created at | ${createdAt} |
| Last updated | ${createdAt} |

---

## 1) Task statement

As a delivery agent, I want to execute ${task.id} with complete traceability and explicit validation so that the parent story can progress without ambiguity.

---

## 2) Verifiable expected outcome

- A concrete deliverable exists for this task and is linked in this document.
- All required sections from the task definition are fully populated (no placeholders).
- Validation evidence is attached with command outputs and/or file references.

---

## 3) Detailed execution plan

${sourceBody || '_No source body found in story task block. Populate manually before execution._'}

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed:
- Exit code(s):
- Output summary:
- Files created/updated:
- Risks found / mitigations:

### Given / When / Then checks

- **Given** all task dependencies are available and validated,
- **When** this task execution plan is completed and evidence is collected,
- **Then** the task outcome is reproducible, secure, and auditable by another agent.

---

## 6) Definition of Done

- [ ] Expected outcome is objectively verifiable.
- [ ] Dependencies are explicit and valid.
- [ ] Security and architecture checks were performed.
- [ ] Validation evidence is attached.
- [ ] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved:
- Downstream items unblocked:
- Open risks (if any):
`;
}

function main() {
  const args = process.argv.slice(2);
  const storyFile = args[0];
  const agileDir = args[1];
  const dryRun = args.includes('--dry-run');
  const overwrite = args.includes('--overwrite');

  if (!storyFile || !agileDir || !path.isAbsolute(storyFile) || !path.isAbsolute(agileDir)) {
    usage();
    process.exit(1);
  }

  if (!fs.existsSync(storyFile)) {
    console.error(`❌ Story file not found: ${storyFile}`);
    process.exit(1);
  }

  const tasksDir = path.join(agileDir, 'tasks');
  const datetimeJs = path.join(path.resolve(__dirname), 'datetime.js');
  const now = getNow(datetimeJs);

  const storyMd = fs.readFileSync(storyFile, 'utf8');
  const { id: storyId, title: storyTitle } = extractStoryTitle(storyMd);
  const epic = extractMeta(storyMd, 'Epic');
  const priority = extractMeta(storyMd, 'Priority') || 'P1';
  const responsibleAgent = sanitizeAgentList(extractMeta(storyMd, 'Responsible agent'));

  if (!storyId) {
    console.error('❌ Could not parse story ID/title from H1 heading.');
    process.exit(1);
  }

  const taskBlocks = parseTaskBlocks(storyMd);
  if (taskBlocks.length === 0) {
    console.error('❌ No task blocks found in section "## 4) Tasks".');
    process.exit(1);
  }

  if (!dryRun && !fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }

  const storyFileName = path.basename(storyFile);
  const storyRelPath = `../stories/${storyFileName}`;

  console.log(`📦 Story: ${storyId} — ${storyTitle}`);
  console.log(`🧩 Tasks found: ${taskBlocks.length}`);

  let created = 0;
  let skipped = 0;

  for (const task of taskBlocks) {
    const compactId = task.id.replace(/-/g, '');
    const fileName = `task-${compactId}-${slugify(task.title)}.md`;
    const outPath = path.join(tasksDir, fileName);

    if (fs.existsSync(outPath) && !overwrite) {
      console.log(`⏭️  Skip (exists): ${outPath}`);
      skipped++;
      continue;
    }

    const content = buildTaskFileContent({
      task,
      storyRelPath,
      storyId,
      storyTitle,
      epic,
      priority,
      responsibleAgent,
      createdAt: now,
    });

    if (dryRun) {
      console.log(`🧪 [dry-run] Would write: ${outPath}`);
    } else {
      fs.writeFileSync(outPath, content, 'utf8');
      console.log(`✅ Created: ${outPath}`);
    }
    created++;
  }

  console.log(`\nDone. created=${created} skipped=${skipped} dryRun=${dryRun}`);
  if (!dryRun) {
    console.log('Next steps:');
    console.log(`1) Review task files in ${tasksDir}`);
    console.log(`2) Run: node "Docs/.github/functions/validate-task-pack.js" "${agileDir}" --story "${storyId}"`);
    console.log(`3) Run: node "Docs/.github/functions/sync-backlog-index.js" "${agileDir}"`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseTaskBlocks,
  extractMeta,
  extractStoryTitle,
  buildTaskFileContent,
};
