# My Gold Standard AI Layers

## Source: Excal-1-Workshop-Guide.md

### Mandatory AI Layer Artifacts

#### 1. Global Rules (`CLAUDE.md`)
- Document PRD decisions (tech stack, architecture, constraints)
- Document project conventions extracted from the existing codebase (brownfield)
- Serve as a stable base that rarely changes (Layer 1 — Project Planning)
- Must be refined during **System Evolution** when error patterns emerge

#### 2. Commands — Core 4 (minimum required)
| Command | PIV Loop Phase | Purpose |
|---------|----------------|---------|
| `/prime` | Planning | Load project context into agent memory |
| `/plan` (or `/plan-feature`) | Planning | Create a structured plan with goals, success criteria, task list, validation strategy |
| `/execute` (or `/implement`) | Implementing | Execute the plan task by task |
| `/commit` | Validating | Conventional commit after validation |

#### 3. Additional Commands Identified
| Command | Phase | Purpose |
|---------|-------|---------|
| `/validate` | Validating | Run full suite: build + lint + tests |
| `/code-review` | Validating | AI-assisted code review |

#### 4. On-Demand Context
- Reference guides for task-specific patterns
- Task-specific rules (Layer 2 — Task Planning, created per feature)
- Integration points documentation
- Codebase analysis for specific tasks

#### 5. Plan Templates
- Plan structure must include: Goal(s), Success criteria, Documentation to reference, Task list, Validation strategy, Desired codebase structure
- Templates must be improved during System Evolution

### Operational Concepts to Implement

#### 6. PIV Loop (Planning → Implementing → Validating)
- The core flow that all artifacts support
- **Planning**: `/prime` + `/plan` — exploration + structured plan
- **Implementing**: `/execute` — task-by-task execution with monitoring
- **Validating**: `/validate` + `/code-review` + `/commit` — tests + review + commit

#### 7. System Evolution (continuous AI layer improvement)
- **When**: implementation deviates from plan, same mistakes repeat, issue patterns emerge, system feels inefficient
- **What to improve**: Commands, On-Demand Context, Global Rules, Plan Templates
- **How**: Iteration report, System-review, AI-assisted reflection, Update system files
- Principle: **"Don't just fix the bug. Fix the system that allowed the bug."**

#### 8. Context Engineering (4 components)
- **Memory** — context persistence across sessions
- **Prompt Engineering** — instruction quality in artifacts
- **RAG** — on-demand retrieval of relevant context
- **Task Management** — task tracking within the plan

#### 9. Two Planning Layers
- **Layer 1 — Project Planning**: tech stack, architecture patterns, constraints + conventions, stable resources (done once, rarely updated)
- **Layer 2 — Task Planning**: codebase analysis, documentation analysis, integration points, task-specific rules (done per feature/task)

### Validation Checklist (extracted from the document)

- [ ] Global Rules (`CLAUDE.md`) documents stack, architecture, and conventions
- [ ] `/prime` command exists and loads project context
- [ ] `/plan` command exists and produces a structured plan with goals + success criteria + task list + validation
- [ ] `/execute` command exists and implements the plan task by task
- [ ] `/commit` command exists and performs conventional commits
- [ ] `/validate` command exists and runs build + lint + tests
- [ ] On-Demand Context available for task-specific patterns
- [ ] Plan Templates include full structure (goals, criteria, docs, tasks, validation, structure)
- [ ] System Evolution process documented (when/what/how to improve)
- [ ] Human + AI validation defined in the loop (unit tests, integration tests, code review, manual tests)

---

## Source: Excal-2-SystemGap.md

### New Concepts (not covered in Excal-1)

#### 10. The System Gap — Quality Criteria for the AI Layer
A well-built AI layer must transform the developer from "Developer A" to "Developer B". The AI layer is **the** differentiator.

| Developer A (without system) | Developer B (with system) |
|------------------------------|---------------------------|
| Hallucinations | AI understands context |
| Missing context | Reads code (codebase-aware) |
| Wasting time | Fast / Efficient |
| Low quality code | High quality code |
| "Fighting" the AI | Complete Context |
| No documentation | Force Multiplier |

**Design goal**: every AI layer artifact must push toward the Developer B column.

#### 11. Baseline Measurement
- Before refining the system, establish a baseline by completing a task "as you normally would"
- Track three metrics: **time spent**, **number of prompts**, and **confidence level (1-10)**
- Use this baseline to measure improvement after System Evolution

#### 12. Target Metric
- Average code acceptance: ~30% (industry norm)
- Top performers achieve **80% code acceptance** (GitHub data)
- The gap is entirely attributable to the system, not the AI model

#### 13. Core Principle — System Over Symptoms
> "It's never a problem with the AI coding assistant; it's a problem with how you use the tool (your system)."

- Top performers invest time in **systems** vs just prompting
- AI must be treated as a **partner tool** for planning, documenting, and validating — not just code generation

### Validation Checklist (incremental from Excal-2)

- [ ] AI layer provides complete context so the agent "understands" the codebase (Developer B: "AI understands")
- [ ] AI layer enables the agent to read and navigate code autonomously (Developer B: "Reads code")
- [ ] Baseline measurement captured before system improvements (time, prompts, confidence)
- [ ] System Evolution addresses root causes, not symptoms ("fix the system, not the bug")

---

## Source: Excal-3-PIVLoop.md

### New Concepts (not covered in Excal-1 or Excal-2)

#### 14. Implementation Monitoring — Trust but Verify
During `/execute`, actively monitor the AI assistant to ensure quality:

- [ ] **Uses your tools correctly** — calls the right commands/functions
- [ ] **Is reading/editing the right files** — navigates autonomously to integration points
- [ ] **Managing its tasks properly** — follows the task list from the plan
- [ ] **Produces "thinking tokens"** — output shows understanding of the plan of attack (not just blind code generation)

**"Thinking tokens"** are a quality signal: intermediate reasoning visible in the agent's output proves it understands context and architecture, not just pattern-matching.

#### 15. Validation Separation — Human vs AI Roles
Clear division of responsibilities during validation:

| Human Validation | AI Coding Assistant Validation |
|------------------|-------------------------------|
| Performs Code Review | Runs Unit Tests |
| Runs Manual Tests | Runs Integration Tests |

*Note: This reinforces the validation checklist from Excal-1 but adds explicit role separation.*

---

## Source: Excal-4-GlobalRules.md

### New Concepts (not covered in Excal-1, Excal-2, or Excal-3)

#### 16. Global Rules File Naming Standards
Different AI coding assistants support different file names:

| File | AI Assistant |
|------|--------------|
| `CLAUDE.md` | Claude Code |
| `AGENTS.md` | Codex, Cursor, Gemini CLI, Factory, etc. |
| `.cursorrules` | Cursor (deprecated) |
| `.windsurfrules` | Windsurf (deprecated) |

**Emerging standard**: `AGENTS.md` is becoming the universal convention.

> **README.md** is for humans to understand a codebase.  
> **AGENTS.md** is for AI to understand a codebase.

**Your global rules file is your day 1 onboarding for your coding assistant.**

#### 17. What to Include in Global Rules (scope definition)
These topics belong in global rules:

- **Tech Stack & Architecture** — runtime, frameworks, database, architecture patterns
- **Code Styles & Patterns** — naming conventions, file organization, idioms
- **Testing Requirements** — test runner, coverage thresholds, test structure
- **Misconceptions AI Often Has With Your Project** — project-specific gotchas that AI frequently gets wrong

**Rule**: If it applies to **ANY task** in the project, it belongs in global rules.

#### 18. What NOT to Include in Global Rules (anti-scope)
These do NOT belong in global rules:

- ❌ **Universal knowledge** not specific to your project (e.g., "TypeScript uses interfaces")
- ❌ **Workflows/commands** — those belong in `/commands` or `/skills`
- ❌ **Anything very specific to your tasks** — use Layer 2 / "As Needed" documents instead
- ❌ **Anything that seriously bloats the rules** — keep it under ~200 lines for adherence

**Rule**: If content changes frequently, it doesn't belong in global rules.

#### 19. Context Loading Tax (economic model)
Every AI session starts with **zero project knowledge**. You pay a context loading cost.

| Approach | Time Cost | Pattern | Cumulative Impact |
|----------|-----------|---------|-------------------|
| **Manual Context Loading** | 5-10 min/session | Explain → work → next session → explain again | Hours wasted |
| **Front Loading (Global Rules)** | 30-60 min once + easy maintenance | Auto-load → work → next session → auto-load | Hours saved |

**ROI**: Global rules amortize the context cost across all sessions.

#### 20. Organizational Metaphor for AI Layer Artifacts
- **Global Rules** = day 1 employee onboarding
- **Dynamic Context** (On-Demand docs) = department training
- **Layer 2 Planning** = this week's assignment

#### 21. Two Loading Strategies (refinement of Layer 1/2 concept)

| Strategy | Scope | Stability | Frequency | When Loaded |
|----------|-------|-----------|-----------|-------------|
| **#1 — Automatic** (Global Rules) | Stable project knowledge | Very rarely changes | Highest level info | Every session |
| **#2 — As Needed** (On-Demand docs) | Project knowledge for specific task types | Changes rarely | More specific instructions | For specific task types |

**Example — Global Rules** (auto-loaded):
```markdown
### Tech Stack
Our tech stack is Python, Postgres for the database, Pydantic AI for the agent framework...

### Architecture
Single AI agent with tools for searching Obsidian files, managing folders...

### Testing Requirements
All features need to be unit and integration tested with pytest...
```

**Example — "As Needed" Document** (loaded by `/plan` or `/execute` for specific task types):
```markdown
### How to build tools into our AI Agent
- When creating tools, add them to the tool registry
- Create docstrings for tools no longer than 300 characters
- Each tool should serve a very unique purpose for the agent
```

**Pattern**: Commands instruct the coding assistant to reference "As Needed" documents when the task type matches.

### Validation Checklist (incremental from Excal-4)

- [ ] Global rules file uses standard naming: `CLAUDE.md` (Claude Code) or `AGENTS.md` (universal)
- [ ] Global rules includes: Tech Stack, Architecture, Code Styles, Testing Requirements, Project-Specific Misconceptions
- [ ] Global rules excludes: universal knowledge, workflows, task-specific content, bloat
- [ ] Global rules kept under ~200 lines for adherence
- [ ] Context Loading Tax paid once via front-loading (30-60 min investment)
- [ ] "As Needed" documents created for task-type-specific patterns (loaded by commands, not auto-loaded)
- [ ] Commands reference "As Needed" documents when task type matches

---

## Source: Excal-5-ReusablePrompts.md

### New Concepts (not covered in Excal-1, Excal-2, Excal-3, or Excal-4)

#### 22. Commands Are Markdown Documents
Commands are simply markdown files that define a **process** (not principles/architecture like global rules).

- **Location**: `.claude/commands/` or `~/.claude/commands/` (user-global)
- **Invocation**: `/command-name` in Claude Code
- **Alternative** (for AI assistants without slash commands): "Read the process in 'command-name.md' and execute the instructions now."

**Example structure:**
```markdown
# Command: /review-code

You are an expert code reviewer evaluating code against our standards:
- Python 3.12 with strict type hints
- Pydantic for validation
- pytest for testing

## Process
Analyze the code for:
1. Type safety issues (missing hints, incorrect types)
2. Pydantic validation errors (schemas and models)
3. Testing gaps (uncovered edge cases)
4. Overall patterns (proper dependency injection, route structure)

## Output Format
For each issue found:
**File/Line:** <path/to/file>:<line>
**Issue:** <Brief summary>
**Suggestion:** <Concrete fix with code example>
**Priority:** Critical/High/Medium/Low
```

#### 23. Dynamic Commands with Parameters
Commands can accept arguments to make them reusable across contexts.

| Syntax | Example Invocation | Variable Substitution |
|--------|-------------------|----------------------|
| `$ARGUMENTS` (all args as single string) | `/fix-issue 123 high-priority` | `$ARGUMENTS` = `'123 high-priority'` |
| `$1`, `$2`, `$3` (positional) | `/review-pr 456 High Alice` | `$1 = '456'`, `$2 = 'High'`, `$3 = 'Alice'` |

#### 24. The Re-Prompting Tax
**Rule**: Type something more than **3 times** → make it a command.

**Hidden costs of one-off prompting:**
- ❌ **Obvious time waste** — 1 min/prompt = hours/month
- ❌ **Inconsistency** — forget parts of the prompt
- ❌ **No improvement** — no systematizing, no iteration
- ❌ **Knowledge not shared** — refined prompts stay in your head, not documented

**Convert to command when you keep typing:**
- "Review this code for bugs, security issues, and performance problems"
- "Create a commit following our team's commit message standards"
- "Explain this code in simple terms with examples"
- "Analyze this for test coverage and suggest improvements"

#### 25. Primary Mental Model for Commands: Input → Process → Output
Every command must define all three stages clearly.

| Stage | Context Engineering Pillars | Purpose |
|-------|---------------------------|---------|
| **Input** | Memory + Prompt Engineering | What the agent needs to **SEE** |
| **Process** | RAG + Tasks + Prompt Engineering | What the agent should **DO** |
| **Output** | Prompt Engineering | What the agent should **SHARE** |

#### 26. Input Section — What the Agent Needs to SEE
Define what context the agent loads before execution:

- Context around the process (domain knowledge, constraints)
- Context specific to right now (**parameters**)
- The **persona** for the agent (explanatory, precise, etc.)
- The parts of the conversation to pay attention to
- How to make assumptions if necessary

**Golden Nugget**: This is where you specify **Layer 1 "on demand" context** to pull!

**Example:**
```markdown
## Input
Read documentation from `docs/architecture.md` and `docs/testing-guide.md`.
You are a precise, security-focused code reviewer.
Focus on the files changed in the current PR.
```

#### 27. Process Section — What the Agent Should DO
Define the step-by-step workflow:

- A **step-by-step process** (a workflow in your system)
- What to **research/analyze**
- How to **manage tasks** (sequential, parallel, conditional)
- What **tools to use** (linter, test runner, git commands)
- What kind of **code changes** to make

**Golden Nugget**: Commands are the **core of your system**. They can be **chained together**.

**Example:**
```markdown
## Process
1. Run `npm run lint` and capture output
2. For each lint error:
   a. Read the file and understand context
   b. Determine if it's a real issue or false positive
   c. Suggest a fix with code snippet
3. Prioritize issues: Critical > High > Medium > Low
```

#### 28. Output Section — What the Agent Should SHARE
Define the deliverable format and structure:

Agents can produce:
- **Code analysis** (issues, patterns, risks)
- **Architecture recommendations** (refactoring suggestions)
- **Code implementation plans** (structured task list)
- **Structured documents** (markdown preferred)
- **Summary of code changes made** (commit message, changelog)

**Golden Nugget**: **Prompt engineering is super important here**. Output format determines how well the command fits with the rest of the system (e.g., plan output becomes input to `/execute`).

**Example:**
```markdown
## Output Format
Produce a markdown file `plan.md` with:
- **Goal**: One-sentence summary
- **Success Criteria**: Checklist of done conditions
- **Tasks**: Numbered list of implementation steps
- **Validation**: Commands to run after implementation
```

#### 29. Command Chaining (teaser)
Commands can be chained: the **output** of one command becomes the **input** of the next.

```
[ Input ] → [ Process ] → [ Output ] → [ Input ] → [ Process ] → [ Output ]
```

**Example workflow:**
1. `/plan feature-name` → produces `plan.md`
2. `/execute plan.md` → implements code, produces `changes.md`
3. `/validate` → runs tests, produces `test-report.md`
4. `/commit` → reads `changes.md` and `test-report.md`, creates conventional commit

### Validation Checklist (incremental from Excal-5)

- [ ] Commands defined as markdown files in `.claude/commands/` or `~/.claude/commands/`
- [ ] Each command has clear **Input**, **Process**, **Output** sections
- [ ] Commands use parameters (`$ARGUMENTS`, `$1`, `$2`, etc.) for reusability
- [ ] Re-prompting tax avoided: any prompt typed >3 times is converted to a command
- [ ] Input section specifies Layer 1 "on demand" context to load
- [ ] Process section defines step-by-step workflow with tools and actions
- [ ] Output section defines structured deliverable format (markdown preferred)
- [ ] Command outputs designed to be inputs to other commands (chaining-ready)

---

## Source: Excal-6-AI-Optimized-Codebases.md

### New Concepts (not covered in Excal-1 through Excal-5)

#### 30. AI-Optimized Codebase Setup Order
The codebase itself must be built in a specific order to maximize AI effectiveness. Each layer compounds quality on the previous one.

| Order | Layer | Purpose | Why This Order |
|-------|-------|---------|----------------|
| 1 | **Testing & Validation** | Linting, type checking, testing | AI needs guardrails from day one |
| 2 | **Logging** | JSON logs: `domain.component.action_state`, request ID correlation, grep-able | See what's happening before building |
| 3 | **Infrastructure** | Multi-stage builds, async framework, type-safe config, auto API docs | Framework before data layer |
| 4 | **Database** | Async ops, provider-agnostic, schema-first migrations | Persistence needs foundation |
| 5 | **Monitoring & Health** | `/health`, `/health/db`, `/health/ready`, global exceptions, error logging | Observable, reportable systems |
| 6 | **Shared Patterns** | Timestamps, Pagination, Errors — extract after infrastructure is solid | Prevents duplication in features |

**Key Principle**: Establish the foundation of your project first, then building everything is much more efficient and reliable.

#### 31. Compounding Quality Effect
Each layer validates the previous layers, creating a compound feedback loop:

- ✅ Tests validate logging
- ✅ Logging enables infrastructure debugging
- ✅ Infrastructure supports database operations
- ✅ Everything builds on foundation after
- → **Production-ready + built for AI from start**

#### 32. Prompt Structure for Setup Steps
When creating setup prompts (commands) for these foundation layers, use this 5-part structure:

| # | Section | Purpose |
|---|---------|---------|
| 1 | **Context Reference** | Point to external docs (On-Demand Context) |
| 2 | **Installation Commands** | e.g., `uv add [package]`, `pnpm add [dep]` |
| 3 | **Implementation Instructions** | File-by-file breakdown |
| 4 | **Testing & Validation** | Multiple validation layers (test runner, linter, Zod, TS type checking) |
| 5 | **Commit & Summary** | `/commit` when green; structured output |

#### 33. Vibe Planning — The Meta-Loop
A lightweight human-AI planning collaboration:

```
Human: Plan X
  ↓
AI: Find docs & sources
  ↓
AI: Structure into steps
  ↓
Result: Code + Docs
```

This is the practical implementation of the **Planning** phase of the PIV loop (Excal-1/3), where the AI researches and structures while the human sets direction.

### Validation Checklist (incremental from Excal-6)

- [ ] Codebase has Testing & Validation infrastructure before feature code (linting, type-check, tests)
- [ ] Structured logging configured: `domain.component.action_state` pattern, JSON format, grep-able
- [ ] Health endpoints exist: `/health`, `/health/db`, `/health/ready`
- [ ] Shared patterns extracted: timestamps, pagination, errors (DRY across features)
- [ ] Foundation layers compound upon each other (tests → logging → infra → DB → monitoring → patterns)
- [ ] Setup prompts follow 5-part structure: Context Ref → Install → Implement → Test & Validate → Commit