import { getEventTypes, getTournamentEventDivisions, 
  getTournamentEvents, saveTournamentEventDivisions } from "../../api/tournaments";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Accordion } from "../Custom/Accordian";
import { useAllowedDivisions } from "@/hooks/useAllowedDivisions";
import { useCallback, useEffect, useState } from "react";
import type { Division, DivisionPayload, EventType } from "@shared";
//import { S } from "@faker-js/faker/dist/airline-DF6RqYmq";


type Props = { tournamentId: number };

type SaveDivisionVars = {
  eventId: number;
  divisions: { divisionId: number; genderId: number; divisionTypeId: number }[];
};


export default function CreateEvents({tournamentId} : Props){

    const [savedIndicator, setSavedIndicator] = useState<Record<number, boolean>>({});

     const numericId = Number(tournamentId);
    const { data: eventTypes, isLoading: isLoadingEventTypes } = useQuery<EventType[]>({
      queryKey: ["eventTypes"],
      queryFn: () => getEventTypes(),
    });

  const { data: tournamentEvents } = useQuery({
    queryKey: ["tournamentEvents", tournamentId],
    queryFn: () => getTournamentEvents(tournamentId!),    
    enabled: !!tournamentId,
  });
  const mutation = useMutation({
  mutationFn: ({ eventId, divisions }: SaveDivisionVars) =>
    saveTournamentEventDivisions(tournamentId, eventId, divisions), 
   onSuccess: (_, { eventId }) => {
    setUnsavedChanges(prev => ({ ...prev, [eventId]: false }));
    
    setSavedIndicator(prev => ({ ...prev, [eventId]: true }));
    setTimeout(() => {
      setSavedIndicator(prev => ({ ...prev, [eventId]: false }));
    }, 1500);
  }

});

    const [divisionSettings, setDivisionSettings] = useState<DivisionSettings>({});
    const [divisionTypeIndex, setDivisionTypeIndex] = useState<DivisionTypeIndex>({});
    const [unsavedChanges, setUnsavedChanges] = useState<Record<number, boolean>>({});

    const onDivisionsLoaded = useCallback((eventId: number, divisions: Division[]) => {
      const nextIndex = Object.fromEntries(
        divisions.map(d => [d.id, d.divisionTypeId] as const)
      ) as Record<number, number>;

      setDivisionTypeIndex(prev => {
        const prevIndex = prev[eventId];
        if (prevIndex) {
          const prevKeys = Object.keys(prevIndex);
          const nextKeys = Object.keys(nextIndex);
          if (prevKeys.length === nextKeys.length) {
            let same = true;
            for (const k of nextKeys) {
              const key = Number(k);
              if (prevIndex[key] !== nextIndex[key]) {
                same = false;
                break;
              }
            }
            if (same) return prev;
          }
        }

        return {
          ...prev,
          [eventId]: nextIndex,
        };
      });
    }, []);
    

  function setDivisionMode(eventId: number, divisionId: number, modeOrFn: DivisionModeUpdater, markDirty = true) {
  setDivisionSettings(prev => {
    const prevMode = prev[eventId]?.[divisionId];

    const newMode =
      typeof modeOrFn === "function"
        ? modeOrFn(prevMode)
        : modeOrFn;

    return {
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [divisionId]: newMode
      }
    };
  });

  if (markDirty) {
    setUnsavedChanges(prev => ({ ...prev, [eventId]: true }));
  }
}


function saveEventDivisions(eventId: number) {
  const settings = divisionSettings[eventId];
  if (!settings) return;

  const typeIndex = divisionTypeIndex[eventId] ?? {};

  const rows = Object.entries(settings).flatMap(([divisionIdStr, mode]) => {
   
    const divisionId = Number(divisionIdStr);
    const divisionTypeId = typeIndex[divisionId];

    const out: { divisionId: number; genderId: number; divisionTypeId: number }[] = [];
    if (mode.male) out.push({ divisionId: divisionId, genderId: 1, divisionTypeId });
    if (mode.female) out.push({ divisionId: divisionId, genderId: 2, divisionTypeId });
    if (mode.coed) out.push({ divisionId: divisionId, genderId: 3, divisionTypeId });

    return out;
  });

  mutation.mutate({ eventId, divisions: rows });
}

const selectedEventIds =
    tournamentEvents?.map((te: { eventId: any; }) => te.eventId) ?? [];

  const filteredEventTypes =
  eventTypes
    ?.filter(et => selectedEventIds.includes(et.id))
    .sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

    


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
                <Accordion key={et.id} title={et.name} dirty={unsavedChanges[et.id]=== true}> 
                  <div className="max-h-96 overflow-y-auto pr-2">
                    <AllowedDivisions
                      tournamentId={numericId}
                      eventId={et.id}
                      divisionSettings={divisionSettings[et.id] || {}}
                      setDivisionMode={setDivisionMode}
                      onDivisionsLoaded={onDivisionsLoaded}
                    />
                    <div className="sticky bottom-0 bg-white py-3 border-t flex justify-end">
                      {unsavedChanges[et.id] && (
                        <span className="text-yellow-600 font-medium">
                          Unsaved changes…
                        </span>
                      )}
                      {/* Saved indicator */}
                      {savedIndicator[et.id] && (
                        <span className="text-green-600 font-semibold animate-fade mr-4
                        ">
                          Saved!
                        </span>
                      )}

                      <button
                        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                        onClick={() => saveEventDivisions(et.id)}
                      >
                        Save Divisions
                      </button>
                    </div>
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
  tournamentId: number;
  eventId: number;
  divisionSettings: Record<number, DivisionMode>; // divisionId → female true/false
  setDivisionMode: (eventId: number, divisionId: number, mode: DivisionModeUpdater, markDirty?: boolean) => void;
  onDivisionsLoaded?: (eventId: number, divisions: Division[]) => void;
}

function AllowedDivisions({ tournamentId, eventId, divisionSettings, setDivisionMode, onDivisionsLoaded }: AllowedDivisionsProps) {
  const { data: divisions = [], isLoading, error } = useAllowedDivisions(eventId);
  useEffect(() => {
    if (!isLoading && divisions.length > 0) {
      onDivisionsLoaded?.(eventId, divisions);
    }
  }, [isLoading, divisions, eventId, onDivisionsLoaded]);

   const { data: saved = [] } = useQuery({
     queryKey: ['savedDivisions', eventId, tournamentId],
     queryFn: () => getTournamentEventDivisions(tournamentId, eventId),
     enabled: !!tournamentId,
   })

   useEffect(() => {
     if (!saved.length) return
      // Only apply saved settings if divisionSettings is empty for this event
      if (Object.keys(divisionSettings).length > 0) return;


     saved.forEach((row : DivisionPayload) => {
       applyInitialDivisionMode(eventId, row.divisionId, prev => ({
  male: prev?.male || row.genderId === 1,
  female: prev?.female || row.genderId === 2,
  coed: prev?.coed || row.genderId === 3,
}));

     })
   }, [saved])


  if (isLoading) return <p className="text-gray-400">Loading divisions...</p>;
  if (error) return <p className="text-red-400">Error loading divisions</p>;

  const defaultMode: DivisionMode = { male: false, female: false, coed: false };
  // Bulk-set handlers
  const handleSetAllMale = () => {
  divisions.forEach((division: Division) => {
    const prev = divisionSettings[division.id] ?? defaultMode;
    updateDivisionMode(eventId, division.id, {
      male: true,
      female: prev.female,
      coed: false
    });
  });
};

  const handleSetAllFemale = () => {
    divisions.forEach((division: Division) => {
       const prev = divisionSettings[division.id] ?? defaultMode;
      updateDivisionMode(eventId,division.id, 
        { male: prev.male, female: true, coed: false });
    });
  };  

  function applyInitialDivisionMode(
  eventId: number,
  divisionId: number,
  updater: DivisionMode | ((prev: DivisionMode | undefined) => DivisionMode)
) {
  setDivisionMode(eventId, divisionId, updater, false);
}


function updateDivisionMode(
  eventId: number,
  divisionId: number,
  mode: DivisionMode
) {
  setDivisionMode(eventId, divisionId, mode, true);
}
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
              {division.name} — {division.beltRank?.beltColor || "No Color"}
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


type DivisionSettings = Record<number, Record<number, DivisionMode>>;
type DivisionTypeIndex = Record<number, Record<number, number>>;

type DivisionModeUpdater =
  | DivisionMode
  | ((prev: DivisionMode | undefined) => DivisionMode);


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