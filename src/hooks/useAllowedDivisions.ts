import { useQuery } from "@tanstack/react-query";
import { 
  getDivisionsByEventType,
  
} from "@/api/tournaments";
import { Division } from "prisma/shared/division";

export function useAllowedDivisions(eventId: number) {
  return useQuery<Division[]>({
    queryKey: ["allowedDivisions", eventId],
    queryFn: () => getDivisionsByEventType(eventId),
  });
}