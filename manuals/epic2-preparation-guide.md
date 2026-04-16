---
title: Epic 2 — Preparation Guide (PIV Loop / AI-Assisted Run)
scope: interview
repos:
  - nextjs-feature-flag-exercise
  - resident-health-workshop-resources
updatedAt: 2026-04-15
---

# Epic 2 — Preparation Guide (PIV Loop / AI-Assisted Run)

## 1) Objetivo e contexto

O Exercício 2 consiste em **re-implementar a mesma task de filtragem** (`TASK.md`) usando a disciplina explícita de **Plan → Implement → Validate (PIV Loop)**. O objetivo não é entregar uma feature nova, mas demonstrar que o método PIV produz resultados melhores que o Exercício 1 (Baseline), que teve planejamento estruturado em epics/stories/tasks, mas sem gate de validação por step de codificação.

**O que muda entre Exercício 1 e Exercício 2:**

| Aspecto | Exercício 1 (Baseline) | Exercício 2 (PIV Loop) |
|---|---|---|
| Planejamento | Estruturado (epics/stories/tasks), mas sem gate de build por step de codificação | Plano formal (`.plan.md`) com validação por etapa antes de avançar |
| Implementação | Incremental, mas sem gate por step | Per-task validation: `build` após cada etapa |
| Validação | Gate final (build + lint + test) | Gate **por task** + gate final |
| Workflows CI | Copilot setup-steps only | + `claude.yml` + `pr-review.yml` + `security-review.yml` |
| Métricas | Primeiras (baseline) | Comparativas (delta vs baseline) |

**Métricas do Baseline (Exercício 1) para referência:**

| Métrica | Valor Exercício 1 |
|---|---|
| Tempo (implementação) | 212 min |
| Prompts | 25 |
| Ciclos de rework | 3 |
| Confiança (início → fim) | 3 → 4 → 5 |

Referência: [`.agents/baseline/measurement-baseline.md`](../.agents/baseline/measurement-baseline.md)

---

## 2) Pré-requisitos

Antes de iniciar o Exercício 2, confirme que:

- [x] Epic 1 está **Done** — todos os 11 critérios de aceitação do `TASK.md` foram implementados e validados
- [x] `epic2-handoff.md` tem declaração `READY` assinada — [`.agents/closure/epic2-handoff.md`](../.agents/closure/epic2-handoff.md)
- [x] Conta GitHub com acesso ao fork `PedroCF87/nextjs-feature-flag-exercise`
- [x] `ANTHROPIC_API_KEY` disponível (variável `ANTHROPIC_API_KEY` no arquivo `.env`)
- [x] Ambiente local funcional (`node v22+`, `pnpm 10+`)
- [ ] Leitura completa da metodologia PIV Loop (Seção 5 deste documento)

---

## 3) Preparação do Git — criar branch a partir do estado original

A abordagem mais segura é criar a branch `exercise-2` diretamente a partir do **commit pai do primeiro commit do fork** (`f73979ed~1`) — o estado exato do repositório original, sem nenhuma modificação. Em seguida, os artefatos de documentação e agile são trazidos do `exercise-1`.

**Por que essa abordagem é melhor do que reverter arquivos manualmente:**
- Zero risco de esquecer um arquivo de implementação residual
- Estado inicial **idêntico** ao repositório upstream original
- Um único bloco de comandos, sem manipulação de SHAs individuais

### 3.1) Criar a branch a partir do commit original

```bash
cd /delfos/Projetos/ITBC\ -\ Desafio\ RDH/nextjs-feature-flag-exercise

# Criar exercise-2 a partir do commit pai do primeiro commit do fork
# f73979ed = primeiro commit feito no fork (Epic 0)
git checkout f73979ed06d03ca3095a42665781a32faf5e3baa~1
git checkout -b exercise-2
```

### 3.2) Trazer os artefatos de documentação do exercise-1

```bash
# Trazer todas as pastas de artefatos (docs, AI Layer, agile, manuals)
git checkout exercise-1 -- docs/
git checkout exercise-1 -- .github/
git checkout exercise-1 -- .agents/
git checkout exercise-1 -- exercise-2-docs/
git checkout exercise-1 -- manuals/

git add -A
git commit -m "chore(e2): initialize branch with agile artifacts and AI Layer from exercise-1 [E2-PREP]"
```

### 3.3) Remover workflows do Exercise 1 que não pertencem ao Exercise 2

O `exercise-1` acumulou workflows de automação do Copilot que não devem existir na branch `exercise-2`. Manter apenas o `copilot-setup-steps.yml` e os 3 workflows Claude que serão ativados na Seção 4.

```bash
# Remover workflows específicos do Exercise 1
git rm .github/workflows/auto-copilot-fix.yml
git rm .github/workflows/auto-merge-on-clean-review.yml
git rm .github/workflows/auto-ready-for-review.yml
git rm .github/workflows/auto-validate-copilot-fix.yml
git rm .github/workflows/copilot-push-signal.yml

git commit -m "chore(e2): remove exercise-1 automation workflows [E2-PREP]"
```

**Workflows após limpeza:**

| Arquivo | Status |
|---|---|
| `copilot-setup-steps.yml` | ✅ Manter — instala dependências para o Copilot cloud agent |
| `auto-copilot-fix.yml` | ❌ Remover — automação específica do Exercise 1 |
| `auto-merge-on-clean-review.yml` | ❌ Remover — automação específica do Exercise 1 |
| `auto-ready-for-review.yml` | ❌ Remover — automação específica do Exercise 1 |
| `auto-validate-copilot-fix.yml` | ❌ Remover — automação específica do Exercise 1 |
| `copilot-push-signal.yml` | ❌ Remover — automação específica do Exercise 1 |
| `claude.yml` | ➕ Adicionar na Seção 4 |
| `pr-review.yml` | ➕ Adicionar na Seção 4 |
| `security-review.yml` | ➕ Adicionar na Seção 4 |

### 3.4) Validação pós-setup

Todos os comandos devem passar com **zero erros**:

```bash
cd server && pnpm run build    # ✅ tsc
cd server && pnpm run lint     # ✅ eslint
cd server && pnpm test         # ✅ vitest (16 testes — CRUD apenas, sem filtragem)
cd client && pnpm run build    # ✅ tsc + vite
cd client && pnpm run lint     # ✅ eslint
```

**Resultado esperado:** aplicação funcional com CRUD de flags, mas **sem filtragem** — pronta para re-implementação.

---

## 4) Ativação dos workflows CI do Exercício 2

Os 3 workflows do Claude Code foram movidos para `exercise-2-docs/` durante o Exercício 1 para evitar execuções indesejadas. Agora precisam ser restaurados.

### 4.1) Mover workflows para `.github/workflows/`

```bash
# Copiar workflows do exercício 2
cp exercise-2-docs/claude.yml .github/workflows/claude.yml
cp exercise-2-docs/pr-review.yml .github/workflows/pr-review.yml
cp exercise-2-docs/security-review.yml .github/workflows/security-review.yml

git add .github/workflows/claude.yml .github/workflows/pr-review.yml .github/workflows/security-review.yml
git commit -m "ci(e2): activate Claude Code workflows for PIV Loop exercise [E2-PREP]"
```

### 4.2) O que cada workflow faz

| Workflow | Trigger | Propósito |
|---|---|---|
| `claude.yml` | `@claude` em Issues/PRs | Claude Code interativo via CI — pode executar tasks diretamente |
| `pr-review.yml` | PR aberto/atualizado | Code review automático (qualidade, segurança, arquitetura, testes) |
| `security-review.yml` | PR para qualquer branch | Review de segurança OWASP via Claude |

### 4.3) Instalar o GitHub App do Claude

O `claude.yml` usa a action `anthropics/claude-code-action@v1`, que requer o **Claude GitHub App** instalado no repositório para poder escrever comentários em Issues e PRs.

1. Acesse [github.com/apps/claude](https://github.com/apps/claude)
2. Clique em **Install**
3. Selecione o fork `PedroCF87/nextjs-feature-flag-exercise`
4. Confirme as permissões (leitura/escrita em Issues, PRs e conteúdo)

**Sem o App instalado, o workflow `claude.yml` falhará com erro de permissão**, mesmo que a `ANTHROPIC_API_KEY` esteja corretamente configurada.

### 4.4) Configurar secrets no GitHub

No fork (`PedroCF87/nextjs-feature-flag-exercise`), vá em **Settings → Secrets and variables → Actions** e configure:

| Secret | Valor | Obrigatório |
|---|---|---|
| `ANTHROPIC_API_KEY` | Chave da API Anthropic | ✅ Sim — todos os 3 workflows dependem |

**Sem essa secret, nenhum dos workflows Claude funcionará.**

### 4.5) Validação dos workflows

Após push da branch `exercise-2`:

1. Crie uma **PR** de `exercise-2` → `exercise-1`
2. Verifique que `pr-review.yml` e `security-review.yml` ativam automaticamente
3. Comente `@claude what is the current state of this PR?` para testar `claude.yml`
4. Se os workflows ativarem, a infra está pronta

---

## 5) A metodologia PIV Loop — como executar

### 5.1) O que é o PIV Loop

```
Plan → Implement → Validate
  ↑                    │
  └────────────────────┘   (repeat until green)
```

**Regra central:** nunca acumular estado quebrado. Após cada etapa de implementação, rodar validação. Se falhar, corrigir **antes** de avançar.

### 5.2) Fase 1 — PLAN (antes de escrever código)

Criar um plano formal antes de implementar. O plano deve conter:

1. **Entendimento da task** — os 11 critérios de aceitação, parafraseados
2. **Arquivos-alvo** — lista exata de quais arquivos criar/modificar
3. **Ordem de execução** — sequência das mudanças (idealmente: types → validation → service → routes → client API → UI)
4. **Padrões a seguir** — com referências `file:line` do código existente
5. **Comandos de validação** — o que rodar após cada etapa
6. **Riscos conhecidos** — os 3 riscos do handoff document

**Formato recomendado:** criar `.agents/plans/feature-flag-filtering.plan.md`

**Diferença do Exercício 1:** no baseline, a análise (E1-S1) foi feita mas o plano era informal. No PIV Loop, o plano é um **artefato formal** que o agente lê e executa step-by-step.

### 5.3) Fase 2 — IMPLEMENT (per-task validation)

Executar o plano **uma task por vez**, com build check após cada task:

```
Para cada task no plano:
  1. Ler arquivo-alvo + arquivos adjacentes (verificar assumptions)
  2. Implementar a mudança
  3. Rodar: pnpm run build (server ou client, conforme contexto)
     → Se falhar: corrigir ANTES de avançar
     → Se passar: próxima task
```

**Exemplo de sequência para filtering:**

| # | Task | Arquivo | Validação após task |
|---|---|---|---|
| 1 | Adicionar `FlagFilterParams` | `shared/types.ts` | `cd server && pnpm run build && cd ../client && pnpm run build` |
| 2 | Criar Zod schema de filtros | `server/src/middleware/validation.ts` | `cd server && pnpm run build` |
| 3 | Implementar filtros no service | `server/src/services/flags.ts` | `cd server && pnpm run build` |
| 4 | Wiring na rota | `server/src/routes/flags.ts` | `cd server && pnpm run build && pnpm test` |
| 5 | Testes de filtragem | `server/src/__tests__/flags.test.ts` | `cd server && pnpm test` |
| 6 | API client com params | `client/src/api/flags.ts` | `cd client && pnpm run build` |
| 7 | Filter state no App | `client/src/App.tsx` | `cd client && pnpm run build` |
| 8 | Componente de filtros | `client/src/components/flags-filter-controls.tsx` | `cd client && pnpm run build && pnpm run lint` |

### 5.4) Fase 3 — VALIDATE (gate final)

Após todas as tasks, rodar a suite completa:

```bash
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
```

Se **tudo verde**: criar PR para review automático.
Se **algo falhar**: corrigir, re-validar, e só então criar PR.

### 5.5) PR Review loop

Com os workflows ativos, o ciclo após implementação é:

```
1. git push origin exercise-2
2. Criar PR: exercise-2 → exercise-1
3. pr-review.yml + security-review.yml ativam automaticamente
4. Ler feedback do Claude nos comments da PR
5. Se houver issues: corrigir → push → review re-executa
6. Se clean: merge
```

---

## 6) Coleta de métricas — comparação com Baseline

### 6.1) Template de métricas

Criar `.agents/baseline/measurement-exercise2.md` com os mesmos campos do Exercício 1:

| Métrica | Como medir |
|---|---|
| **Tempo** | Timestamp do primeiro edit até `pnpm test` green |
| **Prompts** | Contar cada mensagem enviada ao AI agent |
| **Rework cycles** | Contar cada vez que um check passa de green → red → green |
| **Confiança** | Auto-avaliação 1–5 em 3 pontos: antes, durante, depois |

### 6.2) Tabela de comparação esperada

| Métrica | Exercício 1 | Exercício 2 | Delta |
|---|---|---|---|
| Tempo (min) | 212 | ? | ? |
| Prompts | 25 | ? | ? |
| Rework cycles | 3 | ? | ? |
| Confiança final | 5 | ? | ? |

**Hipótese:** o PIV Loop deve reduzir rework cycles (validação por etapa catch erros antes) e potencialmente reduzir tempo total (menos debugging acumulado).

---

## 7) Checklist de preparação completa

Execute cada item na ordem:

- [ ] **1. Branch:** `git checkout f73979ed06d03ca3095a42665781a32faf5e3baa~1 && git checkout -b exercise-2`
- [ ] **2. Trazer artefatos:** `git checkout exercise-1 -- docs/ .github/ .agents/ exercise-2-docs/ manuals/`
- [ ] **3. Commit inicial:** `chore(e2): initialize branch with agile artifacts and AI Layer from exercise-1`
- [ ] **4. Remover workflows do Exercise 1:** `git rm` dos 5 workflows (ver Seção 3.3) + commit
- [ ] **5. Validar estado:** todos os comandos passam com zero erros (ver Seção 3.4) — `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`
- [ ] **6. Workflows Claude:** copiar `exercise-2-docs/*.yml` para `.github/workflows/`
- [ ] **7. Commit workflows:** `ci(e2): activate Claude Code workflows for PIV Loop exercise`
- [ ] **8. GitHub App:** instalar o Claude App no fork via github.com/apps/claude
- [x] **9. Secret:** configurar `ANTHROPIC_API_KEY` no GitHub fork
- [ ] **10. Push:** `git push origin exercise-2`
- [ ] **11. Testar workflows:** criar PR draft e verificar que reviews ativam
- [ ] **12. Plano:** criar `.agents/plans/feature-flag-filtering.plan.md`
- [ ] **13. Métricas:** criar `.agents/baseline/measurement-exercise2.md` (template vazio)
- [ ] **14. Iniciar:** começar implementação seguindo o PIV Loop

---

## 8) Erros comuns e prevenção

| Erro | Prevenção |
|---|---|
| Esquecer de resetar o código e tentar re-implementar sobre o existente | Seguir Seção 3 — o exercício precisa de uma re-implementação limpa |
| Não configurar `ANTHROPIC_API_KEY` | Workflows falham silenciosamente. Testar com PR draft antes de iniciar |
| Implementar tudo de uma vez e validar só no final | Isso é Exercício 1 (baseline). PIV Loop exige build check por task |
| Não registrar métricas em tempo real | Abrir o arquivo de métricas **antes** de implementar e preencher conforme avança |
| Usar branch `exercise-1` em vez de `exercise-2` | Epic 2 trabalha na branch `exercise-2`. Nunca sobrescrever o trabalho do Epic 1 |
| Esquecer de mover os workflows | Sem `claude.yml`, `pr-review.yml` e `security-review.yml`, não há CI review |

---

## 9) Referências

| Documento | Propósito |
|---|---|
| [TASK.md](../../TASK.md) | Os 11 critérios de aceitação (mesma task) |
| [`.agents/closure/epic2-handoff.md`](../../.agents/closure/epic2-handoff.md) | Estado de partida, riscos conhecidos, declaração READY |
| [`.agents/baseline/measurement-baseline.md`](../../.agents/baseline/measurement-baseline.md) | Métricas do Exercício 1 para comparação |
| [`docs/.github/copilot-instructions.md`](../../../docs/.github/copilot-instructions.md#L21-L31) | Definição do PIV Loop |
| [`docs/.github/agents/rdh-workflow-analyst.agent.md`](../../../docs/.github/agents/rdh-workflow-analyst.agent.md#L52-L112) | PIV Loop detalhado + referência de comandos `/plan` e `/implement` |
| [`exercise-2-docs/claude.yml`](../../exercise-2-docs/claude.yml) | Workflow Claude Code para CI |
| [`exercise-2-docs/pr-review.yml`](../../exercise-2-docs/pr-review.yml) | Workflow PR review automático |
| [`exercise-2-docs/security-review.yml`](../../exercise-2-docs/security-review.yml) | Workflow security review |
| [`interview-architecture-overview.md`](./interview-architecture-overview.md) | Arquitetura completa (referência durante planejamento) |
| [`interview-backend-deep-dive.md`](./interview-backend-deep-dive.md) | Backend deep dive (referência para plano de service/routes) |
| [`interview-frontend-deep-dive.md`](./interview-frontend-deep-dive.md) | Frontend deep dive (referência para plano de UI/state) |
