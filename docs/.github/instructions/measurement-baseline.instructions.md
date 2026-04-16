---
applyTo: "**/.agents/baseline/**"
---

# Measurement Baseline — Always-On Instructions

These instructions govern how baseline capture files under `.agents/baseline/` must be created and filled.

## Objective

Ensure every exercise measurement baseline contains **only real, observed data** — never interpolated, guessed, or fabricated values.

---

## Timestamp format

All timestamps in baseline documents must use the format produced by `datetime.js`:

```
YYYY-MM-DD HH:MM:SS ±HH
```

To obtain the current timestamp:

```bash
node "Docs/.github/functions/datetime.js"
```

---

## Prompt boundary rule

A **new prompt** is counted each time the engineer sends a message to the AI agent. Consecutive replies from the same agent in the same conversational turn count as **one** response, not a new prompt.

If the engineer edits their message and resends, it counts as a new prompt.

---

## Rework boundary rule

A **rework cycle** is counted when a previously passing validation step (`pnpm run build`, `pnpm run lint`, `pnpm test`) breaks after a code change and must be recovered. Each distinct regression counts as one rework cycle regardless of how many files were modified to fix it.

---

## Elapsed time calculation

Use `elapsed-time.js` to calculate elapsed minutes between any two captured timestamps:

```bash
node "Docs/.github/functions/elapsed-time.js" "<start-ts>" "<end-ts>" [label]
```

---

## Confidence scale anchors

| Score | Meaning |
|---|---|
| 1 | No idea where to start. First encounter with the domain. |
| 2 | Vague direction. Could not explain the approach without research. |
| 3 | Clear direction but uncertain about edge cases and failure modes. |
| 4 | Strong direction. Expected path is clear; minor surprises are tolerable. |
| 5 | Mechanical execution. No surprises expected. |

Scores below 3 at any checkpoint must be accompanied by a justification note.

---

## Pre-implementation table rules

- Run each validation command in isolation; do not assume results from a previous run.
- Record the actual exit code (0 = ✅, non-zero = ❌).
- Output snippet must be the **first meaningful line** of stdout or stderr — truncate after 100 characters.
- If a command is skipped for any reason, mark it ❌ and record the reason.

---

## AI Layer file presence rules

- Every file presence check must use `test -f <path>` or equivalent.
- Do not mark a file ✅ without executing the check.
- Count `ls .github/agents/ | wc -l` and `ls .github/skills/ | wc -l` separately — minimum counts must match the expected values in the story.

---

## Go/no-go checklist rules

- Every checklist item must have an **evidence source** — a real file path, command output, or run ID.
- A checklist item may only be marked ✅ if the evidence source exists and confirms the claim.
- If any item is ❌, the **Status must be NOT READY**. No exceptions.
- The signed declaration must read exactly:
  ```
  **Status:** READY
  **Signed at:** <timestamp from datetime.js>
  ```

---

## Commit rules

- Baseline commits must only be made when Status = READY (all go/no-go items ✅).
- The commit message must be exactly:
  ```
  chore(baseline): record measurement baseline and sign EPIC-1 go/no-go checklist
  ```
- Never push to `main` — always push to the exercise branch derived from `exercise-1`.

---

## Do not

- Do not leave `[FILL IN]` markers in Sections 1 and 3 after T3 execution.
- Do not pre-fill Sections 5–8 (time, prompts, rework, confidence) before implementation begins.
- Do not sign the checklist with any item ❌.
- Do not invent command output — always run the command and record its actual result.
- Do not omit the `Signed at` timestamp when the status is READY.
