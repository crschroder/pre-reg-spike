import { email, minLength, pipe, string } from "valibot";

export const ParticipantEmailSchema = pipe(
  string(),
  minLength(1, "Email is required"),
  email("Email must be a valid email address")
);