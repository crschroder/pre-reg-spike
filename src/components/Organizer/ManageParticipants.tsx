import { getTournamentRegistrations } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { Column } from "@tanstack/react-table";
import { useMemo } from "react";


export type RegistrationRow = {
  id: number
  firstName: string
  lastName: string
  participantGender: string
  participantRank: string
  isPaid: boolean

  divisionGender: string
  divisionName: string
  divisionRank: string
  divisionBeltOrder: number
  minAge: number
  maxAge: number | null
}


export function ManageParticipants({ tournamentId }: { tournamentId: number }) {
      const {data: registrations, isLoading:participantLoading} = useQuery<any[]>({
    queryKey:['tournament-registrations', tournamentId],
    queryFn: () => getTournamentRegistrations(tournamentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const flattened = registrations?.flatMap((p: any) =>
    (p.registrations ?? []).map((r: any) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,

      participantGender: p.gender.description,
      participantRank: p.rank.beltColor,
      isPaid: p.paid,

      divisionGender: r.tournamentEventDivision.eventGender.description,
      divisionName: r.tournamentEventDivision.division.name,
      divisionRank: r.tournamentEventDivision.division.beltRank.beltColor,
      divisionBeltOrder: r.tournamentEventDivision.division.beltRank.sortOrder,
      minAge: r.tournamentEventDivision.division.minAge,
      maxAge: r.tournamentEventDivision.division.maxAge,

      eventName: r.tournamentEventDivision.tournamentEvent.event.name
    }))
  );
  
//   const columns = useMemo<ColumnDef



  return (
    <div>
      <h2>Manage Participants for Tournament ID: {tournamentId}</h2>
      {!participantLoading ? (
  <ul>
    {flattened?.map((row : RegistrationRow) => (
      <li key={`${row.id}-${row.divisionName}`}>
        {row.firstName} {row.lastName} - {row.divisionName} ({row.divisionRank})
      </li>
    ))}
  </ul>
) : (
  <p>Loading participants...</p>
)}
    </div>
  );
}