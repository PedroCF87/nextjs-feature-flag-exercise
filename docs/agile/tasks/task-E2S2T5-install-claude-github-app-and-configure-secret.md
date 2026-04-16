# Task E2-S2-T5 — Install Claude GitHub App and configure secret

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T5 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | E2-S2-T4 |
| **Blocks** | E2-S2-T6 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 12:20:22 -03 |

---

## 1) Task statement

As a repository administrator, I want to install the Claude GitHub App on the fork and configure the `ANTHROPIC_API_KEY` repository secret so that Claude Code workflows can authenticate and execute PR reviews.

---

## 2) Verifiable expected outcome

- The Claude GitHub App is installed on `PedroCF87/nextjs-feature-flag-exercise` and visible in Settings → GitHub Apps.
- The `ANTHROPIC_API_KEY` repository secret is visible in Settings → Secrets and Variables → Actions.
- No API key is hardcoded in any file in the repository.

---

## 3) Detailed execution plan

**Description:** Install the Claude GitHub App on the fork and configure `ANTHROPIC_API_KEY` as a repository secret. This is a manual task performed in the browser.

**Execution steps:**
1. **Install Claude GitHub App:**
   - Navigate to https://github.com/apps/claude
   - Click "Install" → select `PedroCF87/nextjs-feature-flag-exercise`
   - Grant the requested permissions (code read, PR write, issues write)
2. **Configure ANTHROPIC_API_KEY secret:**
   - Go to `https://github.com/PedroCF87/nextjs-feature-flag-exercise/settings/secrets/actions`
   - Click "New repository secret"
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste the Anthropic API key (never share or log this value)
   - Click "Add secret"
3. **Verify installation:**
   - Check Settings → Integrations → GitHub Apps → confirm "Claude" is listed
   - Check Settings → Secrets and Variables → Actions → confirm `ANTHROPIC_API_KEY` appears (value hidden)

**Acceptance criteria:**
- **Given** the fork needs Claude Code integration
- **When** the app is installed and secret is set
- **Then** the Claude GitHub App appears in installed apps; `ANTHROPIC_API_KEY` is visible as a repository secret (manual verification)

---

## 4) Architecture and security requirements

- **Never** hardcode the API key in any file, commit message, or log output.
- The secret must be configured as a GitHub repository secret, not an environment variable in code.
- Grant the Claude App minimum required permissions (code read, PR write, issues write).
- If the API key is compromised, revoke it immediately at https://console.anthropic.com/.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed:
- Exit code(s):
- Output summary:
- Files created/updated:
- Risks found / mitigations:

### Given / When / Then checks

- **Given** all task dependencies are available and validated,
- **When** this task execution plan is completed and evidence is collected,
- **Then** the task outcome is reproducible, secure, and auditable by another agent.

---

## 6) Definition of Done

- [ ] Expected outcome is objectively verifiable.
- [ ] Dependencies are explicit and valid.
- [ ] Security and architecture checks were performed.
- [ ] Validation evidence is attached.
- [ ] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved:
- Downstream items unblocked:
- Open risks (if any):
