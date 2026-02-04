import { useState } from 'react'
import type { Column } from '@tanstack/react-table'

import { ChevronDown } from 'lucide-react' // or any icon you prefer
import { CheckboxFilter } from './CheckboxFilter'

type Primitive = string | number | boolean

type Props<T extends Primitive> = {
  column: Column<any, unknown>
  options: T[]
  labels?: Record<string, string>
}

export function CheckboxFilterPopover<T extends Primitive>({
  column,
  options,
  labels,
}: Props<T>) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-gray-300 hover:text-white transition"
      >
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-gray-800 border border-gray-700 rounded p-2 shadow-lg">
          <CheckboxFilter column={column} options={options} labels={labels} />
        </div>
      )}
    </div>
  )
}

