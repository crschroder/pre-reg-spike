import api from "@/api/axios";
import { ParticipantSummaryRow } from "@/components/Organizer/ParticipantSummmary";
import { useMutation, useQueryClient } from "@tanstack/react-query";



export function useUpdateParticipantPaid() {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ participantId, paid, tournamentId }: { participantId: number; paid: boolean; tournamentId: number }) => {
      const participantPayload = { paid };
      return api.patch(`/api/participant/${participantId}`, participantPayload)
        .then(res => res.data);
    },
    onMutate: async ({ participantId, paid, tournamentId }) => {
        const queryKey = ['participant-summary', tournamentId];
        await queryClient.cancelQueries({ queryKey});
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: ParticipantSummaryRow[]) => {
        if (!old) return old;        
        return old.map(row =>
          row.participantId === participantId && row.tournamentId === tournamentId
            ? { ...row, paid }
            : row
        );
      });
      //console.log("Updated participant summary in cache for participantId:", previous.find((p: any) => p.participantId === participantId));
      return { previous };

    },
    onError: (err, variables, context, tournamentId) => {
        if(context?.previous ) {
            queryClient.setQueryData(['participant-summary', tournamentId], context.previous);
        }
    },
    onSuccess: (updatedParticipant, variables, context) => {
      queryClient.setQueryData(
        ['participant-summary', updatedParticipant.participant.tournamentId],
        (old: ParticipantSummaryRow[]) => {
          if (!old) return old;
          return old.map(row =>
            row.participantId === updatedParticipant.participant.id
              ? { ...row, paid: updatedParticipant.participant.paid }
              : row
          );
        }
      )
    }
  });
}

export function useToggleCheckInParticipant() {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ participantId, checkedIn, tournamentId }: { participantId: number; checkedIn: boolean; tournamentId: number }) => {
      const participantPayload = { checkedIn };
      return api.patch(`/api/participant/${participantId}`, participantPayload)
        .then(res => res.data);
    },
    onMutate: async ({ participantId, checkedIn, tournamentId }) => {
        const queryKey = ['participant-summary', tournamentId];
        await queryClient.cancelQueries({ queryKey});
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: ParticipantSummaryRow[] | undefined) => {
         if (!old) return old;
        return old.map(row =>
          row.participantId === participantId && row.tournamentId === tournamentId
            ? { ...row, checkedIn }
            : row
        );
      });
      //console.log("Updated participant summary in cache for participantId:", previous.find((p: any) => p.participantId === participantId));
      return { previous };

    },
    onError: (err, variables, context, tournamentId) => {
        if(context?.previous ) {
            queryClient.setQueryData(['participant-summary', tournamentId], context.previous);
        }
    },
    onSuccess: (updatedParticipant, variables, context) => {
      queryClient.setQueryData(
        ['participant-summary', updatedParticipant.participant.tournamentId],
        (old: ParticipantSummaryRow[]) => {
          if (!old) return old;
          return old.map(row =>
            row.participantId === updatedParticipant.participant.id
              ? { ...row, checkedIn: updatedParticipant.participant.checkedIn }
              : row
          );
        }
      )
    }
    });
  }