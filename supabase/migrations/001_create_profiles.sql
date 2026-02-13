-- Soirée: Profiles Table Migration
-- Stores user onboarding data (username, DOB, music preferences, vibe preferences)

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  date_of_birth date not null,
  music_preferences text[] not null,
  vibe_preferences text[] not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policy: Users can only read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Policy: Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Policy: Users can only insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Auto-update the updated_at field on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();
