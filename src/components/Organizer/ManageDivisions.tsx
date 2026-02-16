import { getTournamentRegistrations } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  Column,
  Table
} from "@tanstack/react-table";

// import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { useEffect, useMemo, useState } from "react";
import { CheckboxFilter } from "../Custom/CheckboxFilter";
//import { CheckboxFilterPopover } from "../Custom/CheckBoxFilterPopover";
import { Filter as FilterIcon, FilterX, X } from "lucide-react";
import { Pill } from "../Custom/Pill";
import { sizeClasses } from "@/datatypes/sizeClasses";
import { isBeltColor } from "@/datatypes/belt-colors";
import { beltColors } from "@/datatypes/belt-colors";
import type { PillSize } from "../Custom/Pill";
import type { BeltColor } from "@/datatypes/belt-colors";
import { DebouncedInput } from "../Custom/DebouncedInput";





export type RegistrationRow = {
  id: number
  firstName: string
  lastName: string
  participantGender: string
  participantRank: string
  isPaid: boolean

  divisionGender: string
  divisionName: string
  divisionRank: string
  divisionBeltOrder: number
  minAge: number
  maxAge: number | null

  eventName: string
}
// declare module '@tanstack/react-table' {
//   interface FilterFns {
//     fuzzy: FilterFn<unknown>
//   }
//   interface FilterMeta {
//     itemRank: RankingInfo
//   }
// }

// // Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
// const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
//   // Rank the item
//   const itemRank = rankItem(row.getValue(columnId), value)

//   // Store the itemRank info
//   addMeta({
//     itemRank,
//   })

//   // Return if the item should be filtered in/out
//   return itemRank.passed
// }


export function ManageDivisions({ tournamentId }: { tournamentId: number }) {


    const { data: registrations, isLoading: participantLoading } = useQuery<any[]>({
        queryKey: ['tournament-registrations', tournamentId],
        queryFn: () => getTournamentRegistrations(tournamentId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
    const columns = useMemo<ColumnDef<RegistrationRow>[]>(
      () => [
        // {
        //   header: 'First Name',
        //   accessorKey: 'firstName',
        // },
        // {
        //   header: 'Last Name',
        //   accessorKey: 'lastName',
        // },
        {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: 'fullName',
        header: 'Full Name',
        cell: (info) => info.getValue(), 
        filterFn: "includesString"      
      },
        {
          header: 'Gender',
          accessorKey: 'participantGender',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Rank',
          accessorKey: 'divisionRank',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
          cell: ({ row }) => {
            const color = row.original.divisionRank

            if (isBeltColor(color)) {
              return <Pill color={color}>{color}</Pill>
            }

            // fallback for unexpected values
            return <span>{color}</span>
          },
        },
        {
          header: 'Division',
          accessorKey: 'divisionName',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Event',
          accessorKey: 'eventName',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Division Gender',
          accessorKey: 'divisionGender',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Paid',
          accessorKey: 'isPaid',
          cell: ({ getValue }) => {
            const value = getValue<boolean>()
            return value ? 'Paid' : 'Unpaid'
          },
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
      ],
      [],
    )

  const flattened = useMemo(() => {
  if (!registrations) return []
  return registrations.flatMap((p: any) =>
    (p.registrations ?? []).map((r: any) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,

      participantGender: p.gender.description,
      participantRank: p.rank.beltColor,
      isPaid: p.paid,

      divisionGender: r.tournamentEventDivision.eventGender.description,
      divisionName: r.tournamentEventDivision.division.divisionType.name,
      divisionRank: r.tournamentEventDivision.division.beltRank.beltColor,
      divisionBeltOrder: r.tournamentEventDivision.division.beltRank.sortOrder,
      minAge: r.tournamentEventDivision.division.divisionType.minAge,
      maxAge: r.tournamentEventDivision.division.divisionType.maxAge,

      eventName: r.tournamentEventDivision.tournamentEvent.event.name
    }))
  )
}, [registrations])
if(!participantLoading){
  console.log("Participant loading is complete:", JSON.stringify(registrations, null, 2));
}
  
   const table = useReactTable({
       data: flattened ?? [],
       columns,
       getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
      filterFns: {
    fuzzy: () => true, // placeholder
  },
    },
   );   


const fullNameColumn = table.getColumn("fullName")

  return (
    <div className="min-h-screen bg-gray-900 p-6">
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-white">Manage Participants for Tournament ID: {tournamentId}</h2>
      <div className="mb-4 flex flex-wrap gap-4 text-white" >

        {/* <Filter column={table.getColumn("firstName")!} placeholder="Search first name" />
        <Filter column={table.getColumn("lastName")!} placeholder="Search last name" /> */}
        <Filter column={fullNameColumn!} placeholder="Search full name" />
        <FilterBar table={table} />
</div>

{table.getState().columnFilters.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-4">
    
    {table.getState().columnFilters.flatMap(filter => {
      const column = table.getColumn(filter.id)
      const values = Array.isArray(filter.value) ? filter.value : [filter.value]
      if (filter.id === "fullName") return null
      
      if (filter.id === "divisionRank") {
      }
      return values.map(v => {
        let color:BeltColor = "Blue"
        if (filter.id === "divisionRank" && isBeltColor(v as string)) {
          color = v as BeltColor
        }
        return (  
          <PillButton
            key={`${filter.id}-${v}`}
            color={color}
            onRemove={() => {
              if (column) {
                const newValues = values.filter(val => val !== v)
                if (newValues.length === 0) {
                  column.setFilterValue(undefined)
                } else {
                  column.setFilterValue(newValues)
                }
              }
            }}
          >
            {String(v)}
          </PillButton>
        )
      })
    })}
     <button
                          onClick={() => table.resetColumnFilters()}
                          disabled={table.getState().columnFilters.length === 0}
                          className={`px-3 py-1 rounded transition ${table.getState().columnFilters.length === 0
                                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                              }`}
                      >
                          Clear Filters
                      </button>
  </div>
)}

      <div className="overflow-x-auto overflow-y-auto rounded-lg border border-gray-700 min-h-[200px] max-h-[60vh]">
                  <div className="flex items-center justify-end gap-3 mb-2">
                      
                     

                      
                  </div>
       {!participantLoading ? (
        <table className="w-full text-sm text-gray-200">
            <thead  className="bg-gray-800 text-gray-100">
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} colSpan={header.colSpan} className="px-4 py-3 text-left relative overflow-visible">
                                {header.isPlaceholder ? null : (
                                    <div className="flex items-center gap-2">
                                        {flexRender(header.column.columnDef.header, header.getContext())}

                                        
                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody  className="divide-y divide-gray-700">
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-800 transition-colors">
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-3">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                 {table.getRowModel().rows.length === 0 && (
                                  <tr>
                                      <td
                                          colSpan={table.getAllLeafColumns().length}
                                          className="px-4 py-6 text-center text-gray-400"
                                      >
                                          No participants match your filters
                                      </td>
                                  </tr>
                              )}
            </tbody>
        </table>
) : (
  <p className="text-white">Loading participants...</p>
)}
         </div>
          <div className="h-4" />
      <div className="flex flex-wrap items-center gap-2 text-gray-200">
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="w-16 px-2 py-1 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          className="px-2 py-1 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 text-gray-400">
        {table.getPrePaginationRowModel().rows.length} Participants
      </div>
    </div>
    </div>
  );
}




type FilterBarProps = {
  table: Table<any>
}

function FilterBar({ table }: FilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="relative">
      {/* This button stays inline with the inputs */}
      <button
        onClick={() => setIsFilterOpen(o => !o)}
        aria-label={isFilterOpen ? "Close filters" : "Open filters"}
        aria-expanded={isFilterOpen}
        className={
          isFilterOpen
            ? "text-blue-400 hover:text-blue-300 transition"
            : "text-gray-300 hover:text-white transition"
        }
      >
        {isFilterOpen ? <FilterX size={16} /> : <FilterIcon size={16} />}
      </button>

      {/* This panel appears BELOW the row, not inline */}
      {isFilterOpen && (
        <div className="absolute left-0 mt-2 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 w-max">
          <div className="flex flex-wrap gap-4">
            {table.getColumn("divisionName") && (
              <CheckboxFilter
                column={table.getColumn("divisionName")!}
                options={['junior', 'adult', 'masters', 'senior', 'pee-wee', 'youth']}
              />
            )}

            {table.getColumn("eventName") && (
              <CheckboxFilter
                column={table.getColumn("eventName")!}
                options={['Kumite', 'Kata']}
              />
            )}

            {table.getColumn("divisionRank") && (
              <CheckboxFilter
                column={table.getColumn("divisionRank")!}
                options={['White', 'Yellow', 'Orange', 'Green','Purple', 'Blue', 'Brown', 'Black']}
              />
            )}

            {table.getColumn("participantGender") && (
              <CheckboxFilter
                column={table.getColumn("participantGender")!}
                options={['Male', 'Female', 'Coed']}
              />
            )}

            {table.getColumn("isPaid") && (
              <CheckboxFilter
                column={table.getColumn("isPaid")!}
                options={[true, false]}
                labels={{ true: "Paid", false: "Unpaid" }}
              />
            )}
          </div>
        </div>
      )}
      
     
    </div>
  )
}

// function DebouncedInput({
//   value: initialValue,
//   onChange,
//   debounce = 500,
//   ...props
// }: {
//   value: string | number
//   onChange: (value: string | number) => void
//   debounce?: number
// } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
//   const [value, setValue] = useState(initialValue)

//   useEffect(() => {
//     setValue(initialValue)
//   }, [initialValue])

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       onChange(value)
//     }, debounce)

//     return () => clearTimeout(timeout)
//   }, [value])

//   return (
//     <input
//       {...props}
//       value={value}
//       onChange={(e) => setValue(e.target.value)}
//     />
//   )
// }




function Filter({ column, placeholder }: { column: Column<any, unknown>, placeholder?: string }) {
  const columnFilterValue = column.getFilterValue()

  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={placeholder ?? `Search...`}
      className="px-2 py-1 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
    />
  )
}

type PillButtonProps = {
  children: React.ReactNode
  onRemove: () => void
  color?: BeltColor
  size?: PillSize
}

export function PillButton({
  children,
  onRemove,
  color = "Blue",
  size = "md",
}: PillButtonProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        ${sizeClasses[size]}
        ${beltColors[color]}
      `}
    >
      <span>{children}</span>

          <button
        type="button"
        onClick={onRemove}
        className="
          ml-1 p-0.5 rounded-full
          text-white
          hover:bg-white/20
          focus:outline-none
          flex items-center justify-center
        "
      >

        <X size={12} strokeWidth={2} />
      </button>
    </span>
  )
}
