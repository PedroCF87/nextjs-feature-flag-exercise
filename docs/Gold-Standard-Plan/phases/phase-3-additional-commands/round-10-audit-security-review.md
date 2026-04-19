# Phase 3 — Additional Commands: Round 10 — Audit `/security-review` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/security-review.md`
**Gold Standard concepts**: #25, #26, #27, #28, #29
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~289
- **Frontmatter**: `allowed-tools: Read, Grep, Glob, Bash(git:*, find:*, npm:audit, pnpm:audit, bun:*, cat:*, head:*)`; `argument-hint: [file or directory]`; `description: Security review against OWASP Top 10 — adapts to project stack`
- **Format**: XML-style tags (`<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`) — consistent with other commands
- **Structure**: 4 phases (DISCOVER STACK → ANALYZE → REPORT → SUMMARY) + 8 OWASP categories

### Current Content Summary
1. **`<objective>`**: Stack-adaptive OWASP Top 10 review; defaults to staged changes if no path
2. **`<context>`**: Auto-loads CLAUDE.md head, changed files, dependencies from `package.json`
3. **`<process>`** — 4 phases:
   - **Phase 1 DISCOVER STACK**: stack detection table (DB / Validation / Frontend / Backend / Auth / ORM) + file scope resolution
   - **Phase 2 ANALYZE**: 8 OWASP categories (Injection, Auth, Data Exposure, Resource Leaks, Error Handling, Input Validation, Crypto, Dependency) with severity-tagged checks
   - **Phase 3 REPORT**: finding structure (Category / Severity / File / Issue / Risk / Fix / Reference) + severity definitions table
   - **Phase 4 SUMMARY**: save to `.agents/security-reviews/security-review-{scope}-{date}.md`
4. **`<output>`**: structured markdown — Critical / High / Medium / Low / Info blocks + Stack-Specific Checks Applied + Dependency Audit + Verdict
5. **`<success_criteria>`**: 9 items — stack detection, adaptive checks, finding format, dependency audit, report persistence, verdict clarity

### Strengths Already Present
- **Stack-adaptive** — checks switch based on detected technologies (SQL.js, Zod, React) ✅
- **Project-aware SQL.js check** — explicitly calls out `stmt.free()` in Resource Leaks ✅
- **Severity ladder** with action guidance (Block merge / Fix before commit / Fix soon / Convenience / Note) ✅
- **Persisted reports** in `.agents/security-reviews/` ✅
- **Dependency audit** via package manager's `audit` command ✅
- **Stack-Specific Checks Applied** checklist in output — documents what was skipped and why ✅
- **Verdict** section forces a PASS / PASS WITH NOTES / FAIL decision ✅

### Bugs / Issues Spotted Before Audit
1. **Duplicate `## Phase 3: REPORT` header** on lines 157 and 161 — clearly a copy-paste error
2. **Indentation break** in stack detection table, line 31 (`| **Database** |`) — missing leading indentation under the ordered list, will render off-grid
3. **Phase 4 is titled "SUMMARY"** but its body is about saving the report — name mismatch (should be PERSIST)
4. **`allowed-tools` leaks**: `Bash(find:*, cat:*, head:*)` duplicates `Glob` and `Read` native tools — violates project tool-hygiene convention
5. **`Bash(bun:*)`** is overly broad — only `bun audit` is actually needed

---

## Concept-by-Concept Audit

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<objective>` states the principle; `<context>` auto-loads 3 signals; no explicit persona, no PIV positioning |
| **Process** | ⚠️ Partial | 4 phases with labels, but duplicate Phase 3 header + SUMMARY naming mismatch + no "no-changes-found" pre-condition |
| **Output** | ✅ Strong | Markdown template with Critical/High/Medium/Low blocks, Verdict, Action Items, Stack Checks Applied |

**Actions:**
- [ ] Add persona to `<objective>` (see #26)
- [ ] Remove duplicate `## Phase 3: REPORT` header (line 157 or 161)
- [ ] Rename Phase 4 SUMMARY → Phase 4 PERSIST (matches actual content)

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what context to load.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a security reviewer..." statement |
| PIV positioning | ❌ Missing | Not stated when this runs — before `/commit`? After `/implement`? Complement to `/review-pr`? |
| Pre-conditions | ⚠️ Partial | Fallback logic for `$ARGUMENTS`, but if no staged AND no unstaged changes AND no path, Phase 1 produces an empty scope silently |
| `$ARGUMENTS` clarity | ✅ Good | `[file or directory]` with default-to-staged documented in `<objective>` |
| Context loading | ✅ Good | CLAUDE.md head + changed files + dependencies extract |
| Project On-Demand Context | ❌ Missing | Does not auto-load `.agents/reference/backend.md` (where Express v5 + SQL.js patterns live on-demand) |
| Scope safety | ❌ Missing | No check/warning if `$ARGUMENTS` points to `.env`, `node_modules`, `.git`, or secret files — reviewing these could surface secrets into the report |

**Actions:**
- [ ] Add persona: "You are a security-focused code reviewer with an adversarial mindset. Your job is to find exploitable paths a malicious actor could take — not generic style issues."
- [ ] Add PIV positioning note: "Runs as a complement to `/review-pr` when the change touches security-sensitive surfaces (auth, input handling, SQL, secrets). Not part of the PIV forward chain — invoked on-demand or from `/review-pr` when a security cue is detected."
- [ ] Add `.agents/reference/backend.md` to `<context>` auto-load when present
- [ ] Add **pre-condition** at start of Phase 1: "If `$ARGUMENTS` is empty AND no staged changes AND no unstaged changes, STOP and reply: 'No scope to review. Pass a file/directory, or stage changes first.'"
- [ ] Add **scope safety**: "REFUSE to scan: `.env*`, `**/.git/**`, `**/node_modules/**`. If `$ARGUMENTS` matches these, STOP."

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, rigor.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered phases | ✅ Strong | 4 phases with VERB labels |
| Tools specified | ⚠️ Partial | `allowed-tools` uses shell `find:*`, `cat:*`, `head:*` — duplicates native `Glob`, `Read` |
| Stack adaptation | ✅ Strong | Detection table in Phase 1; categories explicitly conditional ("if database detected") |
| Project-specific gotchas — backend | ⚠️ Partial | SQL.js `stmt.free()` captured ✅; **Express v5 `next(error)` pattern NOT captured** as a security concern (try/catch that responds with `res.status().json()` bypasses centralized error handling — that's an Information Disclosure vector) |
| Project-specific gotchas — Zod | ⚠️ Partial | Zod mentioned generically; doesn't reference the project's `server/src/middleware/validation.ts` as the canonical boundary |
| Error handling — dependency audit fails | ❌ Missing | No instruction for what to do if `pnpm audit` fails to run or reports high-severity CVEs — STOP? FAIL verdict? |
| Finding dedup / aggregation | ❌ Missing | No guidance on aggregating repeated patterns (e.g., 10× `db.exec(` with user input) — risk of noisy report |
| Phase naming accuracy | ❌ Bug | Phase 3 header duplicated; Phase 4 misnamed SUMMARY (really is PERSIST) |

**Actions:**
- [ ] Tighten `allowed-tools` to: `Read, Grep, Glob, Write, Bash(git status:*), Bash(git diff:*), Bash(pnpm audit:*), Bash(npm audit:*), Bash(bun audit:*)`
  - Drop `find`, `cat`, `head` (use `Glob`, `Read`)
  - Drop broad `bun:*` in favor of specific `bun audit:*`
  - Add `Write` for persisting the report
- [ ] Add to **Error Handling** category: "Express v5 pattern: catch blocks that respond with `res.status().json()` instead of calling `next(error)` bypass the centralized error handler — **HIGH** (information disclosure risk)."
- [ ] Add to **Input Validation** category: "Zod pattern (this project): all request bodies must pass through `server/src/middleware/validation.ts` Zod schemas before reaching service methods. Raw `req.body` / `req.params` / `req.query` in a service is **HIGH**."
- [ ] Add to Phase 2 a **finding aggregation rule**: "If the same anti-pattern appears >3 times in the scope, report once with a file list instead of 3 separate entries (prevents report noise)."
- [ ] Add to Phase 2 Dependency category an **error handler**: "If `pnpm audit` reports Critical/High CVEs, the overall verdict is FAIL regardless of code findings."
- [ ] Remove duplicate `## Phase 3: REPORT` header; rename `## Phase 4: SUMMARY` → `## Phase 4: PERSIST`

---

### Concept #28 — Output Section Detail
> Structured, informative, chainable.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Structured finding format | ✅ Strong | Severity-grouped blocks with 7-field schema (Category / Severity / File / Issue / Risk / Fix / Reference) |
| Persisted report | ✅ Strong | `.agents/security-reviews/security-review-{scope}-{date}.md` |
| Stack-checks transparency | ✅ Strong | "Stack-Specific Checks Applied" checklist shows what ran vs skipped |
| Verdict | ✅ Present | PASS / PASS WITH NOTES / FAIL |
| Chain to remediation | ❌ Missing | Findings list a "Fix" snippet, but no chain back to `/implement` or `/rca` for Critical findings |
| User-facing summary | ⚠️ Partial | Report template is the full markdown file; there is no terse terminal-printed summary for the user (unlike `/rca` which has both) |

**Actions:**
- [ ] Add a **user-facing terminal summary** inside `<output>` (complementary to the saved report):
  ```
  Security Review Complete.

  File: .agents/security-reviews/security-review-{scope}-{date}.md

  Verdict: {PASS | PASS WITH NOTES | FAIL}
  Critical: {N}  High: {N}  Medium: {N}  Low: {N}

  Next steps:
  - If Critical or High: fix before `/commit`. Consider `/rca` for complex root causes.
  - If FAIL due to dependency CVE: run `pnpm audit --fix` or update the affected package.
  ```
- [ ] Add in the "Verdict" section a chain-to-next line: "If Critical findings exist, treat this as a block — do not run `/commit` until resolved."

---

### Concept #29 — Command Chaining
> How does `/security-review` integrate with the PIV Loop?

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Stated position in workflow | ❌ Missing | No mention of when this fires relative to other commands |
| Cue to invoke from `/review-pr` | ❌ Missing | `/review-pr` does not reference `/security-review` when sensitive files change |
| Blocks `/commit` on Critical | ⚠️ Partial | Severity table says "Block merge" for Critical, but `/commit`'s Phase 1 VALIDATE does not run `/security-review` — so a committer could skip it |
| Chains to `/rca` on Critical | ❌ Missing | No mention of `/rca` as a follow-up when the root cause is non-obvious |

**Actions:**
- [ ] State explicitly in `<objective>`: "Adjunct to `/review-pr`. Invoked on-demand, or automatically when a reviewer (human or agent) detects security-sensitive changes (auth, input handling, SQL, secrets management)."
- [ ] Chain cue in output verdict: "FAIL → blocks `/commit`. For non-obvious root causes of Critical findings, run `/rca <finding-summary>`."

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Security review against OWASP Top 10 — adapts to project stack" |
| `argument-hint` | ✅ Good | `[file or directory]` — clear and correct |
| `allowed-tools` | ⚠️ Redundant | Shell `find`, `cat`, `head` duplicate native tools; `bun:*` is too broad; no `Write` for report persistence |

**Actions:**
- [ ] Replace `allowed-tools` with: `Read, Grep, Glob, Write, Bash(git status:*), Bash(git diff:*), Bash(pnpm audit:*), Bash(npm audit:*), Bash(bun audit:*)`

---

## Action Plan Summary

### Priority 1 — Fix Bugs (header duplication + mis-named phase + indentation)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Remove duplicate `## Phase 3: REPORT` header | Bug |
| 1.2 | Rename `Phase 4: SUMMARY` → `Phase 4: PERSIST` | Bug / naming |
| 1.3 | Fix indentation of `**Database**` row in stack-detection table | Bug |

### Priority 2 — Input Detail (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add persona ("security-focused code reviewer with adversarial mindset") | #26 |
| 2.2 | Add PIV positioning: "adjunct to `/review-pr`; on-demand; blocks `/commit` on Critical" | #6, #26, #29 |
| 2.3 | Add `.agents/reference/backend.md` to `<context>` auto-load when present | #26 |
| 2.4 | Add pre-condition: empty-scope STOP | #26 |
| 2.5 | Add scope safety: refuse `.env*`, `node_modules`, `.git` | #26 |

### Priority 3 — Process Detail (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add Error Handling item: Express v5 `next(error)` bypass = HIGH (information disclosure) | #27 |
| 3.2 | Add Input Validation item: raw `req.body`/`params`/`query` in service layer = HIGH | #27 |
| 3.3 | Add Phase 2 aggregation rule: dedup repeated anti-patterns >3× | #27 |
| 3.4 | Add Dependency error rule: Critical/High CVE → FAIL verdict | #27 |

### Priority 4 — Output + Chaining (concepts #28, #29)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Add terminal user-facing summary (counts + next steps) | #28 |
| 4.2 | Verdict line chains to `/commit` (block on Critical) and `/rca` for non-obvious root causes | #29 |

### Priority 5 — Frontmatter

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Tighten `allowed-tools`: drop shell `find/cat/head`, add `Write`, scope `bun:*` → `bun audit:*` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference
2. `.claude/commands/security-review.md` — current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-10-audit-security-review.md` — this audit
4. `CLAUDE.md` — for project patterns to reference in checks

Rewrite `.claude/commands/security-review.md` with these requirements:

1. **Frontmatter** — replace `allowed-tools` with:
   `Read, Grep, Glob, Write, Bash(git status:*), Bash(git diff:*), Bash(pnpm audit:*), Bash(npm audit:*), Bash(bun audit:*)`
   Keep `description` and `argument-hint` unchanged.

2. **`<objective>`** — add persona at the top + PIV positioning:
   > You are a security-focused code reviewer with an adversarial mindset. Your job is to find exploitable paths a malicious actor could take — not generic style issues.
   >
   > **Position in workflow**: Adjunct to `/review-pr`. Invoked on-demand, or when a reviewer detects security-sensitive changes (auth, input handling, SQL, secrets). Critical findings BLOCK `/commit`.

   Keep the existing Principle line and default-to-staged behavior.

3. **`<context>`** — add after the existing three auto-loads:
   - `Backend reference: !test -f .agents/reference/backend.md && cat .agents/reference/backend.md || echo "(no backend reference)"`

4. **Phase 1 DISCOVER STACK** — add two pre-conditions at the top:
   - If `$ARGUMENTS` is empty AND no staged changes AND no unstaged changes: STOP with "No scope to review. Pass a file/directory or stage changes first."
   - If `$ARGUMENTS` matches `.env*`, `**/.git/**`, or `**/node_modules/**`: STOP with "Refusing to scan sensitive or generated paths."

   Fix the indentation of the `**Database**` row in the stack-detection table so it aligns with the other rows.

5. **Phase 2 ANALYZE** — additions:
   - Under **5. Error Handling**, add:
     `❌ **HIGH** (this project): Catch blocks that respond with `res.status().json()` instead of calling `next(error)` bypass the centralized Express v5 error handler — information disclosure risk.`
   - Under **6. Input Validation**, add:
     `❌ **HIGH** (this project): Raw `req.body` / `req.params` / `req.query` passed to services without going through the Zod schemas in `server/src/middleware/validation.ts`.`
   - At the end of Phase 2, add an **Aggregation Rule**:
     `If the same anti-pattern appears more than 3 times in the scope, report it once with a file list (prevents report noise).`
   - Under **8. Dependency & Configuration**, add:
     `If `pnpm audit` reports Critical or High severity CVEs, the overall Verdict is FAIL regardless of code findings.`

6. **Remove the duplicate `## Phase 3: REPORT` header** — keep only one.

7. **Rename `## Phase 4: SUMMARY` to `## Phase 4: PERSIST`** — content stays the same.

8. **`<output>`** — append a terminal user-facing summary block AFTER the markdown report template:
   ```
   ---

   ### Terminal Summary (printed to user)

   Security Review Complete.

   File: .agents/security-reviews/security-review-{scope}-{date}.md

   Verdict: {PASS | PASS WITH NOTES | FAIL}
   Critical: {N}   High: {N}   Medium: {N}   Low: {N}

   Next steps:
   - If Critical or High: fix before `/commit`.
   - If non-obvious root cause: run `/rca <finding>`.
   - If FAIL due to CVE: `pnpm audit --fix` or update the affected package.
   ```

9. **Update `<success_criteria>`** — append:
   - Pre-conditions honored (empty scope STOP, sensitive-path refusal)
   - Express v5 `next(error)` bypass check applied when backend files are in scope
   - Zod boundary check applied when route/service files are in scope
   - Terminal summary printed with verdict and counts

10. **Do NOT change**:
    - The OWASP 8-category structure
    - Severity definitions table
    - Stack detection table rows (only fix the indentation bug)
    - SQL.js `stmt.free()` Resource Leaks check
    - Report filename scheme

Do NOT change any source code. Only modify `.claude/commands/security-review.md`.
````

---

## Success Criteria

- [ ] Persona present in `<objective>` ("security-focused reviewer, adversarial mindset") (concept #26)
- [ ] PIV positioning stated: adjunct to `/review-pr`; blocks `/commit` on Critical (concepts #6, #29)
- [ ] `<context>` auto-loads `.agents/reference/backend.md` when present (concept #26)
- [ ] Phase 1 pre-conditions: empty-scope STOP + sensitive-path refusal (concept #26)
- [ ] Phase 1 stack-detection table indentation bug fixed
- [ ] Duplicate `## Phase 3: REPORT` header removed
- [ ] `Phase 4: SUMMARY` renamed to `Phase 4: PERSIST`
- [ ] Express v5 `next(error)` bypass check added under Error Handling (concept #27, project-specific)
- [ ] Zod boundary violation check added under Input Validation (concept #27, project-specific)
- [ ] Finding aggregation rule added (concept #27)
- [ ] CVE Critical/High → FAIL verdict rule added (concept #27)
- [ ] Terminal user-facing summary with verdict + counts + next steps (concepts #28, #29)
- [ ] Chain cues: `/commit` blocked on Critical; `/rca` suggested for non-obvious root causes (concept #29)
- [ ] `allowed-tools` tightened: drop shell `find/cat/head`, add `Write`, scope `bun` to `bun audit:*` (best practice)
- [ ] 8 OWASP categories, severity table, SQL.js `stmt.free()` check, report scheme unchanged ✅
