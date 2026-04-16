---
name: file-timestamps
description: Obtain the real creation date (birthtime) and last modification date (mtime) of a file by running a Node.js script via the terminal. Use this skill whenever an agile artifact requires accurate Created at or Last updated timestamps — never guess or invent dates.
---

## Objective

Provide the **exact filesystem timestamps** of any agile artifact file by executing a Node.js one-liner in the terminal, reading `fs.statSync(path).birthtime` (creation) and `fs.statSync(path).mtime` (last modification), and formatting them as `YYYY-MM-DD HH:MM:SS -HH`.

> **Rule:** never invent, estimate, or copy timestamps from memory. Always run the script below and use the output.

---

## Technical basis

Node.js exposes filesystem metadata through the built-in `fs` module:

| Property | Source | Meaning |
|---|---|---|
| `stats.birthtime` | `fs.statSync(path).birthtime` | Timestamp when the file inode was first created on this filesystem |
| `stats.mtime` | `fs.statSync(path).mtime` | Timestamp of the last content modification |

**Linux caveat:** on many Linux ext4/xfs filesystems, `birthtime` reflects `ctime` (inode change time) rather than a true creation timestamp, because those filesystems do not store a native creation date. This is the most accurate value available without git or external tracking. Accept it as the operational "created at" for agile artifacts.

Reference: [Node.js `fs.stat()` documentation](https://nodejs.org/api/fs.html#fsstatsyncpath-options)

---

## The script

### Preferred usage — shared function file

Use the shared function instead of repeating the inline script:

```bash
# Single file
node "Docs/.github/functions/file-stats.js" "<ABSOLUTE_PATH>"

# Multiple files
node "Docs/.github/functions/file-stats.js" "<PATH_1>" "<PATH_2>" "<PATH_3>"
```

**Example output:**
```
birthtime: 2026-04-09 16:39:34 -03
mtime:     2026-04-09 17:05:25 -03
```

See `Docs/.github/functions/file-stats.js` for the full implementation.

### Inline fallback (when `Docs/.github/functions/` is not available)

Run this in the terminal, replacing `<ABSOLUTE_PATH>` with the full path to the artifact file:

```bash
node -e "
const fs = require('fs');
const stats = fs.statSync('<ABSOLUTE_PATH>');
const fmt = d => {
  const p = n => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const h = Math.floor(Math.abs(off) / 60);
  return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate())
    + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
    + ' ' + sign + p(h);
};
console.log('birthtime: ' + fmt(stats.birthtime));
console.log('mtime:     ' + fmt(stats.mtime));
"
```

**Example output:**
```
birthtime: 2026-04-09 16:39:34 -03
mtime:     2026-04-09 17:05:25 -03
```

---

### Batch script (for multiple files)

When populating timestamps for several artifacts at once, use this script. Save it temporarily as `/tmp/get-timestamps.mjs`, run it, then delete it.

```js
// /tmp/get-timestamps.mjs
import { statSync } from 'fs';

const files = [
  // Replace with the actual absolute paths of the artifacts to inspect:
  '/absolute/path/to/epic-0.md',
  '/absolute/path/to/epic-1.md',
  '/absolute/path/to/story-E0-S1.md',
];

const fmt = d => {
  const p = n => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const h = Math.floor(Math.abs(off) / 60);
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${sign}${p(h)}`;
};

for (const file of files) {
  try {
    const s = statSync(file);
    console.log(`\nFile: ${file}`);
    console.log(`  birthtime: ${fmt(s.birthtime)}`);
    console.log(`  mtime:     ${fmt(s.mtime)}`);
  } catch (e) {
    console.error(`  ERROR reading ${file}: ${e.message}`);
  }
}
```

Run with:
```bash
node /tmp/get-timestamps.mjs
```

---

## Process

### Step 1 — Run the script

Execute the one-liner (or batch script) for the target artifact file(s). Do not skip this step.

### Step 2 — Map output to metadata fields

| Script output field | Artifact metadata field | Rule |
|---|---|---|
| `birthtime` | `Created at` | Set once when first writing the file. Never overwrite on subsequent edits. |
| `mtime` | `Last updated` | Use the value **after** the current edit is saved (re-run the script post-save). |

### Step 3 — Update the artifact metadata block

Replace the placeholder or stale values in the artifact's `## Metadata` section:

```markdown
- **Created at:** 2026-04-09 16:39:34 -03
- **Last updated:** 2026-04-09 17:05:25 -03
```

### Step 4 — Pass to timeline-tracker

Forward the two timestamps to the `timeline-tracker` skill:
- `timestamp` field in the JSONL entry = `mtime` value (the time of the current action).
- `Created at` in the artifact = `birthtime` value (read once, never changed again).

---

## When to re-run the script

| Event | Run script? | Which field to update |
|---|---|---|
| First time creating an artifact file | ✅ Yes, after saving | Set both `Created at` (birthtime) and `Last updated` (mtime) |
| Editing an existing artifact | ✅ Yes, after saving the edit | Update `Last updated` (mtime) only — never touch `Created at` |
| Reading an artifact without editing | ❌ No | No metadata change needed |
| Adding the artifact to `timeline.jsonl` | ✅ Yes, to get the accurate `timestamp` | Read `mtime` as the entry's `timestamp` |

---

## Constraints

- **Never invent timestamps.** If the terminal is not available, block execution and request access before proceeding.
- **Never use `Date.now()` or `new Date()` as a substitute** for filesystem timestamps — these reflect when the agent ran, not when the file was created or last modified.
- **Always run the script after saving the file**, not before, so `mtime` reflects the actual write.
- On Linux, accept `birthtime` as the best available proxy for creation time even if it technically reflects `ctime`.
- Do not store the temporary batch script in the workspace — use `/tmp/` and delete after use.

---

## Quality checklist

- [ ] Script was executed in the terminal (not skipped)
- [ ] Output was read from terminal stdout, not inferred
- [ ] `Created at` uses `birthtime` from the script output
- [ ] `Last updated` uses `mtime` from the script output (read **after** saving the file)
- [ ] `Created at` was not overwritten if the file already had a value
- [ ] Timestamps passed to `timeline-tracker` match the script output exactly
