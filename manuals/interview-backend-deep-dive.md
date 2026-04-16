---
title: Feature Flag Manager — Backend Deep Dive
scope: interview
repos:
  - nextjs-feature-flag-exercise
updatedAt: 2026-04-15
---

# Feature Flag Manager — Backend Deep Dive

## 1) Visão geral

O backend é uma API REST construída com **Express v5** rodando em **Node.js (ESM)**. Usa **SQL.js** (SQLite compilado para WASM) como banco de dados e **Zod** para validação de schemas. Arquitetura em camadas: Routes → Services → Database.

**Referências de arquivos:**
- Entry point: `server/src/index.ts`
- Rotas: `server/src/routes/flags.ts`
- Serviço: `server/src/services/flags.ts`
- Validação: `server/src/middleware/validation.ts`
- Erros: `server/src/middleware/error.ts`
- DB client: `server/src/db/client.ts`
- Schema DDL: `server/src/db/schema.ts`
- Seed data: `server/src/db/seed.ts`
- Testes: `server/src/__tests__/flags.test.ts`

---

## 2) Inicialização do servidor (`index.ts`)

```typescript
import express from 'express'
import cors from 'cors'
import { flagsRouter } from './routes/flags.js'
import { errorHandler } from './middleware/error.js'
import { getDb } from './db/client.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => { res.json({ status: 'ok' }) })
app.use('/api/flags', flagsRouter)

app.use(errorHandler)   // ← Middleware de erro deve ser o ÚLTIMO

async function start() {
  await getDb()          // ← Inicializa banco (cria tabelas, seed se necessário)
  app.listen(port, () => { console.log(`Server running on port ${port}`) })
}

start().catch(console.error)
```

**Pontos importantes:**
- `cors()` sem configuração = aceita qualquer origin (adequado para dev, não para produção)
- `express.json()` faz o parse automático de JSON bodies
- `getDb()` no `start()` garante que o banco está pronto antes de aceitar requests
- O `errorHandler` **precisa** ser registrado depois de todas as rotas

---

## 3) Camada de banco de dados

### 3.1) DB Client (`db/client.ts`)

O client gerencia o ciclo de vida do SQL.js:

```
getDb() → initializeDatabase() → DB_PATH existe?
                                     ├── SIM → carrega do arquivo
                                     └── NÃO → cria novo → createTables → seedFlags → saveDb
                                 
                                 → isSeeded(db)?
                                     ├── SIM → retorna db
                                     └── NÃO → seedFlags → saveDb
```

**Padrão singleton:** `db` é uma variável de módulo. `getDb()` retorna a mesma instância em todos os requests. `initPromise` previne race condition durante inicialização paralela.

**Persistência:**
- `DB_PATH = path.join(process.cwd(), 'flags.db')` → arquivo `server/flags.db`
- `saveDb()` exporta todo o banco para disco com `db.export()` + `fs.writeFileSync()`
- Chamado após cada operação de escrita (create, update, delete)

**Testing hook:**
```typescript
export function _resetDbForTesting(testDb: Database | null = null): void {
  if (db && db !== testDb) db.close()
  db = testDb
  initPromise = testDb ? Promise.resolve(testDb) : null
}
```
Permite injetar um banco in-memory limpo em cada teste, garantindo isolamento total.

### 3.2) Schema (`db/schema.ts`)

Uma única tabela `flags` com 13 colunas. Usa `db.run()` para DDL (sem parâmetros):

```sql
CREATE TABLE IF NOT EXISTS flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,     -- BOOLEAN como INTEGER
  environment TEXT NOT NULL,
  type TEXT NOT NULL,
  rollout_percentage INTEGER NOT NULL DEFAULT 100,
  owner TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',         -- ARRAY como JSON string
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT,
  last_evaluated_at TEXT
)
```

### 3.3) Conversão de nomes (snake_case ↔ camelCase)

A interface `DbRow` usa `snake_case` (como no SQL):
```typescript
interface DbRow {
  id: string; name: string; description: string;
  enabled: number;            // number, não boolean
  environment: string;
  type: string;
  rollout_percentage: number; // snake_case
  owner: string;
  tags: string;               // string, não string[]
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  last_evaluated_at: string | null;
}
```

A função `rowToFlag()` converte para `FeatureFlag` (camelCase):
- `row.enabled === 1` → `boolean`
- `JSON.parse(row.tags)` → `string[]` (com validação de que é array)
- `row.rollout_percentage` → `rolloutPercentage`
- `row.created_at` → `createdAt`
- Valida `environment` e `type` com type guards (`isEnvironment`, `isFlagType`)

### 3.4) Seed (`db/seed.ts`)

20 flags pré-definidas com distribuição realista:
- 7 production, 7 staging, 6 development
- Vários types, owners e tags
- Timestamps aleatórios: `created_at` (últimos 90 dias), `expires_at` (30% com data futura), `last_evaluated_at` (50% recente, 20% stale, 30% null)

Usa `isSeeded()` para verificar se já tem dados:
```typescript
export function isSeeded(db: Database): boolean {
  const result = db.exec('SELECT COUNT(*) as count FROM flags')
  return result.length > 0 && (result[0].values[0][0] as number) > 0
}
```

---

## 4) Camada de validação (`middleware/validation.ts`)

### 4.1) Schema de criação

```typescript
export const createFlagSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1, 'Description is required'),
  enabled: z.boolean(),
  environment: z.enum(['development', 'staging', 'production']),
  type: z.enum(['release', 'experiment', 'operational', 'permission']),
  rolloutPercentage: z.number().min(0).max(100),
  owner: z.string().min(1, 'Owner is required'),
  tags: z.array(z.string()),
  expiresAt: z.string().datetime().nullable().optional(),
})
```

### 4.2) Schema de atualização

```typescript
export const updateFlagSchema = createFlagSchema.partial()
// Todos os campos opcionais — permite update de 1 a N campos
```

### 4.3) Schema de filtros (query string)

```typescript
export const flagFilterQuerySchema = z.object({
  environment: z.enum(['development', 'staging', 'production']).optional(),
  status: z.enum(['enabled', 'disabled']).optional(),
  type: z.enum(['release', 'experiment', 'operational', 'permission']).optional(),
  owner: z.string().optional(),
  name: z.string().optional(),
})
```

### 4.4) Middleware de filtro

```typescript
export function validateFlagFilters(req: Request, res: Response, next: NextFunction): void {
  try {
    res.locals.filters = flagFilterQuerySchema.parse(req.query)
    next()
  } catch (error) {
    next(error)  // ZodError será tratado pelo errorHandler
  }
}
```

**Ponto-chave:** `req.query` vem como `Record<string, string>`, mas Zod valida os valores contra os enums. Se alguém mandar `?environment=invalid`, retorna 400 com `VALIDATION_ERROR`.

---

## 5) Camada de serviço (`services/flags.ts`)

### 5.1) `getAllFlags(filters)` — a query com filtros dinâmicos

Esta é a função mais complexa e mais relevante para entrevista:

```typescript
export async function getAllFlags(filters: FlagFilterParams = {}): Promise<FeatureFlag[]> {
  const db = await getDb()
  
  const conditions: string[] = []
  const params: (string | number)[] = []

  // Cada filtro adiciona uma condição e um parâmetro
  if (filters.environment !== undefined) {
    conditions.push('environment = ?')
    params.push(filters.environment)
  }
  if (filters.status !== undefined) {
    conditions.push('enabled = ?')
    params.push(filters.status === 'enabled' ? 1 : 0)  // ← Conversão boolean→integer
  }
  if (filters.type !== undefined) {
    conditions.push('type = ?')
    params.push(filters.type)
  }
  if (filters.owner !== undefined) {
    conditions.push('owner = ?')
    params.push(filters.owner)
  }
  if (filters.name !== undefined) {
    conditions.push("LOWER(name) LIKE ? ESCAPE '\\'")
    const escaped = filters.name.toLowerCase().replace(/[\\%_]/g, '\\$&')
    params.push('%' + escaped + '%')  // ← Partial match
  }

  const whereClause = conditions.length > 0 
    ? ' WHERE ' + conditions.join(' AND ')  // ← AND logic
    : ''
  const sql = `SELECT * FROM flags${whereClause} ORDER BY created_at DESC`

  const stmt = db.prepare(sql)
  try {
    if (params.length > 0) stmt.bind(params)
    const rows: DbRow[] = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as unknown as DbRow)
    }
    return rows.map(rowToFlag)
  } finally {
    stmt.free()  // ← SEMPRE libera o statement
  }
}
```

**Análise detalhada:**

1. **Construção dinâmica segura:** as condições são strings hardcoded (`'environment = ?'`), não concatenadas do input do usuário. Os valores vão via `bind()` parametrizado. Isso previne SQL injection.

2. **Conversão de status:** `'enabled'` → `1`, `'disabled'` → `0`, porque SQLite não tem tipo boolean.

3. **LIKE seguro:** wildcards do SQLite (`%`, `_`) são escapados no input do usuário:
   ```typescript
   const escaped = filters.name.toLowerCase().replace(/[\\%_]/g, '\\$&')
   ```
   Usa `ESCAPE '\\'` para definir `\` como caractere de escape no LIKE.

4. **AND logic:** `conditions.join(' AND ')` — todos os filtros precisam casar.

5. **Sem filtros:** se nenhum `condition` é adicionado, `whereClause` fica vazio = retorna todas as flags.

### 5.2) `createFlag(input)`

```
1. Verifica duplicata: getFlagByName(input.name)
   → Se existe: throw ConflictError (409)
2. Gera UUID v4
3. Gera timestamps (now)
4. Prepara INSERT com 13 colunas
5. Converte enabled→boolean para INTEGER
6. Converte tags→array para JSON string
7. stmt.run(params) + stmt.free()
8. saveDb() → persiste no arquivo
9. getFlagById(id) → retorna a flag criada
```

### 5.3) `updateFlag(id, input)`

```
1. Verifica existência: getFlagById(id) → 404 se não encontrar
2. Se input.name fornecido → verifica conflito de nome (409)
3. Constrói SET clause dinâmica só com campos fornecidos
4. Converte enabled e tags conforme necessário
5. Atualiza updated_at = now
6. stmt.run(params) + stmt.free()
7. saveDb()
8. Retorna flag atualizada
```

### 5.4) `deleteFlag(id)`

```
1. Verifica existência: getFlagById(id) → 404 se não encontrar
2. DELETE FROM flags WHERE id = ?
3. stmt.run + stmt.free()
4. saveDb()
```

---

## 6) Camada de rotas (`routes/flags.ts`)

```typescript
export const flagsRouter = Router()

// GET /api/flags — com middleware de validação de filtros
flagsRouter.get('/', validateFlagFilters, async (_req, res, next) => {
  try {
    const filters = res.locals.filters as FlagFilterParams
    const flags = await getAllFlags(filters)
    res.json(flags)
  } catch (error) {
    next(error)
  }
})

// GET /api/flags/:id
flagsRouter.get('/:id', async (req, res, next) => {
  try {
    const flag = await getFlagById(req.params.id)
    if (!flag) throw new NotFoundError(`Flag with id '${req.params.id}' not found`)
    res.json(flag)
  } catch (error) { next(error) }
})

// POST /api/flags
flagsRouter.post('/', async (req, res, next) => {
  try {
    const input = createFlagSchema.parse(req.body)  // ← Validação Zod inline
    const flag = await createFlag(input)
    res.status(201).json(flag)
  } catch (error) { next(error) }
})

// PUT /api/flags/:id
flagsRouter.put('/:id', async (req, res, next) => {
  try {
    const input = updateFlagSchema.parse(req.body)
    const flag = await updateFlag(req.params.id, input)
    res.json(flag)
  } catch (error) { next(error) }
})

// DELETE /api/flags/:id
flagsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteFlag(req.params.id)
    res.json({ success: true })
  } catch (error) { next(error) }
})
```

**Padrões observados:**

1. **POST/PUT validam inline** com `createFlagSchema.parse()` / `updateFlagSchema.parse()` — se inválido, `ZodError` cai no `next(error)`.

2. **GET lista usa middleware** (`validateFlagFilters`) que coloca os filtros validados em `res.locals.filters`.

3. **Todos os handlers** usam `try/catch` com `next(error)` — **nunca** respondem diretamente com erros.

4. **GET by ID** faz a verificação `if (!flag)` na rota, não no service — acoplamento consciente.

---

## 7) Tratamento de erros (`middleware/error.ts`)

Hierarquia de classes:

```
Error
  └── AppError (status, error code, message)
        ├── NotFoundError    (404, 'NOT_FOUND')
        ├── ConflictError    (409, 'CONFLICT')
        └── ValidationError  (400, 'VALIDATION_ERROR')
```

O `errorHandler` middleware trata 3 cenários:

```typescript
function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // 1. ZodError → 400 com mensagens formatadas
  if (err instanceof ZodError) {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    res.status(400).json({ error: 'VALIDATION_ERROR', message: messages, statusCode: 400 })
    return
  }
  
  // 2. AppError → status e mensagem customizados
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.error, message: err.message, statusCode: err.statusCode
    })
    return
  }
  
  // 3. Qualquer outro erro → 500 genérico (não vaza informação interna)
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500
  })
}
```

**Decisão de segurança:** erros não mapeados retornam mensagem genérica. A mensagem real é apenas logada no servidor (`console.error`).

---

## 8) Testes (`__tests__/flags.test.ts`)

### Estrutura de isolamento

```typescript
let db: Database

beforeEach(async () => {
  const SQL = await initSqlJs()
  db = new SQL.Database()        // Banco in-memory limpo
  createTables(db)               // Cria tabela flags
  _resetDbForTesting(db)         // Injeta no singleton do client
})

afterEach(() => {
  _resetDbForTesting(null)       // Remove referência
  db.close()                     // Libera memória
})
```

Cada teste roda com banco completamente vazio. Testes criam seus próprios dados.

### Cobertura de filtros (7 testes específicos)

| Teste | O que valida |
|---|---|
| `filters by environment` | 3 flags criadas (prod/staging/dev) → filtra por production → retorna 1 |
| `filters by status enabled` | 1 enabled + 1 disabled → filtra enabled → retorna 1 |
| `filters by status disabled` | 1 enabled + 1 disabled → filtra disabled → retorna 1 |
| `filters by type` | 3 types criados → filtra experiment → retorna 1 |
| `filters by owner` | 2 owners → filtra team-alpha → retorna 1 |
| `filters by name (partial, case-insensitive)` | 3 flags → filtra "PAYMENT" → retorna 2 (payment-service, payment-gateway) |
| `applies AND logic for multiple filters` | 4 flags → filtra prod + enabled + release → retorna 1 (match-all) |
| `returns all flags when no filters provided` | 3 flags → filtra `{}` → retorna 3 |

### Cobertura CRUD (16 testes)

- **Create:** dados corretos, UUID válido, timestamps, rejeição de duplicata
- **Get by ID:** encontrado, não encontrado (null)
- **Get by name:** encontrado, não encontrado (null)
- **Update:** campos parciais, timestamp atualizado, ID inexistente (throw), conflito de nome (throw)
- **Delete:** remoção confirmada, ID inexistente (throw)

---

## 9) Perguntas de entrevista frequentes (e respostas)

### "Como você garantiu que não há SQL injection?"

> Todas as queries parametrizadas usam `db.prepare()` + `stmt.bind()`. Os valores do usuário nunca são concatenados diretamente no SQL. As colunas e operadores são strings hardcoded no código. Além disso, wildcards do LIKE (`%`, `_`) são escapados no input antes do bind.

### "Por que SQL.js em vez de PostgreSQL?"

> É uma restrição do exercício. SQL.js roda o SQLite em WebAssembly, in-memory, sem dependência externa. Simplifica setup mas tem tradeoffs: sem tipos booleanos nativos (usamos INTEGER 0/1), sem arrays (usamos JSON string), persistência manual via export para arquivo.

### "Como funciona a persistência das tags?"

> `tags: string[]` no TypeScript → `tags TEXT` no SQLite. Na escrita: `JSON.stringify(['frontend', 'ux'])` → `'["frontend","ux"]'`. Na leitura: `JSON.parse(row.tags)` com validação de que é array. Se o JSON for inválido, `rowToFlag()` lança erro.

### "Como os filtros funcionam com AND?"

> Cada filtro ativo adiciona uma condição (`conditions.push('column = ?')`) e um valor (`params.push(value)`). As condições são juntadas com `conditions.join(' AND ')`. Se não tem filtro, a query retorna todas as flags.

### "O que acontece se o banco corromper?"

> O `initializeDatabase()` tem try/catch. Se falhar ao ler o arquivo, reseta `db = null` e `initPromise = null`, permitindo retry. Mas não há recuperação automática — o arquivo corrompido precisaria ser deletado manualmente.

### "Como garantir que statements são liberados?"

> Padrão obrigatório: `stmt.free()` em bloco `finally`. Mesmo que a query falhe ou lance exceção, o statement é liberado. Sem isso, há leak de memória no WASM.

### "Por que validar na rota E no service?"

> A rota valida **formato** (Zod schema — "o campo environment é um enum válido?"). O service valida **regras de negócio** ("já existe uma flag com esse nome?"). São camadas de validação complementares.
