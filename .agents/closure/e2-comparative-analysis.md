# Epic 2 — Comparative Analysis: Exercise 1 vs Exercise 2

## Metadata

| Field | Value |
|---|---|
| **Artifact ID** | e2-comparative-analysis |
| **Produced at** | 2026-04-16 17:11:28 -03 |
| **Produced by** | measurement agent |
| **Sources** | `.agents/baseline/measurement-baseline.md` (E1), `.agents/baseline/measurement-exercise2.md` (E2) |

---

## 1 — Side-by-Side Comparison

| Metric | Exercise 1 (Baseline) | Exercise 2 (PIV Loop) | Delta | Δ% |
|--------|----------------------|----------------------|-------|-----|
| Total time (implementation only) | 212 min | 101 min | **−111 min** | **−52%** |
| Prep overhead | 0 min (no formal prep) | 183 min | +183 min | N/A |
| Total time (prep + impl) | 212 min | 284 min | +72 min | +34% |
| Total time (incl. planning) | ~332 min | ~362 min | +30 min | +9% |
| Prompt count | 25 | 34 | +9 | +36% |
| Rework cycles | 3 | 1 | **−2** | **−67%** |
| Confidence (pre) | 3 | 4 | +1 | — |
| Confidence (mid) | 4 | 5 | +1 | — |
| Confidence (post) | 5 | 5 | 0 | — |
| Server tests (total) | 24 (16 base + 8 new) | 26 (16 base + 10 new) | +2 | +8% |
| Friction points logged | 4 | 3 | −1 | — |
| High-impact friction events | 1 (cloud agent failure) | 0 | −1 | — |

---

## 2 — Prep Overhead Analysis

### Investment vs Return

| Metric | Prep cost (E2-S1 + E2-S2) | Impl savings (E2 vs E1) | Net |
|--------|--------------------------|------------------------|-----|
| Time | 183 min invested | 111 min saved per run | −72 min (first run) |
| Rework | 0 cycles during prep | 2 fewer cycles in impl | Net positive |

### Break-Even Calculation

- **Prep cost:** 183 min (one-time investment in AI Layer + repo config)
- **Per-run savings:** 111 min (212 min baseline − 101 min PIV Loop implementation)
- **Break-even point:** 183 ÷ 111 = **1.65 runs** — the prep investment pays for itself before the end of the second exercise run.

After 2 runs: 183 − (111 × 2) = **−39 min** net savings.
After 3 runs: 183 − (111 × 3) = **−150 min** net savings.

### Front-Loading Context (Excal-4 Reference)

The PIV Loop's "Prepare" phase embodies the Excal-4 principle of **front-loading context**: by writing CLAUDE.md, structured commands, PRDs, and on-demand reference documents before touching implementation code, the AI agent starts each task with architectural boundaries, SQL.js constraints, and data-flow patterns already in context. This eliminated the 3→4 confidence ramp-up observed in Exercise 1 (where mid-implementation uncertainty about SQL.js edge cases produced 2 of the 3 rework cycles).

The 18 AI Layer artifacts (1 CLAUDE.md + 9 commands + 1 skill + 2 PRDs + 5 reference docs) represent a reusable knowledge base: they cost 62 min to produce (E2-S1), but would cost near-zero on subsequent exercises against the same codebase.

---

## 3 — Metric-by-Metric Explanatory Notes

### Time (−52% implementation)

The implementation-only time dropped from 212 min to 101 min. Two factors explain this:

1. **Structured context eliminated discovery latency.** In Exercise 1, the agent had to explore the codebase during implementation (E1-S1: 18 min analysis + discovery during E1-S2/S3). In Exercise 2, `backend-patterns.md`, `sql-js-constraints.md`, and `frontend-patterns.md` made the data flow and SQL.js constraints immediately available, eliminating exploratory prompts.
2. **Per-task validation caught errors at the source.** The `/validate` command enforced build+lint+test after each task, preventing error accumulation. Exercise 1's tsconfig `baseUrl` regression (E1-S2-T5) propagated across tasks before detection; in Exercise 2, the only runtime issue (Radix `SelectItem`) was caught within the same task that introduced it.

### Prompts (+36%)

Prompt count increased from 25 to 34, but this is misleading in isolation:

1. **More prompts ≠ less efficiency.** The 9 additional prompts were concentrated in prep (E2-S1: 3 prompts, E2-S2: 10 prompts) and measurement (E2-S5: 8 prompts). Implementation prompts (E2-S3 + E2-S4: 8 total) were actually *lower* than Exercise 1 (E1-S2 + E1-S3: 15 total) — a **47% reduction** in implementation-phase prompts.
2. **Prep prompts produced durable artifacts.** The 13 prep prompts created 18 AI Layer files that would be reused across future exercises. The prompt-to-artifact ratio in prep was high-value.
3. **Commands reduced back-and-forth.** The `/implement` and `/validate` commands encapsulated multi-step workflows, meaning each prompt did more work. Exercise 1 required separate prompts for "implement," "check build," "fix error," and "re-check" — Exercise 2's commands chained these into single invocations.

### Rework (−67%)

Rework cycles dropped from 3 to 1:

1. **Exercise 1 rework #1 (cloud agent failure, 30 min)** was an infrastructure issue entirely avoided in Exercise 2 by using a local execution model from the start.
2. **Exercise 1 rework #2 (tsconfig baseUrl, 8 min)** was a configuration regression that propagated across tasks. Exercise 2's per-task validation would have caught this immediately.
3. **Exercise 1 rework #3 (LIKE escaping, 5 min)** was a security edge case. Exercise 2's `sql-js-constraints.md` reference doc explicitly documented the LIKE escaping pattern, so the implementation included it from the first pass.
4. **Exercise 2's single rework** (Radix `SelectItem` crash, 15 min) was a runtime-only issue invisible to TypeScript/ESLint/Vitest — demonstrating the current gap in the test suite for component-level rendering tests. Despite this, total rework time decreased from ~43 min to ~15 min.

### Confidence (+1 at pre and mid)

1. **Pre-implementation: 3 → 4.** In Exercise 1, uncertainty centered on SQL.js parameterized query mechanics and LIKE filter composition. In Exercise 2, the PRD and `sql-js-constraints.md` documented these patterns with code examples, raising confidence before the first line of code.
2. **Mid-implementation: 4 → 5.** In Exercise 1, mid-point confidence was limited by the tsconfig regression and open questions about client-side filter state management. Exercise 2 reached the mid-point with zero regressions and a clear Filter Controls component spec in the PRD.
3. **Post-validation: 5 = 5.** Both exercises achieved full confidence after validation. The difference is that Exercise 2 reached this ceiling earlier and with significantly less effort.

---

## 4 — System Gap Assessment

### Excal-2 Reference: Closing the Gap Between Developer A and Developer B

The workshop's System Gap concept (Excal-2) posits that two developers with different levels of codebase familiarity produce different outcomes. The AI Layer's purpose is to encode Developer A's knowledge into reusable artifacts so that Developer B (or an AI agent) can perform at Developer A's level.

**Evidence from this comparison:**

| Gap Dimension | Exercise 1 (no AI Layer prep) | Exercise 2 (with AI Layer) | Gap Closed? |
|---|---|---|---|
| Codebase familiarity | Agent discovered patterns during impl | Patterns pre-documented in reference docs | ✅ Yes |
| SQL.js constraint awareness | 2 rework cycles from SQL.js edge cases | 0 SQL.js-related rework (patterns in `sql-js-constraints.md`) | ✅ Yes |
| Validation discipline | Ad-hoc — some tasks validated, some not | Systematic — `/validate` after every task | ✅ Yes |
| Architecture boundary clarity | Implicit — derived from reading code | Explicit — PRD + `backend-patterns.md` define data flow | ✅ Yes |
| Runtime edge cases | Radix/component issues not preventable | Radix crash still occurred (1 rework) | ❌ Partially |

The one remaining gap — **runtime behavior not covered by the current test suite** — is a known limitation. Adding component-level rendering tests (e.g., Testing Library for Radix interactions) would close this gap in future exercises.

### Quantified Gap Closure

- Implementation time gap: 52% reduction.
- Rework gap: 67% reduction.
- Confidence gap: pre-implementation score rose from 3 to 4 (33% improvement on the 1–5 scale).
- Implementation prompts: 47% reduction (15 → 8).

The PIV Loop demonstrably closes the system gap for known patterns. Emergent issues (novel runtime bugs) remain the primary residual risk.

---

## 5 — Key Takeaways

1. **Implementation speed doubled.** The PIV Loop's Prepare phase cut implementation time by 52% (212 → 101 min) by front-loading architectural context, SQL.js constraints, and component patterns into reusable AI Layer artifacts.

2. **Prep breaks even in under 2 runs.** The 183-minute prep investment recovers in 1.65 exercise runs. For repositories with ongoing feature development, the ROI is strongly positive after the first cycle.

3. **Rework dropped to near-zero for known patterns.** Systematic per-task validation and pre-documented edge cases eliminated 2 of 3 rework cycles. The only surviving rework was an emergent runtime issue invisible to static analysis.

4. **More prompts, less wasted work.** Total prompts rose 36%, but implementation-phase prompts fell 47%. The additional prompts were front-loaded into prep and measurement — producing durable artifacts rather than throwaway debugging cycles.

5. **Confidence starts higher and stabilizes earlier.** Pre-implementation confidence rose from 3 to 4, reaching the "mechanical execution" ceiling (5) at the mid-point rather than post-validation. This suggests the PIV Loop shifts cognitive load from implementation to preparation, where it is more productive.
