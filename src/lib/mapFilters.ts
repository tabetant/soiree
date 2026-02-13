/**
 * Map Filter Logic for Soirée
 *
 * Defines filter option sets and the venue filtering function
 * used by the map page and filter UI.
 */

import type { Venue, MapFilters } from "./types";

// ── Filter Option Definitions ───────────────────────────────

export const FILTER_OPTIONS = {
    type: [
        { value: "nights", label: "Nights", description: "Soirée partner clubs/bars — recurring" },
        { value: "tickets", label: "Tickets", description: "Ticketed events — specific dates" },
        { value: "listings", label: "Listings", description: "Non-partner venues — paid placement" },
    ],
    venue: [
        { value: "club", label: "Clubs" },
        { value: "bar", label: "Bars" },
        { value: "lounge", label: "Lounges" },
        { value: "rooftop", label: "Rooftops" },
        { value: "karaoke", label: "Karaoke" },
    ],
    crowd: [
        { value: "quiet", label: "Quiet", description: "0-33% density" },
        { value: "moderate", label: "Moderate", description: "34-66% density" },
        { value: "busy", label: "Busy", description: "67-100% density" },
    ],
    music: [
        { value: "House", label: "House" },
        { value: "Techno", label: "Techno" },
        { value: "Hip-Hop", label: "Hip-Hop" },
        { value: "R&B", label: "R&B" },
        { value: "Jazz", label: "Jazz" },
        { value: "Latin", label: "Latin" },
        { value: "Pop", label: "Pop" },
        { value: "EDM", label: "EDM" },
        { value: "Afrobeats", label: "Afrobeats" },
        { value: "Disco", label: "Disco" },
    ],
    age: [
        { value: "19-24", label: "19-24" },
        { value: "25-30", label: "25-30" },
        { value: "30-40", label: "30-40" },
        { value: "40+", label: "40+" },
    ],
} as const;

export type FilterCategory = keyof typeof FILTER_OPTIONS;

export const FILTER_LABELS: Record<FilterCategory, string> = {
    type: "Type",
    venue: "Venue",
    crowd: "Crowd",
    music: "Music",
    age: "Age",
};

// ── Initial (empty) filter state ────────────────────────────

export const EMPTY_FILTERS: MapFilters = {
    types: [],
    venues: [],
    crowd: [],
    music: [],
    age: [],
};

// ── Crowd density mapping ───────────────────────────────────

function matchesCrowd(density: number, crowdFilters: string[]): boolean {
    if (crowdFilters.length === 0) return true;
    if (crowdFilters.includes("quiet") && density <= 33) return true;
    if (crowdFilters.includes("moderate") && density > 33 && density <= 66) return true;
    if (crowdFilters.includes("busy") && density > 66) return true;
    return false;
}

// ── Age range matching ──────────────────────────────────────

function matchesAge(min: number, max: number, ageFilters: string[]): boolean {
    if (ageFilters.length === 0) return true;
    for (const range of ageFilters) {
        if (range === "40+") {
            if (max >= 40) return true;
        } else {
            const [lo, hi] = range.split("-").map(Number);
            // Venue overlaps if min <= hi && max >= lo
            if (min <= hi && max >= lo) return true;
        }
    }
    return false;
}

// ── Main filter function ────────────────────────────────────

export function filterVenues(venues: Venue[], filters: MapFilters): Venue[] {
    return venues.filter((venue) => {
        // Type filter
        if (filters.types.length > 0 && !filters.types.includes(venue.venue_type)) {
            return false;
        }

        // Venue category filter
        if (filters.venues.length > 0) {
            if (!venue.venue_category || !filters.venues.includes(venue.venue_category)) {
                return false;
            }
        }

        // Crowd filter
        if (!matchesCrowd(venue.current_density, filters.crowd)) {
            return false;
        }

        // Music filter
        if (filters.music.length > 0) {
            const hasMatch = venue.music_types.some((m) => filters.music.includes(m));
            if (!hasMatch) return false;
        }

        // Age filter
        if (!matchesAge(venue.age_range_min, venue.age_range_max, filters.age)) {
            return false;
        }

        return true;
    });
}

// ── Active filter count ─────────────────────────────────────

export function totalActiveFilters(filters: MapFilters): number {
    return (
        filters.types.length +
        filters.venues.length +
        filters.crowd.length +
        filters.music.length +
        filters.age.length
    );
}

/** Count of active selections for a specific filter category */
export function categoryCount(filters: MapFilters, category: FilterCategory): number {
    switch (category) {
        case "type": return filters.types.length;
        case "venue": return filters.venues.length;
        case "crowd": return filters.crowd.length;
        case "music": return filters.music.length;
        case "age": return filters.age.length;
    }
}
