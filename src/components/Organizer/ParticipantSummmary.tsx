import { getParticipantSummary } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { normalizeName } from "@/helpers/stringHelpers";

interface ParticipantEvent {
  eventId: number;
  eventRegistered: string;
  participantEventId: number;
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
      participantEventId: row.participantEventId
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
        <div className="overflow-x-auto overflow-y-auto rounded-lg border border-gray-700 min-h-[200px] max-h-[60vh]">
          <ParticipantTable participants={participants} />
        </div>
      </div>
    </div>
  );
}

const columns: ColumnDef<GroupedParticipant>[] = [
  {
    id: "fullName",
    header: "Name",
    accessorFn: (row) => normalizeName(`${row.firstName} ${row.lastName}`),
    cell: ({ row, getValue }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={row.getToggleExpandedHandler()}
          className="text-lg leading-none"
        >
          {row.getIsExpanded() ? "👇" : "👉"}
        </button>
        <span className="font-medium text-gray-100">
          {getValue<string>()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "paid",
    header: "Paid",
    cell: ({ row, getValue }) => {
      const paid = getValue<boolean>();
      return (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={paid}
            onChange={() => {
              // TODO: wire to API
              // togglePaid(row.original)
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
    cell: ({ row, getValue }) => {
      const checkedIn = getValue<boolean>();
      return (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checkedIn}
            onChange={() => {
              // TODO: wire to API
              // toggleCheckedIn(row.original)
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
import type { ExpandedState } from "@tanstack/react-table";

export function ParticipantTable({
  participants,
  onEditParticipant,
}: {
  participants: GroupedParticipant[];
  onEditParticipant?: (p: GroupedParticipant) => void;
}) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const myColumns = useMemo<ColumnDef<GroupedParticipant>[]>(
    () => columns,
    []
  );

  const table = useReactTable<GroupedParticipant>({
    data: participants,
    columns: myColumns,
    state: { expanded },
    getRowId: (row) => String(row.participantId),
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    filterFns: {
      fuzzy: () => true, // placeholder
    },
  });

  return (
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
                              {ev.eventRegistered}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        className="rounded bg-sky-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600"
                        onClick={() => onEditParticipant?.(row.original)}
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
  );
}
