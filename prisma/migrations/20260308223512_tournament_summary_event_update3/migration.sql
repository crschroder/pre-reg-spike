-- This is an empty migration.-- This is an empty migration.
Drop view if exists tournament_event_summary;

create view tournament_event_summary as 
select display_name as event_code, ev.name as event_type,dt.name as division, belt_color, eg.description as gender, 
  dt.min_age, dt.max_age
  , t.name as tournament_name, t.id as tournament_id,
  br.sort_order as belt_rank_sort_order, ev.sort_order as event_sort_order
  from tournament_event te
  join tournament_event_division ed on te.id = ed.tournament_event_id
  join event_gender eg on eg.id = ed.gender_id 
  join division d on ed.division_id = d.id
   join division_type dt on dt.id = d.division_type_id
  join belt_rank br on br.id = d.belt_rank_id
  join event ev on ev.id = te.event_id
  join tournament t on t.id = te.tournament_id 