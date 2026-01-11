import { getEventTypes, getTournamentEvents } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { Accordion } from "../Custom/Accordian";
import { useAllowedDivisions } from "@/hooks/useAllowedDivisions";
import { useState } from "react";
import { Division,EventType } from "prisma/shared";


type Props = { tournamentId?: string };



export default function CreateEvents({tournamentId} : Props){

     const numericId = Number(tournamentId);
    const { data: eventTypes, isLoading: isLoadingEventTypes } = useQuery<EventType[]>({
      queryKey: ["eventTypes"],
      queryFn: () => getEventTypes(),
    });

    const { data: tournamentEvents, isLoading: isLoadingTournamentEvents } = useQuery({
    queryKey: ["tournamentEvents", numericId],
    queryFn: () => getTournamentEvents(numericId),
    enabled: !!tournamentId,
  });

    const [divisionSettings, setDivisionSettings] = useState<DivisionSettings>({});

  function setDivisionMode(eventId: number, divisionId: number, mode: DivisionMode) {
  setDivisionSettings(prev => ({
    ...prev,
     [eventId]: {
    ...(prev[eventId] || {}),
    [divisionId]: mode
  }
  }));
  console.log(divisionSettings);
}
const selectedEventIds =
    tournamentEvents?.map(te => te.eventId) ?? [];

  const filteredEventTypes =
    eventTypes?.filter(et => selectedEventIds.includes(et.id)) ?? [];

    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
        <div></div>
        <div className="p-8 w-full max-w-6xl">
          <h1 className="text-xl font-semibold mb-6">
            Create Events for tournament ID: {tournamentId}
          </h1>
          <div className="space-y-6">
       {isLoadingEventTypes ? (
  <p>Loading event types...</p>
) : (
  filteredEventTypes?.map((et: EventType) => (
    <Accordion key={et.id} title={et.name}>
      <div className="max-h-64 overflow-y-auto pr-2">
      <AllowedDivisions eventId={et.id} divisionSettings={divisionSettings[et.id]|| {}} setDivisionMode={setDivisionMode} />
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
  divisionSettings: Record<number, DivisionMode>; // divisionId → female true/false
  setDivisionMode: (eventId: number, divisionId: number, mode: DivisionMode) => void;
}

function AllowedDivisions({ eventId, divisionSettings, setDivisionMode }: AllowedDivisionsProps) {
  const { data: divisions = [], isLoading, error } = useAllowedDivisions(eventId);

  if (isLoading) return <p className="text-gray-400">Loading divisions...</p>;
  if (error) return <p className="text-red-400">Error loading divisions</p>;

  const defaultMode: DivisionMode = { male: false, female: false, coed: false };
  // Bulk-set handlers
  const handleSetAllMale = () => {
  divisions.forEach((division: Division) => {
    const prev = divisionSettings[division.id] ?? defaultMode;
    setDivisionMode(eventId, division.id, {
      male: true,
      female: prev.female,
      coed: false
    });
  });
};

  const handleSetAllFemale = () => {
    divisions.forEach((division: Division) => {
       const prev = divisionSettings[division.id] ?? defaultMode;
      setDivisionMode(eventId,division.id, 
        { male: prev.male, female: true, coed: false });
    });
  };  
  return (
    
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm"
          onClick={handleSetAllMale}
        >
          Set All Male
        </button>

        <button
          type="button"
          className="px-3 py-1 rounded bg-pink-600 hover:bg-pink-700 text-sm"
          onClick={handleSetAllFemale}
        >
          Set All Female
        </button>
      </div>
    <div className="grid grid-cols-1 md:grid-cols- lg:grid-cols-3 gap-3">
      {divisions.map((division: Division) => {
         const currentMode = divisionSettings[division.id] ?? defaultMode;

        return (
          <div
            key={division.id}
            className="bg-gray-800 p-4 rounded flex flex-col gap-3"
          >
            <div className="text-sm font-medium text-gray-100">
              {division.name} — {division.beltRank?.color || "No Color"}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-300">Mode:</span>
              <DivisionModeToggle
                value={currentMode}
                onChange={(mode) => setDivisionMode(eventId,division.id, mode)}
              />
            </div>
          </div>
        );
      })}
    </div></div>
  );
}


// components/DivisionModeToggle.tsx
type DivisionMode = {
  male: boolean;
  female: boolean;
  coed: boolean;
};

type DivisionSettings = Record<number, DivisionMode>;


interface DivisionModeToggleProps {
  value: DivisionMode;
  onChange: (value: DivisionMode) => void;
}

export function DivisionModeToggle({ value, onChange }: DivisionModeToggleProps) {
  const base =
    "px-2 py-1 text-xs rounded-md border transition-colors whitespace-nowrap";
  const active = "bg-blue-500 text-white border-blue-500";
  const inactive = "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700";

  return (
    <div className="flex flex-col sm:flex-row gap-1 w-full">
      <button
  className={`${base} ${value.male ? active : inactive}`}
  onClick={() => onChange({ male: !value.male, female: value.female, coed: false })}
>
  Male
</button>

<button
  className={`${base} ${value.female ? active : inactive}`}
  onClick={() => onChange({ male: value.male, female: !value.female, coed: false })}
>
  Female
</button>

<button
  className={`${base} ${value.coed ? active : inactive}`}
  onClick={() => onChange({ male: false, female: false, coed: true })}
>
  Coed
</button>
    </div>
  );
}