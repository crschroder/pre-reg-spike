import { getEventTypes } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { Accordion } from "../Custom/Accordian";
import { useAllowedDivisions } from "@/hooks/useAllowedDivisions";
import { useState } from "react";
import { Division } from "prisma/shared/division";
import { Toggle } from "../Custom/Toggle";

type Props = { tournamentId?: string };

interface EventType {
  id: number;
  name: string;
}

export default function CreateEvents({tournamentId} : Props){

    const { data: eventTypes, isLoading: isLoadingEventTypes } = useQuery<EventType[]>({
      queryKey: ["eventTypes"],
      queryFn: () => getEventTypes(),
    });

    const [divisionSettings, setDivisionSettings] = useState<Record<number, boolean>>({});

  function toggleCoed(divisionId: number) {
    setDivisionSettings(prev => ({
      ...prev,
      [divisionId]: !prev[divisionId]
    }));
  }

    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
        <div></div>
        <div className="p-8 w-full max-w-4xl">
          <h1 className="text-xl font-semibold mb-6">
            Create Events for tournament ID: {tournamentId}
          </h1>
          <div className="space-y-6">
       {isLoadingEventTypes ? (
  <p>Loading event types...</p>
) : (
  eventTypes?.map((et: EventType) => (
    <Accordion key={et.id} title={et.name}>
      <div className="max-h-64 overflow-y-auto pr-2">
      <AllowedDivisions eventId={et.id} divisionSettings={divisionSettings} toggleCoed={toggleCoed} />
      </div>
    </Accordion>
  ))
)}
          </div>
        </div>
      </div>
    )
} 

export interface AllowedDivisionsProps {
  eventId: number;
  divisionSettings: Record<number, boolean>; // divisionId → coed true/false
  toggleCoed: (divisionId: number) => void;
}

function AllowedDivisions({ eventId, divisionSettings, toggleCoed }: AllowedDivisionsProps) {
  const { data: divisions =[], isLoading, error } = useAllowedDivisions(eventId);

  if (isLoading) return <p className="text-gray-400">Loading divisions...</p>;
  if (error) return <p className="text-red-400">Error loading divisions</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {divisions.map((division: Division) => (
        <div
          key={division.id}
          className="bg-gray-800 p-3 rounded flex flex-col gap-2"
        >
          <div className="text-sm font-medium text-gray-100">
            {division.name} — {division.beltRank?.color || "No Color"}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Toggle
              checked={divisionSettings[division.id] ?? false}
              onChange={() => toggleCoed(division.id)}
            />
            <span>Male/Female Combined</span>
          </label>
        </div>
      ))}
    </div>
  );
}