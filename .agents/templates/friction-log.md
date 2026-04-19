# Friction Log — nextjs-feature-flag-exercise

<!-- artifact_id: friction-log -->
<!-- epic_id: EPIC-0 -->
<!-- produced_by: project-adaptation-analyst -->

## Purpose

This log records friction points encountered during the execution of EPIC-0
stories. A friction point is any blocker, rework event, ambiguity, tool failure,
or environment issue that delayed or interrupted story progress.

**Do not edit rows manually.** Use `append-friction-log.js` to add entries:

```bash
node "Docs/.github/functions/append-friction-log.js" \
  "<abs-path-to-repo>" "<story-id>" "<one-sentence description>" \
  [--impact high|medium|low]
```

See `Docs/.github/instructions/friction-log.instructions.md` for classification
rules and when to record.

---

## Log

| # | Story | Timestamp | Description | Impact |
|---|---|---|---|---|
| 1 | — | — | _No friction points recorded yet. Add the first entry via append-friction-log.js when a friction event occurs._ | — |
| 2 | E0-S1 | 2026-04-10 15:56:46 -03 | Example friction point — remove this entry before starting EPIC-0 | low |
| 3 | E1-S1 | 2026-04-15 21:10:14 -03 | Cloud agent execution model failed — PR #29 reverted; required pivot to local execution | high |
| 4 | E1-S2 | 2026-04-15 21:10:21 -03 | tsconfig baseUrl caused path resolution conflict after server filter implementation | low |
| 5 | E1-S2 | 2026-04-15 21:10:21 -03 | LIKE wildcards not escaped in name filter — security-adjacent edge case | low |
| 6 | E1-S4 | 2026-04-15 21:10:21 -03 | No EPIC-1 entries in timeline.jsonl — metrics required manual git log computation | medium |
