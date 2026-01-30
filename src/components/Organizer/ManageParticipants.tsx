import { getTournamentRegistrations } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  Column
} from "@tanstack/react-table";

// import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { useMemo, useState } from "react";
import { CheckboxFilter } from "../Custom/CheckboxFilter";
import { CheckboxFilterPopover } from "../Custom/CheckBoxFilterPopover";


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
            {
                header: 'First Name',
                accessorKey: 'firstName',
            },
            {
                header: 'Last Name',
                accessorKey: 'lastName',
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
                header: 'Paid',
                accessorKey: 'isPaid',
                cell: ({ getValue }) => {
                    const value = getValue<boolean>()
                    return value ? "Paid" : "Unpaid"
                },
                 filterFn: (row, columnId, filterValue) => {
                    if (!filterValue || filterValue.length === 0) return true
                    return filterValue.includes(row.getValue(columnId))
                },
            },
        ],
        []
    );

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
      divisionName: r.tournamentEventDivision.division.name,
      divisionRank: r.tournamentEventDivision.division.beltRank.beltColor,
      divisionBeltOrder: r.tournamentEventDivision.division.beltRank.sortOrder,
      minAge: r.tournamentEventDivision.division.minAge,
      maxAge: r.tournamentEventDivision.division.maxAge,

      eventName: r.tournamentEventDivision.tournamentEvent.event.name
    }))
  )
}, [registrations])

  
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



  return (
    <div className="min-h-screen bg-gray-900 p-6">
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-white">Manage Participants for Tournament ID: {tournamentId}</h2>
       <div className="overflow-x-auto overflow-y-visible rounded-lg border border-gray-700 min-h-[200px]">
                  <div className="flex items-center justify-end gap-3 mb-2">
                      {table.getState().columnFilters.length > 0 && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Filters active
                          </span>
                      )}
                      

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

                                        {header.column.id === 'divisionName' && (
                                            <CheckboxFilterPopover
                                                column={header.column}
                                                options={['junior', 'adult', 'masters', 'senior', 'pee-wee', 'youth']}
                                            />
                                        )}
                                         {header.column.id === 'eventName' && (
                                            <CheckboxFilterPopover
                                                column={header.column}
                                                options={['Kumite', 'Kata']}
                                            />
                                        )}
                                        {header.column.id === 'divisionRank' && (
                                            
                                                <CheckboxFilterPopover
                                                column={header.column}
                                                options={['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black']}
                                            />
                                        
                                        )}
                                        {header.column.id === 'participantGender' && (
                                            <CheckboxFilterPopover
                                                column={header.column}
                                                options={['Male', 'Female', 'Coed']}
                                            />
                                        )}
                                        {header.column.id === 'isPaid' && (
                                            <CheckboxFilterPopover
                                                column={header.column}
                                                options={[true, false]}
                                                labels={{
                                                    true: "Paid",
                                                    false: "Unpaid"
                                                }}
                                            />
                                        )}
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
    </div>
    </div>
  );
}



