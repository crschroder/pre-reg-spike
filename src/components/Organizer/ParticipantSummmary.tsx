import { getParticipantSummary } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable, getPaginationRowModel, getFilteredRowModel, Row } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { normalizeName } from "@/helpers/stringHelpers";
import { useNavigate } from "@tanstack/react-router";

interface ParticipantEvent {
  eventId: number;
  eventRegistered: string;
  participantEventId: number;
  displayName?: string;
}

interface GroupedParticipant {
  userEmail: string;
  userId: number;
  participantId: number;
  firstName: string;
  lastName: string;
  age: number;
  beltColor: string;
  participantGender: string;
  participantDivisionType: string;
  paid: boolean;
  checkedIn: boolean;
  tournamentId: number;
  genderId: number;
  events: ParticipantEvent[];
}

export interface ParticipantSummaryRow {
  userEmail: string;
  userId: number;
  participantId: number;
  firstName: string;
  lastName: string;
  age: number;
  beltColor: string;
  participantGender: string;
  participantDivisionType: string;
  paid: boolean;
  checkedIn: boolean;
  eventRegistered: string;
  tournamentId: number;
  eventId: number;
  participantEventId: number;
  genderId: number;
  displayName?: string;
}

export function groupParticipants(rows: ParticipantSummaryRow[]): GroupedParticipant[] {
  const map = rows.reduce((acc, row) => {
    const id = row.participantId;
    if (!acc[id]) {
      acc[id] = {
        userEmail: row.userEmail,
        userId: row.userId,
        participantId: row.participantId,
        firstName: row.firstName,
        lastName: row.lastName,
        age: row.age,
        beltColor: row.beltColor,
        participantGender: row.participantGender,
        participantDivisionType: row.participantDivisionType,
        paid: row.paid,
        checkedIn: row.checkedIn,
        tournamentId: row.tournamentId,
        genderId: row.genderId,
        events: []
      };
    }
    acc[id].events.push({
      eventId: row.eventId,
      eventRegistered: row.eventRegistered,
      participantEventId: row.participantEventId,
      displayName: row.displayName
    });
    return acc;
  }, {} as Record<number, GroupedParticipant>);
  return Object.values(map);
}

export function ParticipantSummary({ tournamentId }: { tournamentId: number }) {
  const { data: rows, isLoading } = useQuery<ParticipantSummaryRow[]>({
    queryKey: ['participant-summary', tournamentId],
    queryFn: () => getParticipantSummary(tournamentId),
  })
  const participants = useMemo(() => {
    if (!rows) return []
    return groupParticipants(rows)
  }, [rows])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        Loading participants...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div>
        <h2 className="text-3xl font-semibold mb-6 text-white">Participants</h2>
        {/* <div className="overflow-x-auto overflow-y-auto rounded-lg border border-gray-700 min-h-[200px] max-h-[60vh]"> */}
          <ParticipantTable participants={participants} />
        {/* </div> */}
      </div>
    </div>
  );
}


function useParticipantTableColumns() {
  const updatePaid = useUpdateParticipantPaid();
  const updateCheckedIn = useToggleCheckInParticipant();
  return [
    {
      id: "fullName",
      header: "Name",
      accessorFn: (row: GroupedParticipant) => normalizeName(`${row.firstName} ${row.lastName}`),
      cell: ({ row, getValue }: { row: Row<GroupedParticipant>; getValue: () => any }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            className="text-lg leading-none"
          >
            {row.getIsExpanded() ? "👇" : "👉"}
          </button>
          {/* <span className="font-medium text-gray-100">
            {getValue()}
          </span> */}
          <Pill color={row.original.beltColor as any}>{getValue()}</Pill>
        </div>
      ),
    },
    {
      accessorKey: "paid",
      header: "Paid",
      cell: ({
        row,
        getValue,
      }: {
        row: Row<GroupedParticipant>;
        getValue: () => any;
      }) => {
        const paid = getValue();
        return (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={paid}
              disabled={updatePaid.isPending}
              onChange={() => {
                updatePaid.mutate({
                  participantId: row.original.participantId,
                  paid: !paid,
                  tournamentId: row.original.tournamentId
                });
              }}
              className="sr-only peer"
            />
            <div
              className={
                "w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:bg-emerald-600 transition-all relative"
              }
            >
              <span
                className={
                  "absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all " +
                  (paid ? "translate-x-5" : "")
                }
              ></span>
            </div>
            <span className="ml-2 text-xs font-medium text-gray-200">
              {paid ? "Yes" : "No"}
            </span>
          </label>
        );
      },
    },
    {
      accessorKey: "checkedIn",
      header: "Checked In",
      cell: ({
        row,
        getValue,
      }: {
        row: Row<GroupedParticipant>;
        getValue: () => any;
      }) => {
        const checkedIn = getValue();
        return (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checkedIn}
              disabled={updateCheckedIn.isPending}
              onChange={() => {
                updateCheckedIn.mutate({
                  participantId: row.original.participantId,
                  checkedIn: !checkedIn,
                  tournamentId: row.original.tournamentId
                });
              }}
              className="sr-only peer"
            />
            <div
              className={
                "w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-500 rounded-full peer peer-checked:bg-sky-600 transition-all relative"
              }
            >
              <span
                className={
                  "absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all " +
                  (checkedIn ? "translate-x-5" : "")
                }
              ></span>
            </div>
            <span className="ml-2 text-xs font-medium text-gray-200">
              {checkedIn ? "Yes" : "No"}
            </span>
          </label>
        );
      },
    },
  ];
}
import type { ExpandedState, Table } from "@tanstack/react-table";
import { useToggleCheckInParticipant, useUpdateParticipantPaid } from "@/hooks/updateParicipant";
import { DebouncedInput } from "../Custom/DebouncedInput";
import { Toggle } from "../Custom/Toggle";
import { ToggleButton } from "../Custom/ToggleButton";
import { SegmentedButton } from "../Custom/SegmentedButton";
import { Pill } from "../Custom/Pill";

export function ParticipantTable({
  participants,
  onEditParticipant,
}: {
  participants: GroupedParticipant[];
  onEditParticipant?: (p: GroupedParticipant) => void;
}) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const myColumns = useParticipantTableColumns();

  const table = useReactTable<GroupedParticipant>({
    data: participants,
    columns: myColumns,
    state: { expanded, pagination },
    onPaginationChange: setPagination,
    getRowId: (row) => String(row.participantId),
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
     getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: () => true, // placeholder
    },
     autoResetPageIndex: false,
  });

  const navigate = useNavigate();

  const editDetails = function (tournamentId: number, participantId: number) {
    navigate({
      to: `/tournament/participant/register/${tournamentId}/update-participant/${participantId}`,      
    });
  }

  return (
    <>
    <FilterBar table={table} />
      <div className="h-4" />
    <div className="overflow-x-auto overflow-y-auto rounded-lg border border-gray-700 min-h-[200px] max-h-[60vh]">
      
      <table className="w-full text-sm text-gray-200">
        <thead className="sticky top-0 z-10 bg-gray-800 text-gray-100">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left relative overflow-visible"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr className="hover:bg-gray-800 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>

              {row.getIsExpanded() && (
                <tr className="bg-gray-900/70">
                  <td
                    colSpan={table.getVisibleLeafColumns().length}
                    className="px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 text-sm text-gray-200">
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <div className="text-xs text-gray-400">Email</div>
                          <div>{row.original.userEmail}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Age</div>
                          <div>{row.original.age}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Belt</div>
                          <div>{row.original.beltColor}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Gender</div>
                          <div>{row.original.participantGender}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Division</div>
                          <div>
                            {normalizeName(row.original.participantDivisionType)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs text-gray-400">
                          Events Registered
                        </div>
                        {row.original.events.length === 0 ? (
                          <div className="text-xs text-gray-400">
                            No events registered
                          </div>
                        ) : (
                          <ul className="list-disc pl-5">
                            {row.original.events.map((ev) => (
                              <li key={ev.participantEventId}>
                                {ev.eventRegistered} - {ev.displayName?.toLocaleUpperCase()}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          className="rounded bg-sky-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600"
                          onClick={() => editDetails(row.original.tournamentId, row.original.participantId)}
                        >
                          Edit details
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}

          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td
                colSpan={table.getAllLeafColumns().length}
                className="px-4 py-6 text-center text-gray-400"
              >
                No participants found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
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
        {table.getPrePaginationRowModel().rows.length} Selected Participants
        {}
      </div>
       <div className="mt-4 text-gray-400">
        
        {table.getPreSelectedRowModel().rows.length} Total Participants
      </div>
      </>
  );
}

type FilterBarProps = {
  table: Table<any>
}

function FilterBar({ table }: FilterBarProps) {
  const nameColumn = table.getColumn("fullName");
  const columnFilterValue = nameColumn?.getFilterValue()
  const [paidFilterValue, setPaidFilterValue] = useState(0); // 0 = all, 1 = not paid, 2 = paid
  const [checkedInFilterValue, setCheckedInFilterValue] = useState(0); // 0 = all, 1 = not checked in, 2 = checked in

  const onPaidFilterChange = (value: number) => {
    // 0 = all, 1 = not paid, 2 = paid
    if (value === 0) {
      table.setColumnFilters(old => old.filter(f => f.id !== "paid"))
    } else if (value === 1) {
      table.setColumnFilters(old => [...old.filter(f => f.id !== "paid"), { id: "paid", value: false }])
    } else if (value === 2) {
      table.setColumnFilters(old => [...old.filter(f => f.id !== "paid"), { id: "paid", value: true }])
    }
    setPaidFilterValue(value);

  }

  const onCheckedInFilterChange = (value: number) => {
    // 0 = all, 1 = not checked in, 2 = checked in
    if (value === 0) {
      table.setColumnFilters(old => old.filter(f => f.id !== "checkedIn"))
    } else if (value === 1) {
      table.setColumnFilters(old => [...old.filter(f => f.id !== "checkedIn"), { id: "checkedIn", value: false }])
    } else if (value === 2) {
      table.setColumnFilters(old => [...old.filter(f => f.id !== "checkedIn"), { id: "checkedIn", value: true }])
    }
    setCheckedInFilterValue(value);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-4" text-white>

   
    <div className="flex items-center gap-2">
      <DebouncedInput
      
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={(value) => nameColumn?.setFilterValue(value)}
        placeholder="Search by name..."
        className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
     
    <SegmentedButton
      value={paidFilterValue}
      onChange={onPaidFilterChange}
      labels={["All","Not Paid","Paid"]}
      
    />
    <SegmentedButton
      value={checkedInFilterValue}
      onChange={onCheckedInFilterChange}
      labels={["All","Not Checked In","Checked In"]}
    />
    </div>
  );
}

