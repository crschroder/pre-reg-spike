import { getTournamentRegistrations } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  Column,
  Table
} from "@tanstack/react-table";

// import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { useEffect, useMemo, useState } from "react";
import { CheckboxFilter } from "../Custom/CheckboxFilter";
//import { CheckboxFilterPopover } from "../Custom/CheckBoxFilterPopover";
import { ListFilterPlus } from "lucide-react";

const beltColors = {
  White: "bg-gray-200 text-black",
  Yellow: "bg-yellow-400 text-black",
  Orange: "bg-orange-500 text-white",
  Green: "bg-green-600 text-white",
  Purple: "bg-purple-600 text-white",
  Blue: "bg-blue-600 text-white",
  Brown: "bg-amber-800 text-white",
  Black: "bg-black text-white",
} as const;

type BeltColor = keyof typeof beltColors;

function isBeltColor(value: string): value is BeltColor {
  return value in beltColors;
}


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


export function ManageParticipants({ tournamentId }: { tournamentId: number }) {
   
    const [showFilters, setShowFilters] = useState(true);

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
      <div className="mb-4 flex flex-wrap gap-4" text-white>

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

        //   <button
        //     onClick={() => {
        //       // Remove just this one value
        //       if (column) {
        //         const newValues = values.filter(val => val !== v)
        //         if (newValues.length === 0) {
        //           column.setFilterValue(undefined)
        //         } else {
        //           column.setFilterValue(newValues)
        //         }
        //       }
        //     }}
        //     className="text-white hover:text-gray-200"
        //   >
        //     ✕
        //   </button>
        // </span>
        
      )})
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

       <div className="overflow-x-auto overflow-y-visible rounded-lg border border-gray-700 min-h-[200px]">
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
  <p className="text-white-100">Loading participants...</p>
)}
         </div>
    </div>
    </div>
  );
}




type FilterBarProps = {
  table: Table<any>
}

function FilterBar({ table }: FilterBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* This button stays inline with the inputs */}
      <button
        onClick={() => setOpen(o => !o)}
        className="text-gray-300 hover:text-white transition"
      >
        <ListFilterPlus size={16} />
      </button>

      {/* This panel appears BELOW the row, not inline */}
      {open && (
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

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}




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


const sizeClasses = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-3 py-1 gap-1",
  lg: "text-base px-4 py-1.5 gap-2",
} as const;




type PillProps = {
  size?: keyof typeof sizeClasses;
  color: keyof typeof beltColors;
  children: React.ReactNode;
};

export function Pill({ size = "md", color, children }: PillProps) {
  return (
    <span
      className={`
        inlineflex items-center rounded-full
        ${sizeClasses[size]}
        ${beltColors[color]}
      `}
    >
      {children}
    </span>
  );
}

import { X } from "lucide-react"

type PillButtonProps = {
  children: React.ReactNode
  onRemove: () => void
  color?: keyof typeof beltColors
  size?: keyof typeof sizeClasses
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
