# Set Gold Standard Plan

Reference document: `docs/my-gold-standard.md` (My Gold Standard AI Layers)
Target project: `nextjs-ai-optimized-codebase`

---

## Artifact Inventory

### Global Rules
| # | File | Exists |
|---|------|--------|
| G1 | `CLAUDE.md` | ✅ |

### Agents (`.claude/agents/`)
| # | File | Exists |
|---|------|--------|
| A1 | `code-reviewer.md` | ✅ |
| A2 | `code-simplifier.md` | ✅ |
| A3 | `silent-failure-hunter.md` | ✅ |
| A4 | `type-design-analyzer.md` | ✅ |
| A5 | `pr-test-analyzer.md` | ✅ |
| A6 | `comment-analyzer.md` | ✅ |

### Commands (`.claude/commands/`)
| # | File | Maps to Gold Standard |
|---|------|-----------------------|
| C1 | `prime.md` | Core 4 — `/prime` |
| C2 | `plan.md` | Core 4 — `/plan` |
| C3 | `implement.md` | Core 4 — `/execute` |
| C4 | `commit.md` | Core 4 — `/commit` |
| C5 | `validate.md` | Additional — `/validate` |
| C6 | `review-pr.md` | Additional — `/code-review` |
| C7 | `create-pr.md` | Extra |
| C8 | `create-rules.md` | Extra |
| C9 | `create-command.md` | Extra |
| C10 | `create-stories.md` | Extra |
| C11 | `prd-interactive.md` | Extra |
| C12 | `security-review.md` | Extra |
| C13 | `check-ignores.md` | Extra |
| C14 | `rca.md` | Extra — System Evolution |

### Skills (`.claude/skills/`)
| # | File | Exists |
|---|------|--------|
| S1 | `agent-browser/SKILL.md` | ✅ |

### On-Demand Context
| # | File | Exists |
|---|------|--------|
| — | No dedicated on-demand context docs found | ❌ |

---

## Execution Plan

### Phase 1 — Global Rules

#### ✅ [Round 1: Audit `CLAUDE.md`](./phases/phase-1-global-rules/round-1-audit-claude-md.md)

**Gold Standard concepts**: #1, #16, #17, #18, #19, #20, #21

**Prompt:**
> Read `docs/my-gold-standard.md` and `CLAUDE.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `CLAUDE.md` against Gold Standard concepts **#1, #16, #17, #18, #19, #20, #21** (Global Rules scope).
>
> For each concept, state:
> - ✅ **Present** — with evidence (quote or section name)
> - ⚠️ **Partial** — what exists and what's missing
> - ❌ **Missing** — what needs to be added
>
> Then produce a concrete action plan: edits to make to `CLAUDE.md` to reach 100% alignment, respecting the ~200 line limit and anti-scope rules (no workflows, no universal knowledge, no task-specific content).
>
> Output the final rewritten `CLAUDE.md` ready to replace the current one.

---

### Phase 2 — Core 4 Commands (one round per command)

#### [Round 2: Audit `/prime` command](./phases/phase-2-core-commands/round-2-audit-prime.md)

**Gold Standard concepts**: #2, #25 (Input), #26 (Input detail), #8 (Context Engineering)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/prime.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/prime` against Gold Standard concepts **#2** (Core 4), **#25** (Input → Process → Output structure), **#26** (Input section — what the agent needs to SEE), and **#8** (Context Engineering: Memory + RAG).
>
> `/prime` must:
> 1. Load project context into agent memory (concept #2)
> 2. Have clear Input/Process/Output sections (concept #25)
> 3. Input section specifies what files to read and what context to load (concept #26)
> 4. Enable the agent to "understand" the codebase autonomously (Developer B column from concept #10)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `prime.md`.

#### [Round 3: Audit `/plan` command](./phases/phase-2-core-commands/round-3-audit-plan.md)

**Gold Standard concepts**: #2, #5, #9, #25, #26, #27, #28, #33

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/plan.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/plan` against Gold Standard concepts **#2** (Core 4), **#5** (Plan Templates), **#9** (Two Planning Layers), **#25** (Input → Process → Output), **#26** (Input), **#27** (Process), **#28** (Output), **#33** (Vibe Planning).
>
> `/plan` must:
> 1. Accept `$ARGUMENTS` for the feature/task name (concept #23)
> 2. Produce a structured plan including: Goal(s), Success criteria, Documentation to reference, Task list, Validation strategy, Desired codebase structure (concept #5)
> 3. Distinguish Layer 1 (project) from Layer 2 (task) context (concept #9)
> 4. Have clear Input/Process/Output sections (concept #25)
> 5. Input loads On-Demand Context docs as needed (concept #26 Golden Nugget)
> 6. Output is structured markdown that chains into `/implement` (concepts #28, #29)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `plan.md`.

#### [Round 4: Audit `/implement` command](./phases/phase-2-core-commands/round-4-audit-implement.md)

**Gold Standard concepts**: #2, #6, #14, #25, #27, #29

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/implement.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/implement` against Gold Standard concepts **#2** (Core 4 — `/execute`), **#6** (PIV Loop — Implementing phase), **#14** (Trust but Verify monitoring), **#25** (Input → Process → Output), **#27** (Process section), **#29** (Command Chaining — receives `/plan` output as input).
>
> `/implement` must:
> 1. Accept a plan file as `$ARGUMENTS` (concept #23)
> 2. Execute the plan task by task (concept #2)
> 3. Follow the PIV Loop implementing phase (concept #6)
> 4. Process section includes step-by-step workflow with tools and validation (concept #27)
> 5. Chain from `/plan` output (concept #29)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `implement.md`.

#### [Round 5: Audit `/commit` command](./phases/phase-2-core-commands/round-5-audit-commit.md)

**Gold Standard concepts**: #2, #6, #25, #28, #29

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/commit.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/commit` against Gold Standard concepts **#2** (Core 4), **#6** (PIV Loop — Validating phase), **#25** (Input → Process → Output), **#28** (Output section — structured output), **#29** (Command Chaining — runs after `/validate`).
>
> `/commit` must:
> 1. Create a conventional commit (concept #2)
> 2. Follow Input/Process/Output structure (concept #25)
> 3. Output is the final step in the PIV chain (concept #29)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `commit.md`.

---

### Phase 3 — Additional Commands (one round per command)

#### [Round 6: Audit `/validate` command](./phases/phase-3-additional-commands/round-6-audit-validate.md)

**Gold Standard concepts**: #3, #6, #15, #25, #30, #31

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/validate.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/validate` against Gold Standard concepts **#3** (Additional commands), **#6** (PIV Loop — Validating), **#15** (Validation Separation — AI runs tests), **#25** (Input → Process → Output), **#30** (Testing & Validation as foundation layer), **#31** (Compounding Quality Effect).
>
> `/validate` must:
> 1. Run the full suite: build + lint + tests (concept #3)
> 2. Fulfill the AI Validation role: unit + integration tests (concept #15)
> 3. Have clear Input/Process/Output sections (concept #25)
> 4. Leverage the project's testing & validation infrastructure (concept #30)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `validate.md`.

#### [Round 7: Audit `/review-pr` command](./phases/phase-3-additional-commands/round-7-audit-review-pr.md)

**Gold Standard concepts**: #3, #15, #25

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/review-pr.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/review-pr` against Gold Standard concepts **#3** (Additional commands — `/code-review`), **#15** (Validation Separation — AI performs code review), **#25** (Input → Process → Output).
>
> `/review-pr` must:
> 1. Perform AI-assisted code review (concept #3)
> 2. Have clear Input/Process/Output sections (concept #25)
> 3. Output structured issues with file:line, severity, suggestion (Excal-5 example)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `review-pr.md`.

#### [Round 8: Audit `/create-pr` command](./phases/phase-3-additional-commands/round-8-audit-create-pr.md)

**Gold Standard concepts**: #25, #29

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/create-pr.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/create-pr` against Gold Standard concepts **#25** (Input → Process → Output) and **#29** (Command Chaining — integrates at the end of the PIV chain).
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `create-pr.md`.

#### [Round 9: Audit `/rca` command (Root Cause Analysis)](./phases/phase-3-additional-commands/round-9-audit-rca.md)

**Gold Standard concepts**: #7, #25

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/rca.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/rca` against Gold Standard concepts **#7** (System Evolution — "fix the system that allowed the bug") and **#25** (Input → Process → Output).
>
> `/rca` must:
> 1. Support System Evolution: diagnose root causes, not just symptoms (concept #7, #13)
> 2. Output actionable improvements to Commands, Global Rules, On-Demand Context, or Plan Templates (concept #7)
> 3. Have clear Input/Process/Output sections (concept #25)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `rca.md`.

#### [Round 10: Audit `/security-review` command](./phases/phase-3-additional-commands/round-10-audit-security-review.md)

**Gold Standard concepts**: #25

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/security-review.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/security-review` against Gold Standard concept **#25** (Input → Process → Output structure).
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `security-review.md`.

#### [Round 11: Audit `/create-rules` command](./phases/phase-3-additional-commands/round-11-audit-create-rules.md)

**Gold Standard concepts**: #1, #17, #18, #25

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/create-rules.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/create-rules` against Gold Standard concepts **#1** (Global Rules purpose), **#17** (What to include), **#18** (What NOT to include), **#25** (Input → Process → Output).
>
> `/create-rules` must guide the agent to produce rules that:
> 1. Include Tech Stack, Architecture, Code Styles, Testing, Misconceptions (concept #17)
> 2. Exclude universal knowledge, workflows, task-specific content, bloat (concept #18)
> 3. Stay under ~200 lines (concept #18)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `create-rules.md`.

#### [Round 12: Audit `/create-command` command](./phases/phase-3-additional-commands/round-12-audit-create-command.md)

**Gold Standard concepts**: #22, #23, #24, #25, #26, #27, #28

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/create-command.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/create-command` against Gold Standard concepts **#22** (Commands are markdown), **#23** (Dynamic parameters), **#24** (Re-prompting Tax), **#25** (Input → Process → Output), **#26** (Input detail), **#27** (Process detail), **#28** (Output detail).
>
> `/create-command` must guide the agent to produce commands that follow the full Input → Process → Output mental model with parameters.
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `create-command.md`.

#### [Round 13: Audit `/prd-interactive` command](./phases/phase-3-additional-commands/round-13-audit-prd-interactive.md)

**Gold Standard concepts**: #9, #25, #33

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/prd-interactive.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/prd-interactive` against Gold Standard concepts **#9** (Two Planning Layers — Layer 1 Project Planning), **#25** (Input → Process → Output), **#33** (Vibe Planning — Meta-Loop).
>
> `/prd-interactive` must:
> 1. Support Layer 1 Planning: tech stack, architecture, constraints, conventions (concept #9)
> 2. Follow Input/Process/Output structure (concept #25)
> 3. Collaborate in the Vibe Planning meta-loop: Human plans → AI finds docs → AI structures → Result (concept #33)
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `prd-interactive.md`.

#### [Round 14: Audit `/create-stories` command](./phases/phase-3-additional-commands/round-14-audit-create-stories.md)

**Gold Standard concepts**: #8, #25

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/create-stories.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/create-stories` against Gold Standard concepts **#8** (Context Engineering — Task Management) and **#25** (Input → Process → Output).
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `create-stories.md`.

#### [Round 15: Audit `/check-ignores` command](./phases/phase-3-additional-commands/round-15-audit-check-ignores.md)

**Gold Standard concepts**: #25

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/commands/check-ignores.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `/check-ignores` against Gold Standard concept **#25** (Input → Process → Output structure).
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `check-ignores.md`.

---

### Phase 4 — Agents (one round per agent)

#### [Round 16: Audit `code-reviewer` agent](./phases/phase-4-agents/round-16-audit-code-reviewer.md)

**Gold Standard concepts**: #15 (Human vs AI validation), #25 (I/P/O)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/agents/code-reviewer.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit the `code-reviewer` agent against Gold Standard concepts:
> - **#15** — Validation Separation: this agent fulfills the AI's Code Review role
> - **#25** — Must have a clear Input → Process → Output flow in its prompt
>
> Additionally, verify agent-specific quality per my claude-ai-layer-engineer mode:
> - `description` contains a specific "Use proactively when..." trigger
> - `tools` is the minimum viable set (no unused tools)
> - Prompt body has: identity statement, numbered process steps, output format, confidence threshold
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `code-reviewer.md`.

#### [Round 17: Audit `code-simplifier` agent](./phases/phase-4-agents/round-17-audit-code-simplifier.md)

**Gold Standard concepts**: #7 (System Evolution), #25 (I/P/O)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/agents/code-simplifier.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `code-simplifier` against Gold Standard concepts:
> - **#7** — System Evolution: supports refactoring/cleanup
> - **#25** — Must have clear Input → Process → Output flow
>
> Verify agent-specific quality:
> - `description` with "Use proactively when..." trigger
> - Minimum viable `tools`
> - Prompt body: identity, process steps, output format, confidence threshold
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `code-simplifier.md`.

#### [Round 18: Audit `silent-failure-hunter` agent](./phases/phase-4-agents/round-18-audit-silent-failure-hunter.md)

**Gold Standard concepts**: #17 (Misconceptions AI Has), #25 (I/P/O)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/agents/silent-failure-hunter.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `silent-failure-hunter` against Gold Standard concepts:
> - **#17** — Addresses "Misconceptions AI Often Has With Your Project" (catches silent failures AI misses)
> - **#25** — Must have clear Input → Process → Output flow
>
> Verify agent-specific quality:
> - `description` with "Use proactively when..." trigger
> - Minimum viable `tools`
> - Prompt body: identity, process steps, output format, confidence threshold
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `silent-failure-hunter.md`.

#### [Round 19: Audit `type-design-analyzer` agent](./phases/phase-4-agents/round-19-audit-type-design-analyzer.md)

**Gold Standard concepts**: #17 (Code Styles & Patterns), #25 (I/P/O)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/agents/type-design-analyzer.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `type-design-analyzer` against Gold Standard concepts:
> - **#17** — Validates Code Styles & Patterns (type/schema design quality)
> - **#25** — Must have clear Input → Process → Output flow
>
> Verify agent-specific quality:
> - `description` with "Use proactively when..." trigger
> - Minimum viable `tools`
> - Prompt body: identity, process steps, output format, confidence threshold
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `type-design-analyzer.md`.

#### [Round 20: Audit `pr-test-analyzer` agent](./phases/phase-4-agents/round-20-audit-pr-test-analyzer.md)

**Gold Standard concepts**: #15 (Validation Separation — AI runs tests), #25 (I/P/O)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/agents/pr-test-analyzer.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `pr-test-analyzer` against Gold Standard concepts:
> - **#15** — Validation Separation: AI runs/analyzes tests
> - **#25** — Must have clear Input → Process → Output flow
>
> Verify agent-specific quality:
> - `description` with "Use proactively when..." trigger
> - Minimum viable `tools`
> - Prompt body: identity, process steps, output format, confidence threshold
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `pr-test-analyzer.md`.

#### [Round 21: Audit `comment-analyzer` agent](./phases/phase-4-agents/round-21-audit-comment-analyzer.md)

**Gold Standard concepts**: #25 (I/P/O)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/agents/comment-analyzer.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `comment-analyzer` against Gold Standard concept **#25** (Input → Process → Output flow).
>
> Verify agent-specific quality:
> - `description` with "Use proactively when..." trigger
> - Minimum viable `tools`
> - Prompt body: identity, process steps, output format, confidence threshold
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `comment-analyzer.md`.

---

### Phase 5 — Skills

#### [Round 22: Audit `agent-browser` skill](./phases/phase-5-skills/round-22-audit-agent-browser.md)

**Gold Standard concepts**: #25 (I/P/O), #32 (Prompt Structure for Setup Steps)

**Prompt:**
> Read `docs/my-gold-standard.md` and `.claude/skills/agent-browser/SKILL.md` from the `nextjs-ai-optimized-codebase` project.
>
> Audit `agent-browser` skill against Gold Standard concepts **#25** (Input → Process → Output) and **#32** (Prompt Structure: Context Ref → Install → Implement → Validate → Commit).
>
> For each requirement: ✅ Present, ⚠️ Partial, or ❌ Missing — with evidence.
> Produce a concrete action plan and the final rewritten `SKILL.md`.

---

### Phase 6 — Gap Analysis (missing artifacts)

#### [Round 23: On-Demand Context Gap](./phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md)

**Gold Standard concepts**: #4, #9, #20, #21

**Prompt:**
> Read `docs/my-gold-standard.md`.
> Read the `CLAUDE.md` and the full `.claude/` directory structure from the `nextjs-ai-optimized-codebase` project.
>
> The Gold Standard requires **On-Demand Context** documents (concept #4, #21):
> - Reference guides for task-specific patterns
> - Task-specific rules (Layer 2 — loaded by commands, not auto-loaded)
> - Integration points documentation
>
> The On-Demand Context metaphor (concept #20): "department training" — more specific than global rules, less specific than a task plan.
>
> Analyze the existing codebase and commands to identify:
> 1. Which commands reference external context docs that don't exist yet?
> 2. What recurring patterns deserve their own On-Demand Context doc?
> 3. What task types would benefit from "As Needed" documents?
>
> Produce a plan listing each On-Demand Context doc to create, with: filename, purpose, which commands load it, and a skeleton of content.

#### [Round 24: Command Chaining Audit](./phases/phase-6-gap-analysis/round-24-command-chaining-audit.md)

**Gold Standard concepts**: #6, #29

**Prompt:**
> Read `docs/my-gold-standard.md`.
> Read ALL commands in `.claude/commands/` from the `nextjs-ai-optimized-codebase` project.
>
> Audit the **PIV Loop chain** (concept #6) and **Command Chaining** (concept #29):
>
> The Gold Standard defines this chain:
> 1. `/prime` → loads context
> 2. `/plan feature` → produces plan.md
> 3. `/implement plan.md` → produces code + changes
> 4. `/validate` → runs tests, produces report
> 5. `/commit` → conventional commit
> 6. `/create-pr` → opens PR
>
> Verify:
> - Does each command's **output** format match the next command's **input** expectation?
> - Are there broken links in the chain?
> - Does `/plan` output a format that `/implement` explicitly reads?
> - Does `/validate` produce structured output that `/commit` can reference?
>
> Produce a compatibility matrix and action plan to fix any broken chain links.

---

## Execution Summary

| Phase | Rounds | Focus | Gold Standard Concepts |
|-------|--------|-------|----------------------|
| 1 — Global Rules | 1 | `CLAUDE.md` | #1, #16-21 |
| 2 — Core 4 Commands | 2-5 | prime, plan, implement, commit | #2, #5, #6, #8, #9, #14, #23, #25-29, #33 |
| 3 — Additional Commands | 6-15 | validate, review-pr, create-pr, rca, security-review, create-rules, create-command, prd-interactive, create-stories, check-ignores | #3, #7, #15, #17, #18, #22-28 |
| 4 — Agents | 16-21 | 6 subagents | #7, #15, #17, #25 |
| 5 — Skills | 22 | agent-browser | #25, #32 |
| 6 — Gap Analysis | 23-24 | On-Demand Context + Chain Audit | #4, #6, #9, #20, #21, #29 |

**Total: 24 rounds**

After all rounds are complete, run a final `/validate` to confirm the full AI layer passes build + lint + tests.