import {  getRouteApi, useParams, useMatch } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import {Stepper, Step} from '../Custom/Stepper'
import api from '@/api/axios';
import { getEventTypes, getTournamentEvents } from "@/api/tournaments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getTournamentById,
  createTournament,
  updateTournament,
  createTournamentEvents,
  updateTournamentEvents
} from "@/api/tournaments";

import { useNavigate } from "@tanstack/react-router";
import type { EventType, TournamentInput } from '@shared';

type Props = { tournamentId?: number | undefined };

export default function CreateTournament ({tournamentId}:Props) {
      const steps = [
    { label: 'Create Event' },
    { label: 'Add Events' },
    { label: 'Step 3' },  { label: 'Step 4' },
  ];
  console.log("tournamentId in CreateTournament:", tournamentId);
  const [activeStep, setActiveStep] = useState(0);

  const queryClient = useQueryClient();
  
  const navigate = useNavigate();

  const isEdit = Boolean(tournamentId);
  console.log("isEdit:", isEdit); 
    // Load tournament only when editing
    const { data, isLoading } = useQuery({
      queryKey: ["tournament", tournamentId],
      queryFn: () => getTournamentById(tournamentId!),
      enabled: isEdit, // only fetch when editing
    });

  const { data: existingTournamentEvents } = useQuery({
    queryKey: ["tournamentEvents", tournamentId],
    queryFn: () => getTournamentEvents(+tournamentId!),
    enabled: isEdit, // only fetch when editing
  });

  // get event types
  const { data: eventTypesData, isLoading: isLoadingEventTypes } = useQuery<EventType[]>({
        queryKey: ["eventTypes"],
        queryFn: () => getEventTypes(),
      });
  const eventTypes = Array.isArray(eventTypesData) ? eventTypesData : [];
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  useEffect(() => {
  if (isEdit && existingTournamentEvents) {
    const ids = existingTournamentEvents.map((te: { eventId: any; }) => te.eventId);
    setSelectedEvents(ids);
  }
}, [isEdit, existingTournamentEvents]);


  const [form, setForm] = useState({
    name: "",
    date: "",
    location: "",
    organizerId: 1,
  });

      // Prefill when editing
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        date: data.date.slice(0, 10),
        location: data.location,
        organizerId: data.organizerId,
      });
    }
  }, [data]);


    const mutation = useMutation({
  mutationFn: (payload: TournamentInput) =>
    isEdit
      ? updateTournament(tournamentId!, payload)
      : createTournament(payload),

  onSuccess: async (result) => {
    if (isEdit) {
      await updateTournamentEvents(+tournamentId!, { eventIds: selectedEvents });
    } else {
      await createTournamentEvents(result.id, { eventIds: selectedEvents });
    }

    if (!isEdit) {
      // After creating, go to the edit page
      navigate({
        to: "/tournament/organizer/created/$id",
        params: { id: result.id.toString() },
      });
    } else {
      // After editing, refresh the list
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    }
  },
});
 function handleSave() {
    mutation.mutate(form);
  }
  
  if (tournamentId) {
    // edit mode → fetch tournament by id
  } else {
    // create mode → new tournament
  }


   const handleNext = () => {
    // TODO, change this to handle save and proceed    
    if (tournamentId) {
      navigate({
        to: "/tournament/organizer/events/$tournamentId",
        params: { tournamentId: tournamentId },
      });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  


    return (
  <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
    <div className="p-8 w-full max-w-md">
      {tournamentId ? (
        <h1 className="text-xl font-semibold mb-6">
          Editing tournament {tournamentId}
        </h1>
      ) : (
        <h1 className="text-xl font-semibold mb-6">Creating a new tournament</h1>
      )}

      {/* Form fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}

            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tournament name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}

            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tournament date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Location
          </label>
          <input
            type="text"
             value={form.location}
             onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tournament location"
          />
        </div>
        <div>
  <label className="block text-sm font-medium text-gray-200 mb-2">
    Events to Include
  </label>

  <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded border border-gray-700">
    {eventTypes.map((et: any) => (
      <label key={et.id} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedEvents.includes(et.id)}
          onChange={() => {
            setSelectedEvents(prev =>
              prev.includes(et.id)
                ? prev.filter(id => id !== et.id)
                : [...prev, et.id]
            );
          }}
        />
        <span>{et.name}</span>
      </label>
    ))}
  </div>
</div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className={`px-4 py-2 rounded ${
            activeStep === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
        >
          Back
        </button>
         <button
    onClick={handleSave}
    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
  >
    Save
  </button>

        <button
          onClick={handleNext}
          disabled={!isEdit}
          className={`px-4 py-2 rounded ${
            !isEdit
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
);
}



