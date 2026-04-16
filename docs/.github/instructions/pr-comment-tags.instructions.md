---
applyTo: ".github/workflows/**"
---

# PR Comment Tag System — Always-On Instructions

## Purpose

The `[EX:...]` tag protocol enables GitHub Actions workflows to identify PR lifecycle events unambiguously, regardless of comment wording. Tags are machine-readable markers that workflows grep for in PR comments and review bodies.

---

## Tag Dictionary

| Tag | Posted by | When | Consumed by |
|---|---|---|---|
| `[EX:REVIEW-HAS-SUGGESTIONS]` | Copilot Code Review / Code Review agent | In review body when suggestions or changes are present | `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml` |
| `[EX:REVIEW-CLEAN]` | Copilot Code Review / Code Review agent | In review body when no issues are found | `auto-merge-on-clean-review.yml` |
| `[EX:TRIGGER-FIX-REQUEST]` | `auto-copilot-fix.yml`, `auto-validate-copilot-fix.yml` | In PR comment requesting Copilot to apply pending fixes | `auto-validate-copilot-fix.yml` (to verify preceding trigger exists) |
| `[EX:FIX-APPLIED]` | Copilot Coding Agent | In PR comment reporting that fixes were applied to commits | `auto-validate-copilot-fix.yml` |
| `[EX:FIX-INCOMPLETE]` | `auto-validate-copilot-fix.yml` | In PR comment when not all review suggestions were addressed | `auto-validate-copilot-fix.yml` (duplicate-processing guard) |

---

## Placement Rules

1. Tags **must** appear at the very beginning of the comment body, on their own line, before any other content.
2. A comment serving two purposes may include multiple tags on consecutive lines at the start.
3. Tags are plain text — do not wrap them in backticks or code blocks within actual PR comments. The square brackets are the identifying pattern.
4. Workflows match tags using substring search (`grep`, `contains()`, `test()`), so exact spelling matters.

---

## Idempotency Marker

Fix-request and fix-incomplete comments include an HTML comment for deduplication:

```
<!-- review-id: {id} -->
```

- In `auto-copilot-fix.yml`: `{id}` is the review ID from the triggering code review.
- In `auto-validate-copilot-fix.yml`: `{id}` is the `workflow_run.id` of the triggering push signal.

Workflows check for existing comments containing this marker before posting, preventing duplicate trigger comments for the same review cycle.

---

## Lifecycle Flow

```
Copilot opens PR (draft)
  │
  ├── auto-ready-for-review.yml converts to ready
  │
  ├── Copilot Code Review runs
  │     │
  │     ├── [EX:REVIEW-CLEAN] ──── auto-merge-on-clean-review.yml ──── merge + close issue
  │     │
  │     └── [EX:REVIEW-HAS-SUGGESTIONS]
  │           │
  │           └── auto-copilot-fix.yml posts:
  │                 [EX:TRIGGER-FIX-REQUEST]
  │                 <!-- review-id: {id} -->
  │                 @copilot Please apply fixes...
  │                       │
  │                       └── Copilot pushes fix + comments:
  │                             [EX:FIX-APPLIED]
  │                                   │
  │                                   └── auto-validate-copilot-fix.yml
  │                                         │
  │                                         ├── All resolved ── re-request review ── loops back to Code Review
  │                                         │
  │                                         └── Not all resolved ── posts:
  │                                               [EX:FIX-INCOMPLETE]
  │                                               [EX:TRIGGER-FIX-REQUEST]
  │                                               @copilot ... (retry loop)
```

---

## Examples

### Clean review (posted by Copilot Code Review)

```
[EX:REVIEW-CLEAN]
## Pull request overview

No issues found. The implementation follows all exercise conventions.
```

### Review with suggestions (posted by Copilot Code Review)

```
[EX:REVIEW-HAS-SUGGESTIONS]
## Pull request overview

Found 2 issues that should be addressed before merging.

### Suggestions
1. Use `const` instead of `let` in `server/src/services/flags.ts` line 42.
2. Missing `stmt.free()` in finally block in `server/src/services/flags.ts` line 78.
```

### Fix request (posted by `auto-copilot-fix.yml`)

```
[EX:TRIGGER-FIX-REQUEST]
<!-- review-id: 123456789 -->
@copilot Please apply fixes for the following unresolved review feedback:

- **`server/src/services/flags.ts`** (line 42): use `const` instead of `let` [→ view](url)
- **`server/src/services/flags.ts`** (line 78): missing `stmt.free()` in finally block [→ view](url)
```

### Fix applied (posted by Copilot Coding Agent)

```
[EX:FIX-APPLIED]
Applied in commit abc1234. All suggested changes have been addressed:
- Replaced `let` with `const` in `server/src/services/flags.ts`.
- Added `stmt.free()` in finally block.
```

### Fix incomplete + retry (posted by `auto-validate-copilot-fix.yml`)

```
[EX:FIX-INCOMPLETE]
[EX:TRIGGER-FIX-REQUEST]
<!-- review-id: 9876543210 -->
@copilot 1 of 2 review threads remain unresolved after your fix. Please address the remaining feedback:

- **`server/src/services/flags.ts`** (line 78): missing `stmt.free()` in finally block [→ view](url)
```

---

## Anti-Patterns

- **Never** wrap tags in backticks or code fences in actual PR comments — workflows grep for the literal `[EX:TAG]` string.
- **Never** place tags after other content in the comment body — downstream matching assumes tags are at the start.
- **Never** invent new tag names without updating this document and the consuming workflow.
- **Never** use `[DJVR:...]` tags — those belong to the upstream DéjàVu system. This exercise uses `[EX:...]` exclusively.
- **Never** post a `[EX:TRIGGER-FIX-REQUEST]` comment without the `<!-- review-id: ... -->` idempotency marker.
