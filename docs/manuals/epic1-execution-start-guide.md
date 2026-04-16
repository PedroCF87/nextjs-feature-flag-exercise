---
title: "Como Iniciar a Execução do EPIC-1 no GitHub"
scope: interview
repos:
  - nextjs-feature-flag-exercise
updatedAt: 2026-04-14
---

# Como Iniciar a Execução do EPIC-1 no GitHub

## Objetivo

Responder com precisão as três perguntas práticas:

1. Eu crio uma Issue para disparar o planejamento do épico?
2. Preciso criar um documento para servir de corpo dessa Issue?
3. Qual agente eu assinalei nessa Issue?

---

## Resposta curta (antes dos detalhes)

> **E1-S0 (planejamento) roda localmente no VS Code — exatamente igual ao EPIC-0.**
> Você NÃO cria uma Issue para iniciar E1-S0.
> É o próprio E1-S0-T4 que cria as Issues do GitHub para as histórias de implementação E1-S1 a E1-S4.
> Só depois dessas Issues existirem é que o agente de nuvem (GitHub Copilot) começa a executar via Issue.

---

## O Modelo de Execução em Duas Fases

```
FASE 1 — Planejamento local (E1-S0)        FASE 2 — Execução via GitHub Issues (E1-S1 a E1-S4)
──────────────────────────────────────      ─────────────────────────────────────────────────────
Você roda no VS Code (agente local):        Para cada task de E1-S1 a E1-S4:
                                              1. GitHub Issue criada pela Fase 1 existe
  T1 → gera 4 story MDs                       2. Copilot cloud agent lê o corpo da Issue
  T2 → gera task packs para cada story        3. Agente cria branch task/<id>
  T3 → code review com story-task-reviewer    4. Agente executa o plano
  T4 → cria GitHub Issues para TODOS          5. Agente cria PR ("Closes #<issue>")
         os tasks de E1-S1 a E1-S4            6. Você valida e faz merge
  T5 → valida, assina readiness               7. Próxima Issue começa
```

---

## Fase 1 — Executar E1-S0 Localmente (5 tarefas)

### O que já existe

Os task files de E1-S0 já foram criados durante EPIC-0:

| Task | Arquivo | Status |
|---|---|---|
| E1-S0-T1 | `docs/agile/tasks/task-E1S0T1-generate-story-mds-for-epic-1.md` | Draft |
| E1-S0-T2 | `docs/agile/tasks/task-E1S0T2-generate-task-packs-for-all-e1-stories.md` | Draft |
| E1-S0-T3 | `docs/agile/tasks/task-E1S0T3-code-review-planning-artifacts.md` | Draft |
| E1-S0-T4 | `docs/agile/tasks/task-E1S0T4-create-github-issues-for-all-e1-tasks.md` | Draft |
| E1-S0-T5 | `docs/agile/tasks/task-E1S0T5-validate-commit-and-sign-readiness.md` | Draft |

### Procedimento — execute no VS Code, commit direto em `exercise-1`

#### T1 — Gerar 4 story MDs do EPIC-1

**Agente:** `agile-exercise-planner` | **Skill:** `scaffold-stories-from-epic`

**O que faz:** lê a **Seção 7** do epic file (`docs/epics/Epic 1 — Baseline Implementation: Feature Flag Filtering.md`) e gera os 4 story MDs detalhados.

**Artefatos esperados:**
```
docs/agile/stories/story-E1S1-task-analysis-and-implementation-mapping.md
docs/agile/stories/story-E1S2-server-side-filtering-implementation.md
docs/agile/stories/story-E1S3-client-side-filtering-ui-implementation.md
docs/agile/stories/story-E1S4-baseline-measurement-and-closure.md
```

**Validação:**
```bash
ls docs/agile/stories/story-E1S*.md  # deve listar 4 arquivos novos
```

---

#### T2 — Gerar task packs para as 4 histórias

**Agente:** `agile-exercise-planner` | **Skill:** `create-story-task-pack`

**O que faz:** para cada story criado em T1, gera os task files individuais na pasta `docs/agile/tasks/`.

**Validação:**
```bash
node "docs/.github/functions/validate-task-pack.js" docs/agile/tasks task-E1S1
node "docs/.github/functions/validate-task-pack.js" docs/agile/tasks task-E1S2
node "docs/.github/functions/validate-task-pack.js" docs/agile/tasks task-E1S3
node "docs/.github/functions/validate-task-pack.js" docs/agile/tasks task-E1S4
```
Cada um deve sair com exit 0.

---

#### T3 — Code review dos artefatos de planejamento

**Agente:** `story-task-reviewer`

**O que faz:** audita todos os story/task MDs criados em T1–T2, produz um veredito (`approve` ou `request-changes`) com sugestões inline. Todos os achados BLOCKER/MAJOR devem ser resolvidos antes de avançar.

**Como disparar:** peça ao agente `story-task-reviewer` no VS Code:
```
@workspace Revise todos os story e task MDs gerados em E1-S0 T1-T2.
Foque em: completude de ACs, dependências coerentes, scope bem definido.
Produza veredito com evidências.
```

---

#### T4 — Criar GitHub Issues para todos os tasks de E1-S1 a E1-S4

**Agente:** `agile-exercise-planner` — executa localmente com script

**O que faz:** para cada task file de E1-S1 a E1-S4, cria uma Issue no fork com título `[<task-id>] <título>`, labels corretos, e corpo extraído do próprio task file.

**Comando (repita para cada task file):**
```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/create-github-issue-from-task.js" \
  docs/agile/tasks/task-E1S1T1-<slug>.md \
  PedroCF87/nextjs-feature-flag-exercise
```

**Dry-run (verificar antes de criar):**
```bash
node "$REPO_ROOT/docs/.github/functions/create-github-issue-from-task.js" \
  docs/agile/tasks/task-E1S1T1-<slug>.md \
  PedroCF87/nextjs-feature-flag-exercise \
  --dry-run
```

**Validação:**
```bash
gh issue list --repo PedroCF87/nextjs-feature-flag-exercise --label "epic-1"
```
Todas as Issues de E1-S1 a E1-S4 devem aparecer abertas.

> **Nota de segurança:** o script usa `spawnSync` (não interpolação de shell) para passar
> título e labels ao `gh` — sem risco de command injection via conteúdo do task file.

---

#### T5 — Validar, commitar e assinar readiness

```bash
node "$REPO_ROOT/docs/.github/functions/sync-backlog-index.js" "docs/agile"
git add docs/agile/stories/story-E1S*.md docs/agile/tasks/task-E1S*.md docs/agile/backlog-index.json
git commit -m "chore(epic1): generate E1 stories, tasks and open GitHub Issues — E1-S0 Done"
git push origin exercise-1
```

---

## Fase 2 — Execução das Issues (E1-S1 a E1-S4)

Depois que as Issues existirem no fork, a execução é Issue-driven:

### Como o ciclo funciona (1 task = 1 Issue = 1 PR)

```
1. Abra a Issue do task no GitHub  →  verifique se a dependência anterior foi mergeada
2. Atribua ao Copilot cloud agent  →  campo "Assignees" → @Copilot
3. Copilot lê o corpo da Issue     →  localiza "## Task File" → lê o task file
4. Copilot executa o plano         →  cria branch task/<task-id>
5. Copilot cria o PR               →  "Closes #<issue-number>"
6. Você revisa e faz merge         →  valida os critérios do task
7. Próxima Issue começa
```

### O corpo da Issue NÃO precisa ser escrito manualmente

O script `create-github-issue-from-task.js` extrai automaticamente do task file:
- `## 1) Task statement` → título e descrição
- `## 2) Verifiable expected outcome` → critérios de conclusão
- `## 3) Detailed execution plan` → plano passo-a-passo
- Metadata (`ID`, `Priority`, `Depends on`) → labels e referências

Você só precisa garantir que os task files gerados em T2 estejam completos antes de rodar T4.

### Qual agente atribuir nas Issues

| Story | Fase | Agente | Como atribuir |
|---|---|---|---|
| E1-S0 T1–T5 | Planejamento local | `agile-exercise-planner` (VS Code) | **Não cria Issue** — roda localmente |
| E1-S1 | Análise e mapeamento | `task-implementer` (Copilot cloud) | `@Copilot` via GitHub Issues |
| E1-S2 | Server-side filtering | `task-implementer` (Copilot cloud) | `@Copilot` via GitHub Issues |
| E1-S3 | Client-side filtering UI | `task-implementer` (Copilot cloud) | `@Copilot` via GitHub Issues |
| E1-S4 | Medição e closure | `agile-exercise-planner` (Copilot cloud) | `@Copilot` via GitHub Issues |

---

## Checkpoint manual ao fim de cada história

Antes de liberar a próxima história, você valida manualmente:

**E1-S1:** file-impact map e ordem de implementação fazem sentido?
**E1-S2:** server-side filtering funciona? Rode:
```bash
cd server && pnpm run build && pnpm run lint && pnpm test
```
**E1-S3:** todos os 11 ACs do TASK.md verificados no browser?
**E1-S4:** baseline metrics completo, friction log com ≥ 3 pontos?

---

## Sequência Completa de Início — Passo a Passo

```
AGORA (VS Code):
  1. Peça: "Implemente E1-S0-T1 — gerar story MDs do EPIC-1"
  2. Peça: "Implemente E1-S0-T2 — gerar task packs"
  3. Peça: "Implemente E1-S0-T3 — code review dos artefatos"
  4. Peça: "Implemente E1-S0-T4 — criar GitHub Issues para E1-S1 a E1-S4"
  5. Peça: "Implemente E1-S0-T5 — validar e commitar"

DEPOIS (GitHub):
  6. Acesse: https://github.com/PedroCF87/nextjs-feature-flag-exercise/issues
  7. Abra a Issue do task E1-S1-T1
  8. Atribua: @Copilot
  9. Aguarde o PR → revise → merge
  10. Repita para cada task em sequência
```

---

## O que NÃO fazer

| Erro | Por quê é errado |
|---|---|
| Criar uma Issue genérica "execute o planejamento do épico" | E1-S0 roda localmente — uma Issue para ele não faria sentido pois o script de Issues (`create-github-issue-from-task.js`) requer um task file específico |
| Escrever o corpo da Issue manualmente | O script extrai automaticamente do task file — escrever manualmente introduz divergência |
| Atribuir @Copilot em E1-S0 via GitHub | Sem Issues de E1-S0, o agente de nuvem não tem ponto de entrada |
| Commitar em `main` | Todas as branches de feature derivam de `exercise-1` |
| Começar E1-S1 antes de E1-S0-T5 completar | As Issues de E1-S1+ só existem após T4 — não há o que executar antes disso |

---

## Referências

| Arquivo | Relevância |
|---|---|
| [docs/epics/Epic 1.md](../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md#7-candidate-stories-for-the-epic) | Seção 7 — fonte dos 4 story outlines para T1 |
| [docs/agile/stories/story-E1S0-planning-automation.md](../agile/stories/story-E1S0-planning-automation.md) | Acceptance criteria e task list de E1-S0 |
| [.github/skills/scaffold-stories-from-epic/SKILL.md](../../.github/skills/scaffold-stories-from-epic/SKILL.md) | Skill usada em T1 |
| [.github/skills/create-story-task-pack/SKILL.md](../../.github/skills/create-story-task-pack/SKILL.md) | Skill usada em T2 |
| [.github/skills/execute-task-from-issue/SKILL.md](../../.github/skills/execute-task-from-issue/SKILL.md) | Skill do Copilot cloud para E1-S1 a E1-S4 |
| [docs/.github/functions/create-github-issue-from-task.js](../.github/functions/create-github-issue-from-task.js) | Script que cria Issues em T4 |
| [.agents/closure/epic1-handoff.md](../../.agents/closure/epic1-handoff.md) | Starting state e ACs de referência |
