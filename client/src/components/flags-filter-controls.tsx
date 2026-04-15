import type { FlagFilterParams } from '@shared/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FlagsFilterControlsProps {
  filters: FlagFilterParams
  onChange: (filters: FlagFilterParams) => void
}

const EMPTY_VALUE = '__all__'

function FlagsFilterControls({ filters, onChange }: FlagsFilterControlsProps) {
  const handleSelectChange = (key: keyof FlagFilterParams, value: string) => {
    onChange({ ...filters, [key]: value === EMPTY_VALUE ? undefined : value })
  }

  const handleInputChange = (key: keyof FlagFilterParams, value: string) => {
    onChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className={cn('flex flex-wrap items-end gap-3')}>
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
        <label className="text-sm font-medium text-muted-foreground">Owner</label>
        <Input
          className="w-[160px]"
          placeholder="Filter by owner..."
          value={filters.owner ?? ''}
          onChange={(e) => handleInputChange('owner', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">Name</label>
        <Input
          className="w-[180px]"
          placeholder="Search by name..."
          value={filters.name ?? ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
    </div>
  )
}

export { FlagsFilterControls }
