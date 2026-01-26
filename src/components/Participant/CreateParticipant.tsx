import { getTournamentById } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";


type props = {tournamentId: number;};

export function CreateParticipant({tournamentId}: props){
    const { data, isLoading } = useQuery({
      queryKey: ["tournament", tournamentId],
      queryFn: () => getTournamentById(tournamentId!),
        enabled: !!tournamentId,
    });
    const navigate = useNavigate();
    const isEdit = true;
    const handleNext = () => {
    // TODO, change this to handle save and proceed    
    if (tournamentId) {
      navigate({
        to: `/tournament/participant/register/$id/select-events`,
        params: { id: String(tournamentId) },
      });
    }
  };

  const handleBack = () => {
    console.log("Going back to participant dashboard");
    navigate({
      to: `/tournament/participant`,
     
    });
  };


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
         <div className="mt-8 flex gap-4 justify-center">
        <button
           onClick={handleBack}
          //disabled={true}
          className={`px-4 py-2 rounded 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
        >
          Back
        </button>
    

        <button
           onClick={handleNext}
          disabled={!isEdit}
          className={`px-4 py-2 rounded 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
        >
          Next
        </button>
      </div>
    </div>)
}