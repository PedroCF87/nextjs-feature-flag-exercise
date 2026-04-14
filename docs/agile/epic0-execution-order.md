# EPIC-0 — Execution Order (Bypass Approvals Mode)

| Field | Value |
|---|---|
| **Status** | Active |
| **Mode** | Local execution, bypass approvals |
| **PR policy** | **NO PRs for any Epic 0 task — commit directly to `exercise-1` and push** |
| **AI Layer path** | **`.github/` (root) is the live AI Layer — never create artifacts in `docs/.github/`** |
| **Created at** | 2026-04-13 21:49:02 -03 |

---

## Rationale

E0-S5 was strategically moved ahead of E0-S1-T3 because all its artifacts target `.github/` and require no fork AI Layer or codebase audit. E0-S6 T1–7 (writing workflow YMLs and docs) can also be done now. E0-S6 T8–10 (secrets, runner, E2E validation) require the fork to be configured in E0-S2 first.

> **Execution model for all Epic 0 tasks:** run locally in VS Code — `git add <files> && git commit && git push origin exercise-1`. Task files that mention "open PR" or "feature branch" must be ignored for Epic 0; those instructions apply only to Epic 1+.

---

## Execution order

### Phase 1 — Planning & automation artifacts (docs-side only)

| Step | Task | Story | Blocker? | Notes |
|---|---|---|---|---|
| ✅ 1 | E0-S5-T1 | E0-S5 | — | Create `story-task-reviewer` agent |
| ✅ 2 | E0-S5-T2 | E0-S5 | T1 done | Create `scaffold-stories-from-epic` skill |
| ✅ 3 | E0-S5-T3 | E0-S5 | T2 done | Create `create-github-issue-from-task.js` function |
| ✅ 4 | E0-S5-T4 | E0-S5 | T3 done | Create `execute-task-from-issue` skill |
| ✅ 5 | E0-S5-T5 | E0-S5 | T4 done | Dry-run validation (generate story from Epic 1) |
| ✅ 6 | E0-S5-T6 | E0-S5 | T5 done | Commit & sign readiness |
| ✅ 7 | E0-S6-T1 | E0-S6 | E0-S5 done | Create `copilot-push-signal.yml` |
| ✅ 8 | E0-S6-T2 | E0-S6 | T7 done | Create `auto-ready-for-review.yml` |
| ✅ 9 | E0-S6-T3 | E0-S6 | T8 done | Create `auto-copilot-fix.yml` |
| ✅ 10 | E0-S6-T4 | E0-S6 | T9 done | Create `auto-validate-copilot-fix.yml` |
| ✅ 11 | E0-S6-T5 | E0-S6 | T10 done | Create `auto-merge-on-clean-review.yml` |
| ✅ 12 | E0-S6-T6 | E0-S6 | T11 done | Create issue index infrastructure |
| ✅ 13 | E0-S6-T7 | E0-S6 | T7 done | Create PR tag system documentation |

### Phase 2 — Codebase audit (resume E0-S1)

| Step | Task | Story | Blocker? | Notes |
|---|---|---|---|---|
| ✅ 14 | E0-S1-T3 | E0-S1 | Phase 1 done | Codebase audit |
| ✅ 15 | E0-S1-T4 | E0-S1 | T3 done | Produce diagnosis document |

### Phase 3 — AI Layer deployment to fork (E0-S2)

> All steps in this phase run **locally**. No PRs. Commit directly to `exercise-1`.
> AI Layer artifacts target `.github/` (root) — skip any task step that says `docs/.github/`.

| Step | Task | Story | Blocker? | Notes |
|---|---|---|---|---|
| ✅ 16 | E0-S2-T0 | E0-S2 | E0-S1 done | Bootstrap AI Layer mgmt artifacts |
| ✅ 17 | E0-S2-T1 | E0-S2 | T0 done | Deploy global rules to fork |
| ✅ 18 | E0-S2-T2 | E0-S2 | T0 done | Deploy instructions to fork |
| ✅ 19 | E0-S2-T3 | E0-S2 | T0 done | Deploy agents and skills to fork |
| ✅ 20 | E0-S2-T4 | E0-S2 | T0 done | **Create `copilot-setup-steps.yml`** — unblocks E0-S6 T8–T10 |
| ✅ 21 | E0-S2-T5 | E0-S2 | T1–T4 done | Validate, commit, sign readiness — coverage report committed (`c580537`); dry-run run ID `24424611417` ✅ |

### Phase 4 — CI/CD pipeline finalisation (E0-S6 T8–T10)

| Step | Task | Story | Blocker? | Notes |
|---|---|---|---|---|
| ✅ 22 | E0-S6-T8 | E0-S6 | E0-S2-T4 done | Secrets + self-hosted runner — `rdh-exercise-runner` Idle, dry-run `24425988694` ✅ |
| ✅ 23 | E0-S6-T9 | E0-S6 | T22 done | Create `.github/copilot-mcp.json` |
| ✅ 24 | E0-S6-T10 | E0-S6 | T22–T23 done | E2E structural validation + sign checklist |

### Phase 5 — Measurement baseline + closure

| Step | Task | Story | Blocker? | Notes |
|---|---|---|---|---|
| ✅ 25 | E0-S3-T0 | E0-S3 | E0-S2 done | Bootstrap E0-S3 AI Layer artifacts |
| ✅ 26 | E0-S3-T1 | E0-S3 | T25 done | Define measurement dimensions |
| ✅ 27 | E0-S3-T2 | E0-S3 | T26 done | Create capture template |
| ✅ 28 | E0-S3-T3 | E0-S3 | T27 done | Record time-zero snapshot + sign go/no-go |
| 29 | E0-S4-T0 | E0-S4 | E0-S3 done | Bootstrap E0-S4 artifacts |
| 30 | E0-S4-T1 | E0-S4 | T29 done | Verify EPIC-0 DoD evidence |
| 31 | E0-S4-T2 | E0-S4 | T30 done | Produce `epic0-closure-report.md` |
| 32 | E0-S4-T3 | E0-S4 | T31 done | Produce `epic1-handoff.md` |
| 33 | E0-S4-T4 | E0-S4 | T32 done | Commit, push, sign timeline |

---

## Critical path

```
E0-S5 (T1→T6)
    ↓
E0-S6 T1–T7 (YMLs + docs)       E0-S1 T3–T4 (audit)
         ↘                      ↗
          E0-S2 T0–T5 (fork AI Layer + copilot-setup-steps.yml)
                    ↓
          E0-S6 T8–T10 (secrets + runner + validation)
                    ↓
                E0-S3 → E0-S4 (baseline + closure)
                    ↓
                EPIC-1 begins
```

---

## Manual checkpoints (human action required)

| Step | Story | What |
|---|---|---|
| 22 | E0-S6-T8 | Create `COPILOT_CLASSIC_PAT` and `COPILOT_TRIGGER_TOKEN` in GitHub settings |
| 22 | E0-S6-T8 | Register and start self-hosted runner (`docker compose up -d`) |
| 24 | E0-S6-T10 | Verify runner appears "Idle" in fork → Settings → Actions → Runners |
