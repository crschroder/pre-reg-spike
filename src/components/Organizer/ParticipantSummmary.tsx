import { getParticipantSummary } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";


interface ParticipantEvent {
  eventId: number;
  eventRegistered: string;
  participantEventId: number;
}

interface GroupedParticipant {
  userEmail: string;
  userId: number;
  participantId: number;
  firstName: string;
  lastName: string;
  age: number;
  beltColor: string;
  participantGender: string;
  participantDivisionType: string;
  paid: boolean;
  checkedIn: boolean;
  tournamentId: number;
  genderId: number;

  events: ParticipantEvent[];
}

export interface ParticipantSummaryRow {
  userEmail: string;
  userId: number;
  participantId: number;
  firstName: string;
  lastName: string;
  age: number;
  beltColor: string;
  participantGender: string;
  participantDivisionType: string;
  paid: boolean;
  checkedIn: boolean;
  eventRegistered: string;
  tournamentId: number;
  eventId: number;
  participantEventId: number;
  genderId: number;
}


export function groupParticipants(rows: ParticipantSummaryRow[]): GroupedParticipant[] {
  const map = rows.reduce((acc, row) => {
    const id = row.participantId;

    if (!acc[id]) {
      acc[id] = {
        userEmail: row.userEmail,
        userId: row.userId,
        participantId: row.participantId,
        firstName: row.firstName,
        lastName: row.lastName,
        age: row.age,
        beltColor: row.beltColor,
        participantGender: row.participantGender,
        participantDivisionType: row.participantDivisionType,
        paid: row.paid,
        checkedIn: row.checkedIn,
        tournamentId: row.tournamentId,
        genderId: row.genderId,
        events: []
      };
    }

    acc[id].events.push({
      eventId: row.eventId,
      eventRegistered: row.eventRegistered,
      participantEventId: row.participantEventId
    });

    return acc;
  }, {} as Record<number, GroupedParticipant>);

  return Object.values(map);
}


    

export function ParticipantSummary({ tournamentId }: { tournamentId: number }) {
  const { data: rows, isLoading } = useQuery<ParticipantSummaryRow[]>({
    queryKey: ['participant-summary', tournamentId],
    queryFn: () => getParticipantSummary(tournamentId),
  })
  const participants = useMemo(() => {
    if (!rows) return []
    return groupParticipants(rows)
  }, [rows])

  if (isLoading) {
    return <div>Loading…</div>
  }

  return (
    <div>
      Participant Summary for tournament {tournamentId}
      <pre>{JSON.stringify(participants, null, 2)}</pre>
    </div>
  )
}
