-- ================================================================
-- Soirée — Venue Detail Fields + Loyalty Tasks
-- ================================================================
-- Run this migration in your Supabase SQL Editor AFTER 002_create_venues_events.sql

-- ── Add detail columns to venues ────────────────────────────

ALTER TABLE venues
ADD COLUMN IF NOT EXISTS hours jsonb,
ADD COLUMN IF NOT EXISTS gallery_images text[],
ADD COLUMN IF NOT EXISTS gender_ratio jsonb;

-- ── Loyalty Tasks Table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS loyalty_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
    task_description text NOT NULL,
    reward_description text NOT NULL,
    xp_value int NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE loyalty_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Loyalty tasks are viewable by authenticated users"
    ON loyalty_tasks FOR SELECT
    TO authenticated
    USING (true);

-- ── Update venues with detail data ──────────────────────────

UPDATE venues SET
    hours = '{"friday":"10PM-3AM","saturday":"10PM-3AM","thursday":"10PM-2AM"}',
    gender_ratio = '{"male":60,"female":40}'
WHERE name = 'Rebel';

UPDATE venues SET
    hours = '{"friday":"10PM-2:30AM","saturday":"10PM-2:30AM","thursday":"9PM-2AM"}',
    gender_ratio = '{"male":55,"female":45}'
WHERE name = 'Toybox';

UPDATE venues SET
    hours = '{"friday":"11PM-4AM","saturday":"11PM-4AM","thursday":"11PM-3AM"}',
    gender_ratio = '{"male":65,"female":35}'
WHERE name = 'CODA';

UPDATE venues SET
    hours = '{"friday":"10PM-2AM","saturday":"10PM-2AM"}',
    gender_ratio = '{"male":50,"female":50}'
WHERE name = 'EFS Toronto';

UPDATE venues SET
    hours = '{"friday":"5PM-2AM","saturday":"5PM-2AM","sunday":"12PM-10PM"}',
    gender_ratio = '{"male":45,"female":55}'
WHERE name = 'Lavelle';

UPDATE venues SET
    hours = '{"friday":"6PM-2AM","saturday":"6PM-2AM","thursday":"6PM-1AM"}',
    gender_ratio = '{"male":48,"female":52}'
WHERE name = 'The Mahjong Bar';

UPDATE venues SET
    hours = '{"friday":"10PM-2:30AM","saturday":"10PM-2:30AM","thursday":"10PM-2AM"}',
    gender_ratio = '{"male":52,"female":48}'
WHERE name = 'Lost & Found';

-- ── Insert sample loyalty tasks ─────────────────────────────

INSERT INTO loyalty_tasks (venue_id, task_description, reward_description, xp_value)
SELECT id, 'Check in before 11 PM', '50% off first 2 shots', 25 FROM venues WHERE name = 'Rebel'
UNION ALL
SELECT id, 'Visit 3 times this month', 'Free cover charge', 50 FROM venues WHERE name = 'Rebel'
UNION ALL
SELECT id, 'Arrive before midnight', 'Complimentary drink', 30 FROM venues WHERE name = 'Toybox'
UNION ALL
SELECT id, 'Bring 3+ friends', 'VIP table upgrade', 75 FROM venues WHERE name = 'Toybox'
UNION ALL
SELECT id, 'Check in on a Thursday', '2-for-1 drinks', 20 FROM venues WHERE name = 'CODA'
UNION ALL
SELECT id, 'Reserve VIP before 9 PM', 'Bottle service discount 20%', 40 FROM venues WHERE name = 'EFS Toronto'
UNION ALL
SELECT id, 'Tag @EFS on Instagram story', 'Free appetizer platter', 15 FROM venues WHERE name = 'EFS Toronto'
UNION ALL
SELECT id, 'Visit on a Sunday', 'Rooftop access + welcome drink', 35 FROM venues WHERE name = 'Lavelle'
UNION ALL
SELECT id, 'Check in 5 times total', 'Signature cocktail on the house', 60 FROM venues WHERE name = 'The Mahjong Bar'
UNION ALL
SELECT id, 'Check in before 11 PM', 'Skip the line pass', 30 FROM venues WHERE name = 'Lost & Found'
UNION ALL
SELECT id, 'Visit on consecutive weekends', 'Free cover + drink ticket', 55 FROM venues WHERE name = 'Lost & Found';
