---
title: Fluxo Atual de Desenvolvimento com IA (22 etapas)
scope: interview
repos:
  - resident-health-workshop-resources
  - nextjs-feature-flag-exercise
  - nextjs-ai-optimized-codebase
updatedAt: 2026-04-09
---

## 1) Objetivo e contexto

Este manual formaliza, em formato executável, o seu **fluxo atual de desenvolvimento com IA** (da descoberta até merge/retro), com separação entre caminhos **Greenfield** e **Brownfield**.

Objetivo prático: transformar o fluxo em um padrão repetível, com responsabilidades por fase, artefatos esperados e checkpoints de validação no estilo **PIV Loop**.

Base metodológica:
- RDH trabalha com abordagem **AI-first, documentation-driven**.
- A cadência operacional esperada é **Plan → Implement → Validate**.

---

## 2) Pré-requisitos

1. Repositório de trabalho criado e com permissões para issues/PR/workflows.
2. Estrutura de AI Layer prevista no repositório (`.github/copilot-instructions.md`, `.github/instructions/`, `.github/agents/`, `.github/skills/`).
3. Estratégia de validação definida para server/client (lint, typecheck, testes).
4. Template de backlog disponível (épicos, histórias, tarefas, sub-tarefas e dependências).

Resultado esperado: ambiente pronto para executar o fluxo de ponta a ponta sem lacunas de governança.

---

## 3) Procedimento passo a passo

## Fase A — Descoberta e consolidação de contexto (Etapas 1-3)

### Caminho A1: Greenfield
1. Receber o documento de requisitos do cliente.
   - Intenção: capturar escopo inicial e objetivos de negócio.
   - Resultado esperado: documento-fonte versionado no repositório.
2. Analisar ambiguidades e preparar perguntas de descoberta.
   - Intenção: reduzir risco de interpretação antes de desenhar solução.
   - Resultado esperado: lista objetiva de dúvidas e premissas validadas.

### Caminho A2: Brownfield
1. Auditar o codebase existente do cliente (arquitetura, padrões, CI/workflows, lacunas de documentação).
   - Intenção: mapear restrições reais do sistema atual.
   - Resultado esperado: inventário técnico e delta de adaptação do projeto.
2. Esclarecer dúvidas com o time técnico do cliente.
   - Intenção: confirmar decisões arquiteturais e limites de mudança.
   - Resultado esperado: decisões registradas para orientar planejamento.

### Consolidação comum
3. Gerar um documento técnico detalhado com apoio de IA.
   - Intenção: converter requisitos e contexto em plano técnico implementável.
   - Resultado esperado: base única para decomposição ágil e execução.

**Checkpoint PIV (Plan):** não iniciar código antes de concluir e revisar o documento técnico.

---

## Fase B — Planejamento ágil e orquestração de execução (Etapas 4-8)

4. Converter documento técnico em épicos.
5. Detalhar cada épico em histórias.
6. Decompor histórias em tarefas e sub-tarefas.
7. Cadastrar cada tarefa como issue no GitHub.
8. Publicar JSON com ordem de execução e dependências.

Para cada etapa acima:
- Intenção: criar trilha de execução rastreável e priorizada.
- Resultado esperado: backlog navegável, sem dependências implícitas.

**Checkpoint PIV (Plan):** validar se cada item possui critério de aceite e evidência de validação planejada.

---

## Fase C — Bootstrap da AI Layer e setup operacional (Etapas 9-13)

9. Criar/atualizar regras globais (`.github/copilot-instructions.md`).
10. Criar/atualizar instruções (`.github/instructions`).
11. Criar/atualizar agentes (`.github/agents`).
12. Criar/atualizar skills (`.github/skills`).
13. Configurar ambiente do Copilot (workflow de setup, MCP, envs, secrets).

Para cada etapa acima:
- Intenção: transformar o processo em sistema operacional reutilizável.
- Resultado esperado: AI Layer consistente, versionada e pronta para execução automatizada.

**Checkpoint PIV (Plan → Implement):** só avançar para implementação quando o setup estiver validado por execução real.

---

## Fase D — Execução assistida, review loop e fechamento (Etapas 14-22)

14. Atribuir a primeira issue ao agente especialista.
15. Agente abre PR (draft).
16. Agente implementa a tarefa no PR e executa validações/tests.
17. Workflow dispara code review automatizado.
18. Review publica comentários/ajustes.
19. Workflow decide se há pendências.
20. Se houver pendências, aciona agente para correção.
21. Se não houver pendências, faz merge, fecha issue e avança para próxima.
22. Ao fim da história, realizar retro da entrega e abrir issues de bug quando necessário.

Para cada etapa acima:
- Intenção: manter fluxo contínuo com gates explícitos de qualidade.
- Resultado esperado: PRs pequenos, rastreáveis, com ciclo review → fix → re-review até ficar verde.

**Checkpoint PIV (Implement/Validate):** nunca acumular estado quebrado entre tarefas; falhou validação, corrige antes de avançar.

---

## 4) Checklist de validação

Use este checklist ao final de cada história:

- [ ] Existe trilha completa requisito → documento técnico → épico → história → tarefa → issue.
- [ ] A ordem e dependências estão publicadas em JSON e sem conflitos.
- [ ] AI Layer está atualizada (global rules, instructions, agents, skills).
- [ ] Setup do Copilot foi validado por workflow e execução real.
- [ ] Cada PR passou por implementação + review + correção + revalidação.
- [ ] Merge/fechamento de issue ocorreu apenas após gates de qualidade.
- [ ] Retro da história foi registrada e bugs residuais viraram novas issues.

Validação operacional recomendada:
1. Rodar checks definidos no comando de validação do repositório-alvo.
2. Confirmar que o loop review/fix não deixou pendências abertas.
3. Confirmar atualização da fila da próxima tarefa após merge.

---

## 5) Erros comuns e prevenção

1. **Começar a implementar antes de consolidar contexto (etapas 1-3).**
   - Prevenção: bloquear execução até concluir documento técnico revisado.

2. **Criar backlog sem dependências explícitas (etapa 8).**
   - Prevenção: manter JSON de ordem/dependências como artefato obrigatório.

3. **Montar AI Layer incompleta (etapas 9-13).**
   - Prevenção: usar checklist mínimo de prontidão antes de delegar a primeira issue.

4. **Pular o loop de validação contínua (etapas 16-20).**
   - Prevenção: aplicar regra “falhou validação, corrige antes de continuar”.

5. **Fechar história sem retro e sem captura de bugs (etapa 22).**
   - Prevenção: tratar retro como gate obrigatório de encerramento.

---

## 6) Referências

### Estrutura do fluxo e cobertura por etapas
- Docs/ai-development-environment-catalog.md:27-44 (catálogo de custom agents por fase)
- Docs/ai-development-environment-catalog.md:136-147 (mapa de cobertura por etapa 1-22)
- Docs/ai-development-environment-catalog.md:151-170 (ordem recomendada de criação da AI Layer)
- Docs/ai-development-environment-catalog.md:176-184 (checklist mínimo de prontidão)

### Método PIV e comandos operacionais
- Docs/.github/copilot-instructions.md:19-31 (AI-first + PIV Loop)
- Docs/.github/copilot-instructions.md:38 (comandos `/plan`, `/implement`, `/validate`)
- resident-health-workshop-resources/README.md:58-60 (resumo dos comandos)
- resident-health-workshop-resources/.claude/commands/plan.md:14,20,41,64,80,194 (planejamento estruturado)
- resident-health-workshop-resources/.claude/commands/implement.md:16,20,41,58,102,132,151 (execução com validação contínua)
- resident-health-workshop-resources/.claude/commands/validate.md:11,13,28,78 (checks e tratamento de falhas)

### Suplemento conceitual
- resident-health-workshop-resources/ai-context/Excal-3-PIVLoop.md:1-6,53-69 (modelo mental Plan/Implement/Validate/Iterate)
