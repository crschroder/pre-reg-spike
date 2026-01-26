-- ============================================================
-- REGISTRATION SEED SCRIPT
-- Registers every participant in tournament 7 for:
--   - Kumite (event_id = 1)
--   - Kata   (event_id = 2)
-- ============================================================

-- KUMITE REGISTRATIONS (event_id = 1)
INSERT INTO registration (participant_id, event_division_id)
SELECT 
    p.id AS participant_id,
    ted.id AS event_division_id
FROM participant p
JOIN division d
    ON d.belt_rank_id = p.belt_rank_id
   AND p.age >= d.min_age
   AND (d.max_age IS NULL OR p.age <= d.max_age)
JOIN tournament_event te
    ON te.tournament_id = p.tournament_id
   AND te.event_id = 1   -- KUMITE
JOIN tournament_event_division ted
    ON ted.tournament_event_id = te.id
   AND ted.division_id = d.id
   AND ted.gender_id = p.gender_id
WHERE p.tournament_id = 7;


-- KATA REGISTRATIONS (event_id = 2)
INSERT INTO registration (participant_id, event_division_id)
SELECT 
    p.id AS participant_id,
    ted.id AS event_division_id
FROM participant p
JOIN division d
    ON d.belt_rank_id = p.belt_rank_id
   AND p.age >= d.min_age
   AND (d.max_age IS NULL OR p.age <= d.max_age)
JOIN tournament_event te
    ON te.tournament_id = p.tournament_id
   AND te.event_id = 2   -- KATA
JOIN tournament_event_division ted
    ON ted.tournament_event_id = te.id
   AND ted.division_id = d.id
   AND ted.gender_id = p.gender_id
WHERE p.tournament_id = 7;
