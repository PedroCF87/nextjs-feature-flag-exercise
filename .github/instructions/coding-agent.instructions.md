---
applyTo: "**/*.ts,**/*.tsx,**/routes/**,**/services/**"
---

# Coding Agent - Exercise Constraints

## Objective

Ensure implementation agents follow strict TypeScript, SQL.js safety, and validation discipline when working on the exercise codebase.

## Mandatory rules

1. Use strict TypeScript only. Do not use any.
2. Add new domain fields in shared/types.ts before changing services or routes.
3. In Express routes, propagate errors with next(error).
4. In SQL.js operations using prepared statements, always free statements in try/finally.
5. In backend tests, keep DB isolation with _resetDbForTesting() per test lifecycle.
6. Run validation commands after each implementation step (not just at the end):
   - cd server && pnpm run build && pnpm run lint && pnpm test
   - cd client && pnpm run build && pnpm run lint
7. Do not move forward with a broken state. Fix type, lint, and test failures before continuing.

## Validation loop (implement → validate → fix → re-validate)

Every code change must go through this cycle:

1. **Implement** the change as described in the task.
2. **Validate** by running the appropriate commands for the changed scope.
3. **Inspect** — if all commands exit 0, proceed to the next change.
4. **Fix** — if any command fails, diagnose the root cause and fix it.
5. **Re-validate** — run the same commands again.
6. **Repeat** steps 4-5 until all checks pass with zero errors.

Never skip validation. Never proceed with failing checks. Never accumulate multiple
unvalidated changes.

## Do not

- Do not hardcode secrets.
- Do not bypass shared contracts in shared/types.ts.
- Do not leave partially applied changes without running validations.
