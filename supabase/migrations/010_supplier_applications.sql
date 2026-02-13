-- Migration 010: Supplier Applications
-- Self-signup form for venue owners who want to join Soirée.

CREATE TABLE IF NOT EXISTS supplier_applications (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email       TEXT NOT NULL,
    business_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    music_types TEXT[] DEFAULT '{}',
    vibe_types  TEXT[] DEFAULT '{}',
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Anyone can submit an application (no auth required)
ALTER TABLE supplier_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert applications"
    ON supplier_applications FOR INSERT
    WITH CHECK (true);

-- Only admins can view / update applications
CREATE POLICY "Admins can view applications"
    ON supplier_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update applications"
    ON supplier_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
