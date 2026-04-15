# Catálogo de Configuração do Ambiente de Desenvolvimento com IA

| Campo | Valor |
|---|---|
| Status | Draft |
| Data | 2026-04-10 |
| Autor | GitHub Copilot |
| Versão | 1.10.0 |

---

## Objetivo

Listar os **custom agents**, **instructions** e **skills** recomendados para suportar seu fluxo atual de desenvolvimento assistido por IA (requisitos → épicos → histórias → tarefas → issues → implementação em PR → code review/fix loop → merge → próxima tarefa).

Também cobre a etapa adicional de **adequação da documentação/configuração do Copilot para projetos já estruturados** (análise do projeto existente + ajustes em global rules, instructions, agents e skills).

Este catálogo usa como referência a estrutura já aplicada no projeto DéjàVu em [.github](../Dejavu/dejavu-rio-planing/.github):

- Global rules em [copilot-instructions.md](../Dejavu/dejavu-rio-planing/.github/copilot-instructions.md)
- Instructions segmentadas em [.github/instructions](../Dejavu/dejavu-rio-planing/.github/instructions)
- Agents especializados em [.github/agents](../Dejavu/dejavu-rio-planing/.github/agents)
- Setup de ambiente no workflow [copilot-setup-steps.yml](../Dejavu/dejavu-rio-planing/.github/workflows/copilot-setup-steps.yml)

---

## 1) Custom Agents recomendados

> Pasta sugerida: `.github/agents/`

| Arquivo | Fase do fluxo | Responsabilidade principal |
|---|---|---|
| `requirements-analyst.agent.md` | 1-3 | Ler requisitos do cliente, detectar ambiguidades e gerar perguntas de descoberta + baseline técnico. |
| `epic-story-planner.agent.md` | 4-6 | Transformar documento técnico em épicos, histórias, tarefas e sub-tarefas com critérios de aceite. |
| `issue-orchestrator.agent.md` | 7-8 | Converter tarefas em issues e manter JSON de ordem/dependências sincronizado. |
| `rules-bootstrap.agent.md` | 9-12 | Gerar/atualizar `copilot-instructions`, `instructions`, `agents`, `skills` para o projeto corrente. |
| `copilot-env-specialist.agent.md` | 13 | Configurar setup do Copilot (`copilot-setup-steps.yml`, MCP, envs, secrets, firewall). |
| `task-implementer.agent.md` | 14-16 | Implementar uma issue por vez com plano + validação contínua + testes. |
| `pr-review-fix.agent.md` | 17-20 | Ler review, classificar severidade, aplicar correções e publicar relatório de fix. |
| `merge-release-operator.agent.md` | 21 | Validar gates finais, executar merge e fechamento da issue, e acionar próxima tarefa. |
| `post-story-retro.agent.md` | 22 | Avaliar entregas da história, gerar bugs e ajustes sistêmicos (retro do processo). |
| `project-adaptation-analyst.agent.md` | Pré-fluxo / etapa de adequação | Auditar projeto já existente e mapear o delta para atualizar `copilot-instructions`, `instructions`, `agents` e `skills`. |
| `copilot-config-refactor.agent.md` | Etapa de adequação (execução) | Aplicar as alterações nos arquivos da AI Layer com rastreabilidade e checklist de consistência. |
| `agile-exercise-planner.agent.md` | Planejamento dos exercícios | Organizar exercícios em épicos, histórias, tarefas e sub-tarefas com prioridade e dependências. |
| `technical-ptbr-translator.agent.md` | Documentação multilíngue | Traduzir documentação técnica EN → pt-BR com fidelidade semântica e preservação de estrutura técnica. |
| `technical-en-translator.agent.md` | Documentação multilíngue | Traduzir documentação técnica pt-BR → EN com fidelidade semântica e preservação de estrutura técnica. |
| `git-ops.agent.md` | E0-S1 — Execução (T1) | Operações git com guardrails do exercício: configuração de fork, remotes, branches, commits e push seguro. Proíbe push direto em `main` ou `upstream`. Companion skill: `fork-and-configure-remotes`. |
| `environment-validator.agent.md` | E0-S1 — Execução (T2) | Valida ambiente local de desenvolvimento: instala dependências pnpm, executa suite de validação completa (7 comandos individuais), produz relatório de evidência estruturado com exit codes e branch SHA. Companion skill: `validate-exercise-environment`. |
| `codebase-gap-analyst.agent.md` | Análise comparativa | Compara `nextjs-feature-flag-exercise` (estado atual) vs `nextjs-ai-optimized-codebase` (Gold Standard) em arquitetura, tooling, padrões, AI-readiness e testes. Companion skill: `gap-analysis`. |
| `rdh-workflow-analyst.agent.md` | Estudo da metodologia do workshop | Analisa em profundidade commands, skills e workflows do workshop; explica fases, inputs, outputs e decisões de design com rastreabilidade file:line. Companion skill: `analyze-rdh-workflow`. |
| `technical-manual-writer.agent.md` | Documentação técnica | Produz manuais técnicos acionáveis com base em evidências reais dos repositórios (Rulebook, Gold Standard, Exercise). Companion skill: `write-technical-manual`. |
| `prompt-engineer.agent.md` | AI Layer — criação e revisão | Projeta e cria custom agents e skills (`.agent.md`, `SKILL.md`) refletindo convenções do projeto. Companion skill: `create-specialist-agent`. |

### Observação de referência (DéjàVu)

No DéjàVu já existem agents focados em tarefas de infra/setup, por exemplo:

- [github-actions.agent.md](../Dejavu/dejavu-rio-planing/.github/agents/github-actions.agent.md)
- [install-sh.agent.md](../Dejavu/dejavu-rio-planing/.github/agents/install-sh.agent.md)
- [seed-sql.agent.md](../Dejavu/dejavu-rio-planing/.github/agents/seed-sql.agent.md)

---

## 2) Instructions recomendadas

> Pasta sugerida: `.github/instructions/`

### 2.1 Núcleo obrigatório

| Arquivo | Aplicação |
|---|---|
| `coding-agent.instructions.md` | Regras gerais de implementação e comportamento do agente de código. |
| `code-review.instructions.md` | Critérios de review, severidade, formato de comentários e tags de workflow. |
| `pr-comment-tags.instructions.md` | Dicionário de tags obrigatórias para automações de PR/fix/re-review. |
| `documentation.instructions.md` ✅ | Convenções de nomes, front-matter obrigatório (5 campos), estrutura markdown, links relativos, checklists de completude por tipo de documento (`epic-closure-report`, `epic-handoff`, `friction-log`, `decisions-record`, `execution-guide`) e regras de tooling. Aplica-se a `**/.agents/closure/**`, `**/.agents/templates/**` e `agile/epic*-execution-guide.md`. |

### 2.2 Camadas por domínio técnico

| Arquivo | Aplicação |
|---|---|
| `backend.instructions.md` | Padrões de backend/API/serviços. |
| `database.instructions.md` | Convenções SQL, migrações, seeds, idempotência, soft-delete. |
| `frontend.instructions.md` ou `nextjs.instructions.md` | Padrões de UI, App Router, acessibilidade, i18n, metadata. |
| `testing.instructions.md` | Estratégia de testes (unitário, integração, e2e, performance) por camada. |
| `security.instructions.md` | Segredos, RBAC, validação de input, OWASP básico. |

### 2.3 Camadas de processo

| Arquivo | Aplicação |
|---|---|
| `create-issue.instructions.md` | Formato e checklist para criação de issues a partir de tarefas. |
| `create-task.instructions.md` | Padrão para decomposição de histórias em tarefas/sub-tarefas. |
| `roadmap-dependencies.instructions.md` | Regras para manutenção do JSON de dependências e ordem de execução. |
| `project-adaptation.instructions.md` | Regras para diagnóstico de projeto legado e atualização incremental dos artefatos do Copilot sem quebrar o fluxo existente. |
| `copilot-config-governance.instructions.md` | Guardrails para mudança de `copilot-instructions`, `instructions`, `agents` e `skills` (versionamento, compatibilidade e rollback). |
| `agile-planning.instructions.md` | Padrão de decomposição ágil (épicos/histórias/tarefas/sub-tarefas), critérios de aceite e dependências. |
| `timeline-tracking.instructions.md` | Regras de data (`Created at` / `Last updated`) e registro obrigatório em `Docs/agile/timeline.jsonl` para artefatos ágeis. |
| `translation.instructions.md` | Regras de tradução técnica EN → pt-BR preservando estrutura markdown, comandos e precisão operacional. |
| `translation-en.instructions.md` | Regras de tradução técnica pt-BR → EN preservando estrutura markdown, comandos e precisão operacional. |
| `git-operations.instructions.md` | Guardrails sempre-ativos para operações git: segurança de branches, Conventional Commits em inglês, configuração de remotes, operações proibidas e requisitos de evidência por operação. |
| `measurement-baseline.instructions.md` | Regras para definição e captura do baseline de métricas (tempo, prompts, rework, confiança) e assinatura do go/no-go checklist antes de cada exercício. |
| `backlog-governance.instructions.md` ✅ | Regras de manutenção do `backlog-index.json`: quando chamar `sync-backlog-index.js`, campos obrigatórios nas stories/tasks, representação de dependências, ciclo de vida de status (`Draft → In Progress → Done / Blocked`) e política de versão semver do índice. Aplica-se a `agile/backlog-index.json,agile/stories/**,agile/tasks/**`. |
| `friction-log.instructions.md` ✅ | Define o que conta como friction point (bloqueios, retrabalho, ambiguidade, falha de ferramenta), quando registrar, formato da entrada (1 frase, sem pipes), níveis de impacto (high/medium/low) e como E0-S4 consome o log. Aplica-se a `nextjs-feature-flag-exercise/.agents/templates/friction-log.md`. |
| `task-detailing-governance.instructions.md` ✅ | Guardrails para detalhamento de tarefas em lote com qualidade alta: estrutura mandatória, metadados obrigatórios, seção explícita de arquitetura+segurança, evidência de validação, bloco Given/When/Then, e proibição de placeholders. Aplica-se a `agile/stories/**,agile/tasks/**`. |

### 2.4 Camadas de exercício e metodologia

> Instruções de escopo específico aplicadas a repositórios de exercício ou ao workspace de estudo.

| Arquivo | Aplicação |
|---|---|
| `feature-flag-exercise.instructions.md` | Guardrails e convenções específicas do repositório `nextjs-feature-flag-exercise`: padrões de código, comandos de validação, restrições SQL.js, e regras de branch. |
| `gold-standard.instructions.md` | Referência para agentes que operam no repositório `nextjs-ai-optimized-codebase`: stack (Bun, Next.js 16, Drizzle, Biome, Zod v4), padrões de import e comandos de validação. |
| `workshop-resources.instructions.md` | Contexto da metodologia do workshop extraído do repositório `resident-health-workshop-resources`: structure de commands, skills e o AI Layer do workshop. |

### Referência direta no DéjàVu

Modelos já usados no projeto:

- [coding-agent.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/coding-agent.instructions.md)
- [code-review.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/code-review.instructions.md)
- [create-issue.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/create-issue.instructions.md)
- [create-task.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/create-task.instructions.md)
- [database.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/database.instructions.md)
- [documentation.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/documentation.instructions.md)
- [nextjs.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/nextjs.instructions.md)
- [pr-comment-tags.instructions.md](../Dejavu/dejavu-rio-planing/.github/instructions/pr-comment-tags.instructions.md)

---

## 3) Skills recomendadas

> Pasta sugerida: `.github/skills/<skill-name>/SKILL.md`

| Skill | Fase do fluxo | Resultado esperado |
|---|---|---|
| `requirements-clarification` | 1-2 | Checklist de dúvidas + matriz de riscos e premissas. |
| `technical-spec-writer` | 3 | Documento técnico detalhado e validável a partir dos requisitos. |
| `epic-story-decomposer` | 4-6 | Épicos → histórias → tarefas/sub-tarefas com critérios de aceite. |
| `issue-batch-creator` | 7 | Lote de issues padronizadas com labels, prioridade e links. |
| `dependency-roadmap-builder` | 8 | JSON de ordem e dependências com validação de ciclos. |
| `global-rules-bootstrap` | 9-12 | Esqueleto inicial de AI Layer (rules + instructions + agents + skills). |
| `copilot-env-setup` | 13 | Checklist de workflow, MCP, env, secrets e validação de setup. |
| `task-implementation-loop` | 14-16 | Sequência Plan/Implement/Validate por issue com gates explícitos. |
| `review-fix-loop` | 17-20 | Conversão de comentários de review em patch e revalidação. |
| `merge-and-close` | 21 | Checklist de merge seguro + fechamento de issue + próxima fila. |
| `post-story-quality-retro` | 22 | Retro da história, bugs residuais e melhorias sistêmicas. |
| `project-context-audit` | Etapa de adequação | Inventário técnico do projeto existente (stack, estrutura, padrões, workflows, gaps de documentação). |
| `copilot-layer-diff` | Etapa de adequação | Diff estruturado entre AI Layer atual e AI Layer alvo (o que manter, editar, criar, remover). |
| `config-migration-plan` | Etapa de adequação | Plano de migração dos arquivos do Copilot com ordem, dependências, critérios de aceite e rollback. |
| `create-exercise-backlog` | Planejamento dos exercícios | Transformar exercícios em backlog executável com prioridade e dependências. |
| `refine-agile-breakdown` | Planejamento dos exercícios | Refinar backlog existente para melhorar granularidade, aceite e ordem de execução. |
| `gap-analysis` | Análise comparativa | Comparar duas codebases e produzir um roadmap de transformação priorizado com evidências file:line. |
| `analyze-rdh-workflow` | Estudo da metodologia do workshop | Decompor fases, inputs, outputs e decisões de design de um command ou skill do workshop com rastreabilidade. |
| `system-evolution-retro` | Melhoria sistêmica | Converter falhas recorrentes em melhorias de regras, commands, context e templates para aumentar a previsibilidade do ciclo de validação. |
| `write-technical-manual` | Documentação técnica | Gerar manuais técnicos detalhados e acionáveis com base em evidências reais do repositório. |
| `create-specialist-agent` | Criação de agentes | Projetar e criar um novo GitHub Copilot custom agent especializado para um domínio ou tarefa específica. |
| `timeline-tracker` | Registro de atividade | Manter `Docs/agile/timeline.jsonl` como log append-only de todas as operações em artefatos ágeis. |
| `file-timestamps` | Metadados de arquivo | Obter timestamps reais de criação (`birthtime`) e modificação (`mtime`) de arquivos via `fs.statSync()` do Node.js. |
| `fork-and-configure-remotes` | E0-S1 — T1 (fork + remotes) | Fork criado no GitHub, clone local, remotes `origin`+`upstream` configurados, `exercise-1` com tracking para upstream verificado. Checklist de validação (6 itens) e tabela de error recovery (5 casos). |
| `validate-exercise-environment` | E0-S1 — T2 (validação do ambiente) | 6 fases: pré-requisitos → install server → install client → suite server (build/lint/test) → suite client (build/lint) → relatório. Saída: tabela com 7 comandos, exit codes e branch SHA. |
| `produce-diagnosis-document` | E0-S1 — T4 (documento de diagnóstico) | Preenche template de 8 seções (estado do ambiente, mapa de arquitetura, fluxo de dados, gap de filtros, constraints SQL.js, pontos de integração, risk register, ACs do TASK.md) a partir dos findings de T2/T3. |
| `adapt-artifact-to-fork-scope` | E0-S2 — T2/T3 (adaptação de artefatos) | Adapta artefatos da AI Layer do workspace para o fork: substitui `applyTo` por escopo fork-relativo, remove referências absolutas ao workspace, produz diff summary das alterações. Usado pelo agente `copilot-config-refactor`. |
| `validate-ai-layer-coverage` | E0-S2 — T5 (validação de cobertura) | Executa o checklist mínimo de 6 itens de `ai-development-environment-catalog.md §6` contra o fork alvo e produz relatório pass/fail com caminhos de evidência e plano de gap. Salvo em `.agents/validation/ai-layer-coverage-report.md`. |
| `generate-measurement-template` | E0-S3 — T2 (criação do template) | Gera o template completo de 9 seções de captura de baseline, parametrizado por nome do exercício, fork root e comandos de validação. Reutilizável nos 4 exercícios. |
| `record-time-zero-snapshot` | E0-S3 — T3 (snapshot de tempo zero) | Captura de 6 fases: confirma pré-requisitos → roda suite de validação → verifica arquivos AI Layer → preenche template → assina go/no-go → commit. Usa `elapsed-time.js` para calcular tempo decorrido. |
| `translate-technical-docs` | Documentação multilíngue | Tradução técnica EN → pt-BR com consistência terminológica e proteção de comandos/código. |
| `translate-ptbr-to-english` | Documentação multilíngue | Tradução técnica pt-BR → EN com consistência terminológica e proteção de comandos/código. |
| `produce-epic-closure-report` | E<N>-S4 — T2 (relatório de encerramento) | Consolida evidências de DoD de todas as predecessor stories, consulta elapsed time via `timeline-query.js`, e escreve o relatório de encerramento do epic com 5 seções (checklist DoD, riscos residuais, friction log, decisões, tempo total). Reutilizável nos 4 exercícios. |
| `produce-epic-handoff` | E<N>-S4 — T3 (handoff document) | Produz o documento de handoff para o próximo epic com 6 seções: estado inicial (branch/SHA via `git-info.js`), cobertura AI Layer (via `check-ai-layer-files.js --table`), referência da tarefa, primeira story a executar, top 3 riscos do audit, e declaração assinada `READY — EPIC-<N> may begin.` |
| `sync-backlog-index` ✅ | Regeneração do índice de backlog | 4 fases: validar pré-requisitos → dry-run com preview → detectar ciclos de dependência → escrever `backlog-index.json`. Reutilizável para qualquer epic. Usa `sync-backlog-index.js`. |
| `record-friction-point` ✅ | Registro de friction points durante execução | 3 passos: identificar evento → classificar impacto (high/medium/low) → chamar `append-friction-log.js`. Invocável por qualquer story de qualquer exercise. |
| `generate-dashboards` ✅ | Visualização dos 3 sistemas de logs | 4 passos: validar fontes (`timeline.jsonl`, `backlog-index.json`, `friction-log.md`) → executar `generate-dashboards.js` → validar HTMLs em `Docs/dashboard/` → checagem visual de filtros/navegação. |
| `create-story-task-pack` ✅ | Geração segura de tasks em lote por story | 5 fases: pre-check da story → dry-run de scaffold → geração completa de tarefas → validação de qualidade/segurança → sincronização do backlog. Usa `scaffold-story-tasks.js` e `validate-task-pack.js`. |

---

## 4) Mapa de cobertura por etapa do seu fluxo

| Etapas | Agente principal | Skills principais | Instructions críticas |
|---|---|---|---|
| Etapa de adequação (projeto já estruturado) | `project-adaptation-analyst`, `copilot-config-refactor` | `project-context-audit`, `copilot-layer-diff`, `config-migration-plan` | `project-adaptation.instructions.md`, `copilot-config-governance.instructions.md` |
| E0-S1 — Configuração do repositório e ambiente | `git-ops`, `environment-validator`, `project-adaptation-analyst` | `fork-and-configure-remotes`, `validate-exercise-environment`, `produce-diagnosis-document`, `project-context-audit` | `git-operations.instructions.md`, `project-adaptation.instructions.md` |
| E0-S2 — Minimum AI Layer Configuration | `copilot-config-refactor`, `rules-bootstrap`, `copilot-env-specialist`, `git-ops` | `adapt-artifact-to-fork-scope`, `validate-ai-layer-coverage`, `global-rules-bootstrap`, `copilot-env-setup` | `copilot-config-governance.instructions.md`, `coding-agent.instructions.md`, `git-operations.instructions.md` |
| E0-S3 — Definition of Measurement Baseline | `agile-exercise-planner`, `environment-validator`, `git-ops` | `generate-measurement-template`, `record-time-zero-snapshot`, `validate-exercise-environment`, `validate-ai-layer-coverage`, `file-timestamps`, `create-exercise-backlog` | `measurement-baseline.instructions.md`, `agile-planning.instructions.md`, `timeline-tracking.instructions.md` |
| E0-S4 — Preparation Closure and Handoff | `project-adaptation-analyst`, `git-ops`, `agile-exercise-planner` | `produce-epic-closure-report`, `produce-epic-handoff`, `validate-ai-layer-coverage`, `timeline-tracker`, `record-friction-point` | `documentation.instructions.md`, `project-adaptation.instructions.md`, `friction-log.instructions.md` — produces `epic0-execution-guide.md`, `epic0-closure-report.md`, `epic1-handoff.md` |
| 1-3 (requisitos → doc técnico) | `requirements-analyst` | `requirements-clarification`, `technical-spec-writer` | `documentation.instructions.md` |
| 4-6 (épicos/histórias/tarefas) | `epic-story-planner` | `epic-story-decomposer` | `create-task.instructions.md` |
| 7-8 (issues + JSON dependências) | `issue-orchestrator` | `issue-batch-creator`, `dependency-roadmap-builder` | `create-issue.instructions.md`, `roadmap-dependencies.instructions.md` |
| 9-13 (AI Layer + ambiente Copilot) | `rules-bootstrap`, `copilot-env-specialist` | `global-rules-bootstrap`, `copilot-env-setup` | `coding-agent.instructions.md`, `pr-comment-tags.instructions.md` |
| 14-16 (implementação da tarefa) | `task-implementer` | `task-implementation-loop` | instruções de domínio (`backend`, `database`, `frontend`, `testing`) |
| 17-20 (review/fix loop) | `pr-review-fix` | `review-fix-loop` | `code-review.instructions.md`, `pr-comment-tags.instructions.md` |
| 21-22 (merge + retro) | `merge-release-operator`, `post-story-retro` | `merge-and-close`, `post-story-quality-retro` | `documentation.instructions.md`, `security.instructions.md` |

---

## 5) Ordem recomendada de criação

```text
0) Adequação para projeto já estruturado (quando aplicável)
   - inventário técnico do projeto
   - diff da AI Layer atual vs alvo
   - plano de migração com rollback

1) Global rules
   - .github/copilot-instructions.md

2) Instructions (núcleo + domínio + processo)

3) Skills (pipeline completo do seu fluxo)

4) Agents (especialistas por fase)

5) Ambiente Copilot
   - .github/workflows/copilot-setup-steps.yml
   - .github/copilot-mcp.json (ou config cloud equivalente)
   - Environment secrets (copilot)
```

---

## 6) Funções JavaScript utilitárias

> Pasta: `Docs/.github/functions/`
>
> Regra de extração: um snippet `node -e "..."` inline ou bloco bash usado em **3 ou mais lugares distintos** deve ser extraído para um arquivo `.js` com JSDoc, entry point CLI e `module.exports`.

| Arquivo | CLI | Substitui |
|---|---|---|
| `datetime.js` | `node "Docs/.github/functions/datetime.js"` | O one-liner `node -e "const d=new Date()..."` para geração de timestamp atual |
| `file-stats.js` | `node "Docs/.github/functions/file-stats.js" <abs-path> [<abs-path> ...]` | O one-liner `node -e "const fs=require('fs'); const stats=fs.statSync(...)..."` nas skills `file-timestamps` e `timeline-tracker` |
| `timeline-id.js` | `node "Docs/.github/functions/timeline-id.js" <abs-path-to-timeline.jsonl>` | Lógica manual de "ler última linha, extrair id, incrementar" ao anexar em `timeline.jsonl` |
| `elapsed-time.js` | `node "Docs/.github/functions/elapsed-time.js" "<start-ts>" "<end-ts>" [label]` | Cálculo de minutos decorridos entre dois timestamps nos templates de baseline |
| `git-info.js` | `node "Docs/.github/functions/git-info.js" [<abs-repo-path>] [--branch-ref]` | Comandos inline `git rev-parse --short HEAD` + `git branch --show-current` + `git remote get-url` nas skills `validate-exercise-environment`, `produce-diagnosis-document`, `project-context-audit` e `fork-and-configure-remotes` |
| `check-prereqs.js` | `node "Docs/.github/functions/check-prereqs.js" [expected-branch] [<abs-repo-path>]` | O bloco bash da Fase 1 (`node --version && pnpm --version && git branch --show-current`) em `validate-exercise-environment` e verificações implícitas de branch nas tasks T1 e T2 de E0-S1 |
| `validate-workflow-file.js` | `node "Docs/.github/functions/validate-workflow-file.js" <abs-path-to-yml>` | Revisão estrutural manual do `copilot-setup-steps.yml` (job name, `environment: copilot`, `timeout-minutes ≤ 59`, `workflow_dispatch`) na skill `copilot-env-setup`, E0-S2 T4/T5, e anti-patterns do `copilot-env-specialist` |
| `check-ai-layer-files.js` | `node "Docs/.github/functions/check-ai-layer-files.js" <base-path> <rel-path> [...] [--table] [--manifest <json>]` | Verificação manual de existência de arquivos da AI Layer em E0-S2 T0/T5, skill `validate-ai-layer-coverage` passos 3–5 e DoD verification |
| `timeline-query.js` | `node "Docs/.github/functions/timeline-query.js" <abs-path-to-timeline.jsonl> [--epic <ID> \| --story <ID> \| --summary]` | Consulta de elapsed time por epic ou story no `timeline.jsonl`; produz tabelas markdown para closure reports, handoff documents e comparação entre exercises |
| `sync-backlog-index.js` ✅ | `node "Docs/.github/functions/sync-backlog-index.js" <agile-dir> [--dry-run]` | Manutenção manual do `backlog-index.json`; extração inline de metadados de stories/tasks; detecção de ciclos de dependência |
| `append-friction-log.js` ✅ | `node "Docs/.github/functions/append-friction-log.js" <repo-path> <story-id> "<description>" [--impact high\|medium\|low]` | Edição manual da tabela de friction log; substituição inline de pipes e newlines na descrição |
| `generate-dashboards.js` ✅ | `node "Docs/.github/functions/generate-dashboards.js" [--friction-log <abs-path>]` | Geração manual de `Docs/dashboard/timeline.html`, `backlog.html` e `friction-log.html`; dados injetados inline como `const DATA`; Bootstrap 5.3.3 via CDN; zero dependências npm |
| `scaffold-story-tasks.js` ✅ | `node "Docs/.github/functions/scaffold-story-tasks.js" <abs-story-file> <abs-agile-dir> [--dry-run] [--overwrite]` | Criação em lote dos arquivos de tarefa a partir da seção `## 4) Tasks` da story, preservando detalhamento e preenchendo metadados padrão de governança |
| `validate-task-pack.js` ✅ | `node "Docs/.github/functions/validate-task-pack.js" <abs-agile-dir> [--story E0-S1]` | Validação de completude/qualidade das tarefas: metadados obrigatórios, seções mandatórias, ausência de placeholders, presença de sinais de segurança e bloco Given/When/Then |

---

## 7) Checklist mínimo de prontidão

- [ ] Foi feita análise de projeto já estruturado (stack, padrões, CI/workflows, convenções, lacunas da AI Layer).
- [ ] Existe plano de migração para ajustes de configuração com ordem, dependências e rollback.
- [ ] Existe um agente claro para cada macrofase do fluxo (descoberta, planejamento, implementação, review, merge, retro).
- [ ] Cada fase tem ao menos 1 skill operacional reutilizável.
- [ ] Existe instruction para revisão, documentação, segurança e tags de PR.
- [ ] Setup do Copilot foi validado por workflow manual e por execução real do agente.
- [ ] O loop review → fix → re-review → merge está automatizado com gates explícitos.
