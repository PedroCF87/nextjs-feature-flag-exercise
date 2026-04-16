# Task E0-S2-T1 — Adapt and deploy global rules to fork

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S2-T1 |
| **Story** | [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `rules-bootstrap` |
| **Skill** | `global-rules-bootstrap` |
| **Depends on** | [E0-S2-T0 — Bootstrap AI Layer management artifacts](task-E0S2T0-bootstrap-ai-layer-management-artifacts.md) |
| **Blocks** | E0-S2-T5 |
| Created at | 2026-04-11 15:14:45 -03 |
| Last updated | 2026-04-14 17:00:00 -03 |

---

## 1) Task statement

> **Execution context:** T1 runs **locally in VS Code** (Epic 0 local execution model — no PR required).
> T0 artifacts must exist before this task starts.
> Define `REPO_ROOT` once at the start of any shell session:
> ```bash
> REPO_ROOT="$(git rev-parse --show-toplevel)"
> ```
> All paths in this task use `$REPO_ROOT`. T1 ends with a direct commit and push to `exercise-1`.

Produce a fork-scoped `copilot-instructions.md` for the personal fork of `nextjs-feature-flag-exercise` by adapting the workspace-level `docs/.github/copilot-instructions.md`. The fork-scoped version must replace the multi-repo workspace context with exercise-specific content and contain all 7 required sections defined in the `global-rules-bootstrap` skill. The file must be committed in this task — the execution plan ends with a commit and push to the fork.

**Target output file:** `nextjs-feature-flag-exercise/.github/copilot-instructions.md`

---

## 2) Verifiable expected outcome

1. `nextjs-feature-flag-exercise/.github/copilot-instructions.md` exists and is readable.
2. File contains all 7 required sections (Repository purpose, Tech stack table, Architecture / data flow, Validation commands, Branch rules, Commit convention, Key file reference table).
3. No workspace-relative paths remain (no references to `docs/`, `resident-health-workshop-resources/`, `nextjs-ai-optimized-codebase/`).
4. Tech stack section lists all 11 technologies from `AGENTS.md`: Node.js ESM, Express v5, SQL.js, Zod, Vitest, React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query v5, TypeScript strict.
5. Validation commands section includes both server (`cd server && pnpm run build && pnpm run lint && pnpm test`) and client (`cd client && pnpm run build && pnpm run lint`) commands.
6. Key file reference table contains at minimum the 7 entries from `AGENTS.md §Key Files Reference`.
7. Branch rules section explicitly states: `exercise-1` is the working base; never commit directly to `main`.

Check existence:
```bash
ls -la "nextjs-feature-flag-exercise/.github/copilot-instructions.md"
```
Expected exit code: `0`.

---

## 3) Detailed execution plan

### Step 1 — Read source documents

### Step 0 — Confirm T0 output exists (hard dependency)

Before running this task, confirm the companion skill and instruction artifacts created in T0 exist:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/skills/global-rules-bootstrap/SKILL.md" \
  ".github/instructions/coding-agent.instructions.md" \
  ".github/instructions/copilot-config-governance.instructions.md"
```

🔴 **Stop if any item shows `❌`**. Return to T0 and complete missing artifacts first.

### Step 1 — Read source documents

Read the following files using `read_file` (do not skip any — completeness depends on all three):
- `docs/.github/copilot-instructions.md` — workspace-level global rules (source for adaptation pattern)
- `nextjs-feature-flag-exercise/AGENTS.md` — canonical tech stack, data flow, key files, error classes, commands
- `nextjs-feature-flag-exercise/CLAUDE.md` — additional commands and architecture details

**Stop condition:** all three files read in full. Do not proceed until you have confirmed the Key Files Reference table from `AGENTS.md`.

### Step 2 — Apply the `global-rules-bootstrap` skill

Using the skill from `docs/.github/skills/global-rules-bootstrap/SKILL.md`, produce the 7-section `copilot-instructions.md`:

**Section 1 — Repository purpose:**
```
Single-repo exercise: nextjs-feature-flag-exercise.
Working branch: exercise-1 (base for all exercise work).
Current task: implement server-side feature flag filtering (see TASK.md).
Never commit directly to main.
```

**Section 2 — Tech stack table:**

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js (ESM) | Strict ES Modules — no `require()` |
| Backend framework | Express v5 | `next(error)` for all error propagation |
| Database | SQL.js (SQLite/WASM) | In-memory; always `stmt.free()` in `try/finally` |
| Validation | Zod | Schema-first — validate before service call |
| Testing | Vitest | `_resetDbForTesting()` in `beforeEach` + `afterEach` |
| Frontend framework | React 19 | — |
| Build tool | Vite | — |
| Styling | Tailwind CSS v4 | — |
| UI primitives | Radix UI | Headless accessible components |
| State management | TanStack Query v5 | `useQuery` / `useMutation` patterns |
| Language | TypeScript (strict) | No `any`; `import type` for type-only imports |

**Section 3 — Architecture / data flow:**
```
shared/types.ts
  → server/src/middleware/validation.ts (Zod schemas)
  → server/src/services/flags.ts (business logic, SQL.js queries)
  → server/src/routes/flags.ts (Express route handlers)
  → client/src/api/flags.ts (typed fetch wrappers)
  → React Query (useQuery / useMutation)
  → client/src/App.tsx (UI)
```

**Section 4 — Validation commands:**
```bash
# Server (from server/)
pnpm run build   # TypeScript type check
pnpm run lint    # ESLint
pnpm test        # Vitest

# Client (from client/)
pnpm run build   # tsc + vite build
pnpm run lint    # ESLint
```

**Section 5 — Branch rules:**
- Base branch: `exercise-1`
- Never push directly to `main`
- All exercise work on feature branches derived from `exercise-1`
- Use `git push origin HEAD` (not `git push origin main`)

**Section 6 — Commit convention:** Conventional Commits in English:
```
feat(flags): add server-side filtering by environment and status
fix(flags): resolve SQL.js statement leak in getAllFlags after filter
test(flags): add Vitest cases for multi-filter combination
```

**Section 7 — Key file reference table** (7 entries from `AGENTS.md §Key Files Reference`):

| Purpose | File |
|---|---|
| Types | `shared/types.ts` |
| Zod schemas | `server/src/middleware/validation.ts` |
| Error classes | `server/src/middleware/error.ts` |
| Flag service | `server/src/services/flags.ts` |
| Flag routes | `server/src/routes/flags.ts` |
| API client | `client/src/api/flags.ts` |
| Main UI | `client/src/App.tsx` |

### Step 3 — Write the file

Write `nextjs-feature-flag-exercise/.github/copilot-instructions.md` with the 7-section content above.

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place and preserve any valid exercise-scoped additions.

If the `.github/` directory does not yet exist in the fork, `create_file` with the full path will create it automatically.

### Step 4 — Validate content

Read the written file back using `read_file` and confirm:
- Exact file path is `nextjs-feature-flag-exercise/.github/copilot-instructions.md`.
- All 7 section headings are present.
- No `docs/`, `resident-health-workshop-resources/`, or `nextjs-ai-optimized-codebase/` strings remain.
- The key file table has exactly 7 rows.

**Stop condition:** all 4 checks pass. If any check fails, fix the file before marking this task Done.

### Step 5 — Commit and push

Commit and push the global rules file directly to `exercise-1`:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
git add .github/copilot-instructions.md
git status  # confirm only this file is staged
git commit -m "feat(ai-layer): deploy fork-scoped global copilot rules"
git push origin exercise-1
```

**Stop condition:** push succeeds. If `origin` is `dynamous-business/nextjs-feature-flag-exercise`, block — return to E0-S1-T1 and configure a personal fork first.

---

## 4) Architecture and security requirements

**Input validation:**
- Read source files with `read_file` — never reconstruct content from memory. The key file table in `AGENTS.md` is the authoritative source; write exactly those 7 entries.
- Confirm no forbidden strings remain before staging: search for `docs/`, `resident-health-workshop-resources`, `nextjs-ai-optimized-codebase` in the output file.

**Secrets handling:**
- `copilot-instructions.md` must not contain secret values, tokens, or API keys.
- References to credentials must use environment variable names only (e.g., `ANTHROPIC_API_KEY`).

**Rollback/fallback:**
- If the file is written with wrong content, rewrite it in place; if it is irrecoverably malformed, delete and recreate.
- The file lives in `nextjs-feature-flag-exercise/` which is outside `docs/agile/` — the VS Code Agent Hook does not cover it. No timeline entry needed for this file.

**Architecture boundary:**
- The `copilot-instructions.md` must apply only to the `nextjs-feature-flag-exercise` repository scope. Never copy workspace-level instructions that reference multi-repo context.
- Do not include Bun, Drizzle, Biome, Supabase, or Next.js — those belong to the Gold Standard codebase, not this exercise repo.

---

## 5) Validation evidence

### Command — Existence check

```bash
ls -la "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/.github/copilot-instructions.md"
```

**Expected exit code:** `0`
**Expected output:** file listed with size > 0 bytes.

### BDD verification signal

**Given** `nextjs-feature-flag-exercise/.github/copilot-instructions.md` does not exist
**When** I read `AGENTS.md`, apply the `global-rules-bootstrap` skill, and write the 7-section file to the fork's `.github/` directory
**Then** the file exists at the target path
**And** it contains all 7 required section headings
**And** `grep -c "docs/" nextjs-feature-flag-exercise/.github/copilot-instructions.md` returns `0` (no workspace-relative paths)
**And** the Key File Reference table contains exactly 7 rows matching `AGENTS.md §Key Files Reference`

**Affected files:**

| File | Action |
|---|---|
| `nextjs-feature-flag-exercise/.github/copilot-instructions.md` | Created and committed |

---

## 6) Definition of Done

- [x] `nextjs-feature-flag-exercise/.github/copilot-instructions.md` exists and is readable.
- [x] File contains all 7 required sections.
- [x] No workspace-relative paths (`docs/`, `resident-health-workshop-resources/`, `nextjs-ai-optimized-codebase/`) remain.
- [x] Tech stack table includes all 11 technologies from `AGENTS.md`.
- [x] Validation commands section has both server and client command blocks.
- [x] Key file reference table has the same 7 entries as `AGENTS.md §Key Files Reference`.
- [x] Branch rules explicitly name `exercise-1` as base and forbid direct pushes to `main`.
- [x] Committed directly to `exercise-1` (Epic 0 local execution rule — no PR required).
- [x] Pushed to `origin exercise-1`.
