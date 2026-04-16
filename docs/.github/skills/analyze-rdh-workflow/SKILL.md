---
name: analyze-rdh-workflow
description: Deeply analyze an RDH methodology command or skill by decomposing phases, inputs, outputs, design decisions, and practical implications. Use this skill when you need to explain how an RDH workflow works internally with file:line traceability.
---

## Context

This skill is used for analytical reading of the RDH Rulebook (`resident-health-workshop-resources`) with focus on:

- Commands in `.claude/commands/*.md`
- Skills in `.claude/skills/*/SKILL.md`
- Global rules template in `.claude/CLAUDE-template.md`
- MCP in `.mcp.json`
- Transcribed mental models in `ai-context/Excal-*.md`

The goal is not to implement code, but to explain the RDH operating system with precision.

## Process

1. **Identify the analysis target**
   - Confirm whether the target is a command (`/plan`, `/implement`, etc.) or a skill (`agent-browser`, `pptx-generator`).
   - Define scope: overview, specific phase, cross-flow comparison, or interview implications.

2. **Read the source artifact completely**
   - Extract: name, purpose, inputs, internal phases, outputs, and generated artifacts.
   - Record explicit dependencies (e.g., MCP usage, dependency on another command, preconditions).

3. **Decompose phase by phase**
    - For each phase, document:
       - Expected input
       - Actions executed
       - Output produced
       - What problem this phase solves (rationale)

4. **Map artifact flow**
   - Connect inputs and outputs between commands (e.g., PRD → plan → report).
   - Highlight where the PIV Loop is applied (Plan → Implement → Validate).

5. **Apply workshop lenses (ai-context)**
   - Use `Excal-2-SystemGap.md` to explain system maturity.
   - Use `Excal-3-PIVLoop.md` to explain the operational cycle.
   - Use `Excal-4-GlobalRules.md` and `Excal-5-ReusablePrompts.md` to separate stable context vs process.

6. **Produce structured output**
   - Deliver phase table + rationale synthesis + practical example.
   - Whenever possible, reference evidence using `file:line`.

## Expected Output Format

Use a seguinte estrutura:

1. **Executive Summary** (3-5 bullets)
2. **Phase Table**
   - Colunas: `Fase | Input | Ações | Output | Rationale`
3. **Artifact Flow** (text diagram)
4. **Practical Implications**
   - What this changes in day-to-day implementation
   - Risks of ignoring the workflow
5. **Usage Example**
   - Concrete command/skill execution case
6. **References**
   - Lista de `file:line`

## Constraints

- Never invent phases, command names, or MCP tool names.
- Never confuse command with skill.
- Never claim MCP is mandatory when the workflow supports fallback.
- Never respond with generic guidance without repository evidence.
- Never turn analysis into feature implementation.

## Quality Checklist

Before finishing, confirm:

- [ ] The analysis explains **what happens** and **why each phase exists**.
- [ ] There is explicit connection to PIV Loop and AI Layer when relevant.
- [ ] There is at least one practical execution example.
- [ ] There are `file:line` references for core points.
- [ ] There are no out-of-scope recommendations (implementation, unnecessary migration, etc.).
