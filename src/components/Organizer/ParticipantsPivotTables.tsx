import { useMemo } from "react";
import { Pill } from "../Custom/Pill";
import { isBeltColor } from "@/datatypes/belt-colors";

export type ParticipantPivotRow = {
  divisionGender: string;
  divisionName: string;
  divisionRank: string;
  divisionBeltOrder: number;
  minAge: number;
  eventName: string;
};

const PIVOT_DIVISION_ORDER = [
  "junior",
  "adult",
  "masters",
  "senior",
  "pee-wee",
  "youth",
] as const;

const PIVOT_GENDER_ORDER = ["Male", "Female", "Coed"] as const;

type PivotGender = (typeof PIVOT_GENDER_ORDER)[number];

type PivotDivision = (typeof PIVOT_DIVISION_ORDER)[number];

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toPivotDivision(divisionName: string): PivotDivision | null {
  const key = normalizeKey(divisionName);
  return (PIVOT_DIVISION_ORDER as readonly string[]).includes(key)
    ? (key as PivotDivision)
    : null;
}

function toPivotGender(genderName: string): PivotGender | null {
  const key = String(genderName ?? "").trim().toLowerCase();

  if (key === "male") return "Male";
  if (key === "female") return "Female";
  if (key === "coed") return "Coed";

  return null;
}

export function ParticipantsPivotTables({ data }: { data: ParticipantPivotRow[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <ParticipantsPivotTable data={data} eventName="Kata" />
      <ParticipantsPivotTable data={data} eventName="Kumite" />
    </div>
  );
}

export function ParticipantsPivotTable({
  data,
  eventName,
}: {
  data: ParticipantPivotRow[];
  eventName: string;
}) {
  const { ranks, divisions, pivot, total } = useMemo(() => {
    const filtered = (data ?? []).filter(
      (row) => normalizeKey(row.eventName) === normalizeKey(eventName),
    );

    // rank -> division -> gender -> count
    const pivotMap = new Map<
      string,
      Map<PivotDivision, Record<PivotGender, number>>
    >();

    // division -> minAge (for ordering the header columns)
    const divisionMinAge = new Map<PivotDivision, number>();

    // Keep belt order for sorting ranks
    const rankOrder = new Map<string, number>();

    for (const row of filtered) {
      const division = toPivotDivision(row.divisionName);
      if (!division) continue;

      if (!divisionMinAge.has(division)) {
        divisionMinAge.set(division, Number.isFinite(row.minAge) ? row.minAge : 999);
      } else {
        const current = divisionMinAge.get(division) ?? 999;
        const next = Number.isFinite(row.minAge) ? row.minAge : 999;
        if (next < current) divisionMinAge.set(division, next);
      }

      const gender = toPivotGender(row.divisionGender);
      if (!gender) continue;

      const rank = String(row.divisionRank ?? "").trim();
      if (!rank) continue;

      if (!rankOrder.has(rank)) {
        rankOrder.set(
          rank,
          Number.isFinite(row.divisionBeltOrder) ? row.divisionBeltOrder : 999,
        );
      }

      let divisionMap = pivotMap.get(rank);
      if (!divisionMap) {
        divisionMap = new Map();
        pivotMap.set(rank, divisionMap);
      }

      let genderCounts = divisionMap.get(division);
      if (!genderCounts) {
        genderCounts = { Male: 0, Female: 0, Coed: 0 };
        divisionMap.set(division, genderCounts);
      }

      genderCounts[gender] = (genderCounts[gender] ?? 0) + 1;
    }

    const rankList = Array.from(pivotMap.keys()).sort((a, b) => {
      const aOrder = rankOrder.get(a) ?? 999;
      const bOrder = rankOrder.get(b) ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.localeCompare(b);
    });

    const divisionList = Array.from(PIVOT_DIVISION_ORDER).sort((a, b) => {
      const aAge = divisionMinAge.get(a) ?? Number.POSITIVE_INFINITY;
      const bAge = divisionMinAge.get(b) ?? Number.POSITIVE_INFINITY;
      if (aAge !== bAge) return aAge - bAge;
      return a.localeCompare(b);
    });

    return {
      ranks: rankList,
      divisions: divisionList,
      pivot: pivotMap,
      total: filtered.length,
    };
  }, [data, eventName]);

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 px-4 py-3">
        <div className="text-white font-semibold">{eventName} Summary</div>
        <div className="text-gray-300 text-sm">Total registrations: {total}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm text-gray-200">
          <thead className="bg-gray-900/40 text-gray-100">
            <tr>
              <th className="px-3 py-2 text-left whitespace-nowrap w-40 text-sm">
                Division Rank
              </th>
              {divisions.map((division) => (
                <th
                  key={division}
                  className="px-2 py-2 text-center whitespace-nowrap capitalize w-24 text-sm"
                >
                  {division}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {ranks.map((rank) => (
              <tr key={rank} className="hover:bg-gray-800/50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {isBeltColor(rank) ? (
                      <Pill color={rank}>{rank}</Pill>
                    ) : (
                      <span>{rank}</span>
                    )}
                  </div>
                </td>

                {divisions.map((division) => {
                  const genderCounts =
                    pivot.get(rank)?.get(division) ??
                    ({ Male: 0, Female: 0, Coed: 0 } as Record<PivotGender, number>);

                  return (
                    <td
                      key={`${rank}-${division}`}
                      className="px-2 py-2 align-top text-center"
                    >
                      <div className="text-xs leading-5 space-y-0 tabular-nums">
                        <div>
                          <span className="text-gray-400">M:</span> {genderCounts.Male}
                        </div>
                        <div>
                          <span className="text-gray-400">F:</span> {genderCounts.Female}
                        </div>
                        <div>
                          <span className="text-gray-400">C:</span> {genderCounts.Coed}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {ranks.length === 0 && (
              <tr>
                <td
                  colSpan={1 + divisions.length}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  No data for {eventName}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
