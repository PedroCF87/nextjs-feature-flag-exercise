# Controle de custos

> Saldo antes de executar o Gold Standard Plan: USD ?

| Phase | Round | Descrição | Custo (USD) | Custo (R$) | Saldo |
|-------|-------|-----------|-------------|------------|-------|
| Phase 1 | 1 | Audit `CLAUDE.md` | — | — | USD 32,12 |
| Phase 2 | 2 | Audit `/prime` Command | 0,40 | 1,99 | 32,52 |
| Phase 2 | 3 | Audit `/plan` Command | 0,28 | 1,40 | 32,80 |
| Phase 2 | 4 | Audit `/implement` Command | 0,16 | 0,80 | 32,96 |
| Phase 2 | 5 | Audit `/commit` Command | 0,55 | 2,74 | 33,51 |
| Phase 3 | 6 | Audit `/validate` Command | 0,19 | 0,95 | 33,70 |
| Phase 3 | 7 | Audit `/review-pr` Command | 0,08 | 0,40 | 33,78 |
| Phase 3 | 8 | Create `/create-pr` Command | 0,40 | 2,00 | 34,18 |
| Phase 3 | 9 | Audit `/rca` Command (Root Cause Analysis) | 0,30 | 1,50 | 34,48 |
| Phase 3 | 10 | Audit `/security-review` Command | 0,32 | 1,60 | 34,80 |
| Phase 3 | 11 | Audit `/create-rules` Command | 0,22 | 1,10 | 35,02 |
| Phase 3 | 12 | Audit `/create-command` Command | 0,49 | 2,45 | 35,51 |
| Phase 3 | 13 | Audit `/prd-interactive` Command | 0,36 | 1,80 | 35,87 |
| Phase 3 | 14 | Audit `/create-stories` Command | 0,38 | 1,90 | 36,25 |
| Phase 3 | 15 | Audit `/check-ignores` Command | 0,39 | 1,95 | 36,64 |
| Phase 4 | 16 | Audit `code-reviewer` Agent | 0,46 | 2,30 | 37,10 |
| Phase 4 | 17 | Audit `code-simplifier` Agent | 0,70 | 3,49 | 37,80 |
| Phase 4 | 18 | Audit `silent-failure-hunter` Agent | 0,59 | 2,94 | 38,39 |
| Phase 4 | 19 | Audit `type-design-analyzer` Agent | 0,62 | 3,09 | 39,01 |
| Phase 4 | 20 | Audit `pr-test-analyzer` Agent | 0,52 | 2,59 | 39,53 |
| Phase 4 | 21 | Audit `comment-analyzer` Agent | 0,12 | 0,60 | 39,65 |
| Phase 5 | 22 | Audit `agent-browser` Skill | 0,61 | 3,04 | 40,26 |
| Phase 6 | 23 | On-Demand Context Gap | 2,72 | 13,57 | 42,98 |
| Phase 6 | 24 | Command Chaining Audit (PIV Loop) | 2,94 | 14,67 | 48,79 |
| **TOTAL** | | | **16,67** | **83,17** | |