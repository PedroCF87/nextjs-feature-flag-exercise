# Prompts — Story E2-S5: Measurement, Comparison, and Closure

> **Usage:** Copy each prompt block and paste into Claude Code Extension.
> Execute in order (T1 → T8). Each task depends on the previous.
> All placeholder values have been pre-filled from git commit timestamps and session data.

---

## Prompt 1 — E2-S5-T1: Run full validation suite and verify all 11 criteria

````
Task: E2-S5-T1 — Run full validation suite and verify all 11 TASK.md criteria.

Context:
- Branch: exercise-2
- Task file: docs/agile/tasks/task-E2S5T1-run-full-validation-suite-and-verify-all-11-criteria.md
- Story: docs/agile/stories/story-E2S5-measurement-comparison-closure.md
- TASK.md contains the 11 acceptance criteria

Execute:

1. Run the full validation suite:
   ```
   cd server && pnpm run build && pnpm run lint && pnpm test
   cd ../client && pnpm run build && pnpm run lint
   ```

2. Record every command's exit code and output snippet.

3. Verify each of the 11 TASK.md acceptance criteria with file:line evidence:
   - AC1: Filter by environment → check shared/types.ts for FlagFilterParams.environment, server/src/services/flags.ts for WHERE clause, client filter control
   - AC2: Filter by status → same pattern
   - AC3: Filter by type → same pattern
   - AC4: Filter by owner → same pattern
   - AC5: Name search (partial match) → check LIKE in service, debounced input in client
   - AC6: Backend filtering → verify query params in routes/flags.ts, SQL in services/flags.ts
   - AC7: Multiple simultaneous filters (AND logic) → verify conditions.join(' AND ') pattern
   - AC8: Filters persist across create/edit/delete → check filter state at App.tsx level, queryKey includes filters
   - AC9: Clear all filters → check clear button in filter controls
   - AC10: UI indicates active filters → check badge/indicator in filter controls
   - AC11: Responsive filtering → check debounce on text inputs

4. Produce a validation report in this format:

   ## Validation Suite Results

   | Command | Exit Code | Output Snippet | Status |
   |---------|-----------|----------------|--------|
   | server: pnpm run build | ? | ... | ✅/❌ |
   | server: pnpm run lint  | ? | ... | ✅/❌ |
   | server: pnpm test      | ? | ... | ✅/❌ |
   | client: pnpm run build | ? | ... | ✅/❌ |
   | client: pnpm run lint  | ? | ... | ✅/❌ |

   ## TASK.md Criteria Verification

   | # | Criterion | Status | Evidence (file:line) |
   |---|-----------|--------|----------------------|
   | 1 | Filter by environment | ✅/❌ | ... |
   | ... | ... | ... | ... |
   | 11 | Responsive filtering | ✅/❌ | ... |

5. Save the report to `.agents/closure/e2-validation-report.md`.

6. Update task file status to Done, fill sections 5–7, update Last updated timestamp.

7. Add ✅ prefix to the T1 heading in the parent story file.

Do NOT commit yet — we'll batch commit at the end of the story.
````

---

## Prompt 2 — E2-S5-T2: Complete metrics document

```
Task: E2-S5-T2 — Complete the Exercise 2 metrics document.

Context:
- Task file: docs/agile/tasks/task-E2S5T2-complete-metrics-document.md
- Exercise 1 baseline: .agents/baseline/measurement-baseline.md (212 min, 25 prompts, 3 rework, confidence 3→4→5)
- Output: .agents/baseline/measurement-exercise2.md
- Use the same structure as the Exercise 1 baseline doc

Data to record (pre-filled from git commit timestamps and session history):

**Time capture (source: `git log --format="%ai %s" exercise-2`):**
- E2-S0 (Planning): 2026-04-16 01:38:59 → 02:57:04 = ~78 min
- E2-S1 (AI Layer): 2026-04-16 02:57:04 → 03:58:54 = ~62 min
- [sleep break ~8.5h between S1 and S2]
- E2-S2 (Repo config): 2026-04-16 12:29:00 → 15:07:52 = ~159 min wall-clock (~121 min active, ~38 min waiting for GitHub Actions)
- E2-S3+S4 (Server+Client impl): 2026-04-16 15:07:52 → 16:49:00 = ~101 min
  - First impl commit at 15:53:58, Radix fix at 16:16:33, PR review fixes at 16:45:10, last at 16:49:00
- Prep (S1+S2): ~183 min active
- Implementation (S3+S4): ~101 min
- Total (S1–S4): ~284 min active

**Prompt count (estimated from session task invocations):**
- E2-S0 (Planning): ~5 prompts (epic revision, story scaffold, task packs, dependencies fix)
- E2-S1 (AI Layer): ~3 prompts (CLAUDE.md, commands, skills, PRD, reference docs — single large session)
- E2-S2 (Repo config): ~10 prompts (7 tasks × prompt + story revision + PR #34 security fix + validator update)
- E2-S3 (Server): ~3 prompts (implementation + curl tests + validation)
- E2-S4 (Client): ~5 prompts (implementation + Radix fix + PR creation + PR review analysis + fix commits)
- E2-S5 (Measurement): ~8 prompts (one per task)
- Total: ~34 prompts (conservative count)

**Rework cycles:**
- Count: 1
- Details: Radix UI SelectItem value="" crash — runtime error after initial implementation was build/lint/test green; required fix with sentinel value "all" (~15 min to diagnose and fix)
- Note: The 4 issues found by Claude PR review (timer cleanup, stale ref, .max(200), owner asymmetry) were caught during code review phase, not regressions of green checks. Counted as review fixes, not rework cycles.

**Confidence (1–5 scale):**
- Pre-implementation: 4 (CLAUDE.md + PRD + plan + on-demand context docs provided clear structure; SQL.js patterns well-documented from Exercise 1 audit)
- Mid-implementation: 5 (server filtering done and tested, client UI straightforward with known Radix/TanStack patterns)
- Post-validation: 5 (all 11 TASK.md criteria verified; 26 tests pass; build + lint green on both server and client; PR reviewed)

Instructions:

1. Read the Exercise 1 baseline doc (.agents/baseline/measurement-baseline.md) to match the format exactly.

2. Create .agents/baseline/measurement-exercise2.md with:
   - Metadata table (Exercise, Date, Executor, Repository, Branch, Node.js version, pnpm version)
   - Pre-Implementation State (validation commands + AI Layer file presence — for Exercise 2 this includes CLAUDE.md, .claude/commands/*, .claude/skills/*, .agents/reference/*, .agents/PRDs/*)
   - Time Capture section with prep vs implementation breakdown
   - Prompt Count Tally table by phase
   - Rework Log table
   - Confidence Self-Assessment table with justifications

3. Update task file status to Done, fill sections 5–7, update Last updated timestamp.

4. Add ✅ prefix to the T2 heading in the parent story file.

Do NOT commit yet.
```

---

## Prompt 3 — E2-S5-T3: Produce comparative analysis document

```
Task: E2-S5-T3 — Produce the comparative analysis document (Exercise 1 vs Exercise 2).

Context:
- Task file: docs/agile/tasks/task-E2S5T3-produce-comparative-analysis-document.md
- Exercise 1 metrics: .agents/baseline/measurement-baseline.md
- Exercise 2 metrics: .agents/baseline/measurement-exercise2.md (just created in T2)
- Output: .agents/closure/e2-comparative-analysis.md

Instructions:

1. Read both metrics documents.

2. Create .agents/closure/e2-comparative-analysis.md with:

   ## Metadata
   - artifact_id: e2-comparative-analysis
   - produced_at: {{current timestamp}}
   - produced_by: measurement agent

   ## 1 — Side-by-Side Comparison

   | Metric | Exercise 1 (Baseline) | Exercise 2 (PIV Loop) | Delta | Δ% |
   |--------|----------------------|----------------------|-------|-----|
   | Total time (implementation only) | 212 min | ~101 min | -111 min | -52% |
   | Prep overhead | 0 min (no formal prep) | ~183 min | +183 min | N/A |
   | Total time (prep + impl) | 212 min | ~284 min | +72 min | +34% |
   | Prompt count | 25 | ~34 | +9 | +36% |
   | Rework cycles | 3 | 1 | -2 | -67% |
   | Confidence (pre) | 3 | 4 | +1 | — |
   | Confidence (mid) | 4 | 5 | +1 | — |
   | Confidence (post) | 5 | 5 | 0 | — |
   | Server tests | 24 (16 base + 8 new) | 26 (16 base + 10 new) | +2 | — |

   ## 2 — Prep Overhead Analysis

   Explain whether the prep investment (AI Layer + repo config) was worth the cost:
   - Time saved during implementation vs time spent on prep
   - "Break-even" calculation: after how many sessions does the prep pay for itself?
   - Reference Excal-4 "front-loading context" concept

   ## 3 — Metric-by-Metric Explanatory Notes

   For each metric row, write 2-3 sentences explaining WHY the delta occurred:
   - Time: was PIV Loop faster because per-task validation caught errors early?
   - Prompts: did commands reduce prompt count? Did structured context reduce back-and-forth?
   - Rework: did per-task build validation prevent regressions?
   - Confidence: did having CLAUDE.md + PRD + plan increase pre-implementation confidence?

   ## 4 — System Gap Assessment

   Reference Excal-2 (System Gap): did Exercise 2 close the gap between Developer A and Developer B?
   Support with evidence from the comparison table.

   ## 5 — Key Takeaways

   3-5 bullet points summarizing what the PIV Loop changed vs baseline.

3. Update task file status to Done, fill sections 5–7, update Last updated timestamp.

4. Add ✅ prefix to the T3 heading in the parent story file.

Do NOT commit yet.
```

---

## Prompt 4 — E2-S5-T4: Write friction log with System Evolution entries

```
Task: E2-S5-T4 — Write the Epic 2 friction log with all System Evolution entries.

Context:
- Task file: docs/agile/tasks/task-E2S5T4-write-friction-log-with-system-evolution-entries.md
- Exercise 1 friction log for format reference: .agents/baseline/epic1-friction-log.md
- EPIC-0 friction log template: .agents/templates/friction-log.md
- Output: .agents/baseline/epic2-friction-log.md

Known friction points from the Exercise 2 session (consolidate and expand):

1. **Radix UI SelectItem value="" crash** — SelectItem with empty string value caused runtime crash. Fixed with sentinel value "all". Impact: medium (~15 min diagnosis + fix). [SYSTEM-EVOLUTION] — Pattern B (Emergent): Radix UI constraint not documented in any on-demand context; added to frontend-patterns reference.

2. **Claude PR review found 4 issues post-green** — After all local validation passed, automated Claude review on PR #35 identified: (a) timer unmount cleanup missing, (b) stale-read in latestFiltersRef useEffect, (c) missing .max(200) on Zod string fields, (d) owner exact-match asymmetry. Impact: medium (~20 min to fix all 4). [SYSTEM-EVOLUTION] — Pattern A (Preventable): the /review or /security-review commands could have caught these before PR.

3. **Copilot "unable to run full agentic suite"** — PR #35 had 341 files (including docs/agile/), causing Copilot to skip full automated review. Still reviewed all 11 feature files manually. Impact: low (non-blocking, informational only).

4. Add any other friction points from your E2 session — e.g., the ~38 min wait for GitHub Actions workflow trigger during E2-S2-T6 (low impact), or the sleep break fragmenting E2-S1 and E2-S2 into separate sessions.

Instructions:

1. Create .agents/baseline/epic2-friction-log.md following the same format as epic1-friction-log.md.

2. Include ALL friction points with:
   - #, Story, Timestamp, Description, Impact (high/medium/low)
   - Mark [SYSTEM-EVOLUTION] entries clearly

3. Add a Summary section with:
   - Impact count table (high/medium/low/total)
   - Key observations (2-3 paragraphs)
   - Comparison note: "Epic 1 had 4 friction points (1 high, 1 medium, 2 low). Epic 2 had {{N}} friction points..."

4. Update task file status to Done, fill sections 5–7, update Last updated timestamp.

5. Add ✅ prefix to the T4 heading in the parent story file.

Do NOT commit yet.
```

---

## Prompt 5 — E2-S5-T5: System Evolution retrospective

```
Task: E2-S5-T5 — System Evolution retrospective.

Context:
- Task file: docs/agile/tasks/task-E2S5T5-system-evolution-retrospective.md
- Friction log: .agents/baseline/epic2-friction-log.md (just created in T4)
- Workshop reference: Excal-1 (System Evolution = 4th phase of PIV Loop), Excal-5 ("3+ times = command")
- Output: .agents/closure/e2-system-evolution-retrospective.md

Instructions:

1. Read the friction log (.agents/baseline/epic2-friction-log.md).

2. Extract all entries marked [SYSTEM-EVOLUTION].

3. Create .agents/closure/e2-system-evolution-retrospective.md with:

   ## Metadata
   - artifact_id: e2-system-evolution-retrospective
   - produced_at: {{timestamp}}
   
   ## 1 — System Evolution Entries Classification

   | # | Description | Pattern | Root Cause | Artifact Updated |
   |---|-------------|---------|------------|------------------|
   | 1 | Radix SelectItem value="" crash | B (Emergent) | Undocumented Radix constraint | .agents/reference/frontend-patterns.md |
   | 2 | 4 post-green issues found by Claude review | A (Preventable) | Local /review not run before PR | Recommendation: add /review to pre-PR checklist in CLAUDE.md |
   | ... | ... | ... | ... | ... |

   **Pattern definitions:**
   - **Pattern A (Preventable):** The system had the capability to prevent this, but the process didn't invoke it. Fix: adjust the process (command, checklist, rule).
   - **Pattern B (Emergent):** New constraint discovered during implementation that no existing system artifact could have caught. Fix: add new knowledge to the system (on-demand context, global rule, or new command).

   ## 2 — "3+ Times = Command" Audit

   Review the entire Exercise 2 session. Did any instruction get typed/prompted 3+ times?
   
   | Repeated Instruction | Times | Should Be a Command? | Action |
   |---------------------|-------|---------------------|--------|
   | "Run build + lint + test on both server and client" | ~5 | Already exists (/validate) | No action needed |
   | "Check git log for timestamps" | 2 | No (below threshold) | No action |
   | Other: review your session for anything you typed 3+ times | — | — | — |

   If no repeated instructions reached 3+ occurrences, state: "No missed extraction opportunities identified. The command system covered all recurring workflows."

   ## 3 — Decision Rule Application

   For each Pattern A entry, answer: "What system change would have prevented this?"
   For each Pattern B entry, answer: "What system change now captures this for future sessions?"

   ## 4 — Recommendations for Epic 3

   2-3 actionable recommendations for the next exercise based on these findings.

4. Update task file status to Done, fill sections 5–7.

5. Add ✅ prefix to the T5 heading in the parent story file.

Do NOT commit yet.
```

---

## Prompt 6 — E2-S5-T6: Verify PR and automated reviews

````
Task: E2-S5-T6 — Verify PR #35 and document automated review evidence.

Context:
- Task file: docs/agile/tasks/task-E2S5T6-create-pr-and-verify-automated-reviews.md
- PR #35 already exists: exercise-2 → main on PedroCF87/nextjs-feature-flag-exercise
- Claude bot and Copilot already reviewed PR #35
- Output: documentation of review evidence in the task file

PR #35 review status (already completed):
- Claude bot: reviewed all 11 feature files, found 4 issues (timer cleanup, stale ref, Zod .max(), owner asymmetry) — all 4 fixed and pushed
- Copilot: reviewed all 11 feature files ("unable to run full agentic suite" due to 341 files), provided inline comments
- pr-review.yml and security-review.yml: triggered and completed

Instructions:

1. Verify PR #35 exists and has review comments:
   ```
   gh pr view 35 --repo PedroCF87/nextjs-feature-flag-exercise --json reviews,comments,state
   ```

2. If any additional documentation commits are needed (from T1-T5 artifacts), push them to exercise-2 first so they appear in the PR.

3. Document the review evidence in .agents/closure/e2-pr-review-evidence.md:

   ## PR #35 Review Evidence

   | Reviewer | Type | Files Reviewed | Issues Found | Issues Resolved |
   |----------|------|---------------|--------------|-----------------|
   | Claude bot | Automated (pr-review.yml) | 11 feature files | 4 | 4 ✅ |
   | Copilot | Automated (copilot review) | 11 feature files | informational | N/A |
   | Human | Manual code review | — | — | — |

   ## Workflow Trigger Evidence
   - pr-review.yml: triggered ✅ (link to run)
   - security-review.yml: triggered ✅ (link to run)

   ## Review Issues and Resolutions
   1. Timer unmount cleanup → added useEffect cleanup
   2. latestFiltersRef stale-read → direct synchronous assignment
   3. Zod .max(200) missing → added to owner and name fields
   4. Owner exact-match asymmetry → documented as intentional design choice

4. Update task file status to Done, fill sections 5–7.

5. Add ✅ prefix to the T6 heading in the parent story file.

Do NOT commit yet.
````

---

## Prompt 7 — E2-S5-T7: Produce EPIC-2 closure report

```
Task: E2-S5-T7 — Produce the EPIC-2 closure report.

Context:
- Task file: docs/agile/tasks/task-E2S5T7-produce-epic-2-closure-report.md
- Epic 1 closure report for format reference: .agents/closure/epic1-closure-report.md
- Epic 2 DoD: docs/epics/Epic 2 — Preparation Guide (PIV Loop - AI-Assisted Run).md, section 3
- Validation report: .agents/closure/e2-validation-report.md (from T1)
- Metrics: .agents/baseline/measurement-exercise2.md (from T2)
- Comparative analysis: .agents/closure/e2-comparative-analysis.md (from T3)
- Friction log: .agents/baseline/epic2-friction-log.md (from T4)
- System evolution retro: .agents/closure/e2-system-evolution-retrospective.md (from T5)
- PR review evidence: .agents/closure/e2-pr-review-evidence.md (from T6)
- Output: .agents/closure/epic2-closure-report.md

Instructions:

1. Read the Epic 2 file section 3 (Definition of Done) — it has 28 DoD items across 4 phases.

2. Read the Epic 1 closure report (.agents/closure/epic1-closure-report.md) to match the 5-section format.

3. Create .agents/closure/epic2-closure-report.md with:

   ## Metadata
   <!-- artifact_id: epic2-closure-report -->
   <!-- epic_id: EPIC-2 -->
   <!-- produced_at: {{current timestamp}} -->
   <!-- produced_by: measurement agent -->

   ## 1 — EPIC-2 DoD Checklist

   For EACH of the 28 DoD items, provide:
   | # | DoD Item | Status (✅/⚠️/❌) | Evidence |

   Evidence must link to actual files:
   - Phase 1 items (1-7): link to CLAUDE.md, .claude/commands/, .claude/skills/, .agents/reference/, .agents/PRDs/
   - Phase 2 items (8-13): link to branch state, workflow files, PR test
   - Phase 3 items (14-21): link to validation report, types.ts, test results, plan file
   - Phase 4 items (22-28): link to metrics doc, comparative analysis, friction log, PR evidence, this closure report, EPIC-3 handoff

   ## 2 — Residual Risks
   List any open risks. If none: "No open risks. All 28 DoD items confirmed ✅."

   ## 3 — Friction Log Summary
   Top 3 friction points (from epic2-friction-log.md).

   ## 4 — Decisions Record
   Key architectural/process decisions made during Epic 2:
   | Decision | Rationale | Story |

   Include decisions like:
   - "exercise-2 branch from upstream original state" — clean re-implementation
   - "Radix SelectItem sentinel value 'all'" — workaround for empty value crash
   - "Direct synchronous ref assignment" — avoid stale-read in debounced callback
   - "PIV Loop local execution (not cloud)" — Claude Code Extension in VS Code

   ## 5 — Preparation Time
   Reference the timeline and metrics doc for total elapsed time.

4. Update task file status to Done, fill sections 5–7.

5. Add ✅ prefix to the T7 heading in the parent story file.

Do NOT commit yet.
```

---

## Prompt 8 — E2-S5-T8: Produce EPIC-3 handoff document

````
Task: E2-S5-T8 — Produce the EPIC-3 handoff document.

Context:
- Task file: docs/agile/tasks/task-E2S5T8-produce-epic-3-handoff-document.md
- Epic 1 handoff for format reference: .agents/closure/epic1-handoff.md
- Closure report: .agents/closure/epic2-closure-report.md (from T7)
- Output: .agents/closure/epic2-to-epic3-handoff.md

Instructions:

1. Read the Epic 1 handoff (.agents/closure/epic1-handoff.md) to match the 6-section format.

2. Gather current branch state:
   ```
   git log --oneline -5
   git rev-parse HEAD
   git branch -a
   ```

3. Create .agents/closure/epic2-to-epic3-handoff.md with:

   ## Metadata
   <!-- artifact_id: epic2-to-epic3-handoff -->
   <!-- epic_id: EPIC-2 → EPIC-3 -->
   <!-- produced_at: {{current timestamp}} -->

   ## 1 — Starting State
   | Field | Value |
   |-------|-------|
   | Branch + SHA | exercise-2 @ {{SHA}} |
   | Last upstream sync | {{describe}} |
   | Server validation | cd server && pnpm run build && pnpm run lint && pnpm test — ✅ (26 tests) |
   | Client validation | cd client && pnpm run build && pnpm run lint — ✅ |

   ## 2 — AI Layer Coverage
   List ALL AI Layer artifacts and their status:
   - CLAUDE.md ✅
   - .claude/commands/*.md (list each) ✅
   - .claude/skills/ (list each) ✅
   - .agents/reference/*.md (list each) ✅
   - .agents/PRDs/*.md ✅
   - .github/copilot-instructions.md ✅
   - .github/instructions/*.md (list each) ✅
   - .github/agents/*.md (list each) ✅
   - .github/skills/*/SKILL.md (list each) ✅
   - .github/workflows/ (list active) ✅

   ## 3 — Task Reference
   - TASK.md: all 11 criteria met ✅ (link to validation report)
   - Implementation complete on both server and client

   ## 4 — First Story to Execute
   Link to the first story of EPIC-3 (if epic file exists), otherwise state:
   "EPIC-3 stories not yet defined. First action: create EPIC-3 epic file and scaffold stories."

   ## 5 — Top 3 Risks for EPIC-3
   Based on Epic 2 learnings:
   1. Gold Standard migration scope (Bun, Biome, Drizzle, Next.js 16) may require significant refactoring of the existing Express + SQL.js + Vitest stack
   2. Supabase/Drizzle integration replaces SQL.js entirely — all service-layer code and tests will need rewriting, not just refactoring
   3. Two separate AI Layer systems (Copilot .github/ + Claude .claude/) increase maintenance burden — consider consolidating or clearly scoping each toolchain's role

   ## 6 — READY Declaration
   > **READY:** EPIC-2 is closed. All 28 DoD items verified. Branch `exercise-2` is stable
   > with all validation passing. AI Layer (both Copilot and Claude) is complete and validated.
   > EPIC-3 may begin.
   >
   > Signed: {{agent name}}, {{timestamp}}

4. Update task file status to Done, fill sections 5–7.

5. Add ✅ prefix to the T8 heading in the parent story file.

6. Update the parent story E2-S5 status to Done.

7. Now commit ALL E2-S5 artifacts in a single commit:
   ```
   git add .agents/closure/ .agents/baseline/ docs/agile/tasks/task-E2S5T* docs/agile/stories/story-E2S5*
   git commit -m "docs(measurement): complete E2-S5 measurement, comparison, and closure [E2-S5]"
   git push origin exercise-2
   ```
````

---

## Execution Notes

- **T6 may be partially done** — PR #35 exists with reviews. The prompt focuses on documenting evidence rather than creating a new PR.
- **All metric values are pre-filled** from git commit timestamps (`git log --format="%ai %s" exercise-2`) and session context. Review them for accuracy before pasting.
- **"Do NOT commit yet"** rule — Tasks T1–T7 skip the commit step. T8 does a single batch commit with all artifacts.
- If any validation fails in T1, fix it before proceeding to T2.

## Data Sources

| Data | Source | Command |
|------|--------|---------|
| Timestamps per story | Git commit history | `git log --format="%ai %s" --reverse exercise-2` |
| Prompt count | Session history (estimated) | Manual count from conversation |
| Rework cycles | Session events (Radix crash) | From conversation context |
| Confidence | Self-assessment | Based on system preparation level |
| Exercise 1 baseline | `.agents/baseline/measurement-baseline.md` | 212 min, 25 prompts, 3 rework, 3→4→5 |
