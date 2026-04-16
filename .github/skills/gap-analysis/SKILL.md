---
name: gap-analysis
description: Compare two codebases in a structured way to identify gaps in architecture, tooling, and patterns, producing a prioritized transformation roadmap. Use this skill when you need to map Gold Standard vs Current State with file:line evidence.
---

## Context

This skill exists for comparative analysis between repositories in the workshop context, mainly:

- `nextjs-ai-optimized-codebase` (Gold Standard)
- `nextjs-feature-flag-exercise` (Current State / Training Ground)

Goal: generate actionable diagnosis focused on **methodological signal**, **practical impact**, and **execution order**.

## Process (6 dimensions)

1. **Folder structure**
   - Compare feature organization and boundaries (VSA vs layered).
   - Identify improper coupling and missing public API per module.

2. **Tooling and validation**
   - Compare runtime, lint/format, test runner, typecheck, build, and validation commands.
   - Identify differences that affect AI feedback loop (speed, error clarity, standardization).

3. **Code patterns**
   - Compare error handling, logging, input validation, style rules, and service/repository separation.
   - Verify consistency with workshop conventions.

4. **Data architecture**
   - Compare source of truth for types, schema, and validation.
   - Identify drift risk between types, database, and API contracts.

5. **AI-readiness**
   - Measure agent readability: context location, structural predictability, quality of logs and artifacts.
   - Apply `System Gap` lens (repeatable workflow vs ad-hoc prompting).

6. **Tests and quality**
   - Compare layer coverage (service, schema, errors, client), isolation, and quality gates.
   - Identify what is already good and should be preserved.

## Expected Output Format

1. **Executive Summary** (3-7 bullets)
2. **Main table by dimension**
   - Required columns: `Gold Standard | Current State | What to change`
3. **Prioritized roadmap**
   - `Tier 1 (Essencial)` / `Tier 2 (Incremental)` / `Tier 3 (Avançado)`
4. **Insertion points**
   - Exact files to change in the current state
5. **References**
   - Evidências em `file:line`

## Prioritization Criteria

When classifying gaps, consider this order:

1. Relevance to immediate objective (e.g., interview task)
2. Impact on validation loop reliability
3. Ganho de AI-readiness (menos ambiguidade, melhor autocorreção)
4. Implementation cost/risk

## Constraints

- Do not treat the exercise as “wrong”; treat it as a different maturity stage.
- Do not recommend out-of-scope infrastructure migration as a delivery requirement (e.g., replacing SQL.js with Postgres in an exercise task).
- Do not remove valid patterns already present in the exercise.
- Do not produce analysis without concrete code/documentation evidence.

## Quality Checklist

Before finishing:

- [ ] All 6 dimensions were covered.
- [ ] There is at least 1 `file:line` reference per dimension.
- [ ] The roadmap differentiates essential vs incremental vs advanced.
- [ ] Concrete insertion points were listed in the target repository.
- [ ] The analysis explains trade-offs, not only differences.
