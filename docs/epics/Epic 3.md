# Epic 3 — Build a Skill: Context Package Builder

## Metadata

- **ID:** EPIC-3
- **Priority:** P1
- **Related exercise:** Exercise 3 — Build a Skill
- **Depends on:** EPIC-2 (PIV Loop implementation complete, metrics captured, System Evolution retrospective done)
- **Target repository (local clone):** `/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise`
- **Base branch:** `exercise-1` (skill artifacts are portable — branch choice depends on where the test case lives)
- **Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) — iterative design → implement → test on real case → refine
- **Status:** Not started
- **Created at:** 2026-04-16 17:14:39 -03
- **Last updated:** 2026-04-16 17:14:39 -03

---

## 1) Business objective

Create a **reusable, production-quality skill** (`context-package-builder`) that automates the most critical and error-prone step in AI-assisted development: **deciding what context the AI agent should receive for a given task**.

**Workshop framing — The System Gap (Excal-2) and Context Engineering (Excal-3):**
- The workshop's central thesis is that the **system around the AI** determines output quality, not the model.
- The 4 Context Engineering pillars (Excal-3) — **RAG**, **Memory**, **Task Management**, **Prompt Engineering** — all converge on one problem: getting the *right* context to the agent at the *right* time.
- Today, this curation is performed **manually by the architect** every session: "which files should the agent read?", "which constraints matter for this task?", "what patterns does it need to follow?" This is the highest-leverage bottleneck in the workflow.
- The `context-package-builder` skill automates this decision, turning Context Engineering from a human intuition into a repeatable, verifiable process.

**Workshop framing — "3+ times = make it a command/skill" (Excal-5):**
- During Exercises 1 and 2, the architect repeatedly:
  1. Identified relevant source files for a task (by tracing the data flow manually).
  2. Determined which conventions/constraints apply (by re-reading global rules and references).
  3. Decided which files to exclude (noise reduction for the agent's context window).
  4. Assembled a context payload (either mentally or via `/prime` invocations).
- This 4-step workflow happened **before every non-trivial agent interaction** — well above the "3+ times" threshold. It is the ideal candidate for systematization as a skill.

Expected value:
- reduce the "context assembly tax" from ~5–10 min/task (manual) to ~30 sec/task (automated);
- improve agent output quality by ensuring optimal context (neither too much nor too little);
- make the architect's context engineering expertise **transferable** — a less experienced developer using this skill gets the same quality context package;
- demonstrate the workshop's "Build a Skill" methodology: identify routine → formalize process → test on real case → refine;
- produce a reusable artifact that compounds across all future projects (not exercise-specific).

---

## 2) Scope

### In Scope

**Phase 1 — Skill design and specification:**

1. Analyze the context curation patterns used during Exercises 1 and 2 — extract the implicit heuristics the architect applied when deciding what context to give agents.
2. Define the skill's **trigger** (when should it be invoked), **input** (what it receives), **process** (what it does), and **output** (what it produces).
3. Define the **context relevance model**: how the skill determines which files, patterns, and constraints are relevant to a given task. The model should consider:
   - **Data flow tracing:** given a target file or feature, trace upstream (who feeds it) and downstream (who consumes it) in the architectural data flow.
   - **Convention matching:** which global rules, instructions, and on-demand context documents apply to the task's domain (backend, frontend, database, shared).
   - **Constraint extraction:** which project-specific constraints are critical for the task (e.g., SQL.js statement lifecycle, Express error propagation, Zod validation-first).
   - **Noise filtering:** which files are irrelevant and should be explicitly excluded to preserve context window budget.
4. Write the `SKILL.md` following the workshop's **Input → Process → Output** structure (Excal-5), including: persona, trigger conditions, step-by-step process, output format specification, quality checklist, and constraints.
5. Define the **output format** — a structured Context Package manifest (markdown) with sections: Required Files (with read priority), Active Conventions, Critical Constraints, Excluded Files (with rationale), Estimated Context Window Budget, and Suggested Priming Sequence.

**Phase 2 — Skill implementation:**

6. Implement the skill's core logic:
   - **Task parser:** extract intent, target domain (backend/frontend/shared/full-stack), and feature boundary from the task description.
   - **Dependency graph walker:** given the target files, trace imports/exports to identify the minimum connected file set.
   - **Convention mapper:** match the task domain against the AI Layer's instructions, global rules, and on-demand context documents to select relevant conventions.
   - **Constraint extractor:** pull project-specific constraints from global rules and reference documents that are relevant to the task's domain.
   - **Noise filter:** apply exclusion heuristics (test fixtures, configuration files, unrelated features, build artifacts) to minimize context window usage.
   - **Package assembler:** compose the final Context Package manifest with all sections, including the priming sequence (optimal file read order).
7. Create companion artifacts if needed:
   - Template for the Context Package output format.
   - Configuration file for project-specific tuning (customizable exclusion patterns, domain-to-convention mappings).

**Phase 3 — Validation on real cases:**

8. **Test Case A — Backend task:** use the skill to generate a Context Package for "implement server-side filtering in the flags service" (the Exercise 1/2 task). Compare the generated package against the context the architect actually used during Exercise 1 — measure precision (no irrelevant files) and recall (no missing critical files).
9. **Test Case B — Frontend task:** use the skill to generate a Context Package for "add filter controls UI to the flags dashboard". Verify the package includes the correct React/TanStack Query patterns and excludes backend-specific files.
10. **Test Case C — Cross-cutting task:** use the skill to generate a Context Package for "add a new field to the shared types contract and propagate through the full stack". Verify the package correctly identifies the full data flow chain.
11. Measure context package quality metrics: file precision, file recall, constraint completeness, and context window efficiency (total tokens vs. agent's effective context limit).

**Phase 4 — Refinement and documentation:**

12. Refine the skill based on test case results — adjust heuristics, add missing patterns, remove false positives.
13. Document the skill's design decisions and trade-offs.
14. Verify the skill is **project-agnostic** at its core (the conventions/constraints are configurable; the tracing and assembly logic is universal).
15. Record exercise metrics (time, iterations, friction points).
16. Produce EPIC-3 closure report and EPIC-4 handoff.

### Out of Scope

1. Building a full IDE extension or CLI tool — the skill is a SKILL.md document with process instructions, optionally supported by helper scripts.
2. Integrating with external tools (LSP, tree-sitter, etc.) — the skill operates at the file/directory/import level, not at the AST level.
3. Automatic agent invocation — the skill produces the Context Package; the architect or another command decides how to use it.
4. Implementing the actual feature flag filtering (already done in Exercises 1 and 2).
5. Migrating to the Gold Standard stack (that belongs to Epic 4).
6. Creating skills for other workflows (one skill per exercise — focus on depth, not breadth).

---

## 3) Definition of Done (DoD)

This epic is considered complete when **all** items below are true:

**Phase 1 — Skill design:**
1. The skill's trigger, input, process, and output are formally defined and documented.
2. The context relevance model is documented with clear heuristics for: data flow tracing, convention matching, constraint extraction, and noise filtering.
3. The output format (Context Package manifest) is specified with all sections and a worked example.

**Phase 2 — Skill implementation:**
4. `SKILL.md` exists and follows the **Input → Process → Output** structure (Excal-5).
5. The skill can be invoked by an agent or human and produces a complete Context Package from a task description.
6. The skill references the project's AI Layer artifacts (global rules, instructions, on-demand context docs) as its knowledge base.
7. Helper scripts or templates (if any) are functional and tested.

**Phase 3 — Validation:**
8. The skill has been tested on at least 3 real cases (backend, frontend, cross-cutting) against this exercise repository.
9. Each test case has a documented quality assessment: file precision ≥ 80%, file recall ≥ 90%, zero critical constraints missed.
10. The generated Context Package for at least one test case has been used as actual input to an agent task, and the agent's output quality was assessed.
11. Validation evidence (test case results, quality metrics) is documented.

**Phase 4 — Refinement and closure:**
12. The skill has been refined based on test results (at least 1 iteration cycle).
13. The skill is demonstrably **reusable** — its core logic is not hardcoded to the exercise repository (conventions and constraints are configurable).
14. Exercise metrics are captured (time, iterations, friction points, confidence).
15. EPIC-3 closure report produced.
16. EPIC-4 handoff document produced.
17. All changes committed to working branch — no direct commits to `main`.

---

## 4) Risks

1. **Risk:** over-engineering the skill into a tool instead of a reusable process document.
   - **Impact:** excessive implementation time, scope creep beyond exercise deliverables.
   - **Mitigation:** the skill's core is the `SKILL.md` process document. Helper scripts are optional accelerators, not requirements. Time-box implementation to ~60 min.

2. **Risk:** the context relevance model produces too many false positives (irrelevant files included).
   - **Impact:** the Context Package bloats the agent's context window, degrading output quality — the exact opposite of the skill's goal.
   - **Mitigation:** validate against known-good context sets from Exercises 1 and 2. Add explicit exclusion heuristics for common noise patterns (test fixtures, config files, build artifacts).

3. **Risk:** the context relevance model misses critical files (false negatives).
   - **Impact:** the agent lacks essential constraints and produces incorrect code.
   - **Mitigation:** anchor the tracing logic on the data flow architecture (`shared/types.ts` → validation → service → routes → client API → UI). Validate recall against actual implementation file sets.

4. **Risk:** the skill is too tightly coupled to the exercise repository's structure.
   - **Impact:** not reusable on other projects — fails the "reusable across projects" criterion.
   - **Mitigation:** design the skill with configurable inputs (project data flow map, convention file paths, exclusion patterns). Test portability by mentally mapping the skill to the Gold Standard repo (`nextjs-ai-optimized-codebase`).

5. **Risk:** difficulty measuring the skill's effectiveness objectively.
   - **Impact:** cannot demonstrate the value proposition ("does this actually help?").
   - **Mitigation:** define precision/recall metrics before testing. Compare Context Package output against the architect's manual curation as ground truth.

6. **Risk:** confusion between the skill as a "workshop exercise deliverable" and as a "production tool".
   - **Impact:** interview assessment misalignment — over-investing in polish or under-investing in substance.
   - **Mitigation:** the exercise evaluates process quality (identify routine → formalize → test → refine), not tool completeness. Focus on demonstrating the methodology, with the skill as evidence.

---

## 5) Dependencies

### Input dependencies

1. **EPIC-2 fully completed** — PIV Loop metrics captured, AI Layer experience documented, System Evolution retrospective done. The Exercise 2 experience provides the **raw material** for identifying context curation patterns.
2. Existing AI Layer artifacts from Exercises 1 and 2 — global rules, instructions, on-demand context docs, commands, skills — serve as the knowledge base the skill references.
3. Workshop reference materials:
   - `Excal-5-ReusablePrompts.md` (Input → Process → Output structure for skills).
   - `Excal-3-PIVLoop.md` (Context Engineering 4 pillars).
   - Existing skills in `.github/skills/` as structural templates.
4. Exercise repository (`nextjs-feature-flag-exercise`) available as the test case codebase.
5. Exercise 1 and 2 implementation history (which files were actually used for each task) as ground truth for validation.

### Output dependencies (items blocked by this epic)

1. **EPIC-4 (AI-Optimized exercise):** benefits from the `context-package-builder` skill for faster context assembly when working in the Gold Standard codebase.
2. **Workshop interview debrief:** the skill is a key exhibit for demonstrating the "Build a Skill" exercise methodology — identify, formalize, test, refine.
3. **Future projects:** the skill is designed to be portable — usable in any repository with an AI Layer.

---

## 6) Success metrics

1. **Skill deliverable exists:** `SKILL.md` with complete Input → Process → Output specification, quality checklist, and trigger conditions.
2. **Tested on ≥ 3 real cases:** backend task, frontend task, and cross-cutting task — each with documented results.
3. **File precision ≥ 80%:** at least 80% of files in the Context Package are genuinely relevant to the task (minimal noise).
4. **File recall ≥ 90%:** at least 90% of files the architect would manually include are present in the Context Package (no critical gaps).
5. **Zero critical constraints missed:** every project-specific constraint relevant to the task domain appears in the Context Package.
6. **Practical validation:** at least one Context Package was used as actual agent input, and the agent's output was assessed as correct without requiring additional context beyond the package.
7. **Reusability demonstrated:** the skill's core logic is configurable (not hardcoded to the exercise repo), and portability to at least one other project was assessed (even if only as a thought exercise mapped to the Gold Standard repo).
8. **Workshop methodology followed:** the exercise clearly shows the 4-step progression: identify routine → formalize process → test on real case → refine based on results.
9. **Time invested documented:** total time for design + implementation + testing + refinement is tracked.
10. **Friction points recorded:** at least 1 friction point or lesson learned documented for the workshop debrief.

---

## 7) Candidate stories for the epic

### Story E3-S0 — Planning automation

**Priority:** P0 | **Depends on:** EPIC-2 closure

**Description:** generate detailed story MDs for all Epic 3 stories and task files, then sync the backlog index.

**Execution:**
1. Invoke `scaffold-stories-from-epic` on this epic to generate detailed story MDs (E3-S1 to E3-S4).
2. For all stories, invoke `create-story-task-pack` to generate task files.
3. Review generated documents with `story-task-reviewer` agent.
4. Sync backlog index with `sync-backlog-index`.

**Key outputs:**
- 4 detailed story MDs.
- Task files for all stories in `docs/agile/tasks/`.
- Updated `backlog-index.json`.

---

### Story E3-S1 — Skill design and specification

**Priority:** P0 | **Depends on:** E3-S0

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) → commit to working branch.

**Description:** as an architect building a reusable AI workflow, I want the `context-package-builder` skill fully designed and specified — with a documented context relevance model, output format, trigger conditions, and worked examples — so that the implementation has a clear blueprint and the workshop methodology (identify routine → formalize) is evidenced.

**Key tasks:**
1. **Mine Exercise 1 and 2 patterns:** review friction logs, implementation history, and `/plan` artifacts from both exercises to extract the implicit context curation heuristics the architect applied. Document: which files were selected, why, what was excluded, and what was missed (especially files that caused rework when omitted).
2. **Define the context relevance model:** formalize the 4 sub-processes — data flow tracing, convention matching, constraint extraction, noise filtering — with clear inputs, heuristics, and outputs for each.
3. **Specify the output format:** design the Context Package manifest structure with all sections (Required Files, Active Conventions, Critical Constraints, Excluded Files, Context Window Budget, Priming Sequence). Include a worked example for a backend task.
4. **Write the SKILL.md draft:** complete Input → Process → Output specification including: persona, trigger conditions ("when to use this skill"), step-by-step process, output format, quality checklist, and constraints/anti-patterns.
5. **Peer review:** review the SKILL.md against existing skills in `.github/skills/` to ensure structural consistency and completeness.

**Manual checkpoint:** review the SKILL.md draft for clarity — could another agent execute this skill from the document alone?

---

### Story E3-S2 — Skill implementation

**Priority:** P0 | **Depends on:** E3-S1

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) → commit to working branch.

**Description:** as an architect building a reusable AI workflow, I want the `context-package-builder` skill fully implemented with supporting artifacts (templates, configuration, helper scripts) so that it can be invoked by an agent and produces a complete Context Package from a task description.

**Key tasks:**
1. **Implement the task parser:** write the process section that extracts intent, target domain, and feature boundary from a natural-language task description. Include examples for backend, frontend, and full-stack tasks.
2. **Implement the dependency graph walker:** write the process section that traces the data flow from target files — upstream (who feeds this file) and downstream (who consumes its output). Use the project's known data flow architecture as the base graph.
3. **Implement the convention mapper:** write the process section that matches the task domain against the AI Layer's instructions and reference documents, selecting only relevant conventions.
4. **Implement the constraint extractor:** write the process section that pulls project-specific constraints from global rules and on-demand context docs, filtered by task domain.
5. **Implement the noise filter:** write exclusion heuristics (test fixtures, configs, build artifacts, unrelated features) with configurable patterns.
6. **Implement the package assembler:** write the process section that composes the final Context Package manifest with all sections in the specified output format.
7. **Create the Context Package template:** a markdown template for the output.
8. **Create the project configuration file:** a YAML or JSON file that maps project-specific data flow paths, convention file locations, and exclusion patterns — making the skill portable to other repos.

**Manual checkpoint:** invoke the skill manually against a simple task description and verify the output is structurally complete.

---

### Story E3-S3 — Validation on real cases and refinement

**Priority:** P0 | **Depends on:** E3-S2

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) → commit to working branch.

**Description:** as an architect validating a reusable AI workflow, I want the `context-package-builder` skill tested against 3 real task cases from the exercise repository and refined based on results, so that the skill's effectiveness is objectively measured and its heuristics are calibrated.

**Key tasks:**
1. **Test Case A — Backend task:** invoke the skill with input "implement server-side filtering in the flags service". Compare the generated Context Package against the files actually used during Exercise 1 implementation. Measure file precision, file recall, and constraint completeness. Document findings.
2. **Test Case B — Frontend task:** invoke the skill with input "add filter controls UI to the flags dashboard with environment, status, type, owner, and name search filters". Compare output against the Exercise 1 client-side implementation file set. Document findings.
3. **Test Case C — Cross-cutting task:** invoke the skill with input "add a new `priority` field to the feature flag model and propagate through the full stack: types → validation → service → routes → client API → UI". Verify the package correctly identifies the entire data flow chain. Document findings.
4. **Practical validation:** take the Context Package from Test Case A and use it as the actual context input for an agent task (e.g., ask an agent to outline the implementation approach using only the Context Package as context). Assess whether the agent's output is correct and complete.
5. **Refine the skill:** based on test case results, adjust heuristics (add/remove exclusions, tune data flow tracing, improve convention matching). Document each refinement with rationale.
6. **Portability assessment:** map the skill's configuration to the Gold Standard codebase (`nextjs-ai-optimized-codebase`) — identify which config values would change and whether the core logic remains valid. Document assessment.

**Manual checkpoint:** review all 3 test case results and confirm precision ≥ 80%, recall ≥ 90%, zero critical constraints missed. Sign off on the refined SKILL.md.

---

### Story E3-S4 — Measurement, documentation, and closure

**Priority:** P0 | **Depends on:** E3-S3

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) → commit to working branch.

**Description:** as an engineer completing the "Build a Skill" exercise, I want comprehensive documentation of the skill-building methodology, exercise metrics, and comparative insights so that the workshop debrief has clear evidence of the exercise outcomes.

**Key tasks:**
1. **Capture exercise metrics:** document total time (design + implementation + testing + refinement), number of iterations, friction points encountered, and final confidence score (1–5 scale).
2. **Write the skill narrative:** document the 4-step methodology journey — (a) identifying the recurring routine from Exercises 1/2 friction, (b) formalizing the process as SKILL.md, (c) testing on 3 real cases, (d) refining based on evidence. This narrative is the primary workshop deliverable.
3. **Record friction points:** document the main challenges: what was harder than expected, what the skill cannot handle well, and what surprised you.
4. **Compare with manual process:** produce a before/after assessment — manual context curation (Exercise 1/2 experience) vs. skill-assisted context packaging. Quantify: time saved per task, consistency improvement, error reduction.
5. **Produce EPIC-3 closure report.**
6. **Produce EPIC-4 handoff document.**

**Manual checkpoint:** review all evidence artifacts. Confirm the narrative clearly demonstrates the workshop's "Build a Skill" methodology.

---

## 8) AI Layer execution map

Which agents and skills are responsible for executing each story in this epic.

| Story | Responsible agent(s) | Skills | Instructions |
|---|---|---|---|
| E3-S0 — Planning automation | `agile-exercise-planner` | `scaffold-stories-from-epic`, `create-story-task-pack`, `sync-backlog-index` | `agile-planning.instructions.md` |
| E3-S1 — Skill design and specification | `prompt-engineer`, `rdh-workflow-analyst` | `analyze-rdh-workflow`, `create-specialist-agent` | `copilot-config-governance.instructions.md`, `feature-flag-exercise.instructions.md` |
| E3-S2 — Skill implementation | `prompt-engineer`, `task-implementer` | `execute-task-locally` | `coding-agent.instructions.md`, `copilot-config-governance.instructions.md` |
| E3-S3 — Validation and refinement | `task-implementer`, `code-reviewer` | `execute-task-locally`, `record-friction-point` | `coding-agent.instructions.md`, `feature-flag-exercise.instructions.md` |
| E3-S4 — Measurement and closure | `agile-exercise-planner` | `produce-epic-closure-report`, `produce-epic-handoff`, `record-friction-point` | `documentation.instructions.md`, `measurement-baseline.instructions.md` |

---

## 9) Technical reference

### Skill architecture

The `context-package-builder` skill follows the workshop's standard skill structure:

```
.github/skills/context-package-builder/
├── SKILL.md                          # Main skill document (Input → Process → Output)
├── templates/
│   └── context-package.template.md   # Output format template
└── config/
    └── project-config.yaml           # Project-specific configuration (portable)
```

### Context Package output format (target)

```markdown
# Context Package: {task-description}

## Metadata
- Generated by: context-package-builder
- Task domain: {backend | frontend | shared | full-stack}
- Feature boundary: {feature name}
- Estimated context tokens: {count}

## 1) Required Files (read priority order)
| # | File | Relevance | Priority |
|---|------|-----------|----------|
| 1 | shared/types.ts | Source of truth for data contracts | Critical |
| 2 | server/src/services/flags.ts | Business logic — target of change | Critical |
| ... | ... | ... | ... |

## 2) Active Conventions
- {convention from global rules or instructions}
- ...

## 3) Critical Constraints
- {project-specific constraint with file:line reference}
- ...

## 4) Excluded Files (with rationale)
| File/Pattern | Rationale |
|---|---|
| server/src/__tests__/** | Test files — not needed for understanding; add after implementation |
| client/src/components/ui/** | UI primitives — stable, low-relevance to task |
| ... | ... |

## 5) Suggested Priming Sequence
Read files in this order for optimal agent comprehension:
1. {file} — establishes foundation
2. {file} — builds on foundation
3. ...
```

### Context relevance model (4 sub-processes)

| Sub-process | Input | Heuristic | Output |
|---|---|---|---|
| **Data flow tracing** | Target file(s) from task description | Follow `import`/`export` chains upstream and downstream along the project's known data flow | Connected file set |
| **Convention matching** | Task domain (backend/frontend/shared) | Match domain against `.github/instructions/*.md` `applyTo` patterns and `.agents/reference/*.md` scope | Applicable conventions list |
| **Constraint extraction** | Task domain + connected files | Scan global rules and reference docs for constraints mentioning the connected files or their patterns | Critical constraints list |
| **Noise filtering** | Full connected file set | Exclude: test fixtures, build configs, unrelated features, UI primitives (unless task targets them), documentation files | Pruned file set |

### Project data flow (exercise-specific reference)

```
shared/types.ts
  → server/src/middleware/validation.ts   (Zod schemas)
  → server/src/services/flags.ts          (business logic)
  → server/src/routes/flags.ts            (Express handlers)
  → server/src/middleware/error.ts         (error propagation)
  → client/src/api/flags.ts               (fetch wrappers)
  → client/src/App.tsx                     (state management)
  → client/src/components/flags-table.tsx  (data display)
  → client/src/components/flag-form-modal.tsx (data input)
```

### Validation commands

```bash
# Server (from server/)
pnpm run build   # TypeScript type check
pnpm run lint    # ESLint
pnpm test        # Vitest

# Client (from client/)
pnpm run build   # tsc + vite build
pnpm run lint    # ESLint
```

### Workshop methodology reference

| Exercise 3 step | Workshop concept | Reference |
|---|---|---|
| Identify recurring routine | "3+ times = make it a command/skill" | Excal-5 (ReusablePrompts) |
| Define trigger + I→P→O | Input → Process → Output structure | Excal-5 (ReusablePrompts) |
| Write SKILL.md | Skill = subroutine invoked by commands | Excal-1 (Workshop Guide), Excal-4 (GlobalRules) |
| Test on real case | PIV Loop — Validate phase | Excal-3 (PIVLoop) |
| Refine based on results | PIV Loop — Iterate / System Evolution | Excal-3 (PIVLoop), Excal-1 (Workshop Guide) |

### Key patterns to follow

- **Input → Process → Output (Excal-5):** the skill must have a clear Input (task description + project config), Process (4 sub-processes), and Output (Context Package manifest). The Output format must be compatible with downstream commands (`/prime`, `/implement`) as Input.
- **Command chaining compatibility (Excal-5):** the Context Package output should be consumable as input by `/plan` or `/implement` — enabling the chain: `context-package-builder` → Context Package → `/plan` → plan → `/implement` → code.
- **Configurable over hardcoded:** project-specific values (data flow paths, convention file locations, exclusion patterns) must be in a config file, not embedded in the SKILL.md process steps.
- **Skill vs. Command distinction:** the skill is invoked by agents or commands, never directly by the user as a slash command. It's a subroutine in the AI Layer (Tier 3).
- **Quality over completeness:** a Context Package with 80% precision and 90% recall is better than one that includes everything. The goal is **optimal** context, not **maximum** context.

---

## 10) Execution model

This epic uses a **single-phase local execution model** — all work is done in VS Code with Copilot.

```
Exercise 1 + 2 experience (friction logs, implementation history)
    │
    ▼  Mine patterns — "What context did I manually curate?"
Context curation heuristics extracted
    │
    ▼  Formalize — Input → Process → Output (Excal-5)
SKILL.md specification drafted
    │
    ▼  Implement — Process steps, templates, config
Skill artifacts created
    │
    ▼  Test — 3 real cases (backend, frontend, cross-cutting)
Quality metrics (precision, recall, constraints)
    │
    ├── Metrics OK?
    │   YES → proceed to closure
    │   NO  → refine heuristics → re-test
    │
    ▼  Refine — Adjust based on test evidence
Skill finalized
    │
    ▼  Document — Metrics, narrative, friction
EPIC-3 closed → EPIC-4 handoff
```

### Key principles

| Principle | Rationale |
|---|---|
| **Process over tools** | The skill's value is the formalized process, not any tooling. SKILL.md is the primary deliverable. |
| **Test-driven design** | Define test cases (expected Context Packages) before implementation to calibrate the process. |
| **Iterative refinement** | Expect at least 1 refinement cycle after initial testing — this is the PIV "Iterate" phase applied to skill creation. |
| **Portable by design** | Every project-specific value must be in the config file. The SKILL.md core must work for any repo with an AI Layer. |
| **Evidence-based** | Every design decision in the skill must trace back to real experience from Exercises 1/2. No speculative heuristics. |