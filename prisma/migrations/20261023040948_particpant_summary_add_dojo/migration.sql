-- This is an empty migration.

Drop view if exists participant_registration_summary;


create view participant_registration_summary as
SELECT
  u.email AS user_email,
  u.id AS user_id,
  p.id AS participant_id,
  p.first_name,
  p.last_name,
  p.age,
  pbr.belt_color,
  eg.description AS participant_gender,
  dt.name AS participant_division_type,
  p.paid,
  p.checked_in,
  e.name AS event_registered,
  e.id AS event_id,
  pe.id AS participant_event_id,
  p.tournament_id,
  p.gender_id,
  ted.display_name,
  dojo.dojo_name
FROM
  participant p
  JOIN belt_rank pbr ON pbr.id = p.belt_rank_id
  JOIN "user" u ON u.id = p.user_id
  JOIN participant_event pe ON pe.participant_id = p.id
  JOIN event e ON e.id = pe.event_id
  JOIN event_gender eg ON p.gender_id = eg.id
  JOIN registration r ON r.participant_id = p.id
  JOIN tournament_event_division ted ON ted.id = r.event_division_id
  JOIN tournament_event te ON ted.tournament_event_id = te.id
  AND pe.event_id = te.event_id
  JOIN division d ON ted.division_id = d.id
  JOIN division_type dt ON p.age >= dt.min_age
  AND (
    dt.max_age IS NULL
    OR p.age <= dt.max_age
  )
  AND dt.id = d.division_type_id
  join dojo on dojo.id = p.dojo_id