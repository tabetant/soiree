-- ============================================================
-- 007_roles_suppliers_stars.sql
-- Add user roles, stars, suppliers table, and karaoke category
-- ============================================================

-- ── 1. Add role column to profiles ──────────────────────────

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'consumer';

-- Add check constraint (drop first if exists for idempotency)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('consumer', 'supplier', 'admin'));

-- ── 2. Add stars column to profiles ─────────────────────────

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stars int DEFAULT 0;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_stars_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_stars_check
  CHECK (stars >= 0 AND stars <= 100);

-- ── 3. Update venue_category constraint to include karaoke ──

ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_venue_category_check;
ALTER TABLE venues ADD CONSTRAINT venues_venue_category_check
  CHECK (venue_category IN ('club', 'bar', 'lounge', 'rooftop', 'karaoke'));

-- ── 4. Create suppliers table ───────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name text NOT NULL,
  verification_status text DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  stripe_connect_id text,
  plan text DEFAULT 'basic'
    CHECK (plan IN ('basic', 'pro', 'tickets')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_user ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(verification_status);

-- ── 5. RLS for suppliers ────────────────────────────────────

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can view own data' AND tablename = 'suppliers'
  ) THEN
    CREATE POLICY "Suppliers can view own data"
      ON suppliers FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can update own data' AND tablename = 'suppliers'
  ) THEN
    CREATE POLICY "Suppliers can update own data"
      ON suppliers FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── 6. Add 2 karaoke venues ────────────────────────────────

INSERT INTO venues (
  name, address, latitude, longitude, venue_type,
  music_types, vibes, age_range_min, age_range_max,
  dress_code, current_density, hours, gallery_images, gender_ratio, venue_category
) VALUES
('KBox Karaoke', '28 Wellesley St E, Toronto', 43.6639, -79.3810,
 'listings',
 ARRAY['Pop', 'R&B', 'Hip-Hop'],
 ARRAY['Karaoke', 'Party', 'Chill'],
 19, 50, 'No Dress Code', 55,
 '{"monday":"5PM-2AM","tuesday":"5PM-2AM","wednesday":"5PM-2AM","thursday":"5PM-2AM","friday":"5PM-3AM","saturday":"2PM-3AM","sunday":"2PM-12AM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #f472b6, #ec4899)',
   'linear-gradient(135deg, #ec4899, #db2777)',
   'linear-gradient(135deg, #f9a8d4, #f472b6)'
 ],
 '{"male":45,"female":55}'::jsonb,
 'karaoke'),

('Sing Sing Karaoke', '379 Yonge St, Toronto', 43.6578, -79.3820,
 'listings',
 ARRAY['Pop', 'Latin', 'R&B'],
 ARRAY['Karaoke', 'Late night', 'Party'],
 19, 40, 'No Dress Code', 48,
 '{"monday":"6PM-2AM","tuesday":"6PM-2AM","wednesday":"6PM-2AM","thursday":"6PM-2AM","friday":"6PM-4AM","saturday":"2PM-4AM","sunday":"2PM-12AM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #a78bfa, #8b5cf6)',
   'linear-gradient(135deg, #8b5cf6, #7c3aed)',
   'linear-gradient(135deg, #c4b5fd, #a78bfa)'
 ],
 '{"male":50,"female":50}'::jsonb,
 'karaoke');

-- ── 7. Update existing venue vibes to new vocabulary ────────
-- (expand old vibes to match the new 11-item list)

UPDATE venues SET vibes = array_replace(vibes, 'High Energy', 'Rave')
  WHERE 'High Energy' = ANY(vibes);
UPDATE venues SET vibes = array_replace(vibes, 'Casual', 'Chill')
  WHERE 'Casual' = ANY(vibes);
