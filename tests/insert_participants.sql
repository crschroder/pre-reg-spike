INSERT INTO participant (
    first_name,
    last_name,
    age,
    gender_id,
    tournament_id,
    user_id,
    belt_rank_id,
    notes,
    paid
)
SELECT
    -- Random first name
    (ARRAY[
        'Michael','Sarah','Jason','Emily','Robert','Laura','Kevin','Megan',
        'Daniel','Olivia','Christopher','Emma','Matthew','Sophia','Andrew',
        'Isabella','David','Ava','James','Charlotte','Ryan','Grace','Nathan',
        'Lily','Jonathan','Hannah','Tyler','Natalie','Benjamin','Zoe'
    ])[floor(random() * 30 + 1)],

    -- Random last name
    (ARRAY[
        'Smith','Johnson','Brown','Miller','Davis','Wilson','Taylor','Anderson',
        'Thomas','Harris','Martin','Thompson','White','Lopez','Clark','Lewis',
        'Walker','Hall','Allen','Young','King','Wright','Scott','Green'
    ])[floor(random() * 24 + 1)],

    -- Random age within division range
    CASE 
        WHEN d.max_age IS NULL THEN d.min_age + floor(random() * 15)::int
        ELSE d.min_age + floor(random() * (d.max_age - d.min_age + 1))::int
    END AS age,

    g.gender_id,
    7 AS tournament_id,
    2 AS user_id,
    d.belt_rank_id,
    NULL AS notes,
    FALSE AS paid

FROM division d
CROSS JOIN (VALUES (1),(2)) AS g(gender_id)
CROSS JOIN generate_series(1,5);
