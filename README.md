# Soirée — Nightlife Discovery

Discover Toronto's best bars, clubs, and events — curated to your vibe.

## Getting Started

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Authentication → Providers** and enable:
   - **Google** — add your OAuth credentials from the [Google Cloud Console](https://console.cloud.google.com/)
   - **Apple** — add your Apple Sign In credentials from the [Apple Developer Portal](https://developer.apple.com/)
3. Set the **Site URL** to `http://localhost:3000`
4. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

### 2. Run the Database Migration

In the Supabase dashboard, go to **SQL Editor** and run the contents of:

```
supabase/migrations/001_create_profiles.sql
```

This creates the `profiles` table with RLS policies.

### 3. Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Find your credentials in **Supabase Dashboard → Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` / `public` key

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the onboarding flow.

## Project Structure

```
src/
├── app/
│   ├── auth/callback/route.ts      # OAuth redirect handler
│   ├── home/page.tsx                # Placeholder home page
│   ├── onboarding/
│   │   ├── layout.tsx               # Shared onboarding layout + progress bar
│   │   ├── step-1-auth/page.tsx     # Sign in with Apple/Google
│   │   ├── step-2-dob/page.tsx      # Date of birth (19+ validation)
│   │   ├── step-3-music/page.tsx    # Music genre selection
│   │   └── step-4-vibe/page.tsx     # Vibe selection + profile save
│   ├── globals.css                  # Dark nightlife theme
│   └── layout.tsx                   # Root layout
├── components/onboarding/
│   ├── AuthButtons.tsx              # Apple/Google OAuth buttons
│   ├── DateOfBirthPicker.tsx        # DOB picker with age validation
│   ├── MusicSelector.tsx            # Genre autocomplete + chips
│   ├── ProgressBar.tsx              # Step progress indicator
│   └── VibeSelector.tsx             # Vibe card grid
├── lib/
│   ├── supabase.ts                  # Browser Supabase client
│   ├── supabase-server.ts           # Server Supabase client
│   └── types.ts                     # TypeScript interfaces + constants
├── middleware.ts                    # Auth middleware (session + route protection)
supabase/
└── migrations/
    └── 001_create_profiles.sql      # Database schema + RLS policies
```

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Auth + Database)
