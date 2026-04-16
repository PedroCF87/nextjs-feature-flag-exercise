---
title: Workshop RDH — Visão Macro dos 4 Exercícios
scope: interview
repos:
  - resident-health-workshop-resources
  - nextjs-feature-flag-exercise
  - nextjs-ai-optimized-codebase
updatedAt: 2026-04-08
---

## Objetivo e contexto

Este manual resume, em nível macro, os **4 exercícios práticos** do workshop RDH e o que você precisa entregar em cada um.

Ponto-chave: os exercícios são uma **progressão metodológica**. Não são 4 tarefas independentes do mesmo tipo.

---

## Pré-requisitos

1. Ter um repositório próprio (idealmente fork) para testar integração com App/Actions/secrets.
2. Clonar o repositório do exercício e usar a base correta (`exercise-1`).
3. Ter ambiente local funcional para server/client do exercício.

---

## Visão macro dos 4 exercícios

## Exercício 1 — Baseline

### O que é
Executar a task brownfield com seu processo atual (sem “forçar” o método RDH completo).

### Macro tarefas
1. Ler a task e critérios de aceite.
2. Analisar o codebase brownfield existente (arquitetura, padrões, comandos, testes, pontos de integração e riscos).
3. Configurar a base do ambiente de IA no repositório (global rules do Copilot, instructions, agents e skills) seguindo o catálogo em `Docs/ai-development-environment-catalog.md`.
4. Implementar com seu fluxo normal de IA.
5. Medir esforço (tempo, quantidade de prompts, retrabalho, confiança).
6. Registrar os principais pontos de fricção.

### Entregável
- Implementação funcional da task + notas de baseline (o que foi fácil/difícil).

### Critério de sucesso
- Você consegue descrever claramente seu estado inicial de produtividade com IA.

---

## Exercício 2 — PIV Loop (mesma task)

### O que é
Repetir a mesma task aplicando disciplina explícita de **Plan → Implement → Validate**.

### Macro tarefas
1. Planejar antes de codar (arquivos-alvo, ordem, validação).
2. Implementar incrementalmente por etapas pequenas.
3. Validar após cada etapa e corrigir antes de avançar.
4. Comparar resultado com o baseline.

### Entregável
- Implementação da mesma task com evidência de execução via PIV Loop.

### Critério de sucesso
- Queda de retrabalho e maior previsibilidade do fluxo.

---

## Exercício 3 — Build a Skill

### O que é
Criar uma skill reutilizável para automatizar um workflow recorrente do seu dia a dia.

### Macro tarefas
1. Escolher rotina repetitiva (ex.: decomposição de histórias, checklist de review, issue batch).
2. Definir gatilho de uso e saída esperada da skill.
3. Escrever `SKILL.md` com processo, restrições e checklist de qualidade.
4. Testar em caso real e ajustar.

### Entregável
- Skill funcional e reaproveitável no seu AI Layer.

### Critério de sucesso
- Você consegue executar a rotina com menor custo cognitivo e maior consistência.

---

## Exercício 4 — AI-Optimized

### O que é
Trabalhar em um codebase otimizado para agentes (Gold Standard) e aplicar os padrões esperados.

### Macro tarefas
1. Entender padrões estruturais (VSA) e boundaries.
2. Implementar/estender funcionalidade respeitando o padrão do repositório.
3. Validar com o workflow de qualidade do Gold Standard.
4. Comparar experiência com o exercício brownfield.

### Entregável
- Mudança implementada no padrão AI-optimized + validações aprovadas.

### Critério de sucesso
- Você demonstra fluidez em ambiente preparado para agentes (menos ambiguidade, maior velocidade com qualidade).

---

## Sequência recomendada (execução)

1. Baseline (medir estado inicial)
2. PIV Loop (medir ganho de método)
3. Build a Skill (ganho de reuso)
4. AI-Optimized (ganho de arquitetura preparada para IA)

---

## Checklist de validação (macro)

- [ ] Consegui executar os 4 exercícios na ordem.
- [ ] Tenho comparação concreta entre Baseline vs PIV Loop.
- [ ] Criei ao menos 1 skill reutilizável e validada.
- [ ] Apliquei padrões do Gold Standard em um caso real.
- [ ] Consigo explicar verbalmente a evolução do meu sistema de trabalho.

---

## Erros comuns e prevenção

1. **Tratar `TASK.md` como único exercício**
   - Prevenção: lembrar que `TASK.md` é a task prática, enquanto os 4 exercícios são o método de execução.

2. **Pular Baseline**
   - Prevenção: registrar métricas iniciais; sem baseline não há comparação.

3. **Confundir Skill com prompt solto**
   - Prevenção: formalizar skill com processo e output padronizado.

4. **Aplicar padrões Gold Standard no exercício fora de escopo**
   - Prevenção: separar o que é obrigatório no exercício do que é evolução arquitetural.

---

## Referências

- `resident-health-workshop-resources/README.md:20-25` (lista dos 4 exercícios)
- `resident-health-workshop-resources/README.md:159-161` (exercícios usam repositório separado)
- `nextjs-feature-flag-exercise/TASK.md:1` (task principal)
- `nextjs-feature-flag-exercise/TASK.md:15-27` (aceite da task)
- `nextjs-feature-flag-exercise/AGENTS.md:11` (branch base `exercise-1`)
- `nextjs-feature-flag-exercise/AGENTS.md:154-160` (validação)
- `nextjs-ai-optimized-codebase/CODEBASE-GUIDE.md:163-180` (VSA)
- `nextjs-ai-optimized-codebase/CLAUDE.md:18-26` (self-correction workflow)
