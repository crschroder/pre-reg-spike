import { getEventTypes } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { Accordion } from "../Custom/Accordian";
import { useAllowedDivisions } from "@/hooks/useAllowedDivisions";

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
      <AllowedDivisions eventId={et.id} />
      </div>
    </Accordion>
  ))
)}
          </div>
        </div>
      </div>
    )
} 

function AllowedDivisions({ eventId }: { eventId: number }) {
  const { data: divisions, isLoading, error } = useAllowedDivisions(eventId);

  if (isLoading) return <div>Loading divisions...</div>;
  if (error) return <div>Error loading divisions</div>;

  return (
    <div className="grid grid-cols-3 gap-3">
      {divisions.map((division: any) => (
        <label key={division.id} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
          <input
            type="checkbox"
            value={division.id}
            // You’ll wire this up later to create EventDivision
          />
          <span>{division.name} — {division.beltRank?.beltColor}</span>
        </label>
      ))}
    </div>
  );
}