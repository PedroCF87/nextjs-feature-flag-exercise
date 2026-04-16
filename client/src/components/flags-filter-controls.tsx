import { useState, useEffect, useRef } from 'react'
import type { FlagFilterParams } from '@shared/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FlagsFilterControlsProps {
  filters: FlagFilterParams
  onChange: (filters: FlagFilterParams) => void
}

const EMPTY_VALUE = '__all__'
const DEBOUNCE_MS = 300

function FlagsFilterControls({ filters, onChange }: FlagsFilterControlsProps) {
  const [ownerInput, setOwnerInput] = useState(filters.owner ?? '')
  const [nameInput, setNameInput] = useState(filters.name ?? '')
  const [prevFilters, setPrevFilters] = useState(filters)

  // Sync local state when filters change externally (e.g. "Clear all")
  // React-recommended pattern: conditional setState during render
  if (filters.owner !== prevFilters.owner || filters.name !== prevFilters.name) {
    setPrevFilters(filters)
    if (filters.owner !== prevFilters.owner) setOwnerInput(filters.owner ?? '')
    if (filters.name !== prevFilters.name) setNameInput(filters.name ?? '')
  }

  // Refs for latest values inside debounce callbacks
  const filtersRef = useRef(filters)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    filtersRef.current = filters
    onChangeRef.current = onChange
  }, [filters, onChange])

  // Debounce owner input
  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = ownerInput || undefined
      if (normalized !== filtersRef.current.owner) {
        onChangeRef.current({ ...filtersRef.current, owner: normalized })
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [ownerInput])

  // Debounce name input
  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = nameInput || undefined
      if (normalized !== filtersRef.current.name) {
        onChangeRef.current({ ...filtersRef.current, name: normalized })
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [nameInput])

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ''
  ).length

  const handleSelectChange = (key: keyof FlagFilterParams, value: string) => {
    onChange({ ...filters, [key]: value === EMPTY_VALUE ? undefined : value })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">Environment</label>
        <Select
          value={filters.environment ?? EMPTY_VALUE}
          onValueChange={(v) => handleSelectChange('environment', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All environments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_VALUE}>All environments</SelectItem>
            <SelectItem value="development">development</SelectItem>
            <SelectItem value="staging">staging</SelectItem>
            <SelectItem value="production">production</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <Select
          value={filters.status ?? EMPTY_VALUE}
          onValueChange={(v) => handleSelectChange('status', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_VALUE}>All statuses</SelectItem>
            <SelectItem value="enabled">enabled</SelectItem>
            <SelectItem value="disabled">disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">Type</label>
        <Select
          value={filters.type ?? EMPTY_VALUE}
          onValueChange={(v) => handleSelectChange('type', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_VALUE}>All types</SelectItem>
            <SelectItem value="release">release</SelectItem>
            <SelectItem value="experiment">experiment</SelectItem>
            <SelectItem value="operational">operational</SelectItem>
            <SelectItem value="permission">permission</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-owner" className="text-sm font-medium text-muted-foreground">Owner</label>
        <Input
          id="filter-owner"
          className="w-[160px]"
          placeholder="Filter by owner..."
          value={ownerInput}
          onChange={(e) => setOwnerInput(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-name" className="text-sm font-medium text-muted-foreground">Name</label>
        <Input
          id="filter-name"
          className="w-[180px]"
          placeholder="Search by name..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
      </div>

      <div className={cn('flex items-end gap-2', activeFilterCount === 0 && 'hidden')}>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => onChange({})}
        >
          Clear all filters
        </Button>
        <Badge variant="secondary">
          {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
        </Badge>
      </div>
    </div>
  )
}

export { FlagsFilterControls }
