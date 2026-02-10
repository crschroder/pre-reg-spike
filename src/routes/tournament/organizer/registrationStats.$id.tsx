import { getTournamentRegistrations } from '@/api/tournaments';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react';
import { ParticipantsPivotTables } from '@/components/Organizer/ParticipantsPivotTables';

export const Route = createFileRoute(
  '/tournament/organizer/registrationStats/$id',
)({
    params: {
    parse: (params) => ({
      id: Number(params.id),
    }),
    stringify: (params) => ({
      id: String(params.id),
    }),
  },
  component: RouteComponent,
})

function RouteComponent() {
     const { id: tournamentId } = Route.useParams();
     const navigate = useNavigate();
     const { data: registrations, isLoading: participantLoading } = useQuery<any[]>({
        queryKey: ['tournament-registrations', tournamentId],
        queryFn: () => getTournamentRegistrations(tournamentId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        gcTime: 10 * 60 * 1000, // 10 minutes
    });


     const flattened = useMemo(() => {
      if (!registrations) return []
      return registrations.flatMap((p: any) =>
        (p.registrations ?? []).map((r: any) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
    
          participantGender: p.gender.description,
          participantRank: p.rank.beltColor,
          isPaid: p.paid,
    
          divisionGender: r.tournamentEventDivision.eventGender.description,
          divisionName: r.tournamentEventDivision.division.divisionType.name,
          divisionRank: r.tournamentEventDivision.division.beltRank.beltColor,
          divisionBeltOrder: r.tournamentEventDivision.division.beltRank.sortOrder,
          minAge: r.tournamentEventDivision.division.divisionType.minAge,
          maxAge: r.tournamentEventDivision.division.divisionType.maxAge,
    
          eventName: r.tournamentEventDivision.tournamentEvent.event.name
        }))
      )
    }, [registrations])
  
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Registration Statistics</h1>
        <button
          onClick={() => navigate({ to: '/tournament/organizer' })}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>
      {participantLoading ? (
        <p className="text-gray-400">Loading participants...</p>
      ) : (
        <ParticipantsPivotTables data={flattened} />
      )}
    </div>
  )
}
