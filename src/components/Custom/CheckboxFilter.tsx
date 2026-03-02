import { normalizeName } from '@/helpers/stringHelpers'
import type { Column } from '@tanstack/react-table'

type Primitive = string | number | boolean

type CheckboxFilterProps<T extends Primitive> = {
  column: Column<any, unknown>
  options: T[]
  labels?: Record<string, string>
}

export function CheckboxFilter<T extends Primitive>({
  column,
  options,
  labels = {},
}: CheckboxFilterProps<T>) {
  const selected = (column.getFilterValue() as T[]) ?? []

  const toggle = (value: T, checked: boolean) => {
    if (checked) {
      column.setFilterValue([...selected, value])
    } else {
      column.setFilterValue(selected.filter(v => v !== value))
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-1 text-xs text-white">
      {options.map(option => {
        const checked = selected.includes(option)
        const key = String(option)
        const label = labels[key] ?? key

        return (
          <label key={String(option)} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={e => toggle(option, e.target.checked)}
            />
            {normalizeName(label)}
          </label>
        )
      })}
    </div>
  )
}
