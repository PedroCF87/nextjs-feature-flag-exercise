# Workflow Secrets & Self-Hosted Runner Checklist — E0-S6-T8

**Fork:** `PedroCF87/nextjs-feature-flag-exercise`
**Branch:** `exercise-1`
**Produced by:** Task E0-S6-T8 (`copilot-env-specialist`)
**Created at:** 2026-04-14

---

## 1) Why Two PAT Types?

The automation pipeline requires two distinct tokens because GitHub's APIs have incompatible restrictions:

| Reason | Impact |
|---|---|
| `markPullRequestReadyForReview` (GraphQL mutation) and `resolveReviewThread` (GraphQL mutation) **reject Fine-Grained PATs** when the PR was created by a GitHub App (Copilot) | `auto-ready-for-review.yml` and `auto-validate-copilot-fix.yml` require a **Classic PAT** |
| Assigning `@copilot` to an issue via the REST API (POST `/issues/{n}/assignees`) requires `Issues: Read and write` — a Fine-Grained PAT scope — because `GITHUB_TOKEN` (bot token) is silently ignored for Copilot assignment | `auto-merge-on-clean-review.yml` and `auto-copilot-fix.yml` require the **Fine-Grained PAT** |

---

## 2) Secrets Matrix

| Secret name | Token type | Scope | Required by workflows | Where to add | Status |
|---|---|---|---|---|---|
| `COPILOT_CLASSIC_PAT` | Classic PAT | `repo` (full) | `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml` | Repository Secrets **+** `copilot` Environment | ✅ |
| `COPILOT_TRIGGER_TOKEN` | Fine-Grained PAT | `Issues: Read and write` | `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml` | Repository Secrets **+** `copilot` Environment | ✅ |

> **Security rule:** Never commit token values to the repository. Always paste them only in the GitHub Settings UI.

---

## 3) Step-by-Step: Create the PATs

### 3.1 — `COPILOT_CLASSIC_PAT` (Classic PAT)

Go to: **GitHub → Your profile → Settings → Developer settings → Personal access tokens → Tokens (classic)**

1. Click **Generate new token (classic)**.
2. Note: `COPILOT_CLASSIC_PAT — RDH exercise runner`
3. Expiration: choose a date beyond Exercise 1 completion (e.g., 90 days).
4. Select scope: ☑ **`repo`** (full control of private repositories — all sub-scopes included).
5. Click **Generate token**.
6. **Copy the token value immediately** — it is shown only once.

### 3.2 — `COPILOT_TRIGGER_TOKEN` (Fine-Grained PAT)

Go to: **GitHub → Your profile → Settings → Developer settings → Personal access tokens → Fine-grained tokens**

1. Click **Generate new token**.
2. Token name: `COPILOT_TRIGGER_TOKEN — RDH exercise runner`
3. Expiration: same as above.
4. Resource owner: your personal account (`PedroCF87`).
5. Repository access: **Only select repositories** → select `nextjs-feature-flag-exercise`.
6. Permissions → Repository permissions:
   - **Issues:** `Read and write` ☑
7. Click **Generate token**.
8. **Copy the token value immediately.**

---

## 4) Step-by-Step: Add Secrets to the Fork

> Do steps 4.1 **and** 4.2 for **both** tokens.

### 4.1 — Repository-level secrets

Go to: **`https://github.com/PedroCF87/nextjs-feature-flag-exercise` → Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|---|---|
| `COPILOT_CLASSIC_PAT` | *(paste Classic PAT value)* |
| `COPILOT_TRIGGER_TOKEN` | *(paste Fine-Grained PAT value)* |

### 4.2 — `copilot` environment secrets

Go to: **`https://github.com/PedroCF87/nextjs-feature-flag-exercise` → Settings → Environments → `copilot` → Add secret**

| Name | Value |
|---|---|
| `COPILOT_CLASSIC_PAT` | *(paste Classic PAT value)* |
| `COPILOT_TRIGGER_TOKEN` | *(paste Fine-Grained PAT value)* |

> If the `copilot` environment does not exist yet, create it first: Settings → Environments → **New environment** → name: `copilot`.

---

## 5) Self-Hosted Runner Setup

The CI/CD workflows (`copilot-push-signal`, `auto-ready-for-review`, `auto-copilot-fix`, `auto-validate-copilot-fix`, `auto-merge-on-clean-review`) all run on `self-hosted` runners.

### 5.1 — Create runner files on the host

Create a directory `~/exercise-runner/` and save the three files below.

**`~/exercise-runner/docker-compose.yml`:**
```yaml
services:
  runner:
    build:
      context: .
      dockerfile: Dockerfile
    image: rdh-exercise-runner:latest
    container_name: rdh-exercise-runner
    restart: unless-stopped
    network_mode: host
    volumes:
      - /home/pedro-delfos/exercise-runner:/runner
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      RUNNER_ALLOW_RUNASROOT: "1"
```

**`~/exercise-runner/Dockerfile`:**
```dockerfile
FROM ubuntu:22.04

ARG RUNNER_VERSION=2.322.0

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl sudo git jq unzip libicu-dev docker.io ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

RUN npm install -g pnpm

RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh

WORKDIR /runner

COPY runner-entrypoint.sh /runner-entrypoint.sh
RUN chmod +x /runner-entrypoint.sh

ENTRYPOINT ["/runner-entrypoint.sh"]
```

**`~/exercise-runner/runner-entrypoint.sh`:**
```bash
#!/bin/bash
set -e
exec /runner/run.sh
```

### 5.2 — Register the runner with the fork (one-time)

```bash
mkdir -p ~/actions-runner
cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-linux-x64-2.322.0.tar.gz
tar xzf ./actions-runner-linux-x64.tar.gz
```

Then **get the registration token** from GitHub:

> **Fork → Settings → Actions → Runners → New self-hosted runner**
> Copy the `--token` value shown on the page.

Then run:
```bash
cd ~/actions-runner
./config.sh \
  --url https://github.com/PedroCF87/nextjs-feature-flag-exercise \
  --token <REGISTRATION_TOKEN> \
  --name rdh-exercise-runner \
  --labels self-hosted \
  --unattended
```

### 5.3 — Start the container

```bash
cd ~/exercise-runner
docker compose up -d --build
```

### 5.4 — Verify runner is Idle

Go to: **`https://github.com/PedroCF87/nextjs-feature-flag-exercise` → Settings → Actions → Runners**

The runner `rdh-exercise-runner` should appear with status **Idle**.

---

## 6) Validation

### 6.1 — `gh` CLI auth check

```bash
gh auth status
```

Expected: shows the authenticated user and token scopes. If not authenticated, run `gh auth login` first.

### 6.2 — Dry-run: trigger `copilot-push-signal.yml`

Go to: **`https://github.com/PedroCF87/nextjs-feature-flag-exercise/actions/workflows/copilot-push-signal.yml`**

1. Click **Run workflow** → branch: `exercise-1` → **Run workflow**.
2. Wait for the run to complete.
3. Confirm the run used the `rdh-exercise-runner` (visible in the run summary under "Ran on").
4. Record the run ID below.

**Dry-run run ID:** `24425988694`
**Run URL:** `https://github.com/PedroCF87/nextjs-feature-flag-exercise/actions/runs/24425988694`
**Runner used:** `rdh-exercise-runner`
**Status:** ✅ completed successfully

---

## 7) Sign-off Checklist

- [x] `COPILOT_CLASSIC_PAT` created (Classic PAT, `repo` scope)
- [x] `COPILOT_TRIGGER_TOKEN` created (Fine-Grained PAT, `Issues: Read and write`)
- [x] Both secrets added to Repository Secrets
- [x] Both secrets added to `copilot` Environment secrets
- [x] Runner files created in `~/exercise-runner/`
- [x] Runner registered with `./config.sh` — `.runner` and `.credentials` created
- [x] Runner container started: `docker compose up -d --build`
- [x] Runner appears **Listening for Jobs** — confirmed via `docker logs` (processed `auto-merge` job successfully)
- [x] `gh auth status` passes — `PedroCF87` authenticated, scopes: `repo`, `workflow`
- [x] `copilot-push-signal.yml` dry-run completed on `rdh-exercise-runner` — run ID `24425988694` ✅
