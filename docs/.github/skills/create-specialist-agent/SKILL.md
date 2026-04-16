---
name: create-specialist-agent
description: Step-by-step instructions for designing and creating a new GitHub Copilot custom agent specialized for a specific domain or task within a repository. Use this skill when asked to create a new specialist agent, review an existing agent prompt, or build a companion skill.
---

## Context

GitHub Copilot custom agents are `.agent.md` files placed in `.github/agents/`. Each file combines a YAML frontmatter block (identity, tools, model) with a Markdown body that defines the agent's behavior. Companion skills are `SKILL.md` files stored in `.github/skills/<skill-name>/` that Copilot injects into context only when the task matches the skill's description.

---

## Process for Creating a New Specialist Agent

### 1. Gather context before writing anything

Read the following files in order:

1. `.github/copilot-instructions.md` — global project conventions (tech stack, naming, RBAC, i18n, testing, deployment)
2. Any `.github/instructions/*.instructions.md` files relevant to the target domain
3. 2–3 representative source files from the domain the agent will operate in (e.g., an existing Server Action, a component, a service module)

Do **not** write a single line of the agent prompt until this step is complete.

### 2. Define the agent's scope

Answer these four questions explicitly before writing:

| Question | Why it matters |
|---|---|
| What is the **single primary task** this agent performs? | Keeps the prompt focused; avoids bloat |
| What are the **hard boundaries** (what it must NOT do)? | Prevents the agent from overstepping |
| Which **tools** does it need? (read / search / edit / execute / web / agent) | Minimum viable toolset |
| What are the **3 most common mistakes** developers make in this domain? | These become explicit prohibitions |

### 3. Write the YAML frontmatter

Use the template below. Fill in all fields marked `<FILL>`.

```yaml
---
name: <fill-agent-name>          # lowercase, hyphens, no spaces
description: >
  <fill: 1–2 sentences. Start with an action verb.>
  Use this agent when <fill: specific trigger condition>.
tools: ["read", "search", "edit"] # Adjust to minimum required
# model: claude-sonnet-4-5        # Uncomment only if specific model needed
---
```

**Tool selection guide:**
- Always include `read` if the agent needs to inspect files
- Add `search` if the agent needs to find patterns across the codebase
- Add `edit` only if the agent creates or modifies files
- Add `execute` only if the agent must run scripts — require explicit justification
- Add `web` only if the agent needs to fetch external documentation
- Add `agent` only if the agent delegates subtasks to other specialist agents

### 4. Write the Markdown body

Structure the body using these sections. Include only sections that are relevant.

```markdown
## Core Responsibilities
<bullet list of 3–6 specific things the agent does>

## Methodology
<numbered step-by-step process — use numbers so the agent follows them sequentially>

## Project Conventions to Follow
<project-specific rules extracted from copilot-instructions.md — do NOT duplicate;
 reference the file if the rule is already documented there>

## Output Standards
<format, file placement, naming rules for artifacts the agent produces>

## Anti-Patterns to Avoid
<explicit list of common mistakes. Use "Never..." or "Always..." language>
```

**Prompt quality checklist:**

- [ ] Every rule is specific and actionable (references real file paths, function names, or patterns)
- [ ] "Never use X" is written for the top-3 mistakes identified in Step 2
- [ ] No rule duplicates content already in `.github/copilot-instructions.md` — reference it instead
- [ ] Total Markdown body is under 8,000 characters
- [ ] The prompt defines behavior ("When doing X, always do Y"), not just identity ("You are an expert in X")

### 5. Decide whether a companion skill is needed

Create a `SKILL.md` skill when any of the following is true:

- The agent needs more than ~500 words of domain reference that only applies to one type of task
- The agent needs to run a script or reference a reusable template
- The reference material should be shareable with other agents

If you need a skill, create it at `.github/skills/<skill-name>/SKILL.md` using the template in Section 6.

### 6. Skill template

```markdown
---
name: <skill-name>
description: >
  <what this skill does>.
  Use this skill when <trigger condition>.
# allowed-tools: []   # Only add if this skill references a script to run
---

## Context
<1 paragraph explaining when and why this skill applies>

## Process
1. <step 1>
2. <step 2>
3. <step 3>

## Constraints
- Never <anti-pattern 1>
- Always <rule 1>

## Expected Output
<describe the artifact: file path, format, naming convention>
```

### 7. Validate the agent before saving

Run through this checklist:

- [ ] Filename: `<name>.agent.md` in `.github/agents/`, lowercase + hyphens only
- [ ] `description` contains "Use this agent when…" clause
- [ ] `tools` list is the minimum viable set
- [ ] Prompt body references project-specific details (not generic advice)
- [ ] Anti-patterns section covers the 3 mistakes from Step 2
- [ ] Prompt body under 8,000 characters
- [ ] If a skill was created: `SKILL.md` is in `.github/skills/<skill-name>/`
- [ ] Both files use **English** only

### 8. Summarize what you created

After creating the files, provide a concise summary:

```
## Created: <agent-name>

**File:** `.github/agents/<name>.agent.md`
**Tools granted:** read, search, edit
**Why those tools:** <one sentence justification>

**Companion skill:** `.github/skills/<skill-name>/SKILL.md` (if applicable)

**How to invoke:** Use this agent when [trigger condition from description].

**Key behaviors:**
- <behavior 1>
- <behavior 2>
- <behavior 3>
```

Do **not** create a separate documentation file. The summary lives in the chat response only.

---

## Delfos Connect — Project-Specific Constraints

When creating agents for this repository, every agent prompt must acknowledge:

1. **RBAC**: Directus queries on user-owned collections must include `user_created = $CURRENT_USER` or use `DIRECTUS_ADMIN_TOKEN` server-side only
2. **i18n**: No hardcoded UI strings — all user-facing text via `useTranslations()` / `getTranslations()`
3. **Validation**: All external inputs validated with Zod v4 at the boundary
4. **No `any`**: TypeScript strict mode — use explicit types or generics
5. **Server Components by default**: `'use client'` only when the component requires browser APIs or interactivity
6. **Test file pattern**: `src/__tests__/<domain>/<name>.test.ts` mirroring the source path
