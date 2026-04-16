---
applyTo: ../resident-health-workshop-resources/**
---

# Workshop Resources — Always-On Instructions

This context is specific to the `resident-health-workshop-resources` repository (methodology Rulebook).

## Objective

Ensure any agent treats this repository as the **official methodology source** (process, phases, artifacts, and MCP integration), prioritizing rule extraction over code implementation.

## Priority Rules

1. Treat `.claude/commands/*.md` as canonical workflows.
2. Treat `.claude/skills/*/SKILL.md` as reusable subroutines (not direct user entry points).
3. Treat `.claude/CLAUDE-template.md` as the canonical scaffold for global rules.
4. Treat `ai-context/Excal-*.md` as official workshop mental-model supplements.
5. Treat `.mcp.json` as the Atlassian (Jira/Confluence) integration reference for MCP-dependent commands.

## Mandatory Mental Model

Always analyze and explain under the validation loop:

- **Plan** → context definition and structuring
- **Implement** → phased execution without accumulating broken state
- **Validate** → verification and self-correction until green

Preferred vocabulary: **Validation Loop, AI Layer, Global Rules, Commands, Skills, VSA, System Gap**.

## Reading Conventions

When the user asks for workflow explanation:

1. Identify target command/skill.
2. Map phases in the file’s original order.
3. Explain input, actions, output, and design rationale per phase.
4. Connect flow to generated artifacts (PRD, plan, report, stories, review).
5. Cite sources using `file:line` whenever possible.

## What NOT to do

- Do not invent phases, command names, or MCP tools.
- Do not treat skills as commands directly invoked by users.
- Do not claim MCP is mandatory when the workflow supports fallback.
- Do not prioritize feature implementation in this repository; focus here is methodology, context, and workflow.

## Key references

- `.claude/commands/`
- `.claude/skills/`
- `.claude/CLAUDE-template.md`
- `ai-context/Excal-1-Workshop-Guide.md`
- `ai-context/Excal-2-SystemGap.md`
- `ai-context/Excal-3-PIVLoop.md`
- `ai-context/Excal-4-GlobalRules.md`
- `ai-context/Excal-5-ReusablePrompts.md`
- `ai-context/Excal-6-AI-Optimized-Codebases.md`
- `.mcp.json`
