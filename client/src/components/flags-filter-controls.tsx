import { useEffect, useRef, useState } from 'react'
import type { FlagFilterParams, Environment, FlagType } from '@shared/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SENTINEL = '__all__'

interface FlagsFilterControlsProps {
  filters: FlagFilterParams
  onChange: (filters: FlagFilterParams) => void
}

export function FlagsFilterControls({ filters, onChange }: FlagsFilterControlsProps) {
  const [localOwner, setLocalOwner] = useState(filters.owner ?? '')
  const [localName, setLocalName] = useState(filters.name ?? '')

  useEffect(() => { setLocalOwner(filters.owner ?? '') }, [filters.owner])
  useEffect(() => { setLocalName(filters.name ?? '') }, [filters.name])

  const latestFilters = useRef(filters)
  latestFilters.current = filters

  const latestOwner = useRef(localOwner)
  latestOwner.current = localOwner
  useEffect(() => {
    const id = setTimeout(() => {
      onChange({ ...latestFilters.current, owner: latestOwner.current || undefined })
    }, 300)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localOwner])

  const latestName = useRef(localName)
  latestName.current = localName
  useEffect(() => {
    const id = setTimeout(() => {
      onChange({ ...latestFilters.current, name: latestName.current || undefined })
    }, 300)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localName])

  const handleEnvironmentChange = (value: string) => {
    onChange({ ...filters, environment: value === SENTINEL ? undefined : value as Environment })
  }

  const handleStatusChange = (value: string) => {
    onChange({ ...filters, status: value === SENTINEL ? undefined : value as 'enabled' | 'disabled' })
  }

  const handleTypeChange = (value: string) => {
    onChange({ ...filters, type: value === SENTINEL ? undefined : value as FlagType })
  }

  const handleClear = () => {
    setLocalOwner('')
    setLocalName('')
    onChange({})
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '')

  return (
    <div className={cn('flex flex-wrap gap-3 items-center p-4 rounded-lg', hasActiveFilters ? 'bg-muted' : 'bg-muted/50')}>
      <Select value={filters.environment ?? SENTINEL} onValueChange={handleEnvironmentChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SENTINEL}>All environments</SelectItem>
          <SelectItem value="development">Development</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="production">Production</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status ?? SENTINEL} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SENTINEL}>All statuses</SelectItem>
          <SelectItem value="enabled">Enabled</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.type ?? SENTINEL} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SENTINEL}>All types</SelectItem>
          <SelectItem value="release">Release</SelectItem>
          <SelectItem value="experiment">Experiment</SelectItem>
          <SelectItem value="operational">Operational</SelectItem>
          <SelectItem value="permission">Permission</SelectItem>
        </SelectContent>
      </Select>

      <Input
        className="w-40"
        placeholder="Filter by owner…"
        value={localOwner}
        onChange={e => setLocalOwner(e.target.value)}
      />

      <Input
        className="w-44"
        placeholder="Search by name…"
        value={localName}
        onChange={e => setLocalName(e.target.value)}
      />

      {hasActiveFilters && (
        <>
          <span className="text-sm text-primary font-medium">Filters active</span>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear filters
          </Button>
        </>
      )}
    </div>
  )
}
