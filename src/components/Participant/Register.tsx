import { getTournamentById } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";


type props = {tournamentId: number;};

export function RegisterTournament({tournamentId}: props){
    const { data, isLoading } = useQuery({
      queryKey: ["tournament", tournamentId],
      queryFn: () => getTournamentById(tournamentId!),
        enabled: !!tournamentId,
    });

    return (  <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
         <div className="p-8 w-full max-w-6xl">
             <h1 className="text-xl font-semibold mb-6">
            {isLoading ? "Loading..." : `Register for tournament : ${data.name}`}
          </h1>
         <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Participant First Name
                </label>
                  <input
            type="text"
           

            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Participant first name"
          />
            </div>
            <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Participant Last Name
          </label>
          <input
            type="text"
           

            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter participant last name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Participant age
          </label>
          <input
            type="number"
           

            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter participant age (as of tournament date)"
          />
        </div>
         </div>

         </div>
    </div>)
}