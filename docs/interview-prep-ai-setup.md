# Interview Prep — AI Setup Catalog

Catálogo consolidado de agentes, instruções e skills voltados para **análise, compreensão e documentação** da metodologia RDH — não para implementação direta de código.

---

## Necessidades reais mapeadas

| # | Necessidade | Abordagem |
|---|---|---|
| 1 | Entender profundamente os fluxos RDH (PIV Loop, Commands, Skills) | `rdh-workflow-analyst` |
| 2 | Identificar o que falta no `nextjs-feature-flag-exercise` para se aproximar do Gold Standard | `codebase-gap-analyst` |
| 3 | Produzir guias acionáveis para estudo e entrevista | `technical-manual-writer` |
| 4 | Evoluir o sistema após falhas recorrentes | `system-evolution-retro` (skill) |

---

## Agents (`Docs/.github/agents/`)

### ✅ 1. `rdh-workflow-analyst.agent.md`

**Propósito:** Explicar a metodologia RDH em profundidade (fases, rationale, dependências entre comandos e implicações práticas).

**Fontes-chave:**
- `.claude/commands/*.md`
- `.claude/skills/*/SKILL.md`
- `.claude/CLAUDE-template.md`
- `.mcp.json`
- `resident-health-workshop-resources/ai-context/Excal-*.md`
- `nextjs-ai-optimized-codebase/CODEBASE-GUIDE.md`
- `nextjs-ai-optimized-codebase/CLAUDE.md`

**Tools:** `read`, `search`  
**Companion skill:** `analyze-rdh-workflow`

---

### ✅ 2. `codebase-gap-analyst.agent.md`

**Propósito:** Comparar Exercise vs Gold Standard e produzir mapa de lacunas + roadmap priorizado.

**Entregáveis:**
- Gap map por dimensões (arquitetura, tooling, patterns, dados, AI-readiness, testes)
- Tabela `Gold Standard | Estado Atual | O que mudar`
- Priorização (Tier 1/2/3)
- Arquivos-template de referência no Gold Standard

**Tools:** `read`, `search`  
**Companion skill:** `gap-analysis`

---

### ✅ 3. `technical-manual-writer.agent.md`

**Propósito:** Gerar manuais técnicos para humanos (comando, feature, transformação e entrevista).

**Estrutura dos manuais:**
1. Objetivo e contexto
2. Pré-requisitos
3. Passo a passo
4. Checklist de validação
5. Erros comuns
6. Referências `file:line`

**Tools:** `read`, `search`, `edit`  
**Companion skill:** `write-technical-manual`

---

## Instructions (`Docs/.github/instructions/`)

### ✅ 1. `workshop-resources.instructions.md`
**`applyTo:`** `../resident-health-workshop-resources/**`

- Comandos são workflows multi-fase com entrada/saída explícitas
- Skills são sub-rotinas (não entry point de usuário)
- `CLAUDE-template.md` define scaffold canônico
- `ai-context/Excal-*.md` é referência oficial de modelos mentais do workshop

### ✅ 2. `gold-standard.instructions.md`
**`applyTo:`** `../nextjs-ai-optimized-codebase/**`

- Repositório referência (VSA + AI-first)
- VSA por feature: `models.ts`, `schemas.ts`, `repository.ts`, `service.ts`, `errors.ts`, `index.ts`, `tests/`
- `src/core/` apenas infraestrutura compartilhada
- `src/proxy.ts` substitui `middleware.ts` no Next.js 16
- Tooling padrão: Bun, Biome, Drizzle, Supabase, Pino, Zod v4

### ✅ 3. `feature-flag-exercise.instructions.md`
**`applyTo:`** `../nextjs-feature-flag-exercise/**`

- Repositório-alvo de transformação
- Arquitetura atual: layered (`routes → services → db`)
- `shared/types.ts` como contrato central atual
- `TASK.md` como desafio principal da entrevista
- Aplicar PIV Loop explicitamente

---

## Skills (`Docs/.github/skills/`)

### ✅ 1. `analyze-rdh-workflow/SKILL.md`
Análise sistemática de comandos/skills RDH com tabela de fases, decisões de design e exemplo prático.

### ✅ 2. `gap-analysis/SKILL.md`
Comparação estruturada de dois codebases em 6 dimensões, com saída `Gold Standard | Estado Atual | O que mudar`.

### ✅ 3. `write-technical-manual/SKILL.md`
Geração de manuais técnicos orientados por evidência de repositório e referências `file:line`.

### ✅ 4. `system-evolution-retro/SKILL.md`
Transformar falhas recorrentes em melhorias no sistema (regras, comandos, contexto e templates).

---

## Mapa de Cobertura

| Necessidade | Agent | Instructions | Skill |
|---|---|---|---|
| Entender fluxos RDH em profundidade | `rdh-workflow-analyst` | `workshop-resources` | `analyze-rdh-workflow` |
| Saber o que mudar no Exercise | `codebase-gap-analyst` | `gold-standard` + `feature-flag-exercise` | `gap-analysis` |
| Criar manuais técnicos | `technical-manual-writer` | `gold-standard` | `write-technical-manual` |
| Evoluir o sistema após falhas | `rdh-workflow-analyst` | `workshop-resources` | `system-evolution-retro` |

---

## Ordem de Criação Recomendada

```text
1) Instructions
   - workshop-resources.instructions.md
   - gold-standard.instructions.md
   - feature-flag-exercise.instructions.md

2) Skills
   - analyze-rdh-workflow/SKILL.md
   - gap-analysis/SKILL.md
   - write-technical-manual/SKILL.md
   - system-evolution-retro/SKILL.md

3) Agents
   - rdh-workflow-analyst.agent.md
   - codebase-gap-analyst.agent.md
   - technical-manual-writer.agent.md
```

---

## Status

| Artefato | Tipo | Status |
|---|---|---|
| `workshop-resources.instructions.md` | Instruction | ✅ Criado |
| `gold-standard.instructions.md` | Instruction | ✅ Criado |
| `feature-flag-exercise.instructions.md` | Instruction | ✅ Criado |
| `analyze-rdh-workflow/SKILL.md` | Skill | ✅ Criado |
| `gap-analysis/SKILL.md` | Skill | ✅ Criado |
| `write-technical-manual/SKILL.md` | Skill | ✅ Criado |
| `system-evolution-retro/SKILL.md` | Skill | ✅ Criado |
| `rdh-workflow-analyst.agent.md` | Agent | ✅ Criado |
| `codebase-gap-analyst.agent.md` | Agent | ✅ Criado |
| `technical-manual-writer.agent.md` | Agent | ✅ Criado |
