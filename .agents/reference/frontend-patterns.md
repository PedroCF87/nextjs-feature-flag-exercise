# Frontend Patterns — On-Demand Context

> Load this document when you need deep understanding of client-side patterns.
> All file:line references are from the `client/` and `shared/` directories.

---

## 1. Application Structure

### Entry point (`client/src/App.tsx`)

The app uses a two-component pattern — outer `App` provides the QueryClient, inner `FlagsApp` contains all state and logic.

```typescript
// Outer wrapper (lines 137-142)
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FlagsApp />
    </QueryClientProvider>
  )
}

// Inner component with all state (lines 14-135)
function FlagsApp() {
  const qc = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)
  const [filters, setFilters] = useState<FlagFilterParams>({})
  // ...
}
```

### Import convention (lines 1-10)

```typescript
import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, FlagFilterParams } from '@shared/types'
import { getFlags, createFlag, updateFlag, deleteFlag } from '@/api/flags'
import { FlagsTable } from '@/components/flags-table'
import { FlagsFilterControls } from '@/components/flags-filter-controls'
```

**Path aliases** (defined in `client/vite.config.ts`, lines 10-13):
- `@/` → `client/src/`
- `@shared/` → `shared/`

Type-only imports use `import type` — required by strict TypeScript with `verbatimModuleSyntax`.

---

## 2. TanStack Query Pattern

### Read: useQuery with compound key (`client/src/App.tsx`, lines 22-25)

```typescript
const { data: flags = [], isLoading, error } = useQuery({
  queryKey: ['flags', filters],
  queryFn: () => getFlags(filters),
})
```

**Key insight:** `filters` in the query key means changing any filter automatically triggers a refetch. No manual refetch needed.

### Write: useMutation with optimistic invalidation (lines 27-49)

```typescript
const createMutation = useMutation({
  mutationFn: createFlag,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['flags'] })
    setIsFormOpen(false)
    setSelectedFlag(null)
  },
  onError: (error: Error) => {
    console.error('Failed to create flag:', error.message)
    // Modal stays open so user can retry
  },
})
```

**Pattern for all mutations:**
1. `onSuccess` → invalidate `['flags']` (refetches all flag queries) + close modal/dialog
2. `onError` → log error, keep modal open for retry
3. Three mutations: `createMutation`, `updateMutation`, `deleteMutation`

### Update mutation—compound parameter (lines 39-49)

```typescript
const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: UpdateFlagInput }) => updateFlag(id, data),
  // ...
})

// Called via (line 82):
updateMutation.mutate({ id: selectedFlag.id, data })
```

**Pattern:** `mutationFn` receives a single argument, so wrap multiple params in an object.

---

## 3. API Client

**File:** `client/src/api/flags.ts`

### Response handler (lines 5-33)

```typescript
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!response.ok) {
    if (isJson) {
      const error: ApiError = await response.json()
      throw new Error(error.message)
    }
    throw new Error(`Server error: ${response.status} ${response.statusText}`)
  }

  if (!isJson) return undefined as T
  return await response.json()
}
```

**Pattern:** Centralized generic response handler used by all fetch functions. Extracts `message` from the server's `ApiError` shape.

### Filter query string construction (lines 35-50)

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

**Key:** Skips `undefined` and empty string values — only non-empty filters become query params.

### Network error wrapping (lines 51-55)

```typescript
catch (e) {
  if (e instanceof TypeError) {
    throw new Error('Unable to connect to server. Please check your connection.')
  }
  throw e
}
```

**Pattern:** Every fetch function wraps `TypeError` (network failure) into a user-friendly message. Applied to `getFlags`, `getFlag`, `createFlag`, `updateFlag`, `deleteFlag`.

### API base URL (line 3)

```typescript
const API_BASE = 'http://localhost:3001/api'
```

No proxy configured in Vite — client connects directly to `localhost:3001`.

---

## 4. Component Architecture

### FlagsTable (`client/src/components/flags-table.tsx`)

```typescript
interface FlagsTableProps {
  flags: FeatureFlag[]
  onEdit: (flag: FeatureFlag) => void
  onDelete: (flag: FeatureFlag) => void
}
```

**Structure:**
- Props interface named `{Component}Props` (line 14)
- Color maps for environment and type badges (lines 20-30)
- Empty state rendering when `flags.length === 0` (line 34)
- Radix Table primitive composition: `Table > TableHeader > TableRow > TableHead` + `TableBody > TableRow > TableCell`
- Badge components for status (ON/OFF), environment, type, tags (lines 61-80)
- Action buttons: Edit (Pencil icon), Delete (Trash2 icon) per row

### FlagsFilterControls (`client/src/components/flags-filter-controls.tsx`)

```typescript
interface FlagsFilterControlsProps {
  filters: FlagFilterParams
  onChange: (filters: FlagFilterParams) => void
}
```

**Patterns:**
- Debounced text inputs for `owner` and `name` (300ms via `setTimeout`, lines 42-55)
- `useRef` for latest values inside debounce callbacks (lines 38-41)
- Select dropdowns for `environment`, `status`, `type` with sentinel `__all__` value (line 20)
- Syncs local input state when filters change externally (e.g., "Clear all") (lines 30-35)

### FlagFormModal (`client/src/components/flag-form-modal.tsx`)

```typescript
interface FlagFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flag?: FeatureFlag | null
  onSubmit: (data: CreateFlagInput) => void
  isLoading?: boolean
}
```

**Patterns:**
- Uses Radix Dialog primitive (`Dialog > DialogContent > DialogHeader > DialogTitle > DialogFooter`)
- `useMemo` to derive initial form data from `flag` prop (line 50)
- `useEffect` to reset form when `flag` or `open` changes
- Controlled inputs for all fields: name, description, enabled (Switch), environment (Select), type (Select), rolloutPercentage, owner, tags
- Empty form data constant for create mode (lines 33-43)

### DeleteConfirmDialog (`client/src/components/delete-confirm-dialog.tsx`)

Simple dialog with flag name display + Confirm/Cancel buttons.

---

## 5. UI Primitives (shadcn/Radix)

**Directory:** `client/src/components/ui/`

All primitives are pre-built shadcn components wrapping Radix UI:

- `button.tsx` — `Button` with `variant` and `size` props
- `badge.tsx` — `Badge` with `variant: 'default' | 'secondary' | 'outline' | 'destructive'`
- `dialog.tsx` — `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `select.tsx` — `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `table.tsx` — `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `input.tsx` — `Input` (extends native input with Tailwind styling)
- `switch.tsx` — `Switch` (toggle)
- `label.tsx` — `Label` (accessible form label)

### Class composition utility (`client/src/lib/utils.ts`)

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Always** use `cn()` for Tailwind class composition — handles conflicts correctly. Never concatenate class strings manually.

---

## 6. Vite Configuration

**File:** `client/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
})
```

**Key points:**
- Tailwind CSS v4 via Vite plugin (not PostCSS)
- No dev server proxy configured — client fetches from `http://localhost:3001` directly
- Path aliases must match `tsconfig.app.json` aliases for TypeScript resolution

---

## 7. Shared Type Contract

**File:** `shared/types.ts`

This is the **single source of truth** for all data shapes used by both server and client.

### Core types (lines 1-18)

```typescript
export type Environment = 'development' | 'staging' | 'production'           // line 1
export type FlagType = 'release' | 'experiment' | 'operational' | 'permission' // line 2

export interface FeatureFlag {                  // line 4
  readonly id: string                           // immutable after creation
  name: string
  description: string
  enabled: boolean                              // server stores as INTEGER 0/1
  environment: Environment
  type: FlagType
  rolloutPercentage: number
  owner: string
  tags: string[]                                // server stores as JSON TEXT
  readonly createdAt: string                    // ISO 8601
  updatedAt: string
  expiresAt: string | null
  lastEvaluatedAt: string | null
}
```

### Input contracts (lines 20-42)

- `CreateFlagInput` — all fields required except `expiresAt` (optional)
- `UpdateFlagInput` — all fields optional (partial update)

### Filter contract (lines 44-50)

```typescript
export interface FlagFilterParams {
  environment?: Environment
  status?: 'enabled' | 'disabled'    // NOT boolean — maps to enabled column
  type?: FlagType
  owner?: string
  name?: string                       // partial match via LIKE
}
```

### Error contract (lines 52-56)

```typescript
export interface ApiError {
  error: string
  message: string
  statusCode: number
}
```

**Rule:** Never define duplicate interfaces in `server/` or `client/`. Always import from `@shared/types`.
