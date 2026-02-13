-- ============================================================
-- Migration 009: Admin Dashboard Tables
-- ============================================================
-- Admin action logs, user/event flags, ban infrastructure,
-- and expanded supplier verification statuses.
-- ============================================================

-- ── 1. Add banned status to suppliers ───────────────────────

ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_verification_status_check;
ALTER TABLE suppliers ADD CONSTRAINT suppliers_verification_status_check
  CHECK (verification_status IN ('pending', 'approved', 'rejected', 'banned'));

-- ── 2. Add rejection reason to suppliers ────────────────────

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS rejection_reason text;

-- ── 3. Add ban columns to profiles ──────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by uuid REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;

CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned);

-- ── 4. Admin action logs ────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_date ON admin_actions(created_at DESC);

-- ── 5. Flags (user/event reports) ───────────────────────────

CREATE TABLE IF NOT EXISTS flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  target_type text NOT NULL CHECK (target_type IN ('user', 'event', 'post', 'comment')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flags_status ON flags(status);
CREATE INDEX IF NOT EXISTS idx_flags_target ON flags(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_flags_reporter ON flags(reporter_id);

-- ── 6. RLS ──────────────────────────────────────────────────

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Admins can read/write admin_actions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admins_manage_actions' AND tablename = 'admin_actions'
  ) THEN
    CREATE POLICY "admins_manage_actions" ON admin_actions FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Admins can manage flags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admins_manage_flags' AND tablename = 'flags'
  ) THEN
    CREATE POLICY "admins_manage_flags" ON flags FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Users can create flags (report content)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_create_flags' AND tablename = 'flags'
  ) THEN
    CREATE POLICY "users_create_flags" ON flags FOR INSERT
      WITH CHECK (auth.uid() = reporter_id);
  END IF;
END $$;
