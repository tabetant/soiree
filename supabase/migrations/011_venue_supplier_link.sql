-- ============================================================
-- Migration 011: Link venues to suppliers
-- ============================================================
-- Adds supplier_id FK to venues so we can trace which supplier
-- owns each venue. Also adds RLS policies so suppliers can
-- manage their own venues and events.
-- ============================================================

-- ── Add supplier_id to venues ───────────────────────────────
ALTER TABLE venues ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS venue_category text;

-- ── Supplier can insert venues ──────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can insert own venues' AND tablename = 'venues'
  ) THEN
    CREATE POLICY "Suppliers can insert own venues"
      ON venues FOR INSERT TO authenticated
      WITH CHECK (
        auth.uid() IN (SELECT user_id FROM suppliers WHERE id = supplier_id)
      );
  END IF;
END $$;

-- ── Supplier can update own venues ──────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can update own venues' AND tablename = 'venues'
  ) THEN
    CREATE POLICY "Suppliers can update own venues"
      ON venues FOR UPDATE TO authenticated
      USING (
        auth.uid() IN (SELECT user_id FROM suppliers WHERE id = supplier_id)
      );
  END IF;
END $$;

-- ── Supplier can insert events ──────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can insert own events' AND tablename = 'events'
  ) THEN
    CREATE POLICY "Suppliers can insert own events"
      ON events FOR INSERT TO authenticated
      WITH CHECK (
        auth.uid() IN (SELECT user_id FROM suppliers WHERE id = supplier_id)
      );
  END IF;
END $$;

-- ── Supplier can update own events ──────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can update own events' AND tablename = 'events'
  ) THEN
    CREATE POLICY "Suppliers can update own events"
      ON events FOR UPDATE TO authenticated
      USING (
        auth.uid() IN (SELECT user_id FROM suppliers WHERE id = supplier_id)
      );
  END IF;
END $$;

-- ── Backfill: link seed venues to first approved supplier ───
-- (Optional: run manually if you want existing venues to show)
-- UPDATE venues SET supplier_id = (SELECT id FROM suppliers WHERE verification_status = 'approved' LIMIT 1)
-- WHERE supplier_id IS NULL;
