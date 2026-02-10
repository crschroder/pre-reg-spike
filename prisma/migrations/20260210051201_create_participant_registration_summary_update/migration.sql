-- This is an empty migration.
Drop view if exists participant_registration_summary;


create view participant_registration_summary as
select u.email as user_email,
  u.id as user_id,
  p.id participant_id ,
  p.first_name, 
  last_name, age,
  pbr.belt_color,
  eg.description as participant_gender, 
  p.paid, 
  p.checked_in, 
  e.name as event_registered,
  e.id as event_id, 
  pe.id as participant_event_id,
  tournament_id
  , p.gender_id
 from participant p 
  join belt_rank pbr on pbr.id = p.belt_rank_id
  join public.user u on u.id = p.user_id
  join division_type dt on p.age >= dt.min_age and (dt.max_age is null or p.age <= dt.max_age)
  join participant_event pe on pe.participant_id = p.id
  join event e on e.id = pe.event_id
  join event_gender eg on p.gender_id = eg.id;