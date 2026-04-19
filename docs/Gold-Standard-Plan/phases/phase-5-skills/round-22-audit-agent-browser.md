# Phase 5 — Skills: Round 22 — Audit `agent-browser` Skill

**Target file**: `nextjs-feature-flag-exercise/.claude/skills/agent-browser/SKILL.md`
**Gold Standard concepts**: #25 (Input → Process → Output), #32 (Prompt Structure for Setup Steps: Context Ref → Install → Implement → Validate → Commit)
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~333
- **Frontmatter**:
  - `name: agent-browser`
  - `description`: Automates browser interactions for testing the feature flag UI — navigating pages, operating filter controls, filling forms, taking screenshots, clicking buttons, verifying DOM state. Use when: testing at `localhost:3000`, verifying filters, taking screenshots, performing E2E checks
  - `allowed-tools: Bash(agent-browser:*)`
- **Format**: Markdown headers (`##`) — skills use a different format from commands (no XML tags, no `<process>`/`<output>`) and from agents (no YAML frontmatter body fields like `model`, `tools`, `color`)
- **Structure**: Purpose → When to Use → Prerequisites → Quick Start → Core Workflow → Commands Reference → Project-Specific Recipes → Integration with Commands → Constraints

### Current Content Summary

Section-by-section breakdown of the skill file:

1. **Frontmatter** (lines 1–4): Three fields only — `name`, `description`, `allowed-tools`. The description is trigger-oriented (names specific interactions: "filter controls", "flag creation/edit form", "DOM state after CRUD operations"). `allowed-tools: Bash(agent-browser:*)` is the most scoped tool declaration in the codebase — only the single CLI tool is accessible.

2. **Purpose** (lines 6–11): "Automate browser interactions for testing the feature flag management UI" — names the specific purpose (flag management UI) and lists 7 specific interaction types (navigate, filter controls, form filling, screenshots, buttons, DOM verification, E2E smoke tests).

3. **When to Use** (lines 13–20): 7 bullet points covering: testing at `localhost:3000`, filter dropdowns, name search, screenshot capture, form modal, table rendering after CRUD, E2E smoke tests after implementation.

4. **Prerequisites** (lines 22–37): 3 prerequisites with code blocks:
   - Playwright: `npx playwright install chromium`
   - Dev servers: `cd server && pnpm dev` (3001) + `cd client && pnpm dev` (3000)
   - Screenshots directory: `mkdir -p .agents/screenshots`

5. **Quick Start** (lines 39–50): 5-command orientation sequence with actual `agent-browser` syntax (open, snapshot, click, fill, screenshot, close).

6. **Core Workflow** (lines 52–60): 6-step canonical loop with numbered steps:
   1. Navigate (`agent-browser open ...`)
   2. Snapshot (`agent-browser snapshot -i`)
   3. Interact using refs from snapshot
   4. Re-snapshot after DOM changes
   5. Screenshot to capture evidence
   6. Close browser

7. **Commands Reference** (lines 62–138): 9 categories exhaustively documented:
   - Navigation (open, back, reload, close)
   - Snapshot (full, interactive -i, compact -c, scoped -s)
   - Interactions (click, fill, type, press, hover, check, uncheck, select, scroll, scrollintoview)
   - Get Information (text, value, attr, title, url, count)
   - Check State (is visible, is enabled, is checked)
   - Screenshots (stdout, file, full-page)
   - Wait (element, milliseconds, text, network idle)
   - Semantic Locators (role button, text, label)
   - Browser Settings (viewport)

8. **Project-Specific Recipes** (lines 140–291): 8 recipes with bash code blocks:
   - Recipe 1: Smoke Test — Load Flag Manager
   - Recipe 2: Test Filter by Environment
   - Recipe 3: Test Filter by Status
   - Recipe 4: Test Name Search
   - Recipe 5: Create a New Flag
   - Recipe 6: Edit an Existing Flag
   - Recipe 7: Delete a Flag
   - Recipe 8: Combined Filter Test

9. **Integration with Commands** (lines 293–321): Integration notes for:
   - With `/validate`: after static checks, invoke skill for visual regression
   - With `/implement`: after UI changes, invoke for E2E validation

10. **Constraints** (lines 323–333): 7 operational constraints:
    - Headless mode by default
    - Screenshots saved to `.agents/screenshots/`
    - Max 30-second timeout per interaction
    - Always close browser
    - Dev servers must be running
    - Do not hardcode refs across sessions
    - Viewport default 1280×720

### Strengths Already Present

- **Minimal `allowed-tools`** — `Bash(agent-browser:*)` is the single most scoped tool declaration in the codebase; only the specific CLI is accessible ✅
- **Concrete `description`** — names specific UI elements the skill operates on (filter dropdowns, flag creation/edit form), not generic "browser automation" ✅
- **Prerequisites with actual commands** — not "install Playwright" but `npx playwright install chromium`; not "start the server" but `cd server && pnpm dev` ✅
- **Quick Start** provides orientation without requiring deep reading ✅
- **6-step Core Workflow** is a canonical loop that any recipe follows ✅
- **9 Commands Reference categories** with exhaustive coverage — navigation, snapshot, interactions, get info, check state, screenshots, wait, semantic locators, settings ✅
- **Ref stability note** — "Do not hardcode element refs across sessions — always re-snapshot" prevents stale-ref bugs ✅
- **8 project-specific recipes** covering the full CRUD lifecycle (load, filter, search, create, edit, delete, combined) ✅
- **Integration with `/validate` and `/implement`** explicitly stated ✅
- **30-second timeout** and "fail and report" rule prevents infinite hangs ✅
- **Semantic locators** as alternative to refs — `agent-browser find role button click --name "Submit"` is more stable than `@e1` refs ✅
- **`mkdir -p .agents/screenshots`** explicitly in Prerequisites — prevents silent failure on first screenshot ✅

### Issues Spotted Before Audit

1. **No Context Ref at the start** — Gold Standard §32 requires a "Context Ref → Install → Implement → Validate → Commit" setup structure. The skill jumps to "Purpose" without first anchoring itself in the codebase (which files drive the UI, which API endpoint the browser interacts with). A developer arriving at this skill fresh doesn't know where to look in the codebase if something breaks.

2. **No per-recipe Expected Outcomes** — Every recipe shows HOW to interact (the steps) but not WHAT constitutes success. "Recipe 2: Test Filter by Environment" ends with `agent-browser get count "table tbody tr"` and `agent-browser close` — but what count proves the filter worked? What text should appear in rows? Without Expected Outcomes, a recipe passing means "no crash", not "filter worked correctly."

3. **No Reporting format** — After a recipe runs, what does the agent tell the user? There's no standard for what to output after each recipe run: no count summary, no "PASS/FAIL" verdict, no screenshot path confirmation.

4. **No Commit Policy for screenshots** — Screenshots accumulate in `.agents/screenshots/`. Are they committed to git? If so, the repo bloats. If not, they're lost after cleanup. Gold Standard §32's "Commit" step is missing. No `.gitignore` guidance for this path either.

5. **No dev-server pre-condition** — The Constraints section says "dev servers must be running" but there's no executable pre-condition that checks this before the first recipe step. If `localhost:3000` is down, `agent-browser open` may hang or give a confusing error. Should add: `curl -s http://localhost:3000 > /dev/null && curl -s http://localhost:3001/api/flags > /dev/null` as a required first step.

6. **Prerequisites are separate from Core Workflow** — Prerequisites (Playwright install, dev servers, screenshots directory) are declared once at the top but the Core Workflow doesn't reference them as a gate. An agent following the Core Workflow could skip Prerequisites if it doesn't read sequentially.

7. **Recipe steps use hardcoded element text** — Recipes use `find text "production"`, `find text "enabled"`, `find label "Name"` — these assume specific UI text. If the UI changes label from "Name" to "Flag Name", the recipe breaks silently (the `find label` would fail with an error, but the agent might not realize why).

8. **No error-recovery guidance** — What happens when `agent-browser wait --text "Success"` times out? What if the snapshot returns no interactive elements? What if a click doesn't trigger the expected navigation? The Constraints say "max timeout 30 seconds" and "fail and report" but don't define what "fail and report" means in output terms.

9. **"Always close browser" constraint has no mechanism** — The constraint says to close even on errors, but recipes don't show `agent-browser close` in error-recovery paths. A recipe that fails midway would leave a dangling browser process.

10. **Integration with commands is abstract** — The Integration section shows the orchestration *pattern* but not the exact agent-browser commands to run. "Execute Recipe 1 (smoke test)" — what are the actual commands? This section should include runnable command blocks, not just text descriptions.

11. **No "When NOT to use" — important for this skill** — The skill should clarify it's for **visual/DOM testing only**:
    - For API logic testing: use `cd server && pnpm test` (Vitest)
    - For build errors: use `cd server && pnpm run build`
    - For lint: use `cd server && pnpm run lint`
    Using agent-browser for non-UI concerns wastes Playwright overhead and adds flaky test surface.

12. **No recipe for testing error states** — 8 recipes cover the happy path (load, filter, search, CRUD). None tests what happens when: (a) the form is submitted with invalid data, (b) the API returns 404, (c) the delete confirmation is cancelled. Error-state UI testing is critical for the feature flag manager.

13. **No viewport sensitivity guidance** — Constraints say viewport default 1280×720 and "set explicitly if testing responsive behavior" — but don't name breakpoints or specify which features break at what sizes. Feature flags UI may have mobile-specific layout issues.

14. **The description mentions "VSA (Vertical Slice Architecture) patterns from the Gold Standard codebase"** — wait, that's from the system prompt for `code-reviewer`. The `agent-browser` description is clean. But it doesn't link to the actual UI files it automates.

15. **No skill-level "agent browser closed" confirmation in Quick Start** — Quick Start shows how to open and interact but the "close" step is present but doesn't emphasize that forgetting it leaves a dangling process.

---

## Concept-by-Concept Audit

### Concept #32 — Prompt Structure for Setup Steps
> Gold Standard §32 defines the canonical setup structure for anything that requires environmental setup before use: **Context Ref → Install → Implement → Validate → Commit**. Skills with prerequisites must follow this structure so a developer can onboard to the skill from zero.

| Step | Status | Evidence |
|------|--------|----------|
| **Context Ref** | ❌ Missing | No subsection linking to the codebase files this skill operates on (the UI files, the API endpoint it hits, which CLAUDE.md section governs the frontend) |
| **Install** | ✅ Strong | Prerequisites section covers Playwright install + dev servers + screenshots dir with exact commands |
| **Implement** | ✅ Strong | Core Workflow + Commands Reference + Recipes cover the "how to do" exhaustively |
| **Validate** | ⚠️ Partial | Recipes show how to interact but not what outcome proves success; no per-recipe Expected Outcomes; no standard for what the agent reports after a recipe |
| **Commit** | ❌ Missing | No policy for what to do with screenshots after a run (commit? gitignore? PR evidence sub-dirs?); no `.gitignore` guidance |

**Actions:**

- [ ] Add a **Context Ref** subsection at the very beginning of the body (before "## Purpose"), pointing to the codebase files this skill operates on:
  > ## Context Ref
  >
  > This skill drives the **feature flag management UI** built in this exercise. Before using it, understand the UI architecture:
  >
  > | What | File | Notes |
  > |------|------|-------|
  > | Main app entry | [client/src/App.tsx](client/src/App.tsx) | Root component; mounts flags table and filter controls |
  > | Flags table | [client/src/components/flags-table.tsx](client/src/components/flags-table.tsx) | Renders the flags list, filter controls, and row actions |
  > | Flag form modal | [client/src/components/flag-form-modal.tsx](client/src/components/flag-form-modal.tsx) | Create/Edit modal; triggered by "Create Flag" button or row Edit action |
  > | API client | [client/src/api/flags.ts](client/src/api/flags.ts) | Fetch wrappers; consumed by TanStack Query hooks in App.tsx |
  > | API endpoint | `http://localhost:3001/api/flags` | Backend route handled by `server/src/routes/flags.ts` |
  > | Project stack | [CLAUDE.md](CLAUDE.md) | Tech stack: React 19, Vite, Tailwind v4, Radix UI, TanStack Query v5 |
  >
  > **If the UI isn't behaving as expected during a recipe**: read `App.tsx` and `flags-table.tsx` first. The component tree is where label text, filter values, and button names are defined — changes there will break recipe `find text "..."` commands.

- [ ] Add **Expected Outcomes** to each of the 8 Project-Specific Recipes. The outcome format is:
  > **Expected Outcome**:
  > - {What count or DOM state proves the recipe succeeded}
  > - {What screenshot should visually show}
  > - {What would indicate failure (e.g., count unchanged after filter)}

- [ ] Add a **Commit Policy** section to the Constraints area:
  > ## Commit Policy
  >
  > **Screenshots in `.agents/screenshots/` are git-ignored by default.**
  > Add to `.gitignore` if not present:
  > ```
  > .agents/screenshots/
  > ```
  >
  > **When screenshots serve as PR validation evidence**:
  > - Place them in `.agents/screenshots/pr-{N}/` (e.g., `.agents/screenshots/pr-42/`)
  > - Commit ONLY that sub-directory: `git add .agents/screenshots/pr-42/`
  > - Never commit screenshots containing real user data or PII
  > - Delete the sub-directory after the PR is merged: `git rm -r .agents/screenshots/pr-42/`

---

### Concept #25 — Input → Process → Output

> Skills use a different format from commands and agents, but must still have clear Input (what's needed before the skill runs), Process (the workflow to execute), and Output (what the skill produces and reports).

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | Prerequisites define environmental setup (Install). But no Context Ref (which files to understand), no pre-condition check (are dev servers running?), no explicit trigger definition (when to invoke this skill vs run Vitest tests) |
| **Process** | ✅ Strong | Core Workflow is a canonical 6-step loop; Commands Reference is exhaustive; 8 project-specific recipes cover the main scenarios |
| **Output** | ❌ Weak | No standard for what the agent reports after a recipe; no PASS/FAIL verdict format; no screenshot path confirmation; no summary to user |

**Actions:**
- [ ] Add **Pre-condition check** at the top of Core Workflow (or as a "Pre-Step: VERIFY ENVIRONMENT"):
  > **Pre-Step: VERIFY ENVIRONMENT**
  >
  > Before any recipe step, verify both dev servers are responsive:
  > ```bash
  > curl -s http://localhost:3000 > /dev/null && echo "client OK" || echo "client DOWN"
  > curl -s http://localhost:3001/api/flags > /dev/null && echo "server OK" || echo "server DOWN"
  > ```
  >
  > If either fails: **STOP**. Do not attempt to open the browser — `agent-browser open` on an unresponsive URL will hang until timeout. Instruct the user:
  > - To start the client: `cd client && pnpm dev`
  > - To start the server: `cd server && pnpm dev`

- [ ] Add a **Reporting** section at the end of the skill (after Constraints, before Commit Policy), defining what the agent emits after each recipe run:
  ```
  ## Reporting

  After any recipe run, produce this terminal summary:

  Browser Automation Complete.

  Recipe: {recipe name — e.g., "Test Filter by Environment"}
  Outcome: {PASS | FAIL | PARTIAL}
  Screenshots: {comma-separated paths, or "none"}
  Observations: {key counts and DOM checks — e.g., "Row count before filter: 12 | after: 4 | rows show 'production': verified via snapshot"}
  Browser closed: ✓

  {If FAIL:}
  Failure reason: {specific step that failed, element not found, timeout, etc.}
  Last screenshot: {path, if captured before failure}
  Recovery: browser closed ✓ | browser may still be running — run `agent-browser close` manually
  ```

---

### Skill-Specific Quality Checks (beyond Gold Standard concepts)

| Quality Check | Status | Evidence |
|--------------|--------|----------|
| `allowed-tools` minimal | ✅ Exemplary | `Bash(agent-browser:*)` — single CLI tool only |
| `description` triggers correctly | ✅ Strong | Names specific interactions (filter controls, flag form, DOM state, screenshots) |
| `description` says when NOT to use | ❌ Missing | Should clarify "not for API logic testing — use pnpm test" |
| Prerequisites with runnable commands | ✅ Strong | Three prerequisites each with copy-paste commands |
| Core Workflow is canonical | ✅ Strong | 6-step loop every recipe extends |
| Recipes cover CRUD lifecycle | ✅ Good | 8 recipes for load, filter×4, create, edit, delete, combined |
| Error-state recipes | ❌ Missing | No recipe for invalid form submission, API error handling, cancelled delete |
| Per-recipe Expected Outcomes | ❌ Missing | Recipes end after last command with no success/failure criteria |
| Ref stability guidance | ✅ Strong | "Do not hardcode element refs across sessions" |
| Error-recovery steps | ❌ Missing | No guidance when recipe step fails mid-way |
| Reporting format | ❌ Missing | No standard post-recipe output block |
| Commit Policy for screenshots | ❌ Missing | No `.gitignore` guidance |
| Context Ref at start | ❌ Missing | No codebase-anchor section |
| "When NOT to use" | ❌ Missing | No routing to Vitest for non-UI testing |

**Actions:**
- [ ] Add **"When NOT to use"** section to the "When to Use" section:
  > ### When NOT to Use This Skill
  >
  > This skill automates **visual and DOM-level UI testing only**. Do NOT use for:
  > - **API logic testing** (request/response validation, SQL queries, error propagation): use `cd server && pnpm test` (Vitest) — faster, deterministic, no browser overhead
  > - **Build errors** or **TypeScript type checking**: use `cd server && pnpm run build` + `cd client && pnpm run build`
  > - **Lint violations**: use `cd server && pnpm run lint` + `cd client && pnpm run lint`
  > - **Component unit tests** (if added): use Vitest with component testing
  >
  > **Rule**: if you can test it with `pnpm test`, test it there first. Use agent-browser only for what Vitest cannot cover: visual rendering, multi-step user flows, and DOM-state verification after interactions.

- [ ] Add **Recipe 9: Test Invalid Form Submission**:
  > ### Recipe 9: Test Invalid Form Submission
  >
  > ```bash
  > agent-browser open http://localhost:3000
  > agent-browser wait --load networkidle
  >
  > # Open the Create Flag modal
  > agent-browser find text "Create Flag" click
  > agent-browser wait --text "Create Feature Flag"
  > agent-browser snapshot -i
  >
  > # Submit without filling required fields
  > agent-browser find role button click --name "Create"
  > agent-browser wait 500
  > agent-browser snapshot -i
  >
  > # Verify validation error appears
  > agent-browser screenshot .agents/screenshots/form-validation-error.png
  > agent-browser close
  > ```
  >
  > **Expected Outcome**:
  > - The modal remains open (not dismissed)
  > - A validation error message is visible in the snapshot (e.g., "Name is required")
  > - Row count in the table remains unchanged (no flag created)
  > - Screenshot shows the error state clearly

- [ ] Add **Recipe 10: Cancel Delete Confirmation**:
  > ### Recipe 10: Cancel Delete Confirmation
  >
  > ```bash
  > agent-browser open http://localhost:3000
  > agent-browser wait --load networkidle
  > agent-browser snapshot -i
  >
  > # Get initial row count
  > agent-browser get count "table tbody tr"
  >
  > # Click delete on first row
  > agent-browser click @e6   # Use ref from snapshot for delete button
  > agent-browser wait --text "Delete"
  > agent-browser snapshot -i
  >
  > # Cancel the confirmation dialog
  > agent-browser find role button click --name "Cancel"
  > agent-browser wait --load networkidle
  > agent-browser snapshot -i
  >
  > # Verify row count unchanged
  > agent-browser get count "table tbody tr"
  > agent-browser screenshot .agents/screenshots/delete-cancelled.png
  > agent-browser close
  > ```
  >
  > **Expected Outcome**:
  > - Row count after cancellation equals initial row count (no deletion occurred)
  > - Modal/dialog dismissed
  > - Screenshot shows the unchanged table

- [ ] Add **Error-recovery pattern** to Core Workflow and Constraints:
  > ### Error Recovery
  >
  > If any recipe step fails (timeout, element not found, unexpected navigation):
  > 1. **Screenshot before closing**: `agent-browser screenshot .agents/screenshots/error-state.png`
  > 2. **Close the browser**: `agent-browser close` — always, even on failure
  > 3. **Report the failure** using the Reporting format (see below), including "last screenshot" field
  > 4. **Do NOT retry automatically** — first diagnose: was the element not rendered? Did the API call fail? Check `curl -s http://localhost:3001/api/flags` to verify the backend is healthy.

---

## Action Plan Summary

### Priority 1 — Complete §32 Setup Structure

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add **Context Ref** subsection at the top of the body — table of UI files, API endpoint, CLAUDE.md link | #32 (Context Ref) |
| 1.2 | Add **Expected Outcomes** to all 8 existing recipes | #32 (Validate) |
| 1.3 | Add **Commit Policy** section — `.gitignore` for screenshots, PR evidence sub-dir pattern, cleanup | #32 (Commit) |

### Priority 2 — Input Pre-conditions (concept #25)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add **Pre-Step: VERIFY ENVIRONMENT** health check at top of Core Workflow (`curl` both servers before opening browser) | #25 |
| 2.2 | Add **"When NOT to Use"** subsection (routing to Vitest/build/lint for non-UI testing) | #25, skill hygiene |

### Priority 3 — Output Reporting (concept #25)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add **Reporting** section with standard PASS/FAIL/PARTIAL template | #25, #32 |
| 3.2 | Add **Error Recovery** pattern to Core Workflow (screenshot + close + report + no-auto-retry) | #25 |

### Priority 4 — Recipe Completeness

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Add **Recipe 9: Test Invalid Form Submission** with Expected Outcome | #32 (Validate) |
| 4.2 | Add **Recipe 10: Cancel Delete Confirmation** with Expected Outcome | #32 (Validate) |
| 4.3 | Add Expected Outcomes to the Integration with Commands section (concrete success criteria, not just patterns) | #25 |

---

## Execution Prompt (copy-paste ready)

```
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§25, §32)
2. `.claude/skills/agent-browser/SKILL.md` — current skill
3. `docs/Gold-Standard-Plan/phases/phase-5-skills/round-22-audit-agent-browser.md` — this audit
4. `client/src/App.tsx` and `client/src/components/flags-table.tsx` — to write accurate Context Ref file table
5. `CLAUDE.md` — tech stack reference for Context Ref section

Edit `.claude/skills/agent-browser/SKILL.md` with these requirements:

1. **Frontmatter** — unchanged (`allowed-tools: Bash(agent-browser:*)` is exemplary).

2. **Add Context Ref subsection** as the very first section of the body (before "## Purpose"):

   ```markdown
   ## Context Ref

   This skill drives the **feature flag management UI** built in this exercise. Before using it, understand the UI architecture:

   | What | File | Notes |
   |------|------|-------|
   | Main app entry | `client/src/App.tsx` | Root component; mounts flags table, filter controls, TanStack Query provider |
   | Flags table | `client/src/components/flags-table.tsx` | Renders flag list, filter dropdowns, search input, row action buttons |
   | Flag form modal | `client/src/components/flag-form-modal.tsx` | Create/Edit modal — triggered by "Create Flag" or row Edit button |
   | API client | `client/src/api/flags.ts` | Typed fetch wrappers consumed by TanStack Query hooks |
   | Backend API | `http://localhost:3001/api/flags` | Express route: `server/src/routes/flags.ts` |
   | Project stack | `CLAUDE.md` | React 19, Vite, Tailwind v4, Radix UI, TanStack Query v5 |

   **If a recipe `find text "..."` or `find label "..."` command fails**: read `flags-table.tsx` and `flag-form-modal.tsx` first — label text and button names are defined there. A UI copy change will break any recipe that hardcodes those strings.

   **If the API returns errors** during a recipe: check the backend with `curl -s http://localhost:3001/api/flags` — isolate whether the issue is UI or API before re-running browser automation.
   ```

3. **Update "## When to Use"** — add a "When NOT to Use" sub-section:

   ```markdown
   ### When NOT to Use This Skill

   This skill automates **visual and DOM-level UI testing only**. Do NOT use for:
   - **API logic testing** (request/response, SQL queries, error propagation): use `cd server && pnpm test` — faster, deterministic, zero browser overhead
   - **TypeScript type checking**: `cd server && pnpm run build` + `cd client && pnpm run build`
   - **Lint violations**: `cd server && pnpm run lint` + `cd client && pnpm run lint`
   - **Component unit tests** (if added): Vitest component testing

   **Rule**: if you can test it with `pnpm test`, test it there first. Use agent-browser only for what Vitest cannot cover — visual rendering, multi-step user flows, and DOM-state verification after interactions.
   ```

4. **Update "## Core Workflow"** — add a Pre-Step before the numbered steps:

   ```markdown
   ## Core Workflow

   **Pre-Step: VERIFY ENVIRONMENT**

   Before any recipe step, verify both dev servers are responsive:
   ```bash
   curl -s http://localhost:3000 > /dev/null && echo "client OK" || echo "client DOWN — run: cd client && pnpm dev"
   curl -s http://localhost:3001/api/flags > /dev/null && echo "server OK" || echo "server DOWN — run: cd server && pnpm dev"
   ```
   If either server is DOWN: **STOP**. Do not call `agent-browser open` — it will hang until timeout on an unresponsive URL.

   **Error Recovery Pattern**

   If any step in a recipe fails:
   1. Screenshot the current state: `agent-browser screenshot .agents/screenshots/error-state-{timestamp}.png`
   2. Close the browser: `agent-browser close` — always, even on failure
   3. Report using the Reporting format (see below) with "last screenshot" and "failure reason"
   4. Do NOT retry automatically — diagnose first: was the element not rendered? Did the API return an error? Check `curl -s http://localhost:3001/api/flags` before re-running.

   {Keep the existing numbered 6-step workflow VERBATIM after the Pre-Step and Error Recovery blocks.}
   ```

5. **Add Expected Outcomes to all 8 existing recipes**. Use this format for each (add AFTER the last `agent-browser` command in the recipe and BEFORE `agent-browser close`):

   ```markdown
   # Recipe 1 — Smoke Test
   **Expected Outcome**:
   - `get count "table tbody tr"` returns N > 0 (seeded flags are present)
   - Screenshot shows the flags table populated with rows
   - If count = 0: check if the seed ran — `curl -s http://localhost:3001/api/flags | head`

   # Recipe 2 — Filter by Environment
   **Expected Outcome**:
   - Row count AFTER applying filter < row count BEFORE (or = 0 if no 'production' flags)
   - All visible rows in the snapshot contain the text "production" in the Environment column
   - If count is unchanged: the filter may not have applied — re-snapshot and check the dropdown value

   # Recipe 3 — Filter by Status
   **Expected Outcome**:
   - Row count AFTER < row count BEFORE (or = 0 if no enabled flags)
   - All visible rows show status "enabled"
   - Screenshot shows the Status dropdown with "enabled" selected

   # Recipe 4 — Name Search
   **Expected Outcome**:
   - Row count AFTER < row count BEFORE (or = 0 if no flags match "dark")
   - All visible rows contain "dark" in the Name column (case-insensitive)
   - Screenshot shows the search input with "dark" typed

   # Recipe 5 — Create a New Flag
   **Expected Outcome**:
   - Modal closes after "Create" button click (no longer present in snapshot)
   - Row count AFTER create = row count BEFORE + 1
   - New row with name "test-browser-flag" appears in the table
   - Screenshot shows the updated table

   # Recipe 6 — Edit an Existing Flag
   **Expected Outcome**:
   - Modal closes after "Save" click
   - The edited row shows "Updated description" in the Description column
   - Row count unchanged (edit, not create)
   - Screenshot shows the updated row

   # Recipe 7 — Delete a Flag
   **Expected Outcome**:
   - Row count AFTER delete = row count BEFORE - 1
   - The deleted row no longer appears in the snapshot
   - Screenshot shows the updated (shorter) table

   # Recipe 8 — Combined Filter Test
   **Expected Outcome**:
   - Row count AFTER both filters < row count after only one filter (filters are AND, not OR)
   - All visible rows show "production" environment AND "enabled" status
   - Screenshot shows both filter chips/badges active
   ```

6. **Add Recipe 9: Test Invalid Form Submission** (new):

   ```bash
   ### Recipe 9: Test Invalid Form Submission

   ```bash
   agent-browser open http://localhost:3000
   agent-browser wait --load networkidle
   agent-browser get count "table tbody tr"   # Record initial count

   # Open Create Flag modal
   agent-browser find text "Create Flag" click
   agent-browser wait --text "Create Feature Flag"
   agent-browser snapshot -i

   # Submit WITHOUT filling any required fields
   agent-browser find role button click --name "Create"
   agent-browser wait 500   # Allow validation to render
   agent-browser snapshot -i
   agent-browser screenshot .agents/screenshots/form-validation-error.png
   agent-browser get count "table tbody tr"   # Should still equal initial count
   agent-browser close
   ```

   **Expected Outcome**:
   - The modal remains OPEN after clicking Create (validation prevented submission)
   - At least one validation error message is visible in the snapshot
   - Row count is UNCHANGED (no flag created)
   - Screenshot shows the error state clearly
   ```

7. **Add Recipe 10: Cancel Delete Confirmation** (new):

   ```markdown
   ### Recipe 10: Cancel Delete Confirmation

   ```bash
   agent-browser open http://localhost:3000
   agent-browser wait --load networkidle
   agent-browser snapshot -i
   agent-browser get count "table tbody tr"   # Record initial count

   # Trigger delete on first available row
   agent-browser click @e6   # Adapt ref from snapshot for first delete button
   agent-browser wait --text "Delete"   # Wait for confirmation dialog
   agent-browser snapshot -i

   # Cancel instead of confirming
   agent-browser find role button click --name "Cancel"
   agent-browser wait --load networkidle
   agent-browser snapshot -i
   agent-browser get count "table tbody tr"   # Must equal initial count
   agent-browser screenshot .agents/screenshots/delete-cancelled.png
   agent-browser close
   ```

   **Expected Outcome**:
   - Row count AFTER cancel = initial row count (no deletion occurred)
   - Confirmation dialog dismissed from snapshot
   - Screenshot shows the unchanged table
   ```

8. **Add Reporting section** after Constraints (before new Commit Policy):

   ```markdown
   ## Reporting

   After any recipe run, produce this terminal summary:

   ```
   Browser Automation Complete.

   Recipe: {recipe name}
   Outcome: {PASS | FAIL | PARTIAL}
   Screenshots: {comma-separated file paths, or "none taken"}
   Observations: {key counts and DOM checks:
     - Row count before filter: {N} | after filter: {M}
     - Verified: all visible rows contain '{value}' in '{column}'
     - Modal: {opened ✓ | closed ✓ | still open}
     - Error state: {present | absent}}
   Browser closed: {✓ | ✗ — run `agent-browser close` manually}

   {If FAIL:}
   Failure reason: {step {N} failed — element not found | timeout at 30s | unexpected navigation to {url}}
   Last screenshot: {path, or "none"}
   Next steps: {Diagnose UI vs API issue — run `curl -s http://localhost:3001/api/flags`. Check {file} for label changes.}
   ```

   **PASS**: All Expected Outcome criteria met.
   **FAIL**: Recipe ended before completion (timeout, element not found, uncaught error).
   **PARTIAL**: Recipe completed but Expected Outcome criteria not fully met (e.g., filter applied but row text not verified).
   ```

9. **Add Commit Policy section** at the very end (after Constraints and Reporting):

   ```markdown
   ## Commit Policy

   **Default: screenshots are git-ignored.**
   Add to `.gitignore` if not present:
   ```
   .agents/screenshots/
   ```

   **Exception — PR validation evidence**:
   - Place evidence screenshots in `.agents/screenshots/pr-{N}/` (e.g., `pr-42/`)
   - Commit ONLY that sub-directory: `git add .agents/screenshots/pr-42/`
   - Reference in the PR description: "See `.agents/screenshots/pr-42/` for E2E validation"
   - Delete after merge: `git rm -r .agents/screenshots/pr-42/`
   - Never commit screenshots containing real user data

   **Naming convention** for evidence screenshots: `{pr-number}/{recipe-name}-{result}.png`
   Example: `pr-42/filter-by-environment-pass.png`
   ```

10. **Update Integration with Commands** — add concrete commands:

    ```markdown
    ## Integration with Commands

    ### With `/validate`

    After running static checks (`cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`), invoke the agent-browser skill for visual regression:

    ```
    1. Verify environment: curl check on both servers
    2. Run Recipe 1 (Smoke Test) — verify the app loads and shows flags
    3. Run Recipe 2 (Filter by Environment) — verify filtering still works
    4. Run Recipe 4 (Name Search) — verify search still works
    5. Report: static checks {PASS} + visual checks {PASS | FAIL | PARTIAL}
    6. If any visual check FAILS: add to validation report; do NOT proceed to /commit without investigation
    ```

    ### With `/implement`

    After implementing UI changes, invoke the agent-browser skill for E2E validation of the specific feature:

    ```
    1. Run static validation first (build + lint + tests)
    2. Verify environment: curl check
    3. Run the recipe most relevant to the change:
       - Filter feature → Recipes 2, 3, 4, 8
       - Create/Edit → Recipes 5, 6, 9 (invalid form)
       - Delete → Recipes 7, 10 (cancel confirmation)
    4. Screenshot before/after if modifying existing UI behavior
    5. Add screenshots to .agents/screenshots/pr-{N}/ if serving as PR evidence
    6. Report: E2E outcome for the changed feature
    ```
    ```

11. **Do NOT change**:
    - The frontmatter (it's exemplary)
    - The Purpose section (keep verbatim)
    - The Constraints section (keep verbatim; the Error Recovery and Commit Policy are ADDED after, not inside)
    - The Quick Start section (keep verbatim)
    - Commands Reference — all 9 categories (keep verbatim)
    - Recipes 1–8 existing command blocks (only ADD Expected Outcomes after the last command in each, before `agent-browser close`)
    - The ref-stability note ("Do not hardcode element refs across sessions")

Do NOT change any source code. Only edit `.claude/skills/agent-browser/SKILL.md`.
```

---

## Success Criteria

- [ ] **Context Ref subsection** added at the start of body — table mapping skill to 6 codebase files (UI files, API endpoint, CLAUDE.md) with codebase-anchor note about recipe breakage on label changes (concept #32 — Context Ref step)
- [ ] **"When NOT to Use"** added to "When to Use" section — routing to `pnpm test`, `pnpm run build`, `pnpm run lint` for non-UI testing; clear rule: "if you can test with pnpm test, do that first" (skill hygiene)
- [ ] **Pre-Step: VERIFY ENVIRONMENT** added to Core Workflow — `curl` health check on both servers; explicit STOP if either is down (concept #25)
- [ ] **Error Recovery Pattern** added to Core Workflow — screenshot → close → report → no-auto-retry sequence (concept #25)
- [ ] **Expected Outcomes** added to all 8 existing recipes (Recipes 1–8) with count criteria, DOM state criteria, screenshot description, and what-to-check-on-failure (concept #32 — Validate step)
- [ ] **Recipe 9: Test Invalid Form Submission** added — tests that validation prevents blank form submission, modal stays open, row count unchanged (concept #32 — Validate step, new scenario)
- [ ] **Recipe 10: Cancel Delete Confirmation** added — tests that cancelling delete leaves table unchanged (concept #32 — Validate step, new scenario)
- [ ] **Reporting section** added after Constraints — PASS/FAIL/PARTIAL verdict, screenshots list, observations (counts, DOM state, modal state), browser-closed status; FAIL template with failure reason + last screenshot + next steps (concept #25)
- [ ] **Commit Policy section** added — `.gitignore` for `.agents/screenshots/`, PR evidence sub-dir pattern (`pr-{N}/`), naming convention, cleanup after merge (concept #32 — Commit step)
- [ ] **Integration with Commands** section updated — concrete command sequences for `/validate` and `/implement` integrations (not just text patterns) (concept #25)
- [ ] Frontmatter unchanged — `allowed-tools: Bash(agent-browser:*)` exemplary scoping preserved ✅
- [ ] Core Workflow 6 steps preserved verbatim (Pre-Step and Error Recovery added before, not replacing) ✅
- [ ] Commands Reference all 9 categories preserved verbatim ✅
- [ ] Recipes 1–8 bash command blocks preserved verbatim (Expected Outcomes added after last command) ✅
- [ ] Ref-stability note preserved ✅
- [ ] Constraints preserved verbatim ✅
