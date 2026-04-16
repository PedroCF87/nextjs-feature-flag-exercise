---
title: Feature Flag Manager — Frontend Deep Dive
scope: interview
repos:
  - nextjs-feature-flag-exercise
updatedAt: 2026-04-15
---

# Feature Flag Manager — Frontend Deep Dive

## 1) Visão geral

O frontend é um **React 19 SPA** construído com Vite, usando **TanStack Query v5** para gerenciamento de estado assíncrono, **Radix UI** para componentes acessíveis headless, e **Tailwind CSS v4** para estilização utility-first.

**Referências de arquivos:**
- Entry point: `client/src/main.tsx`
- Orquestrador: `client/src/App.tsx`
- API client: `client/src/api/flags.ts`
- Filtros: `client/src/components/flags-filter-controls.tsx`
- Tabela: `client/src/components/flags-table.tsx`
- Modal create/edit: `client/src/components/flag-form-modal.tsx`
- Dialog de delete: `client/src/components/delete-confirm-dialog.tsx`
- UI primitives: `client/src/components/ui/` (Radix-based)
- Utility: `client/src/lib/utils.ts` (função `cn()`)
- Config Vite: `client/vite.config.ts`

---

## 2) Arquitetura de componentes

```
<App>                                    ← QueryClientProvider (TanStack Query)
  └── <FlagsApp>                         ← Estado principal da aplicação
        │
        ├── Header: "Feature Flags" + <Button Create Flag>
        │
        ├── <FlagsFilterControls>        ← 3 Selects + 2 Inputs + Clear button + Badge
        │     Props: { filters, onChange }
        │     Estado local: ownerInput, nameInput (debounce 300ms)
        │
        ├── <FlagsTable>                 ← Tabela com colunas: Name, Status, Env, Type, Rollout, Owner, Tags, Actions
        │     Props: { flags, onEdit, onDelete }
        │     Sem estado próprio
        │
        ├── <FlagFormModal>              ← Dialog Radix (create/edit)
        │     Props: { open, onOpenChange, flag?, onSubmit, isLoading }
        │     Estado local: formData, tagsInput
        │
        └── <DeleteConfirmDialog>        ← AlertDialog Radix
              Props: { open, onOpenChange, flag, onConfirm, isLoading }
              Sem estado próprio (controlado pelo pai)
```

---

## 3) Estado central (`App.tsx`)

### 3.1) Estados

```typescript
const [isFormOpen, setIsFormOpen] = useState(false)
const [isDeleteOpen, setIsDeleteOpen] = useState(false)
const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)
const [filters, setFilters] = useState<FlagFilterParams>({})
```

| Estado | Tipo | Propósito |
|---|---|---|
| `filters` | `FlagFilterParams` | Filtros ativos — passado para query e para FlagsFilterControls |
| `selectedFlag` | `FeatureFlag \| null` | Flag sendo editada/deletada |
| `isFormOpen` | `boolean` | Controla visibilidade do modal create/edit |
| `isDeleteOpen` | `boolean` | Controla visibilidade do dialog de confirmação |

### 3.2) Query principal

```typescript
const { data: flags = [], isLoading, error } = useQuery({
  queryKey: ['flags', filters],    // ← filters no queryKey!
  queryFn: () => getFlags(filters),
})
```

**Ponto crítico para entrevista:**
- `filters` está dentro do `queryKey`. Quando qualquer propriedade de `filters` muda, o TanStack Query automaticamente dispara um novo fetch.
- **Não precisa de `useEffect`** para reagir a mudanças nos filtros — o TanStack Query faz isso.
- `data: flags = []` usa default value para evitar `undefined` durante loading.

### 3.3) Mutations

```typescript
const createMutation = useMutation({
  mutationFn: createFlag,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['flags'] })  // ← Invalida TODAS as queries que começam com 'flags'
    setIsFormOpen(false)
    setSelectedFlag(null)
  },
  onError: (error: Error) => {
    console.error('Failed to create flag:', error.message)
    // Modal stays open so user can retry
  },
})
```

**Padrão idêntico** para `updateMutation` e `deleteMutation`. Todas as mutations:
1. Invalidam queries com `queryKey: ['flags']`
2. Fecham modals/dialogs no sucesso
3. Mantêm modals/dialogs abertos no erro (para retry)
4. Logam erros no console

**Persistência de filtros:** `invalidateQueries({ queryKey: ['flags'] })` invalida a query `['flags', filters]` atual. Quando o TanStack Query faz o refetch, usa o `queryKey` atual (que inclui os filtros). Logo, os filtros **nunca são perdidos** durante operações CRUD.

### 3.4) Handlers

```typescript
const handleCreate = () => {
  setSelectedFlag(null)    // null = modo criação
  setIsFormOpen(true)
}

const handleEdit = (flag: FeatureFlag) => {
  setSelectedFlag(flag)    // flag presente = modo edição
  setIsFormOpen(true)
}

const handleDelete = (flag: FeatureFlag) => {
  setSelectedFlag(flag)
  setIsDeleteOpen(true)
}

const handleFormSubmit = (data: CreateFlagInput) => {
  if (selectedFlag) {
    updateMutation.mutate({ id: selectedFlag.id, data })
  } else {
    createMutation.mutate(data)
  }
}
```

A mesma `FlagFormModal` serve para criar e editar. A diferença é se `selectedFlag` é `null` (criar) ou tem valor (editar).

---

## 4) API Client (`api/flags.ts`)

### 4.1) `handleResponse<T>` — utility genérica

```typescript
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!response.ok) {
    if (isJson) {
      const error: ApiError = await response.json()
      throw new Error(error.message)  // Extrai mensagem do formato padronizado
    }
    throw new Error(`Server error: ${response.status} ${response.statusText}`)
  }

  if (!isJson) return undefined as T
  return await response.json()
}
```

Trata 3 cenários:
1. **Erro com JSON** → lê `ApiError` e extrai `message`
2. **Erro sem JSON** → mensagem genérica com status
3. **Sucesso** → parse e retorna tipado

### 4.2) `getFlags(filters?)` — serialização de filtros

```typescript
export async function getFlags(filters?: FlagFilterParams): Promise<FeatureFlag[]> {
  const params = new URLSearchParams()
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') {
        params.append(key, String(value))
      }
    }
  }
  const query = params.toString()
  const url = query ? `${API_BASE}/flags?${query}` : `${API_BASE}/flags`
  const response = await fetch(url)
  return handleResponse<FeatureFlag[]>(response)
}
```

**Pontos-chave:**
- Filtra valores `undefined` e strings vazias — não envia filtros limpos para o servidor
- Usa `URLSearchParams` para encoding seguro (escapa caracteres especiais automaticamente)
- Se não tem filtros → URL sem query string

**Padrão de erro de rede:**
```typescript
catch (e) {
  if (e instanceof TypeError) {  // fetch lança TypeError quando não consegue conectar
    throw new Error('Unable to connect to server. Please check your connection.')
  }
  throw e
}
```

### 4.3) Outros endpoints

| Função | Método | Endpoint | Body |
|---|---|---|---|
| `getFlag(id)` | GET | `/api/flags/${id}` | — |
| `createFlag(input)` | POST | `/api/flags` | `CreateFlagInput` JSON |
| `updateFlag(id, input)` | PUT | `/api/flags/${id}` | `UpdateFlagInput` JSON |
| `deleteFlag(id)` | DELETE | `/api/flags/${id}` | — |

Todos seguem o mesmo padrão: `fetch()` → `handleResponse<T>()` → catch TypeError.

---

## 5) Componente de filtros (`flags-filter-controls.tsx`)

### 5.1) Props e interface

```typescript
interface FlagsFilterControlsProps {
  filters: FlagFilterParams    // Estado do pai (App.tsx)
  onChange: (filters: FlagFilterParams) => void  // Setter do pai
}
```

O componente é **controlado** — o estado real vive em `App.tsx`. Mas os inputs de texto têm **estado local** para suportar debounce.

### 5.2) Debounce — o padrão mais complexo do frontend

```typescript
const DEBOUNCE_MS = 300

// Estado local dos inputs de texto
const [ownerInput, setOwnerInput] = useState(filters.owner ?? '')
const [nameInput, setNameInput] = useState(filters.name ?? '')
const [prevFilters, setPrevFilters] = useState(filters)

// Sincronização quando filtros mudam externamente (ex: "Clear all")
if (filters.owner !== prevFilters.owner || filters.name !== prevFilters.name) {
  setPrevFilters(filters)
  if (filters.owner !== prevFilters.owner) setOwnerInput(filters.owner ?? '')
  if (filters.name !== prevFilters.name) setNameInput(filters.name ?? '')
}
```

**Por que este padrão?**

1. **Debounce é necessário** para evitar uma requisição HTTP a cada dígito
2. Os inputs de texto precisam de **estado local** para atualizar imediatamente na UI
3. Mas quando o usuário clica "Clear all filters", `filters` muda externamente e o estado local precisa sincronizar
4. O pattern `if (filters !== prevFilters)` é o padrão recomendado pelo React para "armazenar informação de renders anteriores" — mais eficiente que `useEffect`

### 5.3) Refs para closures

```typescript
const filtersRef = useRef(filters)
const onChangeRef = useRef(onChange)
useEffect(() => {
  filtersRef.current = filters
  onChangeRef.current = onChange
}, [filters, onChange])
```

Os refs garantem que o callback do `setTimeout` sempre acesse os valores mais recentes de `filters` e `onChange`, independente de quantos renders aconteceram durante o debounce.

### 5.4) Debounce com useEffect

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const normalized = ownerInput || undefined
    if (normalized !== filtersRef.current.owner) {
      onChangeRef.current({ ...filtersRef.current, owner: normalized })
    }
  }, DEBOUNCE_MS)
  return () => clearTimeout(timer)  // ← Limpa timer anterior
}, [ownerInput])
```

**Fluxo:**
1. Usuário digita → `setOwnerInput('te')` → render
2. `useEffect` cria timer de 300ms
3. Usuário digita mais → `setOwnerInput('team')` → render
4. `useEffect` cleanup: `clearTimeout(timer)` do render anterior
5. Novo timer de 300ms
6. 300ms sem digitar → callback executa → `onChange({ owner: 'team' })`
7. `onChange` atualiza `filters` em `App.tsx` → `queryKey` muda → TanStack Query faz fetch

### 5.5) Selects (sem debounce)

Selects como Environment, Status e Type disparam mudanças **imediatamente** (sem debounce):

```typescript
const handleSelectChange = (key: keyof FlagFilterParams, value: string) => {
  onChange({ ...filters, [key]: value === EMPTY_VALUE ? undefined : value })
}
```

`EMPTY_VALUE = '__all__'` é um sentinel que representa "sem filtro". Radix Select não aceita `undefined` como valor.

### 5.6) Indicador de filtros ativos

```typescript
const activeFilterCount = Object.values(filters).filter(
  (v) => v !== undefined && v !== ''
).length
```

Quando `activeFilterCount > 0`:
- Mostra botão "Clear all filters" → chama `onChange({})`
- Mostra `<Badge>` com "N filters active"

---

## 6) Tabela de flags (`flags-table.tsx`)

### 6.1) Props e estrutura

```typescript
interface FlagsTableProps {
  flags: FeatureFlag[]
  onEdit: (flag: FeatureFlag) => void
  onDelete: (flag: FeatureFlag) => void
}
```

Componente **puro** sem estado — recebe dados e callbacks.

### 6.2) Badges coloridos

Cada ambiente e tipo tem cores distintas:

```typescript
const environmentColors: Record<Environment, string> = {
  development: 'bg-blue-100 text-blue-800 ...',
  staging: 'bg-yellow-100 text-yellow-800 ...',
  production: 'bg-green-100 text-green-800 ...',
}

const typeColors: Record<FlagType, string> = {
  release: 'bg-purple-100 text-purple-800 ...',
  experiment: 'bg-orange-100 text-orange-800 ...',
  operational: 'bg-gray-100 text-gray-800 ...',
  permission: 'bg-pink-100 text-pink-800 ...',
}
```

### 6.3) Tags com truncamento

```tsx
{flag.tags.slice(0, 3).map(tag => (
  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
))}
{flag.tags.length > 3 && (
  <Badge variant="outline" className="text-xs">+{flag.tags.length - 3}</Badge>
)}
```

Mostra as primeiras 3 tags e um badge "+N" se houver mais.

### 6.4) Estado vazio

```tsx
if (flags.length === 0) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      No feature flags found. Create your first flag to get started.
    </div>
  )
}
```

---

## 7) Modal de formulário (`flag-form-modal.tsx`)

### 7.1) Create vs Edit — mesmo componente

```typescript
interface FlagFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flag?: FeatureFlag | null    // null = criar, FeatureFlag = editar
  onSubmit: (data: CreateFlagInput) => void
  isLoading?: boolean
}
```

### 7.2) Estado do formulário

```typescript
const initialData = useMemo(() => {
  if (flag) {
    return { name: flag.name, description: flag.description, ... }
  }
  return emptyFormData
}, [flag])

const [formData, setFormData] = useState<CreateFlagInput>(initialData)
```

- `useMemo` recalcula `initialData` quando `flag` muda
- `useEffect` sincroniza `formData` quando o modal abre

### 7.3) Tags como string

```typescript
const [tagsInput, setTagsInput] = useState(initialTags)  // "frontend, ux"

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  const tags = tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
  onSubmit({ ...formData, tags })
}
```

O usuário digita tags separadas por vírgula. No submit, elas são convertidas para `string[]`.

### 7.4) Campos do formulário

| Campo | Tipo de input | Validação HTML |
|---|---|---|
| Name | `<Input>` | `pattern="^[a-z0-9-]+$"`, `required` |
| Description | `<Input>` | `required` |
| Enabled | `<Switch>` (Radix) | — |
| Environment | `<Select>` (Radix) | 3 opções fixas |
| Type | `<Select>` (Radix) | 4 opções fixas |
| Rollout % | `<Input type="number">` | `min=0`, `max=100` |
| Owner | `<Input>` | `required` |
| Tags | `<Input>` | Texto livre com vírgulas |
| Expires At | `<Input type="datetime-local">` | Opcional |

---

## 8) Dialog de exclusão (`delete-confirm-dialog.tsx`)

Componente simples usando `AlertDialog` do Radix:

```tsx
<AlertDialogDescription>
  Are you sure you want to delete the flag "{flag?.name}"? 
  This action cannot be undone.
</AlertDialogDescription>

<AlertDialogCancel>Cancel</AlertDialogCancel>
<AlertDialogAction onClick={onConfirm} disabled={isLoading}>
  {isLoading ? 'Deleting...' : 'Delete'}
</AlertDialogAction>
```

**Acessibilidade:** Radix `AlertDialog` gerencia focus trap e aria attributes automaticamente.

---

## 9) Padrões Radix UI utilizados

| Componente Radix | Arquivo | Uso |
|---|---|---|
| `Dialog` | `flag-form-modal.tsx` | Modal de criação/edição |
| `AlertDialog` | `delete-confirm-dialog.tsx` | Confirmação de exclusão |
| `Select` | `flags-filter-controls.tsx`, `flag-form-modal.tsx` | Dropdowns |
| `Switch` | `flag-form-modal.tsx` | Toggle enabled/disabled |
| `Table` | `flags-table.tsx` | Tabela de dados |
| `Badge` | `flags-table.tsx`, `flags-filter-controls.tsx` | Labels coloridos |
| `Button` | Vários | Ações |
| `Input` | Vários | Campos de texto |
| `Label` | `flag-form-modal.tsx` | Labels de formulário |

Todos vêm de `components/ui/` — wrappers gerados pelo shadcn/ui com Radix + Tailwind.

### `cn()` — composição de classes

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Combina `clsx` (conditional classes) com `twMerge` (resolve conflitos do Tailwind).

---

## 10) Fluxo completo — exemplo: filtrar por "production"

```
1. Usuário seleciona "production" no Select de Environment
2. handleSelectChange('environment', 'production')
3. onChange({ ...filters, environment: 'production' })
4. App.tsx: setFilters({ environment: 'production' })
5. queryKey muda: ['flags', { environment: 'production' }]
6. TanStack Query dispara novo fetch
7. getFlags({ environment: 'production' })
8. URLSearchParams → "?environment=production"
9. fetch('http://localhost:3001/api/flags?environment=production')
10. Server: validateFlagFilters → parse → res.locals.filters = { environment: 'production' }
11. getAllFlags({ environment: 'production' })
12. SQL: SELECT * FROM flags WHERE environment = ? ORDER BY created_at DESC
13. Retorna array filtrado → 200 JSON
14. TanStack Query atualiza cache
15. flags-table re-renderiza com dados filtrados
```

---

## 11) Fluxo completo — exemplo: criar flag com filtros ativos

```
1. Filtros ativos: { environment: 'production', status: 'enabled' }
2. Usuário clica "Create Flag" → handleCreate()
3. FlagFormModal abre com formData vazio
4. Usuário preenche e submete → handleFormSubmit(data)
5. createMutation.mutate(data)
6. POST /api/flags com JSON body
7. Server cria flag → 201
8. onSuccess: invalidateQueries({ queryKey: ['flags'] })
9. TanStack Query re-executa query com queryKey = ['flags', { environment: 'production', status: 'enabled' }]
10. getFlags({ environment: 'production', status: 'enabled' })
11. Server retorna flags filtradas (incluindo a nova, SE ela casar com os filtros ativos)
12. UI atualiza — filtros permanecem ativos
```

**Observação:** se o usuário criar uma flag de `development`, ela NÃO aparecerá na tabela porque o filtro `environment: 'production'` está ativo. Isso é comportamento esperado.

---

## 12) Perguntas de entrevista frequentes (e respostas)

### "Por que TanStack Query em vez de useEffect + fetch?"

> TanStack Query fornece cache, deduplicação de requests, background refetching, loading/error states, e invalidation automática — tudo que precisaríamos implementar manualmente com useEffect. O `queryKey` com `filters` garante que mudanças nos filtros trigam refetches automaticamente.

### "Como os filtros persistem durante CRUD?"

> O estado `filters` está em `App.tsx`, acima das mutations. `invalidateQueries({ queryKey: ['flags'] })` invalida a query atual, mas o TanStack Query refaz o fetch usando o mesmo `queryKey` que inclui os filtros atuais. Os filtros nunca são resetados por operações CRUD.

### "Por que debounce nos inputs de texto?"

> Sem debounce, cada tecla geraria uma requisição HTTP. Com 300ms de debounce, a requisição só dispara após o usuário parar de digitar por 300ms. Isso reduz carga no servidor e melhora a experiência.

### "Como funciona o debounce sem perder o valor ao clicar Clear?"

> Os inputs de texto têm estado local (`ownerInput`, `nameInput`) para UI imediata, e sincronizam com os filtros externos via o padrão React de "conditional setState during render". Quando `filters.owner` muda externamente (Clear all), o componente detecta a diferença e reseta o estado local.

### "O que é o padrão conditional setState during render?"

> Em vez de colocar `setOwnerInput()` dentro de um `useEffect` (que causaria um render extra), verificamos diretamente no corpo do componente se houve mudança externa e atualizamos o estado local. É o padrão recomendado pela documentação oficial do React para "armazenar informação de renders anteriores". Evita re-renders desnecessários.

### "Por que refs para onChange dentro do useEffect do debounce?"

> O `setTimeout` captura a referência de `onChange` no momento da criação do timer (closure). Se `onChange` mudar entre a criação do timer e a execução (300ms depois), a closure teria a versão antiga. O `useRef` garante que o callback sempre acesse a versão mais recente.

### "Os componentes Radix são acessíveis?"

> Sim. `Dialog` e `AlertDialog` gerenciam focus trap, ESC para fechar, aria-labels, e screen reader announcements automaticamente. `Select` suporta navegação por teclado. Isso é uma das vantagens de usar Radix em vez de construir do zero.

### "Como funciona o cn()?"

> É a composição de `clsx` (classes condicionais) + `twMerge` (resolve conflitos do Tailwind). Exemplo: `cn('p-4', 'p-2')` → `'p-2'` (o último ganha, sem duplicata). Padrão do shadcn/ui.
