import { getUpcomingTournaments } from "../../api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { TournamentStatus } from "../../../shared";
import { format } from 'date-fns';

export function OrganizerDashboard() {
    const status = TournamentStatus.Upcoming;
    const navigate = useNavigate();

    const { data: upcomingTournaments, isLoading: upcomingIsLoading } = useQuery({
        queryKey: ['tournaments', status],
        queryFn: () => getUpcomingTournaments(status),
    });


    function handleManageDivisions(id: number) {
        navigate({ to: `/tournament/organizer/manage-divisions/${id}` });
    }

    function handleManageRegistrants(id: number) {
        navigate({ to: `/tournament/organizer/manage-registrants/${id}` });
    }

    function handleRegistrationStats(id: number) {
        navigate({ to: `/tournament/organizer/registrationStats/${id}` });
    }

    function handleCreated(id: number) {
        navigate({ to: `/tournament/organizer/created/${id}` });
    }

    return (<div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-6">Welcome to the tournament dashboard page</h1>
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-white">
                Select a Tournament
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!upcomingIsLoading && upcomingTournaments.map((t: { id: number; name: string; date: string; location: string }) => {
                    return (
                        <div
                            key={t.id}
                            className="p-5 rounded-lg border border-gray-700 bg-gray-800"
                        >
                            <h2 className="text-xl font-semibold text-white">{t.name}</h2>
                            <p className="text-gray-300">{format(new Date(t.date), 'MMM d, yyyy')}</p>
                            <p className="text-gray-400">{t.location}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleCreated(t.id)}
                                    className="flex-1 min-w-max px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                                >
                                    Edit Tournament
                                </button>
                                <button
                                    onClick={() => handleManageDivisions(t.id)}
                                    className="flex-1 min-w-max px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    Manage Divisions
                                </button>
                                <button
                                    onClick={() => handleManageRegistrants(t.id)}
                                    className="flex-1 min-w-max px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                >
                                    Manage Registrants
                                </button>
                                <button
                                    onClick={() => handleRegistrationStats(t.id)}
                                    className="flex-1 min-w-max px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                                >
                                    Registration Stats
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

    </div>)
}
