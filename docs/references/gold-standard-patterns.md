# Gold Standard Patterns Reference

> Extracted from `nextjs-ai-optimized-codebase` — the workshop's reference AI-optimized codebase.
> Use this document as a MIRROR reference when creating AI Layer artifacts for Exercise 2.

| Field | Value |
|---|---|
| Source repository | `nextjs-ai-optimized-codebase` |
| Tech stack | Next.js 16 + React 19 + Bun + Biome + Drizzle ORM + Supabase + Pino + Zod v4 |
| Architecture | Vertical Slice Architecture (VSA) |
| Key documentation | `CLAUDE.md` (global rules), `CODEBASE-GUIDE.md` (1992-line deep walkthrough) |
| Created at | 2026-04-16 |

---

## 1) Architecture — Vertical Slice Architecture (VSA)

Every feature owns its entire stack in `src/features/{feature}/`:

```
src/features/{feature}/
├── models.ts      — Drizzle types: InferSelectModel / InferInsertModel from schema
├── schemas.ts     — Zod v4 schemas + z.infer<> types (CreateInput, UpdateInput, Response)
├── repository.ts  — Pure DB queries via Drizzle (no logic, no logging, no errors)
├── service.ts     — Business logic: calls repository, applies rules, logs, throws typed errors
├── errors.ts      — Classes extending feature base error; carry code + statusCode
├── index.ts       — Public API gate: exports service functions + types; does NOT export repository
└── tests/         — Co-located: service.test.ts, schemas.test.ts, errors.test.ts
```

**Why VSA matters for AI agents:**
- **Locality:** AI reads ONE folder to understand any feature (vs. 4+ folders in layered architecture)
- **Independence:** changes to one feature don't affect others
- **Pattern recognition:** AI learns the structure once, applies it everywhere
- **Context efficiency:** less context needed per interaction

### Exercise mapping (layered → VSA concepts)

| Gold Standard (VSA) | Exercise (Layered) | Notes |
|---|---|---|
| `src/features/flags/models.ts` | `shared/types.ts` | Exercise uses manual interfaces, not schema-derived |
| `src/features/flags/schemas.ts` | `server/src/middleware/validation.ts` | Same Zod approach, different location |
| `src/features/flags/repository.ts` | Merged in `server/src/services/flags.ts` | Exercise has no repository separation |
| `src/features/flags/service.ts` | `server/src/services/flags.ts` | Dual responsibility in exercise (service + data access) |
| `src/features/flags/errors.ts` | `server/src/middleware/error.ts` | Exercise has centralized errors (correct for its scope) |
| `src/features/flags/index.ts` | None | Exercise has no public API gate |
| `src/features/flags/tests/` | `server/src/__tests__/flags.test.ts` | Exercise uses single test file (integration tests) |

---

## 2) AI Context Files — Two-Document Pattern

The Gold Standard uses **two** AI context documents, each with a distinct purpose:

### CLAUDE.md — Operational Rules (377 lines)

Auto-loaded every session. Contains:
- **Commands** — exact `bun run` / `npx tsc` commands to run
- **Self-Correction Workflow** — the Write → Run Checks → Read Errors → Fix → Repeat loop
- **Why this matters for AI** — explains how strict TS settings produce actionable error messages
- **Tech Stack** — table format with technology, version, and AI benefit
- **VSA structure** — file responsibilities table, feature creation steps, code examples
- **Database commands** — drizzle-kit workflow
- **Supabase patterns** — learned patterns from setup (key naming, cookies, middleware)
- **Code style rules** — what fails checks (errors vs warnings)
- **Logging** — `getLogger("domain.component")` + action-state pattern

### CODEBASE-GUIDE.md — Deep Walkthrough (1992 lines)

NOT auto-loaded. Serves as long-form reference with expandable code examples:
1. What Makes a Codebase AI-Optimized?
2. Core Principles (Machine-Readable Feedback, One Source of Truth, Fail Fast, Clear Boundaries, Consistent Patterns)
3. The AI Feedback Loop (with self-correction example)
4. Architecture: Vertical Slice Pattern (with Traditional vs VSA comparison)
5. Type Safety with TypeScript (with strict mode explanation)
6. Runtime Validation with Zod (schemas → types → API usage)
7. Structured Logging (Pino + action-state + request context)
8. Database Layer with Drizzle ORM (type-safe queries + migrations)
9. Error Handling (3-layer architecture: feature errors → API handler → response schema)
10. Testing Strategy (mock.module, co-located tests, 80% coverage)
11. Fast Tooling (Bun 10x, Biome 25x speed comparisons)
12. Putting It All Together (complete workflow: setup → create feature → implement → test → verify)

**Exercise implication:** When creating the Exercise 2 `CLAUDE.md`, consider whether a separate deep-reference document (equivalent to `CODEBASE-GUIDE.md`) would reduce bloat in global rules while preserving depth. The on-demand context docs (`.agents/reference/*.md`) serve a similar purpose.

---

## 3) Structured Logging — Pino + Action-State + Request Context

### Logger Factory

```typescript
// src/core/logging/logger.ts
export const logger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
  base: {
    service: process.env["APP_NAME"] ?? "ai-opti-nextjs-starter",
    environment: process.env["NODE_ENV"] ?? "development",
  },
  // JSON in production, pretty-print in development
  ...(isDevelopment ? { transport: { target: "pino-pretty" } } : {}),
});
```

### Child Logger with Request Context

```typescript
// src/core/logging/index.ts
export function getLogger(component: string) {
  const context = getRequestContext();
  return logger.child({
    component,
    requestId: context?.requestId,
    userId: context?.userId,
    correlationId: context?.correlationId,
  });
}
```

### AsyncLocalStorage for Request Context

```typescript
// src/core/logging/context.ts
import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
  userId?: string;
  correlationId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function withRequestContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}
```

### Action-State Pattern

Every service operation logs three states:

```typescript
logger.info({ ownerId, name }, "project.create_started");
logger.info({ projectId, slug }, "project.create_completed");
logger.error({ projectId, error }, "project.create_failed");
```

Message format: `domain.action_state` — grep-able, AI-parseable, traceable.

### Exercise implication

The exercise uses `console.error` in the error handler and `console.log` for startup. For Exercise 2 CLAUDE.md, document this as a known limitation. If structured logging is added (Tier 2), follow the Pino + action-state pattern above.

---

## 4) Environment Validation — Fail-Fast Config

```typescript
// src/core/config/env.ts
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  NODE_ENV: getOptionalEnv("NODE_ENV", "development"),
  LOG_LEVEL: getOptionalEnv("LOG_LEVEL", "info"),
  NEXT_PUBLIC_SUPABASE_URL: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
} as const;
```

**Key principle:** app crashes at startup if required env vars are missing — not at runtime when a request hits the missing config.

### Exercise implication

The exercise uses `process.env.PORT || 3001` inline. For Exercise 2 CLAUDE.md, document this as a known difference. If env validation is added (Tier 2), adapt the pattern above for Express (no Supabase vars needed).

---

## 5) Error Handling — 3-Layer Architecture

### Layer 1: Feature Errors (`src/features/projects/errors.ts`)

```typescript
export type ProjectErrorCode =
  | "PROJECT_NOT_FOUND"
  | "PROJECT_SLUG_EXISTS"
  | "PROJECT_ACCESS_DENIED";

export class ProjectError extends Error {
  readonly code: ProjectErrorCode;
  readonly statusCode: HttpStatusCode;
  constructor(message: string, code: ProjectErrorCode, statusCode: HttpStatusCode) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}
```

### Layer 2: Centralized API Error Handler (`src/core/api/errors.ts`)

```typescript
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) { /* → 400 with field-level details */ }
  if (isHttpError(error))        { /* → error.statusCode with code */ }
  /* else → 500 Internal Error */
}
```

### Layer 3: Standard Error Response Schema (`src/shared/schemas/errors.ts`)

```typescript
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
```

### Exercise comparison

| Aspect | Gold Standard | Exercise |
|---|---|---|
| Error base class | Feature-specific (`ProjectError`) with typed `ProjectErrorCode` union | Centralized `AppError` with string `error` field |
| Error codes | Union type: `"PROJECT_NOT_FOUND" \| "PROJECT_SLUG_EXISTS"` | Plain strings: `"NOT_FOUND"`, `"CONFLICT"` |
| Error handler | `handleApiError()` in `src/core/api/errors.ts` — handles Zod + HttpError + unknown | `errorHandler` middleware in `server/src/middleware/error.ts` — handles Zod + AppError + unknown |
| Response schema | Zod-validated `ErrorResponseSchema` | Manual JSON response |

**Exercise's approach is correct for its scope.** The primary gap is typed error codes (union vs plain string).

---

## 6) Shared Schemas Layer

The Gold Standard has cross-feature shared schemas in `src/shared/`:

### Pagination

```typescript
// src/shared/schemas/pagination.ts
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export function getOffset(params: PaginationParams): number {
  return (params.page - 1) * params.pageSize;
}

export function createPaginatedResponse<T>(
  items: T[], total: number, params: PaginationParams
): PaginatedResponse<T> {
  return { items, pagination: { page, pageSize, total, totalPages } };
}
```

### Error Response

```typescript
// src/shared/schemas/errors.ts
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export function createErrorResponse(error, code, details?): ErrorResponse { /* ... */ }
```

### Shared Utilities

```typescript
// src/shared/utils/dates.ts
export function utcNow(): Date { return new Date(); }
export function formatIso(date: Date): string { return date.toISOString(); }
export function parseIso(str: string): Date { /* validates and returns */ }
```

### Exercise implication

The exercise has `shared/types.ts` as the shared contract but no shared schemas or utilities layer. For Exercise 2, the on-demand context docs should note this difference without recommending migration (out of scope).

---

## 7) Testing — Mock Module Pattern

### Gold Standard: True Unit Tests (mock.module)

```typescript
// src/features/projects/tests/service.test.ts
import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockRepository = {
  findById: mock(() => Promise.resolve(undefined)),
  create: mock(() => Promise.resolve({} as Project)),
};

mock.module("../repository", () => mockRepository);

const { createProject } = await import("../service");

describe("createProject", () => {
  beforeEach(() => { mockRepository.create.mockReset(); });
  
  it("creates a project with generated slug", async () => {
    mockRepository.create.mockResolvedValue(mockProject);
    const result = await createProject({ name: "Test" }, ownerId);
    expect(result).toEqual(mockProject);
  });
});
```

### Exercise: Integration Tests (_resetDbForTesting)

```typescript
// server/src/__tests__/flags.test.ts
beforeEach(() => { _resetDbForTesting(); });
afterEach(() => { _resetDbForTesting(null); });

it("creates a flag", () => {
  const flag = createFlag({ name: "test", ... });
  expect(flag.name).toBe("test");
});
```

### Key differences

| Aspect | Gold Standard | Exercise |
|---|---|---|
| Strategy | Unit tests (service isolated from DB) | Integration tests (service + real DB) |
| DB dependency | None (repository mocked) | Yes (SQL.js in-memory) |
| Isolation method | `mock.module()` per repository | `_resetDbForTesting()` per test |
| Speed | Faster (no DB operations) | Fast enough (in-memory SQLite) |
| Granularity | Separate files: `service.test.ts`, `schemas.test.ts`, `errors.test.ts` | Single file: `flags.test.ts` |
| Coverage threshold | 80% enforced | Not enforced |

**Exercise's approach is correct for SQL.js.** The `_resetDbForTesting()` pattern is the idiomatic way to isolate SQL.js integration tests.

---

## 8) Biome Configuration (Lint + Format)

The Gold Standard replaces ESLint + Prettier with Biome (`biome.json`):

### Key rules that produce AI-actionable errors

| Rule | Level | AI benefit |
|---|---|---|
| `noUnusedImports` | error | Precise: "Remove unused import `X`" |
| `noUnusedVariables` | error | Precise: "Variable `X` is declared but never used" |
| `noConsole` | warn | Catches `console.log` left in code |
| `noExplicitAny` | warn | Forces proper typing |
| `noDoubleEquals` | error | Prevents `==` vs `===` bugs |
| `useConst` | error | Enforces `const` when value never reassigned |
| `useImportType` | error | Enforces `import type` for type-only imports |
| `useExportType` | error | Enforces `export type` for type-only exports |
| `noDefaultExport` | warn | Named exports only (except Next.js pages via override) |
| `noForEach` | warn | Prefers `for...of` loops |
| `useBlockStatements` | error | Enforces braces on if/else |

### Override pattern for Next.js files

```json
{
  "overrides": [
    {
      "includes": ["**/app/**/page.tsx", "**/app/**/layout.tsx", "*.config.ts"],
      "linter": { "rules": { "style": { "noDefaultExport": "off" } } }
    }
  ]
}
```

### Exercise implication

The exercise uses ESLint with minimal configuration. When creating Exercise 2 `CLAUDE.md`, document which ESLint rules are equivalent to these Biome rules, and note which rules are NOT enforced in the exercise (e.g., `noConsole`, `noForEach`, `noDefaultExport`).

---

## 9) Health Endpoints

The Gold Standard has 3 health endpoints:

### `/health` — Basic liveness

```typescript
export function GET() {
  return NextResponse.json({ status: "healthy", service: "api", timestamp: formatIso(utcNow()) });
}
```

### `/health/ready` — Readiness (checks dependencies)

```typescript
export async function GET() {
  const checks = { database: "disconnected", auth: "missing" };
  try { await db.execute(sql`SELECT 1`); checks.database = "connected"; }
  catch { allHealthy = false; }
  // Check auth config...
  return NextResponse.json({ status: allHealthy ? "healthy" : "degraded", checks });
}
```

### `/health/db` — Database connectivity

```typescript
export async function GET() {
  await db.execute(sql`SELECT 1`);
  return NextResponse.json({ status: "healthy", service: "database", provider: "supabase" });
}
```

### Exercise implication

The exercise has no health endpoints. This is marked as "⚠️ Not required" in Epic 2's Foundation-first table, which is correct. If added (Tier 3), adapt for SQL.js: check `getDb()` returns valid database.

---

## 10) TypeScript Strict Mode — Key Differences

| Setting | Gold Standard | Exercise | Impact |
|---|---|---|---|
| `strict` | ✅ | ✅ | Same base strictness |
| `noUncheckedIndexedAccess` | ✅ | ❌ | GS: `array[i]` returns `T \| undefined`, forcing null checks |
| `exactOptionalPropertyTypes` | ✅ | ❌ | GS: stricter handling of optional properties |
| `verbatimModuleSyntax` | ✅ | ❌ | GS: requires explicit `import type` for types |
| `noUnusedLocals` | ✅ | ❌ | GS: error on unused variables |
| `noUnusedParameters` | ✅ | ❌ | GS: error on unused function parameters |

**AI implication:** The Gold Standard's stricter settings produce MORE actionable error messages, enabling better AI self-correction. Exercise's settings are less strict, which means some errors only surface at runtime instead of compile-time.

---

## 11) Path Aliases

| Alias | Gold Standard | Exercise |
|---|---|---|
| `@/*` | `./src/*` | N/A |
| `@/core/*` | `./src/core/*` | N/A |
| `@/features/*` | `./src/features/*` | N/A |
| `@/shared/*` | `./src/shared/*` | N/A |
| `@shared/*` | N/A | `shared/*` (only alias) |

The Gold Standard has 4 aliases covering all major directories. The exercise has 1 alias for the shared types.

---

## 12) Authentication Pattern (Supabase)

The Gold Standard uses Supabase Auth with:
- Server-side client (`src/core/supabase/server.ts`) — cookies-based session
- Client-side client (`src/core/supabase/client.ts`) — browser-based
- Proxy (`src/proxy.ts`) — session refresh middleware (Next.js 16)
- Route group layouts — `(auth)` redirects authenticated users to dashboard, `(dashboard)` redirects unauthenticated to login
- Server Actions with `useActionState` (React 19 pattern) — `(prevState, formData)` signature

The exercise has no authentication. This is out of scope for Epic 2.

---

## References

- `nextjs-ai-optimized-codebase/CLAUDE.md` — global rules (377 lines)
- `nextjs-ai-optimized-codebase/CODEBASE-GUIDE.md` — deep walkthrough (1992 lines)
- `nextjs-ai-optimized-codebase/biome.json` — lint + format configuration
- `nextjs-ai-optimized-codebase/tsconfig.json` — strict TypeScript settings
- `nextjs-ai-optimized-codebase/bunfig.toml` — test runner configuration (80% coverage)
- `nextjs-ai-optimized-codebase/src/features/projects/` — reference VSA feature slice
- `nextjs-ai-optimized-codebase/src/core/logging/` — Pino + AsyncLocalStorage + action-state
- `nextjs-ai-optimized-codebase/src/core/config/env.ts` — fail-fast environment validation
- `nextjs-ai-optimized-codebase/src/core/api/errors.ts` — centralized API error handler
- `nextjs-ai-optimized-codebase/src/shared/schemas/` — cross-feature schemas (pagination, errors)
- `nextjs-ai-optimized-codebase/src/app/api/health/` — health endpoint patterns
