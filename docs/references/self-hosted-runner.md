# Self-Hosted GitHub Actions Runner — RDH Exercise Reference

| Field | Value |
|---|---|
| Status | Reference |
| Source project | `dejavu-rio-planing` (`actions-runner/docker-compose.yml`) |
| Applies to | `nextjs-feature-flag-exercise` fork |
| Runner count | 1 (DéjàVu uses 2) |
| Created at | 2026-04-09 17:57:30 -03 |
| Last updated | 2026-04-09 17:58:14 -03 |

---

## Purpose

The exercise workflows (`auto-ready-for-review`, `auto-copilot-fix`, `auto-validate-copilot-fix`, `auto-merge-on-clean-review`, `copilot-push-signal`) all run on `self-hosted` runners. This document describes how to set up and run one self-hosted runner using Docker Compose, based on the DéjàVu project pattern.

---

## Architecture

The runner runs as a Docker container. It:
- Bind-mounts the pre-registered runner directory from the host (so credentials are never baked into the image).
- Mounts the Docker socket so it can create service containers for workflow steps.
- Uses `network_mode: host` so that `localhost` references in `run:` steps reach any services spawned on the host network.

```
Host machine
├── ~/actions-runner/        ← registered runner directory (bind-mounted)
│   ├── .runner              ← GitHub registration
│   ├── .credentials         ← GitHub credentials
│   └── _work/               ← workflow workdir
└── /var/run/docker.sock     ← Docker socket (bind-mounted)
```

---

## Docker Compose file

Save as `docker-compose.yml` (e.g., in `~/exercise-runner/`):

```yaml
# exercise-runner/docker-compose.yml
# Self-hosted GitHub Actions Runner — RDH Exercise
#
# Single runner for the nextjs-feature-flag-exercise fork.
# Bind-mounts the pre-configured runner directory from the host so
# .runner/.credentials are NEVER baked into the image.
# The Docker socket is mounted so the runner can create service containers.
# network_mode: host required so localhost references reach host-network services.
#
# ── Usage ──────────────────────────────────────────────────────────────────────
# First time (build + start):
#   docker compose up -d --build
#
# Subsequent starts:
#   docker compose up -d
#
# Stop:
#   docker compose down
#
# View logs:
#   docker compose logs -f runner
# ──────────────────────────────────────────────────────────────────────────────

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
      # Runner binaries + registration files (.runner, .credentials, work folder)
      - ~/actions-runner:/runner
      # Docker socket — lets the runner create service containers for workflows
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      RUNNER_ALLOW_RUNASROOT: "1"
```

---

## Dockerfile

Save as `Dockerfile` in the same directory as the `docker-compose.yml`:

```dockerfile
FROM ubuntu:22.04

ARG RUNNER_VERSION=2.322.0

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    sudo \
    git \
    jq \
    unzip \
    libicu-dev \
    docker.io \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Install pnpm
RUN npm install -g pnpm

# Install gh CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh

WORKDIR /runner

# Entrypoint: delegate to runner directory from bind-mount
COPY runner-entrypoint.sh /runner-entrypoint.sh
RUN chmod +x /runner-entrypoint.sh

ENTRYPOINT ["/runner-entrypoint.sh"]
```

---

## Entrypoint script

Save as `runner-entrypoint.sh` in the same directory:

```bash
#!/bin/bash
set -e

# The runner binaries and registration files are bind-mounted from the host.
# This script simply starts the listener process.
exec /runner/run.sh
```

---

## Registration (one-time setup)

Before starting the container, the runner directory must be registered with GitHub.

### 1. Create the runner directory on the host

```bash
mkdir -p ~/actions-runner
cd ~/actions-runner
```

### 2. Download the GitHub Actions runner

```bash
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-linux-x64-2.322.0.tar.gz
tar xzf ./actions-runner-linux-x64.tar.gz
```

### 3. Register the runner with the fork repository

Go to: **Fork repository → Settings → Actions → Runners → New self-hosted runner**

Copy the registration token shown on that page, then run:

```bash
./config.sh \
  --url https://github.com/<your-username>/nextjs-feature-flag-exercise \
  --token <REGISTRATION_TOKEN> \
  --name rdh-exercise-runner \
  --labels self-hosted \
  --unattended
```

After registration, the `.runner` and `.credentials` files will be created in `~/actions-runner/`.

### 4. Start the runner container

```bash
cd ~/exercise-runner
docker compose up -d --build
```

### 5. Verify

In the fork repository, go to **Settings → Actions → Runners** — the runner should appear as "Idle".

---

## Comparison: DéjàVu vs Exercise

| Aspect | DéjàVu | Exercise |
|---|---|---|
| Runner count | 2 (`runner-1`, `runner-2`) | 1 (`runner`) |
| Image name | `dejavurio-runner:latest` | `rdh-exercise-runner:latest` |
| Host runner dir 1 | `~/actions-runner` | `~/actions-runner` |
| Host runner dir 2 | `~/action-runner-2` | *(not applicable)* |
| Container name 1 | `dejavurio-runner-1` | `rdh-exercise-runner` |
| Container name 2 | `dejavurio-runner-2` | *(not applicable)* |
| Runner label | `arc-runner-set` (GitHub ARC) | `self-hosted` |
| Network mode | `host` | `host` |
| Docker socket | ✅ mounted | ✅ mounted |

> **Note:** DéjàVu uses GitHub Actions Runner Controller (ARC) with `arc-runner-set` as the runner label. The exercise uses a single directly-registered `self-hosted` runner for simplicity. Both mount the Docker socket and use `network_mode: host` for the same reason — workflow steps that reference `localhost` need access to host-network services.

---

## Maintenance

### Stop the runner

```bash
cd ~/exercise-runner
docker compose down
```

### Update the runner binary

1. Stop the container: `docker compose down`
2. In `~/actions-runner`: remove old binaries, download the new version, re-run `./config.sh` with the new registration token (tokens expire — generate a fresh one from Settings → Runners).
3. Restart: `docker compose up -d --build`

### View logs

```bash
docker compose logs -f runner
```

---

## References

- [DéjàVu — actions-runner/docker-compose.yml](../../../Dejavu/dejavu-rio-planing/actions-runner/docker-compose.yml)
- [GitHub Actions — self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners)
- [GitHub Actions — runner releases](https://github.com/actions/runner/releases)
- [GitHub Workflow Automation System](github-workflow-system.md)
