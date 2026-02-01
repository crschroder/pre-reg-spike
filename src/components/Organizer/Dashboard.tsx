import { getUpcomingTournaments } from "../../api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { TournamentStatus } from "../../../shared";
import { useState } from "react";
import { format } from 'date-fns';

export function OrganizerDashboard() {
    const status = TournamentStatus.Upcoming;
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const navigate = useNavigate();

    const { data: upcomingTournaments, isLoading: upcomingIsLoading } = useQuery({
        queryKey: ['tournaments', status],
        queryFn: () => getUpcomingTournaments(status),
    });


    function handleSelectTournament(id: number) {
        navigate({ to: `/tournament/organizer/manage-participants/${id}` });
    }

    return (<div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-6">Welcome to the tournament registration page</h1>
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-white">
                Select a Tournament
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!upcomingIsLoading && upcomingTournaments.map((t: { id: number; name: string; date: string; location: string }) => {
                    const isSelected = selectedId === t.id;

                    return (
                        <button
                            key={t.id}
                            onClick={() => setSelectedId(t.id)}
                            className={`p-5 rounded-lg border text-left transition 
                   ${isSelected
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                                }`}
                        >
                            <h2 className="text-xl font-semibold text-white">{t.name}</h2>
                            <p className="text-gray-300">{format(new Date(t.date), 'MMM d, yyyy')}</p>
                            <p className="text-gray-400">{t.location}</p>

                            {isSelected && (
                                <p className="text-blue-400 font-medium mt-2">
                                    Selected
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedId && (
                <div className="mt-6">
                    <button
                        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => handleSelectTournament(selectedId)}
                    >
                        Continue to Manage Participants
                    </button>
                </div>
            )}
        </div>

    </div>)
}
