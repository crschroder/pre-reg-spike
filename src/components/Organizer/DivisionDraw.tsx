import { useAtomValue } from "jotai";
import { selectedRegistrationsAtom } from "@/store/selectedRegistrations";
import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Pill } from "../Custom/Pill";
import { isBeltColor } from "@/datatypes/belt-colors";

type RegistrationRow = {
  id: number;
  firstName: string;
  lastName: string;
  participantGender: string;
  participantRank: string;
  divisionName: string;
  eventName: string;
  eventDislayName: string;
};

export function DivisionDraw() {
  const selected = useAtomValue(selectedRegistrationsAtom);

  const columns = useMemo<ColumnDef<RegistrationRow>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Full Name",
        accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.eventDislayName }`,
        id: "fullName",
        cell: (info) => info.getValue(),
      },
      {
        header: "Gender",
        accessorKey: "participantGender",
      },
      {
        header: "Rank",
        accessorKey: "participantRank",
        cell: ({ row }) => {
          const color = row.original.participantRank;
          if (isBeltColor(color)) {
            return <Pill color={color}>{color}</Pill>;
          }
          return <span>{color}</span>;
        },
      },
      {
        header: "Division",
        accessorKey: "divisionName",
      },
      {
        header: "Event",
        accessorKey: "eventName",
      },
    ],
    []
  );

  const table = useReactTable({
    data: selected ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h2 className="text-2xl font-semibold mb-4">Selected Registrations</h2>
      {selected.length === 0 ? (
        <p>No registrations selected.</p>
      ) : (
        <table className="w-full text-sm text-gray-200 border border-gray-700 rounded">
          <thead className="bg-gray-800">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
