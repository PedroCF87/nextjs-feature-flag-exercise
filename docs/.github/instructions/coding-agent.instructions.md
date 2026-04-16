---
applyTo: "**/*.ts,**/*.tsx,**/routes/**,**/services/**"
---

# Coding Agent - Exercise Constraints

## Objective

Ensure implementation agents follow strict TypeScript, SQL.js safety, and validation discipline
when working on the exercise codebase.

## Mandatory rules

1. Use strict TypeScript only. Do not use `any`.
2. Add new domain fields in `shared/types.ts` before changing services or routes.
3. In Express routes, propagate errors with `next(error)`.
4. In SQL.js operations using prepared statements, always free statements in `try/finally`.
5. In backend tests, keep DB isolation with `_resetDbForTesting()` per test lifecycle.
6. Run validation commands after each implementation phase:
   - `cd server && pnpm run build && pnpm run lint && pnpm test`
   - `cd client && pnpm run build && pnpm run lint`
7. Do not move forward with a broken state. Fix type, lint, and test failures before continuing.

## Do not

- Do not hardcode secrets.
- Do not bypass shared contracts in `shared/types.ts`.
- Do not leave partially applied changes without running validations.