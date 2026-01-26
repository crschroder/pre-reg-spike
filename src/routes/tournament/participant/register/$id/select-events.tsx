import { getTournamentById } from '@/api/tournaments';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router';


export const Route = createFileRoute(
  '/tournament/participant/register/$id/select-events',
)({
  component: RouteComponent,
})

function RouteComponent() {
     const { id } = useParams({
        from: '/tournament/participant/register/$id/select-events',
     });

     const { data, isLoading } = useQuery({
      queryKey: ["tournament", id],
      queryFn: () => getTournamentById(id!),
        enabled: !!id,
    });
    const navigate = useNavigate();
    const isEdit = true;
    const handleNext = () => {
    // TODO, change this to handle save and proceed    
    if (id) {
      navigate({
        to: `/tournament/participant/register/$id/submit-entry`,
        params: { id: String(id) },
      });
    }
  };
   const handleBack = () => {
    // TODO, change this to handle save and proceed    
    if (id) {
      navigate({
        to: `/tournament/participant/register/$id/create-participant`,
        params: { id: String(id) },
      });
    }
  };


    
  return <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
         <div className="p-8 w-full max-w-6xl">
             <h1 className="text-xl font-semibold mb-6">
            {isLoading ? "Loading..." : `Select Events : ${data.name}`}
          </h1>
         <div className="space-y-6">
          Events will go here
         </div>

         </div>
         <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={handleBack}
          disabled={!isEdit}
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
    </div>
}
