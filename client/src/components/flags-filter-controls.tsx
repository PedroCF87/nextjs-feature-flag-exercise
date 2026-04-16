import { useState, useEffect, useRef } from 'react'
import type { FlagFilterParams, Environment, FlagType } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FlagsFilterControlsProps {
  filters: FlagFilterParams
  onChange: (filters: FlagFilterParams) => void
}

export function FlagsFilterControls({ filters, onChange }: FlagsFilterControlsProps) {
  const [nameInput, setNameInput] = useState(filters.name ?? '')
  const [ownerInput, setOwnerInput] = useState(filters.owner ?? '')

  // Keep a ref to latest filters so timer callbacks always spread current values.
  // Updated in an effect (not during render) to satisfy react-hooks/refs.
  const latestFiltersRef = useRef<FlagFilterParams>(filters)
  useEffect(() => {
    latestFiltersRef.current = filters
  }, [filters])

  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ownerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNameChange = (value: string) => {
    setNameInput(value)
    if (nameTimerRef.current !== null) clearTimeout(nameTimerRef.current)
    nameTimerRef.current = setTimeout(() => {
      onChange({ ...latestFiltersRef.current, name: value || undefined })
    }, 300)
  }

  const handleOwnerChange = (value: string) => {
    setOwnerInput(value)
    if (ownerTimerRef.current !== null) clearTimeout(ownerTimerRef.current)
    ownerTimerRef.current = setTimeout(() => {
      onChange({ ...latestFiltersRef.current, owner: value || undefined })
    }, 300)
  }

  const activeCount = Object.values(filters).filter(v => v !== undefined).length

  const handleClear = () => {
    setNameInput('')
    setOwnerInput('')
    if (nameTimerRef.current !== null) clearTimeout(nameTimerRef.current)
    if (ownerTimerRef.current !== null) clearTimeout(ownerTimerRef.current)
    onChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Select
        value={filters.environment ?? ''}
        onValueChange={(v) =>
          onChange({ ...filters, environment: v ? (v as Environment) : undefined })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All environments</SelectItem>
          <SelectItem value="development">Development</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="production">Production</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? ''}
        onValueChange={(v) =>
          onChange({ ...filters, status: v ? (v as 'enabled' | 'disabled') : undefined })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All statuses</SelectItem>
          <SelectItem value="enabled">Enabled</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? ''}
        onValueChange={(v) =>
          onChange({ ...filters, type: v ? (v as FlagType) : undefined })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All types</SelectItem>
          <SelectItem value="release">Release</SelectItem>
          <SelectItem value="experiment">Experiment</SelectItem>
          <SelectItem value="operational">Operational</SelectItem>
          <SelectItem value="permission">Permission</SelectItem>
        </SelectContent>
      </Select>

      <Input
        className="w-[160px]"
        placeholder="Search by name"
        value={nameInput}
        onChange={(e) => handleNameChange(e.target.value)}
      />

      <Input
        className="w-[160px]"
        placeholder="Filter by owner"
        value={ownerInput}
        onChange={(e) => handleOwnerChange(e.target.value)}
      />

      {activeCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{activeCount} active</Badge>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
