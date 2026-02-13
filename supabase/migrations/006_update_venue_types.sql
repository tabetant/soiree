-- ============================================================
-- 006_update_venue_types.sql
-- Migrate venue_type values and add venue_category column
-- ============================================================

-- ── 1. Drop old constraint FIRST so updates are allowed ─────

ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_venue_type_check;

-- ── 2. Update venue_type values ─────────────────────────────

UPDATE venues SET venue_type = 'nights' WHERE venue_type = 'soiree_night';
UPDATE venues SET venue_type = 'tickets' WHERE venue_type = 'soiree_event';
UPDATE venues SET venue_type = 'listings' WHERE venue_type = 'ticker';

-- ── 3. Add new check constraint ─────────────────────────────

ALTER TABLE venues ADD CONSTRAINT venues_venue_type_check
  CHECK (venue_type IN ('nights', 'tickets', 'listings'));

-- ── 4. Add venue_category column ────────────────────────────

ALTER TABLE venues ADD COLUMN IF NOT EXISTS venue_category text;
ALTER TABLE venues ADD CONSTRAINT venues_venue_category_check
  CHECK (venue_category IN ('club', 'bar', 'lounge', 'rooftop'));

-- ── 5. Populate venue_category based on name heuristics ─────

UPDATE venues SET venue_category = 'club'
  WHERE venue_category IS NULL
  AND (name ILIKE '%club%' OR name ILIKE '%rebel%' OR name ILIKE '%cube%'
       OR name ILIKE '%coda%' OR name ILIKE '%toybox%' OR name ILIKE '%efs%'
       OR name ILIKE '%wildflower%' OR name ILIKE '%lovechild%'
       OR name ILIKE '%lost%' OR name ILIKE '%nest%' OR name ILIKE '%gold%hawk%');

UPDATE venues SET venue_category = 'rooftop'
  WHERE venue_category IS NULL
  AND (name ILIKE '%lavelle%' OR name ILIKE '%cabana%');

UPDATE venues SET venue_category = 'bar'
  WHERE venue_category IS NULL
  AND (name ILIKE '%bar%' OR name ILIKE '%tavern%' OR name ILIKE '%get well%'
       OR name ILIKE '%bellwoods%' OR name ILIKE '%horseshoe%' OR name ILIKE '%apt%'
       OR name ILIKE '%handlebar%' OR name ILIKE '%mill%');

UPDATE venues SET venue_category = 'lounge'
  WHERE venue_category IS NULL
  AND (name ILIKE '%drake%' OR name ILIKE '%mahjong%' OR name ILIKE '%gladstone%'
       OR name ILIKE '%el mocambo%' OR name ILIKE '%young centre%');

-- Default remaining to lounge
UPDATE venues SET venue_category = 'lounge' WHERE venue_category IS NULL;

-- ── 6. Update vibes to new vocabulary ───────────────────────

UPDATE venues SET vibes = array_replace(vibes, 'High Energy', 'Rave');
UPDATE venues SET vibes = array_replace(vibes, 'Party', 'Rave');
UPDATE venues SET vibes = array_replace(vibes, 'Intimate', 'Chill');
UPDATE venues SET vibes = array_replace(vibes, 'Casual', 'Chill');

-- ── 7. Migrate old music genres to new ones ─────────────────

UPDATE venues SET music_types = array_replace(music_types, 'Indie', 'Pop');
UPDATE venues SET music_types = array_replace(music_types, 'Rock', 'Pop');
UPDATE venues SET music_types = array_replace(music_types, 'Alternative', 'Pop');
UPDATE venues SET music_types = array_replace(music_types, 'Punk', 'Pop');
UPDATE venues SET music_types = array_replace(music_types, 'Blues', 'Jazz');
UPDATE venues SET music_types = array_replace(music_types, 'Soul', 'Jazz');
UPDATE venues SET music_types = array_replace(music_types, 'Classical', 'Jazz');
UPDATE venues SET music_types = array_replace(music_types, 'Reggaeton', 'Latin');
UPDATE venues SET music_types = array_replace(music_types, 'Top 40', 'Pop');
