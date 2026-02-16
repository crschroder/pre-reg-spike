import api from "@/api/axios";
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
        queryClient.setQueryData(queryKey, (old) => {
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
        (old) => {
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
  return useMutation({
    mutationFn: async ({ participantId, checkedIn }: { participantId: number; checkedIn: boolean }) => {
      const participantPayload = { checkedIn };
      return api.patch(`/api/participant/${participantId}`, participantPayload)
        .then(res => res.data);
    },
    });
  }