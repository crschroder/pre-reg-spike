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
  // normalize helper so casing/whitespace differences don't break matching
  const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase()

  const selectedRaw = (column.getFilterValue() as T[]) ?? []
  const selected = selectedRaw.map((s) => normalize(s))

  const toggle = (value: T, checked: boolean) => {
    if (checked) {
      column.setFilterValue([...selectedRaw, value])
    } else {
      column.setFilterValue(selectedRaw.filter(v => v !== value))
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-1 text-xs text-white">
      {options.map(option => {
        const key = String(option)
        const checked = selected.includes(normalize(option))
        const label = labels[key] ?? key

        return (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => toggle(option, e.target.checked)}
              className="w-4 h-4"
            />
            <span>{label}</span>
          </label>
        )
      })}
    </div>
  )
}
