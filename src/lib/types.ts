/**
 * TypeScript Types for Soirée
 */

// ── Music Genres ────────────────────────────────────────────
export const MUSIC_GENRES = [
    "House",
    "Techno",
    "Hip-Hop",
    "R&B",
    "Jazz",
    "Latin",
    "Pop",
    "EDM",
    "Afrobeats",
    "Disco",
] as const;

export type MusicGenre = (typeof MUSIC_GENRES)[number];

// ── Vibe Options ────────────────────────────────────────────
export const VIBE_OPTIONS = [
    "Chill",
    "Upscale",
    "Rave",
    "Hip hop",
    "Rooftop",
    "Lounge",
    "Karaoke",
    "Party",
    "Intimate",
    "Late night",
    "Live music",
] as const;

export type VibeOption = (typeof VIBE_OPTIONS)[number];

// ── Vibe Icons (emoji + label for vibe cards) ───────────────
export const VIBE_ICONS: Record<VibeOption, string> = {
    Chill: "🌊",
    Upscale: "✨",
    Rave: "⚡",
    "Hip hop": "🎤",
    Rooftop: "🏙️",
    Lounge: "🛋️",
    Karaoke: "🎶",
    Party: "🎉",
    Intimate: "🕯️",
    "Late night": "🌙",
    "Live music": "🎸",
};

// ── Vibe Descriptions ───────────────────────────────────────
export const VIBE_DESCRIPTIONS: Record<VibeOption, string> = {
    Chill: "Relaxed atmosphere",
    Upscale: "Premium experience",
    Rave: "High energy",
    "Hip hop": "Urban beats",
    Rooftop: "Open-air vibes",
    Lounge: "Laid-back setting",
    Karaoke: "Sing your heart out",
    Party: "Dance all night",
    Intimate: "Cozy & close",
    "Late night": "After-hours fun",
    "Live music": "Live performances",
};

// ── User Profile (matches Supabase `profiles` table) ────────
export type UserRole = "consumer" | "supplier" | "admin";

export interface UserProfile {
    id: string;
    username: string;
    display_name?: string | null;
    bio?: string | null;
    profile_picture_url?: string | null;
    date_of_birth: string; // ISO date string (YYYY-MM-DD)
    music_preferences: MusicGenre[];
    vibe_preferences: VibeOption[];
    total_xp: number;
    level: number;
    stars: number; // 0-100 reputation score
    role: UserRole;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

// ── Onboarding Form State ───────────────────────────────────
export interface OnboardingFormData {
    username: string;
    dateOfBirth: string;
    musicPreferences: MusicGenre[];
    vibePreferences: VibeOption[];
}

// ── Venue Types ─────────────────────────────────────────────
export const VENUE_TYPES = [
    "nights",
    "tickets",
    "listings",
] as const;

export type VenueType = (typeof VENUE_TYPES)[number];

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
    nights: "Nights",
    tickets: "Tickets",
    listings: "Listings",
};

// ── Venue Categories ────────────────────────────────────────
export const VENUE_CATEGORIES = [
    "club",
    "bar",
    "lounge",
    "rooftop",
    "karaoke",
] as const;

export type VenueCategory = (typeof VENUE_CATEGORIES)[number];

export const VENUE_CATEGORY_LABELS: Record<VenueCategory, string> = {
    club: "Clubs",
    bar: "Bars",
    lounge: "Lounges",
    rooftop: "Rooftops",
    karaoke: "Karaoke",
};

export interface Venue {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    venue_type: VenueType;
    venue_category?: VenueCategory | null;
    music_types: string[];
    vibes: string[];
    age_range_min: number;
    age_range_max: number;
    dress_code: string | null;
    current_density: number; // 0-100
    hours?: Record<string, string> | null; // e.g. { "friday": "10PM-3AM" }
    gallery_images?: string[] | null;
    gender_ratio?: { male: number; female: number } | null;
    created_at: string;
}

export interface VenueEvent {
    id: string;
    venue_id: string;
    name: string;
    description: string | null;
    event_date: string;
    end_date: string | null;
    ticket_price: number | null;
    created_at: string;
}

// ── Map Filters ─────────────────────────────────────────────
export interface MapFilters {
    types: string[];    // ['nights', 'tickets', 'listings']
    venues: string[];   // ['club', 'bar', 'lounge', 'rooftop']
    crowd: string[];    // ['quiet', 'moderate', 'busy']
    music: string[];    // music genres
    age: string[];      // ['19-24', '25-30', '30-40', '40+']
}

export interface LoyaltyTask {
    id: string;
    venue_id: string;
    task_description: string;
    reward_description: string;
    xp_value: number;
    active: boolean;
    created_at: string;
}

// ── Achievements ────────────────────────────────────────────

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string | null;
    xp_reward: number;
    requirement_type: string;
    requirement_value: number;
    created_at: string;
}

// ── Social Feed ─────────────────────────────────────────────

export interface PostAuthor {
    username: string;
    display_name?: string | null;
    profile_picture_url?: string | null;
}

export interface PostVenue {
    name: string;
    latitude: number;
    longitude: number;
}

export interface Post {
    id: string;
    user_id: string;
    user: PostAuthor;
    venue_id?: string | null;
    venue?: PostVenue | null;
    caption?: string | null;
    image_urls: string[];
    location_name?: string | null;
    created_at: string;
    like_count: number;
    comment_count: number;
    is_liked_by_user: boolean;
}

export interface Comment {
    id: string;
    user: PostAuthor;
    comment_text: string;
    created_at: string;
}

export interface Notification {
    id: string;
    type: "like" | "comment" | "follow" | "achievement" | "loyalty_reward";
    from_user_id: string;
    from_user?: PostAuthor | null;
    post_id?: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}
