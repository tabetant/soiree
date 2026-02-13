-- ================================================================
-- Soirée — Venues, Events & Check-ins Schema
-- ================================================================
-- Run this migration in your Supabase SQL Editor AFTER 001_create_profiles.sql

-- ── Venues ──────────────────────────────────────────────────

create table if not exists venues (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    address text not null,
    latitude decimal(10, 8) not null,
    longitude decimal(11, 8) not null,
    venue_type text not null check (venue_type in ('soiree_night', 'soiree_event', 'ticker')),
    music_types text[] not null default '{}',
    vibes text[] not null default '{}',
    age_range_min int default 19,
    age_range_max int default 99,
    dress_code text,
    current_density int default 0 check (current_density >= 0 and current_density <= 100),
    created_at timestamptz default now()
);

-- ── Events ──────────────────────────────────────────────────

create table if not exists events (
    id uuid primary key default gen_random_uuid(),
    venue_id uuid references venues(id) on delete cascade,
    name text not null,
    description text,
    event_date timestamptz not null,
    end_date timestamptz,
    ticket_price decimal(10, 2),
    created_at timestamptz default now()
);

-- ── Check-ins ───────────────────────────────────────────────

create table if not exists check_ins (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    venue_id uuid references venues(id) on delete cascade,
    checked_in_at timestamptz default now()
);

-- ── RLS Policies ────────────────────────────────────────────

alter table venues enable row level security;
alter table events enable row level security;
alter table check_ins enable row level security;

-- Venues: readable by all authenticated users
create policy "Venues are viewable by authenticated users"
    on venues for select
    to authenticated
    using (true);

-- Events: readable by all authenticated users
create policy "Events are viewable by authenticated users"
    on events for select
    to authenticated
    using (true);

-- Check-ins: users can view and create their own
create policy "Users can view own check-ins"
    on check_ins for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create check-ins"
    on check_ins for insert
    to authenticated
    with check (auth.uid() = user_id);

-- ── Mock Data — Toronto Venues ──────────────────────────────

insert into venues (name, address, latitude, longitude, venue_type, music_types, vibes, age_range_min, age_range_max, dress_code, current_density) values
    ('Rebel', '11 Polson St, Toronto', 43.63980000, -79.35530000, 'soiree_night', '{"EDM","House"}', '{"High Energy","Party"}', 19, 35, 'Smart casual', 78),
    ('Toybox', '473 Adelaide St W, Toronto', 43.64640000, -79.39790000, 'soiree_night', '{"Hip-Hop","R&B"}', '{"Party","High Energy"}', 19, 30, 'Dress to impress', 85),
    ('CODA', '794 Bathurst St, Toronto', 43.66310000, -79.41130000, 'soiree_night', '{"Techno","House"}', '{"Intimate","High Energy"}', 19, 40, null, 62),
    ('EFS Toronto', '647 King St W, Toronto', 43.64430000, -79.40150000, 'soiree_event', '{"Hip-Hop","R&B","Afrobeats"}', '{"Upscale","Party"}', 19, 35, 'Upscale dress code', 90),
    ('Lavelle', '627 King St W, Toronto', 43.64460000, -79.40070000, 'soiree_event', '{"House","R&B"}', '{"Upscale","Chill"}', 21, 40, 'Upscale', 55),
    ('The Drake Hotel', '1150 Queen St W, Toronto', 43.64320000, -79.42520000, 'ticker', '{"Indie","House"}', '{"Chill","Casual"}', 19, 45, null, 40),
    ('The Horseshoe Tavern', '370 Queen St W, Toronto', 43.64940000, -79.39490000, 'ticker', '{"Indie"}', '{"Casual","Intimate"}', 19, 50, null, 32),
    ('The Mahjong Bar', '136 Ossington Ave, Toronto', 43.64630000, -79.42220000, 'soiree_night', '{"R&B","Hip-Hop"}', '{"Intimate","Upscale"}', 19, 35, 'Smart casual', 70),
    ('Handlebar', '159 Augusta Ave, Toronto', 43.65330000, -79.40150000, 'ticker', '{"Indie","Reggaeton"}', '{"Casual","Party"}', 19, 40, null, 48),
    ('Cube Nightclub', '314 Queen St W, Toronto', 43.64980000, -79.39320000, 'soiree_event', '{"EDM","Techno","House"}', '{"High Energy","Party"}', 19, 30, 'No dress code', 72),
    ('Lost & Found', '577 King St W, Toronto', 43.64480000, -79.39850000, 'soiree_night', '{"Hip-Hop","Afrobeats","R&B"}', '{"Party","High Energy"}', 19, 30, 'Dress to impress', 88),
    ('Apt 200', '204 Adelaide St W, Toronto', 43.64860000, -79.38800000, 'ticker', '{"R&B","Hip-Hop"}', '{"Casual","Party"}', 19, 30, null, 58),
    ('Nest', '423 College St, Toronto', 43.65620000, -79.40580000, 'soiree_event', '{"Afrobeats","Reggaeton","Hip-Hop"}', '{"Party","High Energy"}', 19, 28, 'Smart casual', 65);
