import { useMemo, useState } from "react";
import { getTournamentEventSummary } from "@/api/tournaments";
import type { EventSummary, TournamentEventSummary } from "@shared";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type FilterFn,
} from "@tanstack/react-table";
import { Accordion } from "../Custom/Accordian";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// Required by module augmentation in demo/table.tsx
const fuzzyFilter: FilterFn<any> = () => true;

export function TournamentSummary({ tournamentId }: { tournamentId: number }) {
  const { data, isLoading } = useQuery<TournamentEventSummary>({
    queryKey: ["tournament-summary", tournamentId],
    queryFn: () => getTournamentEventSummary(tournamentId),
  });

  const eventsByType = useMemo(() => {
    if (!data?.events) return new Map<string, EventSummary[]>();
    
    return data.events.reduce((acc, event) => {
      const existing = acc.get(event.eventType) ?? [];
      existing.push(event);
      acc.set(event.eventType, existing);
      return acc;
    }, new Map<string, EventSummary[]>());
  }, [data?.events]);

  const sortedEventTypes = useMemo(() => {
    return Array.from(eventsByType.entries()).sort(([, a], [, b]) => {
      const aOrder = a[0]?.eventOrder ?? 999;
      const bOrder = b[0]?.eventOrder ?? 999;
      return aOrder - bOrder;
    });
  }, [eventsByType]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <p className="text-gray-200">Loading tournament summary...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <p className="text-gray-200">No data found for this tournament.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-semibold mb-6 text-white">
        Event Summary for {data.tournamentName} - {data.tournamentId}
      </h1>

      <div className="space-y-4">
        {sortedEventTypes.map(([eventType, events]) => (
          <Accordion key={eventType} title={eventType}>
            <div className="bg-gray-900 -mx-4 -my-3 px-4 py-3">
              <EventSummaryTable data={events} />
            </div>
          </Accordion>
        ))}
      </div>
    </div>
  );
}

const columns: ColumnDef<EventSummary>[] = [
  {
    accessorKey: "eventCode",
    header: "Code",
  },
  {
    accessorKey: "divisionName",
    header: "Division",
  },
  {
    accessorKey: "beltColor",
    header: "Belt",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "minAge",
    header: "Min Age",
  },
  {
    accessorKey: "maxAge",
    header: "Max Age",
  },
];

function EventSummaryTable({ data }: { data: EventSummary[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "minAge", desc: false },
    { id: "beltRankOrder", desc: false },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: { fuzzy: fuzzyFilter },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm text-gray-200">
          <thead className="bg-gray-800 text-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        role="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="ml-1">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp size={14} />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} />
                          )}
                        </span>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-800 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  No divisions found for this event
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center gap-2 text-gray-200 mt-4">
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 px-2 py-1 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
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
    </div>
  );
}