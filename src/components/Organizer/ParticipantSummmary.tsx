import { getParticipantSummary } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, TableOptions, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";


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

//   const columns = useMemo<ColumnDef<GroupedParticipant>[]>(() => [
//   {
//         accessorFn: (row) => `${row.firstName} ${row.lastName}`,
//         id: 'fullName',
//         header: 'Full Name',
//         cell: (info) => info.getValue(), 
//         filterFn: "includesString"      
//       },
//       {header: 'Email', accessorKey: 'userEmail' },
//       {header: 'Age', accessorKey: 'age' },
//       {header: 'Belt Color', accessorKey: 'beltColor' },
// ], [])



  if (isLoading) {
    return <div>Loading…</div>
  }

  return (
    <div>
      <h2>Participants</h2>
      <ParticipantTable participants={participants} />
    </div>
  )
}

const columns: ColumnDef<GroupedParticipant>[] = [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const p = row.original;

      return (
        <div style={{ paddingLeft: `${row.depth * 1.5}rem` }}>
          <button
            onClick={row.getToggleExpandedHandler()}
            style={{ cursor: "pointer", marginRight: "0.5rem" }}
          >
            {row.getIsExpanded() ? "👇" : "👉"}
          </button>

          {p.firstName} {p.lastName}

          {row.getIsExpanded() && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                background: "#f7f7f7",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <strong>Events Registered</strong>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                {p.events.map((ev) => (
                  <li key={ev.participantEventId}>{ev.eventRegistered}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    },
  },

  { accessorKey: "age", header: "Age" },
  { accessorKey: "beltColor", header: "Belt" },
];
import type { ExpandedState } from "@tanstack/react-table";

export function ParticipantTable({ participants }: { participants: GroupedParticipant[] }) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable<GroupedParticipant>({
    data: participants,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
     filterFns: {
    fuzzy: () => true, // placeholder
  },
  // sortingFns: {},
  // globalFilterFn: undefined,

  } satisfies TableOptions<GroupedParticipant>);

  return (
    <table className="min-w-full border">
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((header) => (
              <th key={header.id} className="border p-2">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="border p-2 align-top">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
