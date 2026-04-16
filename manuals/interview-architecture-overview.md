---
title: Feature Flag Manager — Architecture Overview
scope: interview
repos:
  - nextjs-feature-flag-exercise
updatedAt: 2026-04-15
---

# Feature Flag Manager — Architecture Overview

## 1) Objetivo e contexto

Este documento descreve a **arquitetura completa** do Feature Flag Manager — um dashboard full-stack para gerenciar feature flags com filtragem server-side. Foi construído como exercício prático para demonstrar domínio de arquitetura em camadas, validação de dados, e comunicação tipada entre frontend e backend.

**Stack tecnológica:**

| Camada | Tecnologia | Versão / Modo |
|---|---|---|
| Runtime | Node.js | ESM (`import`/`export`, sem `require()`) |
| Framework HTTP | Express.js | v5 |
| Banco de dados | SQL.js | SQLite compilado para WASM, in-memory + persistência em arquivo |
| Validação | Zod | Schema-first, validação na fronteira |
| Testes | Vitest | Isolamento com DB in-memory por teste |
| Frontend | React | v19 |
| Build | Vite | Dev server na porta 3000 |
| Estado assíncrono | TanStack Query | v5 (`useQuery` + `useMutation`) |
| Estilização | Tailwind CSS | v4, com `cn()` para composição |
| Componentes | Radix UI | Headless, acessíveis |
| Contrato compartilhado | TypeScript (strict) | `shared/types.ts` — single source of truth |

---

## 2) Fluxo de dados — ponta a ponta

```
shared/types.ts                          ← Contrato único (FeatureFlag, FlagFilterParams, etc.)
    │
    ├──► server/src/middleware/validation.ts   ← Zod schemas, validação na fronteira
    │         │
    │         ▼
    ├──► server/src/services/flags.ts          ← Lógica de negócio, queries SQL.js
    │         │
    │         ▼
    ├──► server/src/routes/flags.ts            ← Handlers Express, usa next(error)
    │         │
    │         ▼
    ├──► client/src/api/flags.ts               ← Fetch wrappers tipados
    │         │
    │         ▼
    └──► client/src/App.tsx                    ← TanStack Query + useState → UI
              │
              ▼
         client/src/components/                ← Componentes React (table, filters, modals)
```

**Regra fundamental:** qualquer novo campo de domínio começa em `shared/types.ts` e propaga para baixo neste fluxo.

---

## 3) Estrutura de diretórios

```
nextjs-feature-flag-exercise/
├── shared/
│   └── types.ts                    # Contratos TypeScript (FeatureFlag, CreateFlagInput, etc.)
│
├── server/                         # Backend Express (porta 3001)
│   ├── src/
│   │   ├── index.ts                # Entry point — monta middleware, rotas, error handler
│   │   ├── db/
│   │   │   ├── client.ts           # getDb(), saveDb(), closeDb(), _resetDbForTesting()
│   │   │   ├── schema.ts           # CREATE TABLE flags (DDL)
│   │   │   └── seed.ts             # 20 flags realistas para desenvolvimento
│   │   ├── middleware/
│   │   │   ├── validation.ts       # Zod schemas (create, update, filtros)
│   │   │   └── error.ts            # AppError, NotFoundError, ConflictError, ValidationError
│   │   ├── services/
│   │   │   └── flags.ts            # Business logic: getAllFlags, createFlag, updateFlag, etc.
│   │   ├── routes/
│   │   │   └── flags.ts            # Express Router: GET/POST/PUT/DELETE /api/flags
│   │   └── __tests__/
│   │       └── flags.test.ts       # 24 testes Vitest (CRUD + filtragem)
│   └── flags.db                    # SQLite persistido (gerado automaticamente)
│
├── client/                         # Frontend React (porta 3000)
│   ├── src/
│   │   ├── main.tsx                # Entry React
│   │   ├── App.tsx                 # Orquestrador: query, mutations, filter state
│   │   ├── api/
│   │   │   └── flags.ts            # getFlags(), createFlag(), updateFlag(), deleteFlag()
│   │   ├── components/
│   │   │   ├── flags-table.tsx         # Tabela de flags com badges coloridos
│   │   │   ├── flags-filter-controls.tsx # Filtros com debounce (300ms)
│   │   │   ├── flag-form-modal.tsx     # Modal de criação/edição
│   │   │   ├── delete-confirm-dialog.tsx # Confirmação de exclusão
│   │   │   └── ui/                     # Radix UI primitives (Button, Select, etc.)
│   │   └── lib/
│   │       └── utils.ts               # Função cn() para class merging
│   └── vite.config.ts             # Aliases: @shared/*, @/*
```

---

## 4) Tipos compartilhados (`shared/types.ts`)

Este arquivo é o **contrato único** entre backend e frontend. Ambos importam dele via path alias `@shared/types`.

### `FeatureFlag` — entidade principal

```typescript
interface FeatureFlag {
  readonly id: string              // UUID v4, gerado no server
  name: string                     // Único, lowercase com hyphens (regex: /^[a-z0-9-]+$/)
  description: string
  enabled: boolean                 // No SQLite: INTEGER 0/1
  environment: Environment         // 'development' | 'staging' | 'production'
  type: FlagType                   // 'release' | 'experiment' | 'operational' | 'permission'
  rolloutPercentage: number        // 0–100
  owner: string                    // Time responsável
  tags: string[]                   // No SQLite: JSON string → TEXT column
  readonly createdAt: string       // ISO 8601
  updatedAt: string                // ISO 8601
  expiresAt: string | null
  lastEvaluatedAt: string | null
}
```

### `FlagFilterParams` — contrato de filtragem

```typescript
interface FlagFilterParams {
  environment?: Environment        // Filtro exato
  status?: 'enabled' | 'disabled'  // Mapeia para enabled = 1/0 no SQL
  type?: FlagType                  // Filtro exato
  owner?: string                   // Filtro exato
  name?: string                    // LIKE parcial, case-insensitive
}
```

**Todos os campos são opcionais.** Se nenhum filtro for fornecido, retorna todas as flags.

### Decisão de design: AND logic

Múltiplos filtros aplicados simultaneamente usam **lógica AND** — todas as condições precisam ser verdadeiras. Exemplo: `environment=production & status=enabled & type=release` retorna **apenas** flags que são de production **E** estão habilitadas **E** são do tipo release.

---

## 5) API REST

| Método | Endpoint | Body/Query | Resposta |
|---|---|---|---|
| `GET` | `/api/flags` | Query params opcionais: `environment`, `status`, `type`, `owner`, `name` | `FeatureFlag[]` |
| `GET` | `/api/flags/:id` | — | `FeatureFlag` |
| `POST` | `/api/flags` | `CreateFlagInput` (JSON body) | `FeatureFlag` (201) |
| `PUT` | `/api/flags/:id` | `UpdateFlagInput` (JSON body, partial) | `FeatureFlag` |
| `DELETE` | `/api/flags/:id` | — | `{ success: true }` |
| `GET` | `/health` | — | `{ status: 'ok' }` |

### Formato de erro

```json
{
  "error": "NOT_FOUND",
  "message": "Flag with id 'abc' not found",
  "statusCode": 404
}
```

Os erros são mapeados automaticamente pelo `errorHandler` middleware:

| Classe | Status | Código |
|---|---|---|
| `ValidationError` (ou `ZodError`) | 400 | `VALIDATION_ERROR` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| Qualquer outro `Error` | 500 | `INTERNAL_SERVER_ERROR` |

---

## 6) SQL.js — restrições e padrões críticos

SQL.js é SQLite compilado para WebAssembly. Roda in-memory com persistência manual em arquivo.

### Restrições que afetam o código

| Restrição | Como é tratada |
|---|---|
| **Booleans não existem em SQLite** | `enabled` é `INTEGER` (0/1). Conversão: `enabled ? 1 : 0` na escrita, `enabled === 1` na leitura |
| **Arrays não existem em SQLite** | `tags` é `TEXT` com `JSON.stringify(array)` na escrita e `JSON.parse()` na leitura |
| **Statements precisam ser liberados** | Todo `db.prepare()` precisa de `stmt.free()` em bloco `try/finally` |
| **`db.exec()` não aceita params** | Usado apenas para DDL. Para queries parametrizadas: `db.prepare()` + `stmt.bind()` |
| **Persistência manual** | `saveDb()` exporta o banco para arquivo após cada escrita |

### Padrão `try/finally` obrigatório

```typescript
const stmt = db.prepare(sql)
try {
  stmt.bind(params)
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as DbRow)
  }
  return rows.map(rowToFlag)
} finally {
  stmt.free()  // SEMPRE liberar, mesmo em caso de exceção
}
```

### Inicialização do banco

1. `getDb()` verifica se já existe instância em memória
2. Se `flags.db` existe no disco → carrega com `new SQL.Database(fileBuffer)`
3. Se não existe → cria banco vazio → `createTables(db)` → `seedFlags(db)` → `saveDb()`
4. Se tabela existe mas está vazia → `seedFlags(db)` → `saveDb()`

**Race condition prevention:** usa `initPromise` para evitar inicializações paralelas.

---

## 7) Esquema SQL

```sql
CREATE TABLE IF NOT EXISTS flags (
  id TEXT PRIMARY KEY,                       -- UUID v4
  name TEXT NOT NULL UNIQUE,                 -- Index implícito pelo UNIQUE
  description TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,        -- 0 = disabled, 1 = enabled
  environment TEXT NOT NULL,                 -- 'development' | 'staging' | 'production'
  type TEXT NOT NULL,                        -- 'release' | 'experiment' | 'operational' | 'permission'
  rollout_percentage INTEGER NOT NULL DEFAULT 100,
  owner TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',           -- JSON array serializado
  created_at TEXT NOT NULL,                  -- ISO 8601
  updated_at TEXT NOT NULL,                  -- ISO 8601
  expires_at TEXT,                           -- ISO 8601 ou NULL
  last_evaluated_at TEXT                     -- ISO 8601 ou NULL
)
```

**Convenção de nomes:** colunas usam `snake_case` no SQL, propriedades usam `camelCase` no TypeScript. A conversão acontece na função `rowToFlag()`.

---

## 8) Decisões de segurança

| Preocupação | Mitigação | Onde |
|---|---|---|
| SQL Injection | Queries parametrizadas via `stmt.bind()` — nunca concatenação de strings | `services/flags.ts` |
| LIKE pattern injection | Wildcards `%`, `_`, `\` são escapados antes do LIKE | `services/flags.ts:L97` |
| Input validation | Toda entrada do usuário passa por Zod antes de chegar ao service | `middleware/validation.ts` |
| Error information leakage | Erros internos retornam mensagem genérica (500) | `middleware/error.ts` |
| CORS | Habilitado via `cors()` middleware | `index.ts` |

---

## 9) Estratégia de testes

- **Runner:** Vitest
- **Total:** 24 testes
- **Isolamento:** cada teste cria um banco in-memory via `_resetDbForTesting()`

### Estrutura dos testes

```
describe('Flag Service')
  ├── describe('getAllFlags')       → empty array, returns all
  ├── describe('createFlag')        → correct data, UUID, timestamps, duplicate rejection
  ├── describe('getFlagById')       → found, not found
  ├── describe('getFlagByName')     → found, not found
  ├── describe('updateFlag')        → partial update, timestamp, not found, name conflict
  ├── describe('deleteFlag')        → removes, not found
  └── describe('filtering')         → by environment, status (enabled + disabled), type,
                                       owner, name (partial/case-insensitive), AND logic,
                                       no filters returns all
```

### Padrão do teste

```typescript
beforeEach(async () => {
  const SQL = await initSqlJs()
  db = new SQL.Database()
  createTables(db)
  _resetDbForTesting(db)       // Injeta DB de teste no singleton
})

afterEach(() => {
  _resetDbForTesting(null)     // Limpa singleton
  db.close()
})
```

---

## 10) Diagrama de componentes React

```
<QueryClientProvider>        ← TanStack Query provider
  └── <FlagsApp>             ← Estado central: filters, selectedFlag, modals
        ├── <FlagsFilterControls>   ← Selects + inputs com debounce 300ms
        ├── <FlagsTable>            ← Tabela com badges, ações edit/delete
        ├── <FlagFormModal>         ← Modal create/edit (Dialog Radix)
        └── <DeleteConfirmDialog>   ← Confirmação de exclusão (AlertDialog Radix)
```

### Estado central em `App.tsx`

```typescript
const [filters, setFilters] = useState<FlagFilterParams>({})

const { data: flags } = useQuery({
  queryKey: ['flags', filters],    // filters no queryKey = re-fetch automático
  queryFn: () => getFlags(filters),
})
```

**Ponto-chave para entrevista:** `filters` é parte do `queryKey`. Quando o usuário muda qualquer filtro, o TanStack Query automaticamente faz re-fetch. Não precisa de `useEffect` extra.

### Persistência de filtros

Quando o usuário cria, edita ou deleta uma flag, o mutation chama `invalidateQueries({ queryKey: ['flags'] })`. Como `filters` está no `queryKey`, a invalidation dispara um novo fetch **com os filtros atuais ainda aplicados**. Os filtros nunca são resetados por operações CRUD.

---

## 11) Seed data — 20 flags realistas

As flags são distribuídas para testar todas as combinações de filtro:

| Environment | Count | Types |
|---|---|---|
| production | 7 | 3 release, 2 experiment, 2 operational |
| staging | 7 | 3 release, 2 permission, 2 experiment |
| development | 6 | 2 release, 1 experiment, 2 operational, 1 permission |

Owners incluem: `team-frontend`, `team-payments`, `team-mobile`, `team-growth`, `team-platform`, `team-ml`, `team-auth`, `team-internal`, `team-product`, `team-search`, `team-backend`.

---

## 12) Comandos de validação

```bash
# Backend (de server/)
pnpm run build    # tsc — type check
pnpm run lint     # ESLint
pnpm test         # Vitest — 24 testes

# Frontend (de client/)
pnpm run build    # tsc + vite build
pnpm run lint     # ESLint

# Combinado (copy-paste ready)
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
```

---

## 13) Glossário rápido

| Termo | Significado no projeto |
|---|---|
| **Flag** | Feature flag — toggle que habilita/desabilita uma funcionalidade |
| **Environment** | Ambiente de deploy: development, staging, production |
| **Rollout percentage** | Percentual de usuários que veem a feature (0–100) |
| **Status** | enabled (on) ou disabled (off) — mapeado para `enabled: boolean` |
| **Type** | Categoria da flag: release (entrega), experiment (A/B test), operational (infra), permission (acesso) |
| **Owner** | Time responsável pela flag |
| **Tags** | Labels livres para categorização (armazenadas como JSON string) |
| **AND logic** | Filtros simultâneos são combinados com AND (todos precisam ser verdadeiros) |
