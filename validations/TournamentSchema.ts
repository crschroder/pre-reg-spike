import { object, string, number, isoDate, optional, minLength, pipe } from "valibot";

export const TournamentSchema = object({
  name: pipe(
    string(),
    minLength(3, "Tournament name must be at least 3 characters")
  ),
   date: pipe(
    string(),
    isoDate("Date must be a valid ISO string")
  ),
  location: optional(string()),
  organizerId: number()
});