# Phase 4 — Agents: Round 19 — Audit `type-design-analyzer` Agent

**Target file**: `nextjs-feature-flag-exercise/.claude/agents/type-design-analyzer.md`

**Gold Standard concepts**: #17 (Code Styles & Patterns), #25 (Input → Process → Output)

**Agent-specific quality checks**: proactive `description` trigger, minimum-viable `tools`, identity, numbered process, structured output, rating system

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Frontmatter**:
  - `name: type-design-analyzer`
  - `description`: 3 proactive examples with `<commentary>` (new `FlagFilter` type, Zod schemas PR, `rolloutPercentage` field refactor)
  - `model: opus`
  - `tools: Read, Grep, Glob`
  - `color: pink`
- **Body length**: ~132 lines
- **Format**: Markdown headers (agent format)

### Current Content Summary

Section-by-section breakdown of the agent file:

1. **Frontmatter** (lines 1–7): Standard agent YAML. `description` has 3 realistic examples each tied to this project's data contracts (`FlagFilter`, Zod schemas in `validation.ts`, `FeatureFlag` refactor). Examples reference `shared/types.ts` as "the data contract source" — teaches callers the agent's scope.

2. **Identity statement** (line 9): "You are a type design expert with extensive experience in large-scale TypeScript and Zod schema architecture. Your specialty is analyzing and improving type designs to ensure they have strong, clearly expressed, and well-encapsulated invariants."

3. **Core Mission** (lines 11–12): "You evaluate type designs with a critical eye toward invariant strength, encapsulation quality, and practical usefulness. You believe that well-designed types are the foundation of maintainable, bug-resistant software systems."

4. **Analysis Framework** (lines 14–53) — 5 analysis steps:
   - **Step 1 — Identify Invariants** (lines 18–24): 6 probes — data consistency, valid state transitions, field relationship constraints, business-logic rules encoded in type, preconditions/postconditions, **SQL.js storage constraints (booleans as INTEGER, relationships as foreign keys)**
   - **Step 2 — Evaluate Encapsulation (Rate 1–10)** (lines 26–31): 5 questions — internal details hidden? invariants violate-able from outside? access modifiers / readonly? interface minimal and complete? exported from feature boundary (index.ts in VSA)?
   - **Step 3 — Assess Invariant Expression (Rate 1–10)** (lines 33–38): 5 questions — invariants clearly communicated through structure? compile-time enforcement? type self-documenting? edge cases obvious from definition? **union types used for enums instead of TypeScript `enum`**
   - **Step 4 — Judge Invariant Usefulness (Rate 1–10)** (lines 40–45): 5 questions — prevents real bugs? aligned with business requirements? reasons easier? neither too restrictive nor too permissive? **reflects SQL.js constraints accurately**
   - **Step 5 — Examine Invariant Enforcement (Rate 1–10)** (lines 47–52): 5 questions — checked at construction (Zod parse)? all mutations guarded? impossible to create invalid instances? runtime checks comprehensive? **Zod v4 used**

5. **Project-Specific Checks** (lines 54–63) — 8-item checklist specifically for this project:
   - Data contract flow: `shared/types.ts` → `validation.ts` → service → routes → client API
   - Zod location: schemas in `server/src/middleware/validation.ts`, not inline in routes
   - Zod v4 import: `from "zod/v4"` (NOT `from "zod"`)
   - SQL.js booleans: modeled as `0 | 1` or converted at service layer
   - Union types for enums: `'development' | 'staging' | 'production'` (NOT TypeScript `enum`)
   - Type-only imports: `import type`
   - Naming consistency: PascalCase types, camelCase fields
   - Schema alignment: Zod schemas infer to same shape as TS types

6. **Output Format** (lines 65–96) — structured template with 6 sections:
   - Heading: `## Type: [TypeName or SchemaName]`
   - Invariants Identified (bulleted)
   - Ratings (4 dimensions, each X/10 with brief justification)
   - Strengths
   - Concerns
   - Recommended Improvements (concrete, actionable, with `file:line` when possible)

7. **Key Principles** (lines 98–107) — 7 design philosophy bullets:
   - Compile-time over runtime when feasible
   - Clarity > cleverness
   - Consider maintenance burden
   - "Perfect is the enemy of good" — pragmatic
   - **Types should make illegal states unrepresentable**
   - Constructor validation (Zod parse) crucial
   - Immutability simplifies invariant maintenance
   - `shared/types.ts` is single source of truth

8. **Common Anti-patterns** (lines 109–119) — 9 project-specific anti-patterns to flag:
   - Anemic domain models
   - Mutable internals exposed
   - Invariants enforced only through documentation
   - TypeScript `enum` instead of union types
   - Wrong Zod import (`from "zod"` vs `from "zod/v4"`)
   - Validation schemas inline in routes (should be in `validation.ts`)
   - Zod schemas not aligned with `shared/types.ts` TypeScript types
   - Boolean fields in types when SQL.js stores as INTEGER (0/1)
   - Missing `import type`

9. **When Suggesting Improvements** (lines 121–132): 6 considerations (complexity cost, breaking-change justification, skill level of codebase, performance impact, safety-usability balance, **SQL.js storage constraints impact on type design**) + closing paragraph: "Sometimes a simpler type with fewer guarantees is better than a complex type that tries to do too much."

### Strengths Already Present

- **Proactive description** with 3 project-realistic examples each anchored to a concrete type (`FlagFilter`, Zod schemas, `FeatureFlag` refactor) and each with `<commentary>` explaining trigger reasoning ✅
- **4-dimension quantitative rating system** (Encapsulation / Expression / Usefulness / Enforcement, each 1–10) — forces numeric grounding, prevents vague "seems fine" judgments ✅
- **Read-only `tools`** (`Read, Grep, Glob`) — exemplary; correctly scoped for an analysis agent ✅
- **Project-Specific Checks** section with 8 project-aware items — best-in-class coverage of this exercise's data-contract rules ✅
- **Common Anti-patterns** with 9 codebase-specific items — including the subtle `from "zod"` vs `from "zod/v4"` pitfall ✅
- **SQL.js storage awareness** runs through all 5 analysis steps — catches the common mistake of modeling booleans as `boolean` when SQL.js stores them as INTEGER ✅
- **"Make illegal states unrepresentable"** — a Gold-Standard-grade type design principle stated explicitly ✅
- **Pragmatism guardrails** — "perfect is enemy of good", "complexity cost", "skill level of existing codebase" — prevents over-engineering recommendations ✅
- **Output template with `file:line` requirement** for Recommended Improvements — makes findings actionable ✅
- **VSA (Vertical Slice Architecture) awareness** — mentions exporting types from feature boundary (`index.ts`) ✅
- **Data contract flow explicit**: `shared/types.ts` → `validation.ts` → service → routes → client API — the agent knows the path that a type takes through the layers ✅

### Issues Spotted Before Audit

1. **No scope pre-condition** — agent starts with "When analyzing a type, you will..." but doesn't define *which* type(s) to analyze. If invoked with no context, behavior is undefined.

2. **No Invocation Context** — not stated when this agent fires. The `description` examples suggest: (a) new type introduction, (b) PR creation with Zod schemas, (c) type refactor. But no formal positioning relative to PIV workflow.

3. **No `.agents/reference/*` loading** — project has `.agents/reference/sql-js-constraints.md` (Round 23 audit) — exactly this agent's SQL.js concerns. The agent embeds its own SQL.js checks (correctly) but doesn't consult the canonical on-demand doc, which may drift.

4. **No System Evolution signal** — when the same type design anti-pattern appears repeatedly (e.g., 5 places use `from "zod"` instead of `from "zod/v4"`), it indicates either a `rule-violation` (convention ignored) or a `rule-gap` (convention not documented). Gold Standard §17 / §7 establishes a feedback loop; Round 9 (`/rca`), Round 17 (`code-simplifier`), and Round 18 (`silent-failure-hunter`) all added this channel. This agent — the *specialist* for type-design AI Gotchas — should also emit these signals.

5. **No cross-agent coordination** — overlaps with `code-reviewer` (no `any`, `import type`), `silent-failure-hunter` (Zod validation propagation), `code-simplifier` (surface-level type cleanup). Without routing, same issues may be reported 3 ways.

6. **No rendered output example** — the 6-section template is defined but no concrete rendered analysis is shown. Agent descriptions get ambiguous without a concrete anchor.

7. **No empty-state handling** — what if the scope contains no types worth analyzing (e.g., pure control-flow code with no type declarations)? Output template expects at least one type.

8. **No new-type vs existing-type distinction** — analyzing a *new* type (first introduction) has different focus than analyzing an *existing* type being modified. New types: check invariants from scratch. Existing types: focus on changes + downstream impact. Currently treated identically.

9. **No `ts-morph` / AST-level guidance** — the agent uses `Read, Grep, Glob` to inspect types. For complex types (generics, conditional types, mapped types), grep alone can miss structure. No guidance on how deep to go without AST tools.

10. **No "When NOT to use" in `description`** — could route users to other agents for non-type concerns.

11. **Anti-patterns list is discovery-oriented, not resolution-oriented** — lists 9 patterns to flag, but doesn't provide side-by-side "wrong vs. correct" examples (unlike `silent-failure-hunter`'s Reference Library which is the strongest teaching artifact in the codebase).

12. **No top-level summary block** — output has per-type sections but no rollup when analyzing multiple types (e.g., a PR that adds 5 types). Breakdown of average ratings, anti-pattern hit count, file distribution.

13. **No rating-threshold guidance** — 1–10 scale defined but no threshold at which "Concerns" become "Critical" vs "Nice-to-have". `code-reviewer` has ≥80 confidence threshold; this agent should have analogous rating thresholds (e.g., "any dimension <5 → Critical; 5–7 → Important; 8–10 → Satisfactory").

14. **No downstream chain hints** — after analysis, the user has no guidance. Should chain to `code-simplifier` (for surface cleanup — `import type` additions), `code-reviewer` (for broader review), `/rca` (for unclear design decisions), `/validate` (after fixes).

15. **`description` examples don't cover pre-existing type review** — all 3 examples trigger on *new or modified* types. A periodic "audit all types in `shared/types.ts`" invocation isn't covered.

---

## Concept-by-Concept Audit

### Concept #17 — Code Styles & Patterns (Type Design Pillar)

> Gold Standard §17 names "Code Styles & Patterns" as a pillar of CLAUDE.md. Type design is a subset — how types are structured, named, and enforced is as much a project convention as error handling or naming. `type-design-analyzer` is the specialist agent for this pillar.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Enforces project type conventions | ✅ Strong | 8-item Project-Specific Checks: Zod location, `zod/v4` import, SQL.js booleans, union types, `import type`, naming, schema alignment |
| Catches AI-likely mistakes | ✅ Strong | Anti-patterns list names `from "zod"` instead of `from "zod/v4"` (AI default), TS `enum` instead of union (AI default), inline Zod in routes (AI convenience pattern), boolean in type when SQL.js uses INTEGER |
| Aligned with CLAUDE.md §Code Styles | ⚠️ Partial | No explicit CLAUDE.md re-read at start; agent's embedded checks may drift from CLAUDE.md over time |
| Feeds CLAUDE.md §AI Gotchas | ❌ Missing | The 9-item anti-patterns list IS a gotchas list — but there's no mechanism to promote newly-discovered patterns to CLAUDE.md §AI Gotchas when observed in the wild. No classification of recurring patterns |
| Classifies misses (rule-violation vs rule-gap vs process-gap) | ❌ Missing | Round 9 `/rca` introduced this taxonomy; this agent should emit the same for recurring anti-patterns |
| Routes recurring findings to `/rca` | ❌ Missing | Not stated |

**Actions:**
- [ ] Add to Output Format an optional **"System Evolution"** section that activates when the same anti-pattern recurs ≥3 times OR the anti-pattern isn't in the agent's documented list / CLAUDE.md §AI Gotchas. Format:

  ```
  ## System Evolution (optional — emit only when triggered)

  **Trigger**: Same type-design anti-pattern found in ≥3 places, OR the pattern isn't currently covered in CLAUDE.md / `.agents/reference/sql-js-constraints.md` / this agent's Anti-patterns list.

  **Classification** (choose one):
  - `rule-violation` — the correct pattern IS documented; it was ignored. Signal: upstream review (`/review-pr`, `code-reviewer`) missed it.
  - `rule-gap` — the pattern is NOT documented. The observation should be promoted to `CLAUDE.md §AI Gotchas` or `.agents/reference/backend-patterns.md`.
  - `process-gap` — the pattern is documented and typically caught, but a specific workflow regressed it.

  **Recommended action**:
  - `rule-violation` → `/rca "why did /review-pr miss {pattern} in {N} places?"`
  - `rule-gap` → summarize the correct pattern for human addition to CLAUDE.md §AI Gotchas. Do NOT self-modify.
  - `process-gap` → recommend updating the specific command's checklist.

  **Example entry**:
  - **Pattern**: `import { z } from "zod"` instead of `import { z } from "zod/v4"`
  - **Occurrences**: 4 — `server/src/middleware/validation.ts:1`, `server/src/routes/flags.ts:3`, `server/src/routes/users.ts:3`, `shared/schemas.ts:1`
  - **Classification**: `rule-violation` (CLAUDE.md §Code Style covers Zod v4; also in this agent's Project-Specific Checks)
  - **Recommended action**: `/rca "why did /review-pr miss 4 wrong Zod imports?"`
  ```

- [ ] Add a new **Step 6 — CLASSIFY RECURRENCES** to the Analysis Framework:
  > 6. **CLASSIFY RECURRENCES** — Count each distinct anti-pattern's occurrences across the scope.
  >   - If the same anti-pattern appears in ≥3 places: aggregate into a single finding AND emit a System Evolution classification.
  >   - If you apply an anti-pattern rule that isn't in CLAUDE.md / `.agents/reference/*.md` / this agent's documented list: emit `rule-gap` classification with the correct pattern summarized for human review.
  >   - Do NOT modify CLAUDE.md yourself — flag for human decision.

---

### Concept #25 — Input → Process → Output

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | No explicit scope pre-condition. `description` examples carry the context but no formal Input section |
| **Process** | ✅ Strong | 5 analysis steps explicit (will be 6 with CLASSIFY RECURRENCES addition) |
| **Output** | ✅ Strong | 6-section structured template per type — but no rendered example, no top-level summary, no System Evolution channel |

**Actions:**
- [ ] Add explicit Input pre-conditions (see Concept #26 below).
- [ ] Add rendered example + top-level summary + System Evolution section to Output (see Concept #28 below).

---

### Concept #26 — Input Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | "type design expert... large-scale TypeScript and Zod schema architecture" |
| Default scope | ❌ Missing | Not stated |
| Custom scope | ❌ Missing | Not stated |
| New-type vs existing-type distinction | ❌ Missing | All types treated identically regardless of whether they're new or modified |
| Empty-scope handling | ❌ Missing | What if scope has no type declarations? |
| `.agents/reference/*` loading | ❌ Missing | Should consult `sql-js-constraints.md` (canonical SQL.js storage rules) and `backend-patterns.md` (validation layer patterns) |
| CLAUDE.md re-read | ❌ Missing | Not mandated |
| Workflow positioning (when this fires) | ❌ Missing | No formal Invocation Context |
| "When NOT to use" | ❌ Missing | No routing to specialist agents |

**Actions:**
- [ ] Add an **Invocation Context** subsection right after Core Mission:
  > ## Invocation Context
  >
  > Invoked when types or Zod schemas are introduced, modified, or reviewed. Typical callers:
  > - **Proactively by the assistant** — when adding a new type to `shared/types.ts`, a new Zod schema to `server/src/middleware/validation.ts`, or modifying an existing domain type.
  > - **During PR creation** — as part of `/review-pr`'s orchestrated pipeline, especially when the diff touches `shared/types.ts`, `validation.ts`, or service-layer data shapes.
  > - **Before a refactor** — when modifying a core domain type (e.g., adding a field to `FeatureFlag`), invoke this agent to assess downstream impact and invariant stability.
  > - **Periodic audit** — to re-audit the full type surface in `shared/types.ts` and Zod schemas. Used sparingly; most runs are scoped to recent changes.
  >
  > **Not a replacement for `/review-pr`** — this is a specialist type-design audit; `/review-pr` orchestrates multiple agents for full coverage.

- [ ] Add a **Scope** subsection before "Analysis Framework":
  > ## Scope
  >
  > **Default**: types and Zod schemas recently modified in:
  > - `shared/types.ts` (domain types)
  > - `server/src/middleware/validation.ts` (Zod schemas)
  > - `server/src/services/*` (data-shape signatures on service methods)
  > - `client/src/api/*` (API response types)
  >
  > Use `git diff HEAD` to identify changes. If nothing changed in these files, check if the user passed a custom scope.
  >
  > **Custom**: If the user specifies types, files, or directories, audit those instead.
  >
  > **Empty-scope STOP**: If both are empty AND no custom scope, reply `No type declarations in scope. Specify types/files, or modify type-related files first.` and exit.
  >
  > **No-types-in-scope case**: If the scope contains only non-type code (pure implementation without type declarations or Zod schemas), emit: `✓ Scope contains no type declarations. Nothing to audit.` and exit.
  >
  > ### New-type vs Existing-type Distinction
  >
  > For each type in scope, classify:
  > - **New type** (first appearance in git history) — full 5-step analysis; focus on designing invariants correctly from scratch.
  > - **Existing type being modified** — focus on: (a) the *delta* from previous version, (b) whether existing invariants still hold, (c) downstream impact on service/routes/client API/tests that use this type.
  > - **Existing type being re-audited** (periodic) — full 5-step analysis but note "no recent changes" in report.

- [ ] Add to the top of "Analysis Framework" a **Pre-Step: LOAD CONTEXT** block:
  > **Pre-Step: LOAD CONTEXT** — Before analyzing any type, read these reference docs (if present):
  > - `CLAUDE.md` §Code Style + §Architecture — project-wide conventions
  > - `.agents/reference/sql-js-constraints.md` — canonical SQL.js storage rules (booleans as INTEGER, parameterization, statement lifecycle)
  > - `.agents/reference/backend-patterns.md` — canonical validation-layer patterns
  > - `shared/types.ts` (full file) — the data-contract source; even if the scope is `validation.ts` only, the Zod schemas must align with types here
  >
  > On conflict between these sources and the agent's embedded Project-Specific Checks: the reference docs win. Flag the drift in the report so CLAUDE.md / the agent can be updated.

- [ ] Append **"When NOT to use"** to `description`:
  > **When NOT to use this agent**:
  > - For error-propagation and silent-failure detection: use `silent-failure-hunter` (the specialist for `next(error)`, `stmt.free()`, Zod parse propagation).
  > - For general code-quality review across layers: use `code-reviewer`.
  > - For applying surface-level type fixes (add `import type`, rename to kebab-case): use `code-simplifier`.
  > - For comment accuracy on type declarations: use `comment-analyzer`.
  > - For test coverage of type boundaries: use `pr-test-analyzer`.
  > This agent owns **type design, invariant expression, Zod schema alignment, and SQL.js storage modeling** exclusively.

---

### Concept #27 — Process Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered analysis steps | ✅ Strong | 5 steps (will be 6 with CLASSIFY RECURRENCES) |
| Tools match steps | ✅ Exemplary | Read, Grep, Glob — read-only |
| Rating dimensions defined | ✅ Strong | 4 dimensions (Encapsulation / Expression / Usefulness / Enforcement), each 1–10 |
| Rating thresholds | ❌ Missing | 1–10 scale defined but no guidance on what rating range is "Critical" vs "Important" vs "Satisfactory" |
| AST-level depth guidance | ❌ Missing | Agent has Read+Grep but no guidance on how to handle complex types (generics, conditional types, mapped types) where grep alone may miss structure |
| Aggregation for repeated anti-patterns | ❌ Missing | 5 places with `from "zod"` → 5 findings |
| Cross-agent coordination | ❌ Missing | Overlaps with other agents |
| Evidence-quoting requirement | ⚠️ Implicit | Output template says "file:line when possible" — should be mandatory |
| Reference Library | ❌ Missing | Anti-patterns listed by name but no side-by-side "wrong vs. correct" code snippets (unlike `silent-failure-hunter`) |

**Actions:**
- [ ] Add **Rating Thresholds** subsection right after the 4-dimension definition:
  > ### Rating Thresholds
  >
  > Each dimension rates 1–10. Map to severity:
  > - **1–4**: **Critical** — the type has a fundamental design flaw. Surface in Concerns as top priority.
  > - **5–7**: **Important** — the type works but invariants are under-expressed or over-permissive. Surface in Concerns.
  > - **8–10**: **Satisfactory** — no action required; may still surface in Strengths.
  >
  > If ANY dimension rates 1–4: the overall type is flagged Critical in the report summary.

- [ ] Add **AST-level depth guidance** to Step 1:
  > **Depth guidance**: `Read` + `Grep` may miss structure in:
  > - Complex generics (conditional types, mapped types, template literal types)
  > - Inheritance chains across files
  > - Cross-file type resolution through re-exports
  >
  > For these cases: (a) read the full defining file, (b) grep for all usages of the type in the codebase to see how invariants are enforced (or violated) at use sites, (c) if still ambiguous, flag "Analysis limited — recommend manual review or `ts-morph`-based deeper audit" in the report rather than guessing.

- [ ] Add **Evidence-quoting requirement** to Step 1:
  > **Evidence rule**: Every identified invariant must quote the actual type declaration (or schema definition) at `file:line`. Every Concern must quote the offending snippet. No paraphrasing — the reader verifies without opening the file.

- [ ] Add **Aggregation Rule** to Step 6 CLASSIFY RECURRENCES:
  > **Aggregation**: If the same anti-pattern (same root cause + same fix) appears in more than 3 places, group into a single aggregated finding.
  >
  > Example:
  > ```
  > [Aggregated — 4 occurrences] Wrong Zod import: `from "zod"` instead of `from "zod/v4"`
  > Files: server/src/middleware/validation.ts:1, server/src/routes/flags.ts:3, server/src/routes/users.ts:3, shared/schemas.ts:1
  > Fix (apply to all): change `import { z } from "zod"` → `import { z } from "zod/v4"`
  > System Evolution: rule-violation (see section below)
  > ```

- [ ] Add a new section **Reference Library — Wrong vs. Correct Type Patterns** after "Common Anti-patterns" (mirror `silent-failure-hunter`'s Reference Library structure). Side-by-side examples for the top 4–5 anti-patterns:

  ```markdown
  ## Reference Library — Wrong vs. Correct Type Patterns

  **CRITICAL: Know the project's canonical patterns.**

  ### Zod v4 import

  **CORRECT**:
  ```ts
  import { z } from "zod/v4";  // this project uses Zod v4
  ```

  **WRONG**:
  ```ts
  import { z } from "zod";  // defaults to installed version; may not align with project's Zod v4 API
  ```

  ### Enum modeling

  **CORRECT** (union type):
  ```ts
  export type Environment = 'development' | 'staging' | 'production';
  export const EnvironmentSchema = z.enum(['development', 'staging', 'production']);
  ```

  **WRONG** (TypeScript `enum`):
  ```ts
  export enum Environment {
    Development = 'development',
    Staging = 'staging',
    Production = 'production',
  }  // TypeScript enums have runtime overhead and awkward serialization; union types are preferred
  ```

  ### SQL.js boolean storage

  **CORRECT** (model as `0 | 1` at storage boundary, convert at service layer):
  ```ts
  // shared/types.ts — domain type (true boolean for consumers)
  export interface FeatureFlag {
    enabled: boolean;
    // ...
  }

  // server/src/services/flags.ts — service converts at DB boundary
  const enabledInt: 0 | 1 = row.enabled === 1 ? 1 : 0;
  return { ...row, enabled: enabledInt === 1 };
  ```

  **WRONG**:
  ```ts
  // shared/types.ts
  export interface FeatureFlag {
    enabled: boolean;
    // ...
  }
  // server/src/services/flags.ts
  return row;  // row.enabled is `0` or `1` — the returned shape violates the FeatureFlag contract
  ```

  ### Zod schema alignment with TS types

  **CORRECT** (schema infers to the TS type):
  ```ts
  // shared/types.ts
  export interface FeatureFlag {
    id: string;
    name: string;
    enabled: boolean;
    environment: 'development' | 'staging' | 'production';
  }

  // server/src/middleware/validation.ts
  import type { FeatureFlag } from '@shared/types';
  import { z } from "zod/v4";

  export const FeatureFlagSchema: z.ZodType<FeatureFlag> = z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    environment: z.enum(['development', 'staging', 'production']),
  });
  ```

  **WRONG** (schema drifts from type):
  ```ts
  // shared/types.ts has `enabled: boolean`, but schema accepts both:
  export const FeatureFlagSchema = z.object({
    enabled: z.union([z.boolean(), z.number()]),  // drift — consumers of FeatureFlag expect boolean only
  });
  ```

  ### Inline validation vs validation.ts

  **CORRECT** (centralized in validation middleware):
  ```ts
  // server/src/middleware/validation.ts
  export const CreateFlagSchema = z.object({ /* ... */ });

  // server/src/routes/flags.ts
  import { CreateFlagSchema } from '../middleware/validation';
  router.post('/', validate(CreateFlagSchema), async (req, res, next) => { /* ... */ });
  ```

  **WRONG** (inline in route):
  ```ts
  router.post('/', async (req, res, next) => {
    const schema = z.object({ /* inline */ });
    schema.parse(req.body);  // duplicated across routes; no single source of truth
    // ...
  });
  ```
  ```

- [ ] Add a **Cross-Agent Coordination** section right after the Reference Library:
  > ## Cross-Agent Coordination
  >
  > When multiple agents run on the same change:
  > - `code-reviewer` — does generic checklist review including `no-any` and `import type` at the surface. This agent (type-design-analyzer) owns **deep type-design judgments** (encapsulation, invariants, Zod alignment, SQL.js storage modeling). On overlap: specialist wins.
  > - `silent-failure-hunter` — owns Zod parse failures propagating via `next(error)` (the *runtime* side). This agent owns the *schema design* side. Both may flag a Zod issue from different angles.
  > - `code-simplifier` — applies surface-level fixes (e.g., adding `import type`); defer structural type changes to this agent.
  > - `comment-analyzer` — owns JSDoc accuracy on types; this agent doesn't critique comments.
  > - `pr-test-analyzer` — verifies tests cover type boundaries; this agent designs the boundaries, analyzer verifies they're tested.
  >
  > **On domain conflict**: this agent wins for type-design, invariant expression, Zod schema alignment, and SQL.js storage modeling. Specialist agents win in their domains.

---

### Concept #28 — Output Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Per-type structured template | ✅ Strong | 6 sections: heading, Invariants, Ratings (4 dimensions), Strengths, Concerns, Recommended Improvements |
| Rating format | ✅ Strong | X/10 + brief justification per dimension |
| Actionability | ✅ Strong | Recommended Improvements requires `file:line` |
| Rating severity mapping | ❌ Missing | Covered in Concept #27 actions |
| Rendered example | ❌ Missing | No concrete rendered analysis |
| Top-level summary (multi-type PR) | ❌ Missing | If analyzing 5 types, no rollup |
| Aggregated-finding format | ❌ Missing | Covered in Concept #27 actions |
| System Evolution channel | ❌ Missing | Covered in Concept #17 actions |
| Empty-state message | ❌ Missing | No message for "scope has no types" or "all types satisfactory" |
| Cross-agent cross-references | ❌ Missing | No hints when another agent would cover adjacent concerns |
| Downstream chain hints | ❌ Missing | After analysis, no next-step guidance |

**Actions:**
- [ ] Add a **Top-Level Summary block** at the start of multi-type output (or after the single-type block if only one type):
  > ```
  > ## Analysis Summary
  > Scope: {files audited}
  > References consulted: {CLAUDE.md + .agents/reference/*.md loaded}
  > Types analyzed: {N} ({n} new + {n} modified + {n} periodic)
  > Average ratings: Encapsulation {X.Y} | Expression {X.Y} | Usefulness {X.Y} | Enforcement {X.Y}
  > Severity breakdown: Critical {n} | Important {n} | Satisfactory {n}
  > Aggregated findings: {count}
  > System Evolution classifications: {rule-violations: n | rule-gaps: n | process-gaps: n}
  >
  > ---
  > (individual per-type analyses follow)
  > ```

- [ ] Add a **Next Steps block** at the end of the output:
  > ```
  > ## Next Steps
  > - Address Critical findings (any dimension <5) before `/commit`.
  > - For aggregated findings: apply the fix uniformly to all listed files. `code-simplifier` can apply surface-level fixes (e.g., `import type`) after your Recommended Improvements are approved.
  > - If System Evolution flagged a rule-gap: summarize the correct pattern for human addition to `CLAUDE.md §AI Gotchas` (do NOT self-modify).
  > - For unclear design decisions (e.g., "should this type be mutable?"): `/rca "<design question>"`.
  > - After fixes: `/validate` to confirm the suite passes.
  > - Downstream: `code-reviewer` for broader correctness review; `silent-failure-hunter` if Zod propagation patterns changed.
  > ```

- [ ] Add **rendered examples** for both a populated multi-type analysis and an empty-state case (see Execution Prompt below for full content).

- [ ] Add **empty-state handling** in Output:
  > ### Empty-State Messages
  >
  > - If scope has no types: `✓ Scope contains no type declarations. Nothing to audit.`
  > - If all types rate ≥8 on all dimensions: `✓ Type design is solid. All {N} types rate Satisfactory on all four dimensions. No immediate action required.`

---

### Concept #29 — Command Chaining (agent context)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Position in workflow | ⚠️ Partial | Implied by `description` examples; no explicit Invocation Context (covered by Concept #26) |
| Chain to `code-simplifier` for surface fixes | ❌ Missing | Covered by Concept #28 Next Steps |
| Chain to `/rca` for unclear design | ❌ Missing | Covered by Concept #28 Next Steps |
| Chain to `/validate` after fixes | ❌ Missing | Covered by Concept #28 Next Steps |
| Relationship to `/review-pr` | ❌ Missing | Covered by Concept #26 Invocation Context |

**Actions:**
- [ ] All covered by Invocation Context (Concept #26) + Next Steps block (Concept #28) + Cross-Agent Coordination (Concept #27).

---

### Agent-Specific Quality Checks

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `description` contains proactive trigger | ✅ Strong | 3 examples with `<commentary>` |
| `description` has periodic-audit trigger | ❌ Missing | No example for periodic full-surface audit |
| `description` specifies when NOT to use | ❌ Missing | Covered in Concept #26 actions |
| Minimum-viable `tools` | ✅ Exemplary | Read, Grep, Glob — read-only |
| Identity statement | ✅ Strong | "type design expert... large-scale TypeScript and Zod schema architecture" |
| Numbered process | ✅ Strong | 5 steps (will be 6 with CLASSIFY RECURRENCES) |
| Rating system | ✅ Strongest | 4-dimension quantitative ratings, best in codebase |
| Output format | ✅ Strong | 6-section per-type template |
| Rendered output example | ❌ Missing | Covered in Concept #28 actions |
| Aggregation rule | ❌ Missing | Covered in Concept #27 actions |
| Reference Library (side-by-side) | ❌ Missing | Covered in Concept #27 actions |
| System Evolution signal | ❌ Missing | Covered in Concept #17 actions |
| Cross-agent coordination | ❌ Missing | Covered in Concept #27 actions |

---

## Action Plan Summary

### Priority 1 — System Evolution Feedback Loop (concept #17) — HEADLINE

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add Step 6 CLASSIFY RECURRENCES to Analysis Framework | #17, #7 |
| 1.2 | Add System Evolution output section with classification (rule-violation / rule-gap / process-gap) + recommended actions | #17, #7 |
| 1.3 | rule-gap findings summarize the correct pattern for human-driven CLAUDE.md §AI Gotchas addition (agent does NOT self-modify) | #17 |
| 1.4 | rule-violation findings route to `/rca "why did /review-pr miss {pattern}?"` | #17, cross-ref Round 9 |

### Priority 2 — Input Pre-conditions (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add Invocation Context subsection (proactive on new type; during `/review-pr`; pre-refactor; periodic audit) | #26 |
| 2.2 | Add Scope subsection with default (`git diff HEAD` on type-related files), custom, empty-scope STOP, no-types-case | #26 |
| 2.3 | Add New-type vs Existing-type-modified vs Periodic-audit distinction with per-mode focus | #26 |
| 2.4 | Add Pre-Step LOAD CONTEXT: CLAUDE.md + `.agents/reference/sql-js-constraints.md` + `backend-patterns.md` + full `shared/types.ts` read | #26, cross-ref Round 23 |
| 2.5 | Append "When NOT to use" to `description` routing to 5 specialist agents | Agent hygiene |
| 2.6 | Add 4th `description` example for periodic full-surface audit trigger | Agent hygiene |

### Priority 3 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add Rating Thresholds: 1–4 Critical / 5–7 Important / 8–10 Satisfactory; any dimension <5 → overall Critical | #27 |
| 3.2 | Add AST-level depth guidance for complex types (generics, conditional, mapped types) — flag limitations explicitly | #27 |
| 3.3 | Add Evidence-quoting requirement: every invariant and concern must quote actual code at `file:line` | #27 |
| 3.4 | Add Aggregation Rule: >3 occurrences → single grouped finding | #27 |
| 3.5 | Add **Reference Library — Wrong vs. Correct Type Patterns** section with 5 side-by-side examples (Zod v4 import, union vs enum, SQL.js booleans, schema alignment, inline vs centralized validation) | #27 |
| 3.6 | Add Cross-Agent Coordination section routing to `code-reviewer`, `silent-failure-hunter`, `code-simplifier`, `comment-analyzer`, `pr-test-analyzer` | #27 |

### Priority 4 — Output Polish (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Add Top-Level Summary block (scope, references consulted, types count, avg ratings, severity breakdown, aggregated count, System Evolution counts) | #28 |
| 4.2 | Add Next Steps block (Critical before `/commit`, aggregation fix, rule-gap human-review, `/rca` unclear, `/validate` after, downstream agents) | #28, #29 |
| 4.3 | Add rendered examples: populated multi-type report + empty-state (2 messages: no types vs all satisfactory) | #28 |
| 4.4 | Add Empty-State Messages subsection | #28 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§17, §25, §26, §27, §28)
2. `.claude/agents/type-design-analyzer.md` — current agent
3. `docs/Gold-Standard-Plan/phases/phase-4-agents/round-19-audit-type-design-analyzer.md` — this audit
4. `.claude/agents/silent-failure-hunter.md` — template for Reference Library structure + Cross-Agent Coordination + Scope + System Evolution
5. `.claude/agents/code-reviewer.md`, `code-simplifier.md`, `comment-analyzer.md`, `pr-test-analyzer.md` — Cross-Agent Coordination references
6. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-9-audit-rca.md` — System Evolution taxonomy source
7. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-11-audit-create-rules.md` — CLAUDE.md §AI Gotchas destination
8. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — `.agents/reference/*` loading pattern

Edit `.claude/agents/type-design-analyzer.md` with these requirements:

1. **Frontmatter** — unchanged (`tools: Read, Grep, Glob` remains exemplary).

2. **Append to `description`** — add a 4th proactive example (periodic audit) + "When NOT to use" paragraph:

   Add this example (after the existing 3):
   > <example>
   > Context: Quarterly codebase health check — the user wants to audit all types in shared/types.ts and all Zod schemas in validation.ts.
   > user: "Can you do a full type-design audit of our data contracts?"
   > assistant: "I'll use the type-design-analyzer agent to perform a periodic audit of every type in shared/types.ts and every schema in validation.ts."
   > <commentary>
   > For periodic full-surface audits, invoke type-design-analyzer with explicit scope. The agent treats these as 'existing type being re-audited' (no recent changes) — full 5-step analysis per type with report-wide summary.
   > </commentary>
   > </example>

   Append:
   > **When NOT to use this agent**:
   > - For error-propagation and silent-failure detection: use `silent-failure-hunter` (the specialist for `next(error)`, `stmt.free()`, Zod parse propagation).
   > - For general code-quality review across layers: use `code-reviewer`.
   > - For applying surface-level type fixes (add `import type`, rename to kebab-case): use `code-simplifier`.
   > - For comment accuracy on type declarations: use `comment-analyzer`.
   > - For test coverage of type boundaries: use `pr-test-analyzer`.
   > This agent owns **type design, invariant expression, Zod schema alignment, and SQL.js storage modeling** exclusively.

3. **Body** — reorganize with these sections in order (preserve 5 analysis steps, 4 rating dimensions, Project-Specific Checks, Common Anti-patterns, Key Principles VERBATIM; add new sections):

   ```markdown
   You are a type design expert with extensive experience in large-scale TypeScript and Zod schema architecture. Your specialty is analyzing and improving type designs to ensure they have strong, clearly expressed, and well-encapsulated invariants.

   **Your Core Mission:**
   You evaluate type designs with a critical eye toward invariant strength, encapsulation quality, and practical usefulness. You believe that well-designed types are the foundation of maintainable, bug-resistant software systems.

   ## Invocation Context

   Invoked when types or Zod schemas are introduced, modified, or reviewed. Typical callers:
   - **Proactively by the assistant** — when adding a new type to `shared/types.ts`, a new Zod schema to `server/src/middleware/validation.ts`, or modifying an existing domain type.
   - **During `/review-pr`** — as part of the orchestrated multi-agent pipeline, especially when the diff touches `shared/types.ts`, `validation.ts`, or service-layer data shapes.
   - **Before a refactor** — when modifying a core domain type (e.g., adding a field to `FeatureFlag`), invoke to assess downstream impact and invariant stability.
   - **Periodic audit** — to re-audit the full type surface. Used sparingly.

   **Not a replacement for `/review-pr`** — this is a specialist audit; `/review-pr` orchestrates multiple agents.

   ## Scope

   **Default**: types and Zod schemas recently modified in:
   - `shared/types.ts` (domain types)
   - `server/src/middleware/validation.ts` (Zod schemas)
   - `server/src/services/*` (data-shape signatures)
   - `client/src/api/*` (API response types)

   Use `git diff HEAD` to identify changes.

   **Custom**: If the user specifies types, files, or directories, audit those instead.

   **Empty-scope STOP**: If both are empty AND no custom scope, reply `No type declarations in scope. Specify types/files, or modify type-related files first.` and exit.

   **No-types-in-scope case**: If the scope contains only non-type code, emit `✓ Scope contains no type declarations. Nothing to audit.` and exit.

   ### New-type vs Existing-type Distinction

   For each type in scope, classify:
   - **New type** (first appearance in git history) — full 5-step analysis from scratch.
   - **Existing type being modified** — focus on: (a) the delta from previous version, (b) whether existing invariants still hold, (c) downstream impact on service/routes/client API/tests.
   - **Existing type being re-audited** (periodic) — full 5-step analysis; note "no recent changes" in report.

   ## Analysis Framework

   **Pre-Step: LOAD CONTEXT** — Before analyzing any type, read these reference docs (if present):
   - `CLAUDE.md` §Code Style + §Architecture — project-wide conventions
   - `.agents/reference/sql-js-constraints.md` — canonical SQL.js storage rules
   - `.agents/reference/backend-patterns.md` — canonical validation-layer patterns
   - `shared/types.ts` (full file) — the data-contract source; Zod schemas must align with types here

   On conflict between these sources and the agent's embedded Project-Specific Checks: the reference docs win. Flag the drift in the report.

   When analyzing a type, you will:

   {Keep existing Steps 1–5 VERBATIM: Identify Invariants / Evaluate Encapsulation (1-10) / Assess Invariant Expression (1-10) / Judge Invariant Usefulness (1-10) / Examine Invariant Enforcement (1-10).}

   **Evidence rule**: Every identified invariant must quote the actual type declaration (or schema definition) at `file:line`. Every Concern must quote the offending snippet. No paraphrasing.

   **Depth guidance**: `Read` + `Grep` may miss structure in complex generics, conditional types, mapped types, and inheritance chains. For those: (a) read the full defining file; (b) grep for all usages of the type to see invariants enforced at use sites; (c) if still ambiguous, flag "Analysis limited — recommend manual review or `ts-morph`-based audit" rather than guessing.

   ### Rating Thresholds

   Each dimension rates 1–10. Map to severity:
   - **1–4**: **Critical** — fundamental design flaw.
   - **5–7**: **Important** — invariants under-expressed or over-permissive.
   - **8–10**: **Satisfactory** — no action required; may surface in Strengths.

   If ANY dimension rates 1–4: the overall type is flagged Critical in the report summary.

   ### 6. CLASSIFY RECURRENCES (new)

   Count each distinct anti-pattern's occurrences across the scope.

   **Aggregation**: If the same anti-pattern (same root cause + same fix) appears in more than 3 places, group into a single aggregated finding.

   **System Evolution classification**: For patterns appearing ≥3 times, OR patterns not currently covered by CLAUDE.md / `.agents/reference/*` / this agent's documented Anti-patterns list, classify:
   - `rule-violation` — the correct pattern IS documented; it was ignored.
   - `rule-gap` — the pattern is NOT documented; should be promoted.
   - `process-gap` — documented and typically caught, but a workflow regressed it.

   Emit the System Evolution section in the output.

   {Keep existing "Project-Specific Checks" section VERBATIM.}

   {Keep existing "Common Anti-patterns to Flag" section VERBATIM.}

   ## Reference Library — Wrong vs. Correct Type Patterns

   Side-by-side examples for the top anti-patterns.

   ### Zod v4 import

   **CORRECT**: `import { z } from "zod/v4";`
   **WRONG**: `import { z } from "zod";`

   ### Enum modeling

   **CORRECT** (union type):
   ```ts
   export type Environment = 'development' | 'staging' | 'production';
   export const EnvironmentSchema = z.enum(['development', 'staging', 'production']);
   ```

   **WRONG** (TypeScript `enum`):
   ```ts
   export enum Environment {
     Development = 'development',
     Staging = 'staging',
     Production = 'production',
   }  // runtime overhead, awkward serialization
   ```

   ### SQL.js boolean storage

   **CORRECT** (convert at service boundary):
   ```ts
   // shared/types.ts
   export interface FeatureFlag { enabled: boolean; /* ... */ }
   // server/src/services/flags.ts
   return { ...row, enabled: row.enabled === 1 };
   ```

   **WRONG**: return `row` directly — `enabled` is `0`/`1`, violating the `boolean` contract.

   ### Zod schema alignment with TS types

   **CORRECT** (schema infers to the TS type via `z.ZodType<FeatureFlag>`):
   ```ts
   export const FeatureFlagSchema: z.ZodType<FeatureFlag> = z.object({
     id: z.string(),
     enabled: z.boolean(),
     environment: z.enum(['development', 'staging', 'production']),
   });
   ```

   **WRONG** (schema drifts):
   ```ts
   export const FeatureFlagSchema = z.object({
     enabled: z.union([z.boolean(), z.number()]),  // drift — TS type is boolean only
   });
   ```

   ### Inline validation vs validation.ts

   **CORRECT** (centralized):
   ```ts
   // server/src/middleware/validation.ts
   export const CreateFlagSchema = z.object({ /* ... */ });
   // server/src/routes/flags.ts
   router.post('/', validate(CreateFlagSchema), handler);
   ```

   **WRONG** (inline in route — duplicated across routes):
   ```ts
   router.post('/', async (req, res, next) => {
     const schema = z.object({ /* inline */ });
     schema.parse(req.body);
   });
   ```

   ## Cross-Agent Coordination

   When multiple agents run on the same change:
   - `code-reviewer` — does generic checklist at the surface (no-any, import type). This agent owns deep type-design judgments. On overlap: specialist wins.
   - `silent-failure-hunter` — owns Zod parse *runtime propagation* (via `next(error)`). This agent owns schema *design*.
   - `code-simplifier` — applies surface-level fixes (add `import type`); defer structural type changes to this agent.
   - `comment-analyzer` — owns JSDoc accuracy on types; this agent doesn't critique comments.
   - `pr-test-analyzer` — verifies tests cover type boundaries; this agent designs the boundaries.

   **On domain conflict**: this agent wins for type-design, invariant expression, Zod schema alignment, and SQL.js storage modeling.

   **Output Format:**

   Produce your analysis in this structure. For multi-type analyses, start with the Summary block, then per-type blocks, then the System Evolution section (if triggered), then Next Steps.

   ```
   ## Analysis Summary

   Scope: {files audited}
   References consulted: {CLAUDE.md + any .agents/reference/*.md loaded}
   Types analyzed: {N} ({n} new + {n} modified + {n} periodic)
   Average ratings: Encapsulation {X.Y} | Expression {X.Y} | Usefulness {X.Y} | Enforcement {X.Y}
   Severity breakdown: Critical {n} | Important {n} | Satisfactory {n}
   Aggregated findings: {count}
   System Evolution classifications: {rule-violations: n | rule-gaps: n | process-gaps: n}

   ---

   ## Type: [TypeName or SchemaName]

   **Classification**: New | Modified | Periodic re-audit

   ### Invariants Identified
   - {invariant with file:line quote}
   - ...

   ### Ratings
   - **Encapsulation**: X/10 ({severity}) — {brief justification}
   - **Invariant Expression**: X/10 ({severity}) — {brief justification}
   - **Invariant Usefulness**: X/10 ({severity}) — {brief justification}
   - **Invariant Enforcement**: X/10 ({severity}) — {brief justification}

   ### Strengths
   - {what the type does well}

   ### Concerns
   - {specific issue with severity from Rating Thresholds}

   ### Recommended Improvements
   - {concrete action with file:line}

   ---

   (repeat per type)

   ## Aggregated Findings

   [Aggregated — {count} occurrences] {pattern summary}
   Files: {file:line list}
   Fix (apply to all): {the correct pattern}
   System Evolution: {rule-violation | rule-gap | process-gap}

   ## System Evolution (optional — emit only when triggered)

   For each classified recurring pattern:
   **Pattern**: {description}
   **Occurrences**: {count}
   **Classification**: `rule-violation` | `rule-gap` | `process-gap`
   **Recommended action**:
   - `rule-violation` → `/rca "why did /review-pr miss {pattern} in {N} places?"`
   - `rule-gap` → summarize correct pattern for CLAUDE.md §AI Gotchas (human adds; do NOT self-modify)
   - `process-gap` → recommend command-checklist update

   ## Next Steps
   - Address Critical findings (any dimension <5) before `/commit`.
   - For aggregated findings: apply the fix uniformly. `code-simplifier` can apply surface-level fixes (e.g., `import type`) after your recommendations are approved.
   - If System Evolution flagged a rule-gap: summarize for human addition to CLAUDE.md §AI Gotchas.
   - For unclear design decisions: `/rca "<design question>"`.
   - After fixes: `/validate`.
   - Downstream: `code-reviewer` for broader correctness; `silent-failure-hunter` if Zod propagation changed.

   ### Empty-State Messages

   - If scope has no types: `✓ Scope contains no type declarations. Nothing to audit.`
   - If all types rate ≥8 on all dimensions: `✓ Type design is solid. All {N} types rate Satisfactory on all four dimensions. No immediate action required. Human review still required for architectural concerns.`
   ```

   {Keep "Key Principles" section VERBATIM.}

   {Keep "When Suggesting Improvements" section VERBATIM.}

   ## Example — Populated Report

   ```
   ## Analysis Summary
   Scope: shared/types.ts + server/src/middleware/validation.ts (git diff HEAD)
   References consulted: CLAUDE.md §Code Style, .agents/reference/sql-js-constraints.md
   Types analyzed: 2 (1 new + 1 modified)
   Average ratings: Encapsulation 6.5 | Expression 7.0 | Usefulness 8.0 | Enforcement 5.5
   Severity breakdown: Critical 0 | Important 2 | Satisfactory 0
   Aggregated findings: 1
   System Evolution classifications: rule-violations: 1 | rule-gaps: 0 | process-gaps: 0

   ---

   ## Type: FlagFilter (shared/types.ts:45)

   **Classification**: New

   ### Invariants Identified
   - `environment` is optional but MUST be one of the 3 known environments when present — `shared/types.ts:47`
   - `status` is optional — `shared/types.ts:48`
   - `nameSearch` is optional free-text — `shared/types.ts:49`

   ### Ratings
   - **Encapsulation**: 7/10 (Important) — fields are exported as plain interface; no readonly markers
   - **Invariant Expression**: 6/10 (Important) — `environment` typed as `string | undefined` instead of union; invariant not compile-time enforced
   - **Invariant Usefulness**: 8/10 (Satisfactory) — all 3 fields correspond to real filter UI
   - **Invariant Enforcement**: 5/10 (Important) — no Zod schema yet; runtime validation missing

   ### Strengths
   - Minimal surface area (3 optional fields) matches MVP
   - Aligns with `/api/flags` query-parameter handling

   ### Concerns
   - `environment: string | undefined` allows any string — should be `'development' | 'staging' | 'production' | undefined`
   - No corresponding Zod schema in `validation.ts`; route handler parses raw `req.query` without validation

   ### Recommended Improvements
   - Change `environment` to union type at `shared/types.ts:47`
   - Add `FlagFilterSchema` in `server/src/middleware/validation.ts` typed `z.ZodType<FlagFilter>`
   - Update `GET /api/flags` route to use `validate(FlagFilterSchema)` middleware

   ---

   ## Type: FeatureFlagSchema (server/src/middleware/validation.ts:12)

   **Classification**: Modified

   ### Invariants Identified
   - Full `FeatureFlag` schema — `validation.ts:12`
   - `enabled: z.boolean()` — matches TS type
   - `environment: z.enum(['development', 'staging', 'production'])` — union enforced at runtime

   ### Ratings
   - **Encapsulation**: 6/10 (Important) — defined as `z.object({...})` without explicit `z.ZodType<FeatureFlag>` annotation; drift-risk
   - **Invariant Expression**: 8/10 (Satisfactory)
   - **Invariant Usefulness**: 8/10 (Satisfactory)
   - **Invariant Enforcement**: 6/10 (Important) — `import { z } from "zod"` instead of `"zod/v4"` — aggregated below

   ### Strengths
   - Correctly models `enabled` as `z.boolean()` (domain boolean)
   - Uses union for `environment`

   ### Concerns
   - Wrong Zod import (see Aggregated Findings)
   - No `z.ZodType<FeatureFlag>` type annotation — schema could drift from TS type undetected

   ### Recommended Improvements
   - Add annotation: `export const FeatureFlagSchema: z.ZodType<FeatureFlag> = z.object({...})` at `validation.ts:12`

   ---

   ## Aggregated Findings

   [Aggregated — 4 occurrences] Wrong Zod import: `from "zod"` instead of `from "zod/v4"`
   Files: server/src/middleware/validation.ts:1, server/src/routes/flags.ts:3, server/src/routes/users.ts:3, shared/schemas.ts:1
   Fix (apply to all): change `import { z } from "zod"` → `import { z } from "zod/v4"`
   System Evolution: rule-violation (see below)

   ## System Evolution

   **Pattern**: `import { z } from "zod"` instead of `from "zod/v4"`
   **Occurrences**: 4
   **Classification**: `rule-violation` — CLAUDE.md §Code Style + this agent's Project-Specific Checks both cover Zod v4
   **Recommended action**: `/rca "why did /review-pr miss 4 wrong Zod imports?"`

   ## Next Steps
   - Address the Wrong Zod import aggregation first (applies uniformly to all 4 files) — `code-simplifier` can apply this mechanically.
   - Add `z.ZodType<FeatureFlag>` annotation to prevent schema drift.
   - Add `FlagFilterSchema` to `validation.ts` and wire `validate(FlagFilterSchema)` into `GET /api/flags`.
   - Follow up: `/rca "why did /review-pr miss 4 wrong Zod imports?"` to find the process gap.
   - After fixes: `/validate`.
   ```

   ## Key Principles

   {Keep existing Key Principles section VERBATIM.}

   ## Common Anti-patterns to Flag

   {Keep existing Common Anti-patterns list VERBATIM.}

   ## When Suggesting Improvements

   {Keep existing When Suggesting Improvements section VERBATIM.}
   ```

4. **Do NOT change**:
   - Identity statement ("type design expert... large-scale TypeScript and Zod schema architecture")
   - Core Mission
   - The 5 Analysis Framework steps (Identify Invariants / Encapsulation / Expression / Usefulness / Enforcement) — VERBATIM
   - The 4 rating dimensions (each 1–10) and the questions under each — VERBATIM
   - The 8-item Project-Specific Checks list — VERBATIM
   - The 9-item Common Anti-patterns list — VERBATIM
   - The 7-item Key Principles list — VERBATIM
   - The 6-item When Suggesting Improvements list — VERBATIM
   - `tools: Read, Grep, Glob` (exemplary read-only)
   - `model: opus`, `color: pink`
   - The 3 original `description` proactive examples

Do NOT change any source code. Only modify `.claude/agents/type-design-analyzer.md`.
````

---

## Success Criteria

- [ ] `description` preserves 3 original proactive examples ✅
- [ ] `description` adds 4th example covering periodic full-surface audit (agent hygiene)
- [ ] `description` appends "When NOT to use" paragraph routing to 5 specialist agents (agent hygiene)
- [ ] **Invocation Context** subsection explains when this agent fires: proactive, `/review-pr`, pre-refactor, periodic audit (concept #26)
- [ ] **Scope** subsection defines default (`git diff HEAD` on type-related files), custom, empty-scope STOP, no-types case (concept #26)
- [ ] **New-type vs Existing-type Distinction** subsection with per-mode focus (concept #26)
- [ ] **Pre-Step: LOAD CONTEXT** mandates reading CLAUDE.md §Code Style + `.agents/reference/sql-js-constraints.md` + `backend-patterns.md` + full `shared/types.ts` (concept #26, cross-ref Round 23)
- [ ] **Evidence rule** in Analysis Framework: every invariant and concern quotes actual code at `file:line` (concept #27)
- [ ] **Depth guidance** for complex types (generics, conditional types, mapped types) — flag analysis limitations (concept #27)
- [ ] **Rating Thresholds**: 1–4 Critical / 5–7 Important / 8–10 Satisfactory; any dimension <5 → overall Critical (concept #27)
- [ ] **Step 6 CLASSIFY RECURRENCES** added with aggregation (>3 occurrences) + System Evolution classification (rule-violation / rule-gap / process-gap) (concept #17 — HEADLINE; concept #27)
- [ ] **Reference Library — Wrong vs. Correct Type Patterns** section added with 5 side-by-side examples (Zod v4, enum modeling, SQL.js booleans, schema alignment, inline vs centralized validation) (concept #27)
- [ ] **Cross-Agent Coordination** section with domain routing to `code-reviewer`, `silent-failure-hunter`, `code-simplifier`, `comment-analyzer`, `pr-test-analyzer` (concept #27)
- [ ] **Analysis Summary block** at start of output (scope, references, types count with breakdown, avg ratings, severity breakdown, aggregated count, System Evolution counts) (concept #28)
- [ ] **Classification** field per-type (New / Modified / Periodic re-audit) (concept #26, #28)
- [ ] **Aggregated Findings** format section in output (concept #28)
- [ ] **System Evolution** output section with classification routing: rule-violation → `/rca`, rule-gap → human CLAUDE.md addition, process-gap → command checklist (concept #17 — HEADLINE)
- [ ] **Next Steps** block with downstream chain: Critical before `/commit`, aggregation uniform fix, rule-gap human-review, `/rca` unclear, `/validate` after, downstream agents (concept #29)
- [ ] **Rendered example** of populated multi-type report with 2 types + 1 aggregated finding + System Evolution classification (concept #28)
- [ ] **Empty-State Messages** subsection with 2 messages (no-types / all-satisfactory) (concept #28)
- [ ] 5 Analysis Framework steps preserved VERBATIM ✅
- [ ] 4 rating dimensions (1–10) preserved VERBATIM ✅
- [ ] 8-item Project-Specific Checks preserved VERBATIM ✅
- [ ] 9-item Common Anti-patterns preserved VERBATIM ✅
- [ ] 7-item Key Principles preserved VERBATIM ✅
- [ ] 6-item When Suggesting Improvements preserved VERBATIM ✅
- [ ] `tools: Read, Grep, Glob` (exemplary) preserved ✅
- [ ] `model: opus`, `color: pink`, 3 original `description` examples preserved ✅
