import { getEventTypes } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { Accordion } from "../Custom/Accordian";

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
      <div className="text-gray-600">
        Divisions will appear here once they are available.
      </div>
    </Accordion>
  ))
)}
          </div>
        </div>
      </div>
    )
} 

