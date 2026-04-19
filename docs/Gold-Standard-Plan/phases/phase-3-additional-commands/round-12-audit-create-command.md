# Phase 3 — Additional Commands: Round 12 — Audit `/create-command` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/create-command.md`

**Gold Standard concepts**: #22, #23, #24, #25, #26, #27, #28

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~239
- **Frontmatter**: `allowed-tools: Write, Read, Grep, Glob`; `argument-hint: <command-name> <purpose description>`; `description: Meta command creator - generates slash commands following established patterns`
- **Format**: XML-style tags — consistent
- **Structure**: 5 phases (GATE → CLASSIFY → EXPLORE → GENERATE → VALIDATE)

### Current Content Summary
1. **`<objective>`**: Meta-persona ("You are Claude Code creating a command for Claude Code"); Meta Principle ("Write instructions you would want to receive"); Simplicity Principle ("Not everything needs to be a command")
2. **`<context>`**: Lists existing commands, loads CLAUDE.md, loads two reference commands (`commit.md` + `plan.md`)
3. **`<process>`** — 5 phases:
   - **Phase 1 GATE**: should-this-be-a-command table (one-time → just do it; simple → CLAUDE.md; repeatable multi-step → YES; team-shared → YES) + anti-patterns + STOP gate
   - **Phase 2 CLASSIFY**: TOOL vs WORKFLOW binary classification with size + examples
   - **Phase 3 EXPLORE**: read 2–3 existing commands of matching type; extract 5 pattern categories; CHECKPOINT
   - **Phase 4 GENERATE**: TOOL template + WORKFLOW template + Writing Rules (specificity, VERB names, `!`backticks, scoped tools, project-specific patterns)
   - **Phase 5 VALIDATE**: 5 quality checks (CLARITY, SPECIFICITY, RIGHT_SIZE, SCOPED_TOOLS, PATTERN_MATCH) + mental execution test + CHECKPOINT
4. **`<success_criteria>`**: 6 items — saved path, no confusion, specificity, complexity-matched, pattern-aligned, reports file path + usage

### Strengths Already Present
- **Meta-persona** makes self-referential capabilities explicit ("the agent executing this has your exact tools") ✅
- **GATE Phase 1** actively prevents command sprawl — recommends CLAUDE.md or "just do it" when appropriate ✅
- **TOOL vs WORKFLOW** binary classification enforces right-sizing ✅
- **Phase 3 EXPLORE** mandates pattern mirroring from existing commands — matches how `/plan` works ✅
- **Both templates** (TOOL + WORKFLOW) with concrete placeholders ✅
- **Specificity examples** (Bad vs Good) with project-specific SQL.js example ✅
- **Project-specific patterns** list embedded: validation command, data flow order, SQL.js constraints, `next(error)` ✅
- **Mental execution test** in Phase 5 ✅
- **Scoped tool examples** for `allowed-tools` teaching ✅

### Bugs / Issues Spotted Before Audit
1. **Template uses shell `grep`** (line 183): `grep -n "db.prepare" server/src/services/ | head -20` — but project convention (CLAUDE.md + Rounds 9–11 audits) is to use the native `Grep` tool. This teaches every new command to use the wrong approach.
2. **Template placeholder confusion**: TOOL template line 99 shows `{!`git status` or @relevant-file}` — `!`-backtick context is embedded inside a `{}` placeholder. Readers may copy `{!...}` literally instead of dropping the braces.
3. **`$ARGUMENTS` never demonstrated in body**: Templates use `{input}` / `<input>` as placeholders but never show where `$ARGUMENTS` literally appears in the generated command body.
4. **No `${ARGUMENTS:-default}` pattern taught**: This defaulting pattern is used in [commit.md](.claude/commands/commit.md), [create-rules.md](.claude/commands/create-rules.md), and recommended in the Round 8 `/create-pr` plan — but `/create-command` never teaches it.

---

## Concept-by-Concept Audit

### Concept #22 — Commands Are Markdown
> Slash commands are markdown files in `.claude/commands/` with YAML frontmatter. The format is: frontmatter + body.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Output is markdown in `.claude/commands/` | ✅ Present | `<success_criteria>`: "saved to `.claude/commands/{command-name}.md`" |
| Frontmatter with `description` | ✅ Present | Both templates include `description` |
| Frontmatter with `allowed-tools` | ✅ Present | Both templates include scoped `allowed-tools` |
| XML-style tag convention | ✅ Present | Phase 3 EXPLORE lists tags to extract |
| Filename rules | ❌ Missing | No instruction that filenames must be kebab-case (matches existing convention); no validation that `$ARGUMENTS` name is a valid filename |

**Actions:**
- [ ] Add filename convention rule to Phase 4 GENERATE: "Command names must be kebab-case (e.g., `create-pr`, `security-review`), lowercase ASCII + hyphens only, no spaces, no uppercase. If `$ARGUMENTS` command name violates this, normalize it and print the normalization."

---

### Concept #23 — Dynamic Parameters (`$ARGUMENTS`)
> Commands accept runtime input via `$ARGUMENTS`. Frontmatter `argument-hint` describes the expected shape; the body uses `$ARGUMENTS` where substitution happens.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `argument-hint` shown in templates | ✅ Present | Both templates have `argument-hint:` |
| `$ARGUMENTS` substitution demonstrated | ❌ **Missing** | Templates use `{input}` / `<input>` placeholders but never show `$ARGUMENTS` literally in the generated body. A new command author wouldn't know where `$ARGUMENTS` substitutes. |
| `${ARGUMENTS:-default}` pattern taught | ❌ **Missing** | This defaulting pattern is used in [commit.md](.claude/commands/commit.md:17), [create-rules.md](.claude/commands/create-rules.md:10) and recommended in Round 8 — but never taught here |
| Empty-input pre-condition taught | ❌ **Missing** | Rounds 9–11 consistently require "if `$ARGUMENTS` empty, STOP". `/create-command` never teaches this pattern, so new commands will miss it |
| Argument parsing when input is structured | ❌ Missing | No guidance on parsing multi-value `$ARGUMENTS` (e.g., `<command-name> <purpose>` — how does the command split?) |

**Actions:**
- [ ] Add a **"Dynamic Parameters (`$ARGUMENTS`)"** subsection to Phase 4 GENERATE Writing Rules with three patterns:
  1. **Direct substitution**: `Create a new slash command: $ARGUMENTS` — the literal string is inserted.
  2. **Defaulting**: `${ARGUMENTS:-CLAUDE.md}` — falls back when empty. Use for optional arguments.
  3. **Empty-input pre-condition**: At the top of Phase 1, add:
     ```
     If `$ARGUMENTS` is empty, STOP and reply: "Required: <expected shape>. Usage: /<command-name> <args>"
     ```
  4. **Multi-value parsing**: For `argument-hint: <name> <purpose>`, parse from `$ARGUMENTS` as "first whitespace token = name, remainder = purpose".
- [ ] Update both TOOL and WORKFLOW templates to include `$ARGUMENTS` literally at least once in the body, plus an example empty-input pre-condition.

---

### Concept #24 — Re-prompting Tax
> If you type the same multi-step request more than 2–3 times, you are paying a re-prompting tax. That's the signal to write a command.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Framed as "is this a command?" decision | ✅ Partial | GATE Phase 1 table asks the question but does not name the tax |
| Uses the "re-prompting tax" framing | ❌ Missing | The term and reasoning are absent; user has no mental model for why multi-step repetition costs more than the sum of its prompts |
| Threshold for decision | ❌ Missing | No numeric rule (e.g., "if you've typed this ≥3 times, it's a command") |

**Actions:**
- [ ] Replace Phase 1 GATE table first row with a re-prompting tax framing:
  ```
  **Re-prompting tax**: Every time you re-type a multi-step prompt, you pay: (a) the prompt cost, (b) context-loading cost, (c) human drift (slight variations in phrasing produce slight variations in output). If you've issued this same multi-step request ≥3 times, the tax has exceeded the cost of a command.
  ```
- [ ] Add a concrete rule: "**Threshold**: Create a command if you've re-prompted the same workflow ≥3 times, OR if ≥2 team members issue it, OR if the prompt is part of PIV Loop."

---

### Concept #25 — Input → Process → Output Structure
> Every command defines all three.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ✅ Strong | `<objective>` (meta-persona + principles) + `<context>` (4 loads) |
| **Process** | ✅ Strong | 5 phases with CHECKPOINTs + templates |
| **Output** | ⚠️ Partial | `<success_criteria>` strong, but no `<output>` block defining the terminal summary printed to the user |

**Actions:**
- [ ] Add terminal `<output>` block (see concept #28)

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, context.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | "You are Claude Code creating a command for Claude Code" — sharpest meta-persona in the codebase |
| Pre-condition: `$ARGUMENTS` non-empty | ❌ Missing | Ironically, this command teaches empty-input checks via #23 but doesn't apply one to itself |
| Pre-condition: file doesn't already exist | ❌ Missing | If user asks to create `plan` but `plan.md` exists, Phase 4 would silently overwrite (destructive-write risk — same issue as Round 11's `/create-rules`) |
| Context loading | ✅ Strong | Loads `commit.md` + `plan.md` as reference types (one TOOL, one WORKFLOW) |
| Meta-trigger note | ⚠️ Partial | Simplicity Principle states *when not* to create a command, but does not state the positive trigger beyond GATE |

**Actions:**
- [ ] Add to `<context>` a **pre-condition** block:
  > **Pre-conditions** (check before any work):
  > 1. If `$ARGUMENTS` is empty or missing a purpose description → STOP and print: `Usage: /create-command <command-name> <purpose>`
  > 2. If `.claude/commands/<command-name>.md` already exists → STOP and ask: `A command at <path> already exists. Choose: OVERWRITE (current backed up to .bak), MERGE (edit in place, preserve custom sections), or CANCEL.` If non-interactive, default to CANCEL.

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, evidence-first.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered VERB-labeled phases | ✅ Strong | GATE / CLASSIFY / EXPLORE / GENERATE / VALIDATE |
| CHECKPOINTs | ✅ Strong | Phases 3 and 5 have explicit CHECKPOINTs |
| Phase 3 mandates reading existing commands | ✅ Strong | "Read 2–3 commands of the matching type" — evidence-first |
| Templates for both types | ✅ Strong | TOOL + WORKFLOW |
| **Teaches shell `grep` (bug)** | ❌ **Bug** | Line 183 example: `grep -n "db.prepare" server/src/services/ | head -20` — propagates non-conventional tool use into every new command |
| Template placeholder hygiene | ⚠️ Bug | `{!`git status` or @relevant-file}` — `!`-backtick context mixed with `{}` placeholders is confusing |
| Project-specific patterns taught | ✅ Strong | Lines 202–206: validation command, data flow, SQL.js, `next(error)` — this is gold |
| Phase 5 VALIDATE has objective checks | ⚠️ Partial | 5 checks are all judgement calls (CLARITY/SPECIFICITY/RIGHT_SIZE/SCOPED_TOOLS/PATTERN_MATCH); no check that the generated file is syntactically valid (e.g., frontmatter parses, code fences balance) |

**Actions:**
- [ ] **Fix the shell-grep bug** (line 183): replace the grep example with `Grep` tool usage or a different specificity example. Suggested:
  ```markdown
  # Bad — vague
  Analyze the code for issues

  # Good — specific
  Use Grep to find `db.prepare(` without a matching `stmt.free()` in the same function:
  pattern: "db\.prepare\("
  path: "server/src/services/"
  Cross-reference each hit against `stmt.free()` in its enclosing try/finally.
  ```
- [ ] Fix template placeholder hygiene in Phase 4. Change `{!`git status` or @relevant-file}` to: `!\`git status --porcelain\`` (show the actual pattern without enclosing placeholder braces).
- [ ] Add an objective Phase 5 check: **FILE_VALIDATES** — "The written `.md` parses with valid YAML frontmatter (closed `---` delimiters), balanced code fences, and no broken XML tags."
- [ ] Add to Phase 5: **HAS_EMPTY_INPUT_GUARD** — "If the command declares `$ARGUMENTS`, the body includes an empty-input pre-condition."

---

### Concept #28 — Output Section Detail
> Structured, traceable, reports what was done.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File written | ✅ Present | Phase 4 writes to `.claude/commands/{command-name}.md` |
| Terminal summary to user | ❌ Missing | No `<output>` block defining the shape; `<success_criteria>` says "Report includes file path, usage example, type classification, 'test it' prompt" — but the shape is only described, not templated |
| Chain hint | ⚠️ Partial | "test it" mentioned in success criteria but not templated with the actual `/{command-name}` invocation pattern |

**Actions:**
- [ ] Add a terminal `<output>` block:
  ```
  Command Created.

  Path: .claude/commands/{command-name}.md
  Type: {TOOL | WORKFLOW}
  Lines: {count}
  Allowed tools: {scoped list}
  Accepts `$ARGUMENTS`: {yes | no}
  Previous command at path: {overwritten — backed up to .bak | no prior file}

  Test it now:
  /{command-name} {example args matching argument-hint}

  Next steps:
  1. Invoke the command with a real input to smoke-test.
  2. If the command is part of the PIV chain, update the upstream/downstream command's Output section to reference it (see Rounds 5 and 8 for precedent).
  3. Commit with `/commit` scope `ai-layer`.
  ```

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Meta command creator - generates slash commands following established patterns" |
| `argument-hint` | ✅ Good | `<command-name> <purpose description>` — well-typed |
| `allowed-tools` | ✅ Clean | `Write, Read, Grep, Glob` — minimal, no shell leaks (notably clean compared to create-rules/security-review) |

**Actions:**
- [ ] Add `Bash(ls:*)` (currently called via `!\`ls -la .claude/commands/\`` in `<context>` but not declared) and `Bash(cp:*)` (for the `.bak` backup introduced by the pre-condition). Without declarations, those `!`-expansions may fail.

---

## Action Plan Summary

### Priority 1 — Fix the Shell-grep Propagation Bug (concept #27) — headline

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Replace shell-grep example in Writing Rules with native `Grep` tool usage | #27 |
| 1.2 | Fix template placeholder: remove `{...}` around `!`-backtick context | #27 |

### Priority 2 — Teach `$ARGUMENTS` Properly (concept #23)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add "Dynamic Parameters" subsection to Writing Rules with: direct substitution, defaulting (`${ARGUMENTS:-default}`), empty-input pre-condition, multi-value parsing | #23 |
| 2.2 | Update both templates to include `$ARGUMENTS` literally and an empty-input STOP pattern | #23 |

### Priority 3 — Pre-conditions & Destructive-Write Safety (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add `$ARGUMENTS` empty-input pre-condition to `<context>` | #26 |
| 3.2 | Add file-exists pre-condition with OVERWRITE/MERGE/CANCEL + `.bak` on overwrite | #26 |
| 3.3 | Add filename normalization rule (kebab-case only) to Phase 4 | #22 |

### Priority 4 — Re-prompting Tax Framing (concept #24)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Replace Phase 1 GATE first row with re-prompting-tax framing + concrete threshold (≥3 re-prompts or ≥2 team members or PIV-chain candidate) | #24 |

### Priority 5 — Output Polish + Objective Checks (concepts #27, #28)

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Add terminal `<output>` block with type, path, test-it invocation, next steps | #28 |
| 5.2 | Add Phase 5 objective checks: FILE_VALIDATES (YAML + fences), HAS_EMPTY_INPUT_GUARD | #27 |

### Priority 6 — Frontmatter

| # | Action | Concept |
|---|--------|---------|
| 6.1 | Add `Bash(ls:*)` (already used in `<context>`) and `Bash(cp:*)` (for `.bak` backup) to `allowed-tools` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§22, §23, §24)
2. `.claude/commands/create-command.md` — current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-12-audit-create-command.md` — this audit
4. `.claude/commands/commit.md` and `.claude/commands/create-rules.md` — precedents for `${ARGUMENTS:-default}` pattern
5. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-11-audit-create-rules.md` — precedent for destructive-write safety pattern

Rewrite `.claude/commands/create-command.md` with these requirements:

1. **Frontmatter** — update `allowed-tools` to:
   `Write, Read, Grep, Glob, Bash(ls:*), Bash(cp:*)`
   Keep `description` and `argument-hint` unchanged.

2. **`<objective>`** — keep existing meta-persona and principles. Unchanged.

3. **`<context>`** — keep the 4 existing loads. Add a **Pre-conditions** block before `<process>` begins (or inline at the start of Phase 1):
   > **Pre-conditions** (check before any work):
   > 1. If `$ARGUMENTS` is empty or doesn't contain both name and purpose → STOP. Reply: `Usage: /create-command <command-name> <purpose>`
   > 2. Normalize the command name: lowercase, kebab-case, ASCII only. If the original differs from the normalized form, print the normalization and use the normalized form.
   > 3. If `.claude/commands/<normalized-name>.md` already exists → STOP and ask: `A command at that path already exists. Choose: OVERWRITE (current backed up to .bak), MERGE (preserve custom sections), or CANCEL.` If non-interactive, default to CANCEL.

4. **Phase 1 GATE** — replace the first table row with a re-prompting-tax framing:
   > **The Re-prompting Tax**: Every time you re-type a multi-step prompt you pay three costs: the prompt itself, context-loading (the agent must re-read files every time), and human drift (slight phrasing changes produce different outputs). If the same multi-step request has been issued ≥3 times OR is part of the PIV Loop OR is shared across the team → the tax has already exceeded the one-time cost of writing a command. Create it.

   Keep the remaining table rows and the GATE/STOP behavior.

5. **Phase 4 GENERATE — Writing Rules section** — apply these fixes:

   **a.** Replace the shell-grep Bad/Good example with a native-tool example:
   ```
   # Bad — vague
   Analyze the code for issues

   # Good — specific
   Use the Grep tool to find `db.prepare(` without `stmt.free()` in the enclosing function:
   - pattern: "db\.prepare\("
   - path: "server/src/services/"
   Then cross-reference each hit against the nearest `stmt.free()` in a try/finally.
   ```

   **b.** Add a new subsection **Dynamic Parameters (`$ARGUMENTS`)** right after "Dynamic context via `!` backticks":
   ```
   **Dynamic parameters via `$ARGUMENTS`:**

   | Pattern | When | Example |
   |---------|------|---------|
   | Direct substitution | Required input | `Create a new command: $ARGUMENTS` |
   | Defaulting | Optional input with fallback | `${ARGUMENTS:-CLAUDE.md}` |
   | Empty-input guard | Required input — fail closed | At top of Phase 1: `If $ARGUMENTS is empty, STOP and reply: "Usage: /<name> <expected>"` |
   | Multi-value parsing | `argument-hint: <a> <b>` | First whitespace token = a; remainder = b |

   **Every command that declares `$ARGUMENTS` must include an empty-input pre-condition** — this is a project-wide convention (see `/rca`, `/create-rules`, `/security-review`).
   ```

6. **Phase 4 GENERATE — TOOL template** — update the template to demonstrate `$ARGUMENTS`:
   ```markdown
   ---
   allowed-tools: {minimum set}
   description: {One line}
   argument-hint: <input>
   ---

   <objective>
   {What this does — 2-3 lines}. Input: `$ARGUMENTS`
   </objective>

   <context>
   {Only if dynamic state needed}
   Status: !`git status --porcelain`
   </context>

   <process>
   Pre-condition: If `$ARGUMENTS` is empty, STOP and reply: `Usage: /<name> <input>`.

   1. {Step one — reference `$ARGUMENTS` where used}
   2. {Step two}
   3. {Report result}
   </process>

   <success_criteria>
   {Single sentence}
   </success_criteria>
   ```

7. **Phase 4 GENERATE — WORKFLOW template** — same updates:
   - Fix the placeholder hygiene: change `{!`git status` or @relevant-file}` to `!\`git status --porcelain\`` (no braces around the backtick context).
   - Add a pre-condition line at the top of Phase 1 showing the empty-input STOP pattern.
   - Reference `$ARGUMENTS` literally at least once in the body.

8. **Phase 5 VALIDATE** — extend the check table with two **objective** checks (in addition to the existing 5):
   | FILE_VALIDATES | The written `.md` has closed YAML frontmatter, balanced code fences, balanced XML tags |
   | HAS_EMPTY_INPUT_GUARD | If the command declares `$ARGUMENTS`, the body includes an empty-input STOP pre-condition |

9. **Add terminal `<output>` block** after `<process>`, before `<success_criteria>`:
   ```
   Command Created.

   Path: .claude/commands/{normalized-name}.md
   Type: {TOOL | WORKFLOW}
   Lines: {count}
   Allowed tools: {scoped list}
   Accepts `$ARGUMENTS`: {yes — <shape> | no}
   Previous command at path: {overwritten — backed up to .bak | no prior file}

   Test it now:
   /{normalized-name} {example args matching argument-hint}

   Next steps:
   1. Invoke with a real input to smoke-test.
   2. If the command is part of the PIV chain, update the upstream or downstream command's Output section to reference it (see Rounds 5 and 8 for precedent).
   3. Commit with `/commit` scope `ai-layer`.
   ```

10. **`<success_criteria>`** — append:
    - Pre-conditions honored (empty-input STOP; name normalization; destructive-write safety)
    - Command body references `$ARGUMENTS` where the command accepts input (concept #23)
    - Phase 5 FILE_VALIDATES and HAS_EMPTY_INPUT_GUARD checks pass (concept #27)
    - Terminal summary printed (concept #28)

11. **Do NOT change**:
    - Meta-persona ("You are Claude Code creating a command for Claude Code")
    - Meta Principle and Simplicity Principle
    - TOOL vs WORKFLOW classification rules
    - Phase 3 EXPLORE pattern-mirroring requirement
    - Project-specific patterns list (validation command, data flow, SQL.js, `next(error)`)
    - Existing CHECKPOINTs

Do NOT change any source code. Only modify `.claude/commands/create-command.md`.
````

---

## Success Criteria

- [ ] Shell-grep example in Writing Rules replaced with native `Grep` tool usage (concept #27 — fixes bug that propagates to every new command)
- [ ] Template placeholder hygiene fixed: no `{}` braces around `!`-backtick context (concept #27)
- [ ] Re-prompting Tax framing present in Phase 1 GATE with concrete threshold (concept #24)
- [ ] Empty-input STOP pre-condition applied to `/create-command` itself (concept #26)
- [ ] File-exists pre-condition with OVERWRITE/MERGE/CANCEL + `.bak` (concept #26)
- [ ] Filename normalization rule (kebab-case only) (concept #22)
- [ ] "Dynamic Parameters (`$ARGUMENTS`)" subsection added with 4 patterns (concept #23)
- [ ] Both TOOL and WORKFLOW templates reference `$ARGUMENTS` literally + include empty-input guard (concept #23)
- [ ] Phase 5 objective checks added: FILE_VALIDATES + HAS_EMPTY_INPUT_GUARD (concept #27)
- [ ] Terminal `<output>` block with type, path, test-it invocation, next steps (concept #28)
- [ ] `allowed-tools` extended with `Bash(ls:*)` (already used) and `Bash(cp:*)` (for `.bak`) (best practice)
- [ ] Meta-persona, Meta Principle, Simplicity Principle, TOOL/WORKFLOW classification, Phase 3 EXPLORE, project-specific patterns preserved ✅
