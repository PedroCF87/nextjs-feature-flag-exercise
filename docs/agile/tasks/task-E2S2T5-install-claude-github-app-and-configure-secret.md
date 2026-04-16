# Task E2-S2-T5 — Install Claude GitHub App and configure secret

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T5 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | E2-S2-T4 |
| **Blocks** | E2-S2-T6 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 13:53:21 -03 |

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

- **Command(s) executed:** Manual steps in browser (no CLI commands)
  1. Navigated to https://github.com/apps/claude → installed on `PedroCF87/nextjs-feature-flag-exercise`
  2. Navigated to repository Settings → Secrets and Variables → Actions → created `ANTHROPIC_API_KEY` repository secret
  3. Verified in Settings → GitHub Apps → "Claude" listed as installed
  4. Verified in Settings → Secrets → `ANTHROPIC_API_KEY` visible (value hidden)
- **Exit code(s):** N/A (manual browser task)
- **Output summary:**
  - Claude GitHub App: installed and visible in repository integrations
  - `ANTHROPIC_API_KEY`: configured as repository secret (value masked)
  - Screenshot evidence: [`docs/images/Claude-App-installed.png`](../../images/Claude-App-installed.png)
- **Files created/updated:** `docs/images/Claude-App-installed.png` (screenshot of installed app)
- **Risks found / mitigations:** None — API key stored exclusively as GitHub secret, never committed to code

### Given / When / Then checks

- **Given** the fork `PedroCF87/nextjs-feature-flag-exercise` needed Claude Code integration and T4 had placed all 3 workflow files,
- **When** the Claude GitHub App was installed and `ANTHROPIC_API_KEY` was configured as a repository secret,
- **Then** the app appears in Settings → GitHub Apps, the secret is visible in Settings → Secrets (value hidden), and no API key is hardcoded in the repository.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E2-S2-T4 (all 3 Claude workflows present in `.github/workflows/`)
- **Downstream items unblocked:** E2-S2-T6 (push branch + create draft PR to trigger workflows)
- **Open risks (if any):** If the `ANTHROPIC_API_KEY` value is invalid or expired, workflows will fail at runtime — verify on first PR trigger (T6)
