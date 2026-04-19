# .agents/ Directory — Index

This directory contains all AI-layer artifacts for the feature-flag-exercise project.

## Directory Classification

| Directory | Type | Lifecycle | Producer | Consumer | Notes |
|-----------|------|-----------|----------|----------|-------|
| `reference/` | **On-Demand Context** | Evolving | Human / `/create-rules` | `/prime`, `/plan`, `/implement`, `/review-pr`, all agents | See `reference/README.md` |
| `PRDs/` | **Product Artifacts** | Per-feature | `/prd-interactive` | `/create-stories`, `/plan` | `.prd.md` files |
| `stories/` | **Task Decomposition** | Per-feature | `/create-stories` | `/plan` | `-stories.md` files |
| `plans/` | **Task Plans** | Per-task | `/plan` | `/implement` | `.plan.md` files |
| `reports/` | **Audit Reports** | Per-run | `/security-review`, `/check-ignores`, `/validate` | Human review | Date-stamped |
| `rca-reports/` | **Root Cause Reports** | Per-incident | `/rca` | Human review | `rca-report-{N}.md` |
| `reviews/` | **PR Review Reports** | Per-PR | `/review-pr` | Human review | |
| `screenshots/` | **Browser Evidence** | Per-run | `agent-browser` skill | Human review | Git-ignored by default |
| `validation/` | **Validation Artifacts** | Per-run | `/validate` | Human review | May overlap with `reports/`; classify pending |
| `templates/` | **Doc Templates** | Stable | Human | Human / `/create-command` / `/prd-interactive` | Manual use; AI integration TBD |
| `baseline/` | **Exercise-Only** | One-time | Human | Human only | Baseline measurements; not AI-integrated |
| `closure/` | **Exercise-Only** | One-time | Human | Human only | Exercise completion reports; not AI-integrated |
| `diagnosis/` | **Diagnostic Reports** | Per-incident | Human / `/rca` | Human | May merge with `rca-reports/`; classify pending |
| `governance/` | **ADR Store** | Evolving | Human | Human / `/plan` inputs | Architecture decisions; AI integration TBD |

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE-template.md` | Template for `/create-rules` to use when regenerating `CLAUDE.md` |
| `reference/README.md` | Manifest for On-Demand Context docs — start here when choosing which doc to load |
