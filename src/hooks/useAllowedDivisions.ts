import { useQuery } from "@tanstack/react-query";
import { 
  getDivisionsByEventType,
  
} from "@/api/tournaments";

export function useAllowedDivisions(eventId: number) {
  return useQuery({
    queryKey: ["allowedDivisions", eventId],
    queryFn: () => getDivisionsByEventType(eventId),
  });
}