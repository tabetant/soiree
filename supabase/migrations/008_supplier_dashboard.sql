-- ============================================================
-- Migration 008: Supplier Dashboard Tables
-- ============================================================
-- New tables for event management, tasks, rewards, tickets,
-- attendances, and analytics tracking.
-- ============================================================

-- ── Update events table ─────────────────────────────────────

ALTER TABLE events ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_category text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_range text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_tier text CHECK (price_tier IN ('$', '$$', '$$$'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity int;
ALTER TABLE events ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS checkin_qr_secret text UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS refund_policy text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ended'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS tasks_enabled boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS rewards_enabled boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS age_requirement int DEFAULT 19;
ALTER TABLE events ADD COLUMN IF NOT EXISTS music_types text[] DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS vibes text[] DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';

-- ── Tasks ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    task_type text NOT NULL CHECK (task_type IN ('checkin', 'early_checkin', 'bring_friend')),
    xp_value int NOT NULL DEFAULT 10,
    early_checkin_time time,
    created_at timestamptz DEFAULT now()
);

-- ── Rewards ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
    name text NOT NULL,
    reward_type text NOT NULL,
    description text NOT NULL,
    min_level int DEFAULT 0,
    expiry_type text CHECK (expiry_type IN ('same_night', 'date_range')),
    expiry_date timestamptz,
    inventory_limit int,
    redemption_limit_per_user int DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- ── User Rewards (inventory) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS user_rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id uuid REFERENCES rewards(id) ON DELETE CASCADE,
    status text DEFAULT 'available' CHECK (status IN ('available', 'redeemed', 'expired')),
    dynamic_qr_seed text,
    redeemed_at timestamptz,
    redeemed_by uuid REFERENCES suppliers(id),
    created_at timestamptz DEFAULT now()
);

-- ── Tickets ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    ticket_type text NOT NULL,
    price decimal(10, 2) NOT NULL,
    quantity int NOT NULL,
    sales_start timestamptz NOT NULL,
    sales_end timestamptz NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- ── Ticket Purchases ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ticket_purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    ticket_id uuid REFERENCES tickets(id),
    stripe_payment_ref text,
    ticket_qr_secret text UNIQUE NOT NULL,
    status text DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'refunded', 'cancelled')),
    purchased_at timestamptz DEFAULT now()
);

-- ── Ticket Scans (door entry log) ────────────────────────────

CREATE TABLE IF NOT EXISTS ticket_scans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id uuid REFERENCES ticket_purchases(id) ON DELETE CASCADE,
    scanned_at timestamptz DEFAULT now(),
    scanned_by uuid REFERENCES suppliers(id)
);

-- ── Attendances (check-ins) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS attendances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
    checked_in_at timestamptz DEFAULT now(),
    method text DEFAULT 'qr' CHECK (method IN ('qr', 'manual')),
    UNIQUE(user_id, event_id)
);

-- ── Analytics Tracking ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    date date NOT NULL,
    map_impressions int DEFAULT 0,
    event_opens int DEFAULT 0,
    saves int DEFAULT 0,
    shares int DEFAULT 0,
    check_ins int DEFAULT 0,
    ticket_sales int DEFAULT 0,
    UNIQUE(event_id, date)
);

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;

-- Suppliers can manage their own events' tasks
CREATE POLICY "suppliers_manage_tasks" ON tasks FOR ALL
    USING (event_id IN (
        SELECT e.id FROM events e
        JOIN suppliers s ON e.supplier_id = s.id
        WHERE s.user_id = auth.uid()
    ));

-- Suppliers can manage their own events' rewards
CREATE POLICY "suppliers_manage_rewards" ON rewards FOR ALL
    USING (event_id IN (
        SELECT e.id FROM events e
        JOIN suppliers s ON e.supplier_id = s.id
        WHERE s.user_id = auth.uid()
    ));

-- Users can view their own rewards
CREATE POLICY "users_view_own_rewards" ON user_rewards FOR SELECT
    USING (user_id = auth.uid());

-- Suppliers can manage tickets for their events
CREATE POLICY "suppliers_manage_tickets" ON tickets FOR ALL
    USING (event_id IN (
        SELECT e.id FROM events e
        JOIN suppliers s ON e.supplier_id = s.id
        WHERE s.user_id = auth.uid()
    ));

-- Users can view their own ticket purchases
CREATE POLICY "users_view_own_purchases" ON ticket_purchases FOR SELECT
    USING (user_id = auth.uid());

-- Suppliers can view & create ticket scans for their events
CREATE POLICY "suppliers_manage_scans" ON ticket_scans FOR ALL
    USING (purchase_id IN (
        SELECT tp.id FROM ticket_purchases tp
        JOIN events e ON tp.event_id = e.id
        JOIN suppliers s ON e.supplier_id = s.id
        WHERE s.user_id = auth.uid()
    ));

-- Users can view their own attendances
CREATE POLICY "users_view_own_attendances" ON attendances FOR SELECT
    USING (user_id = auth.uid());

-- Suppliers can view attendances for their events
CREATE POLICY "suppliers_view_attendances" ON attendances FOR SELECT
    USING (event_id IN (
        SELECT e.id FROM events e
        JOIN suppliers s ON e.supplier_id = s.id
        WHERE s.user_id = auth.uid()
    ));

-- Suppliers can view analytics for their events
CREATE POLICY "suppliers_view_analytics" ON event_analytics FOR SELECT
    USING (event_id IN (
        SELECT e.id FROM events e
        JOIN suppliers s ON e.supplier_id = s.id
        WHERE s.user_id = auth.uid()
    ));

-- Anyone can read published events' tasks/rewards/tickets
CREATE POLICY "public_read_tasks" ON tasks FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE status = 'published'));

CREATE POLICY "public_read_rewards" ON rewards FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE status = 'published'));

CREATE POLICY "public_read_tickets" ON tickets FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE status = 'published'));
