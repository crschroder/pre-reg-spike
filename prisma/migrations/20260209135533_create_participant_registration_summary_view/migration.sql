-- This is an empty migration.
create view participant_registration_summary as
select u.email as user_email, 
       p.id participant_id ,
       e.id as event_id,  
       p.first_name,  
       p.last_name, 
       p.age, 
       pbr.belt_color, 
       p.paid, 
       p.checked_in, 
       dt.name as participant_division_type,
       e.name as event_registered, 
       tournament_id
 from participant p 
  join belt_rank pbr on pbr.id = p.belt_rank_id
  join public.user u on u.id = p.user_id
  join division_type dt on p.age between dt.min_age and dt.max_age
  join participant_event pe on pe.participant_id = p.id
  join event e on e.id = pe.event_id