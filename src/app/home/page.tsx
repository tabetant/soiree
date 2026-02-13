"use client";

/**
 * Home Page — Interactive Map
 *
 * Full-screen nightlife map of Toronto with:
 * - Fixed header (SOIRÉE logo + notification bell)
 * - Search bar
 * - Filter pills (Type, Venue, Crowd, Music, Age)
 * - Map with density-colored markers
 * - Filter modal (bottom sheet)
 * - Event detail bottom sheet on marker click
 * - Shared bottom navigation bar
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Venue, MapFilters } from "@/lib/types";
import { EMPTY_FILTERS, type FilterCategory } from "@/lib/mapFilters";
import MapView from "@/components/map/MapView";
import MapHeader from "@/components/map/MapHeader";
import FilterPills from "@/components/map/FilterPills";
import FilterModal from "@/components/map/FilterModal";
import EventDetailSheet from "@/components/map/EventDetailSheet";
import BottomNav from "@/components/BottomNav";
import { MOCK_VENUES } from "@/lib/mockData";

import { isDevMode } from "@/lib/devMode";

export default function HomePage() {
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);

    // Filter modal state
    const [activeFilterCategory, setActiveFilterCategory] = useState<FilterCategory | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // Load venues — check dev mode first
    useEffect(() => {
        async function loadVenues() {
            // Dev mode: always use mock data
            if (isDevMode()) {
                console.log("[Home] Dev mode ON → using mock venues");
                setVenues(MOCK_VENUES);
                setLoading(false);
                return;
            }

            console.log("[Home] Dev mode OFF → fetching real venues from Supabase");
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("venues")
                    .select("*")
                    .order("name");

                if (!error && data && data.length > 0) {
                    // Merge DB venues with mock data for any missing fields
                    const enriched = data.map((dbVenue) => {
                        const mockMatch = MOCK_VENUES.find((m: Venue) => m.name === dbVenue.name);
                        return {
                            ...mockMatch,
                            ...dbVenue,
                            hours: dbVenue.hours || mockMatch?.hours,
                            gallery_images: dbVenue.gallery_images || mockMatch?.gallery_images,
                            gender_ratio: dbVenue.gender_ratio || mockMatch?.gender_ratio,
                        } as Venue;
                    });
                    console.log(`[Home] Loaded ${enriched.length} real venues from Supabase`);
                    setVenues(enriched);
                } else {
                    console.log("[Home] No venues in Supabase — showing empty state");
                    setVenues([]);
                }
            } catch (err) {
                console.error("[Home] Supabase error:", err);
                setVenues([]);
            } finally {
                setLoading(false);
            }
        }

        loadVenues();
    }, []);

    // Search-filtered venues (applied before map filters)
    const searchFilteredVenues = useMemo(() => {
        if (!searchQuery.trim()) return venues;
        const q = searchQuery.toLowerCase();
        return venues.filter(
            (v) =>
                v.name.toLowerCase().includes(q) ||
                v.address.toLowerCase().includes(q) ||
                v.music_types.some((m) => m.toLowerCase().includes(q)) ||
                v.vibes.some((vb) => vb.toLowerCase().includes(q))
        );
    }, [venues, searchQuery]);

    // Get selected values for the active filter category
    const getSelectedValues = (cat: FilterCategory): string[] => {
        switch (cat) {
            case "type": return filters.types;
            case "venue": return filters.venues;
            case "crowd": return filters.crowd;
            case "music": return filters.music;
            case "age": return filters.age;
        }
    };

    // Apply filter from modal
    const handleApplyFilter = (cat: FilterCategory, selected: string[]) => {
        setFilters((prev) => {
            switch (cat) {
                case "type": return { ...prev, types: selected };
                case "venue": return { ...prev, venues: selected };
                case "crowd": return { ...prev, crowd: selected };
                case "music": return { ...prev, music: selected };
                case "age": return { ...prev, age: selected };
            }
        });
    };

    if (loading) {
        return (
            <div className="flex h-dvh items-center justify-center bg-background">
                <div className="animate-float text-5xl">🌙</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-dvh w-full bg-background">
            {/* ── Fixed Header ──────────────────────────────── */}
            <header className="shrink-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5">
                {/* Logo bar */}
                <MapHeader />

                {/* Search bar */}
                <div className="px-3 pb-2">
                    <div className="relative">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search clubs, events..."
                            className="h-11 w-full rounded-xl bg-[#1a1a1a] border border-white/10 pl-10 pr-4 text-sm text-foreground placeholder:text-gray-500 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                        />
                    </div>
                </div>

                {/* Filter pills */}
                <FilterPills
                    filters={filters}
                    onOpenFilter={(cat) => setActiveFilterCategory(cat)}
                />
            </header>

            {/* ── Map ───────────────────────────────────────── */}
            <div className="flex-1 min-h-0">
                <MapView
                    venues={searchFilteredVenues}
                    filters={filters}
                    onSelectVenue={setSelectedVenueId}
                />
            </div>

            {/* ── Event detail bottom sheet ──────────────────── */}
            <EventDetailSheet
                venueId={selectedVenueId}
                onClose={() => setSelectedVenueId(null)}
                venues={venues}
            />

            {/* ── Filter modal ──────────────────────────────── */}
            {activeFilterCategory && (
                <FilterModal
                    filterType={activeFilterCategory}
                    isOpen={true}
                    onClose={() => setActiveFilterCategory(null)}
                    selectedValues={getSelectedValues(activeFilterCategory)}
                    onApply={(selected) => {
                        handleApplyFilter(activeFilterCategory, selected);
                    }}
                />
            )}

            {/* ── Bottom navigation ─────────────────────────── */}
            <BottomNav />
        </div>
    );
}
