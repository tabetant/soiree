"use client";

/**
 * Home Page — Interactive Map
 *
 * Full-screen nightlife map of Toronto with:
 * - Fixed header (SOIRÉE logo + notification bell)
 * - Search bar
 * - Filter pills (Type, Venue, Crowd, Music, Age)
 * - Map with density-colored markers + red pulse for active events
 * - Filter modal (bottom sheet)
 * - Event detail bottom sheet on marker click
 * - Shared bottom navigation bar
 * - 60-second auto-refresh for live data
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Venue, VenueEvent, MapFilters } from "@/lib/types";
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

    // ── Load venues + events from Supabase ─────────────────────
    const loadMapData = useCallback(async () => {
        // Dev mode: always use mock data
        if (isDevMode()) {
            console.log("[Home] Dev mode ON → using mock venues");
            setVenues(MOCK_VENUES);
            setLoading(false);
            return;
        }

        console.log("[Home] Fetching real venues + events from Supabase…");
        try {
            const supabase = createClient();

            // 1. Fetch all venues with supplier info
            const { data: venuesData, error: venuesError } = await supabase
                .from("venues")
                .select(`
                    *,
                    supplier:suppliers (
                        id,
                        business_name,
                        verification_status
                    )
                `)
                .order("name");

            if (venuesError) {
                console.error("[Home] Error fetching venues:", venuesError);
                throw venuesError;
            }

            // 2. Fetch published events (current and future)
            const now = new Date().toISOString();
            const { data: eventsData, error: eventsError } = await supabase
                .from("events")
                .select("*")
                .eq("status", "published")
                .gte("end_date", now);

            if (eventsError) {
                console.error("[Home] Error fetching events:", eventsError);
            }

            const publishedEvents = eventsData || [];
            const nowDate = new Date();

            // 3. Enrich venues with active events
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrichedVenues: Venue[] = (venuesData || []).map((v: any) => {
                const venueEvents = publishedEvents.filter((e) => e.venue_id === v.id);
                const hasActiveEvent = venueEvents.some(
                    (e) =>
                        new Date(e.event_date) <= nowDate &&
                        new Date(e.end_date || e.event_date) >= nowDate
                );

                // Map DB events to VenueEvent type
                const mappedEvents: VenueEvent[] = venueEvents.map((e) => ({
                    id: e.id,
                    venue_id: e.venue_id,
                    name: e.name,
                    description: e.description || null,
                    event_date: e.event_date,
                    end_date: e.end_date || null,
                    ticket_price: e.ticket_price || null,
                    created_at: e.created_at,
                }));

                return {
                    id: v.id,
                    name: v.name,
                    address: v.address,
                    latitude: Number(v.latitude),
                    longitude: Number(v.longitude),
                    venue_type: v.venue_type,
                    venue_category: v.venue_category || null,
                    music_types: v.music_types || [],
                    vibes: v.vibes || [],
                    age_range_min: v.age_range_min || 19,
                    age_range_max: v.age_range_max || 99,
                    dress_code: v.dress_code || null,
                    current_density: v.current_density || 0,
                    hours: v.hours || null,
                    gallery_images: v.gallery_images || null,
                    gender_ratio: v.gender_ratio || null,
                    created_at: v.created_at,
                    supplier_id: v.supplier_id || null,
                    supplier: v.supplier || null,
                    active_events: mappedEvents,
                    has_active_event: hasActiveEvent,
                } as Venue;
            });

            console.log(
                `[Home] Loaded ${enrichedVenues.length} venues, ` +
                `${publishedEvents.length} published events, ` +
                `${enrichedVenues.filter((v) => v.has_active_event).length} with active events`
            );

            setVenues(enrichedVenues);
        } catch (err) {
            console.error("[Home] Supabase error:", err);
            setVenues([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load + 60-second polling for live updates
    useEffect(() => {
        loadMapData();

        const interval = setInterval(loadMapData, 60_000);
        return () => clearInterval(interval);
    }, [loadMapData]);

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
                <div className="text-center">
                    <div className="animate-float text-5xl mb-3">🌙</div>
                    <p className="text-sm text-foreground-muted">Loading map…</p>
                </div>
            </div>
        );
    }

    // Empty state when no venues exist
    if (!isDevMode() && venues.length === 0) {
        return (
            <div className="flex flex-col h-dvh w-full bg-background">
                <header className="shrink-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5">
                    <MapHeader />
                </header>
                <div className="flex-1 flex items-center justify-center px-6">
                    <div className="text-center max-w-sm">
                        <span className="text-5xl mb-4 block">🗺️</span>
                        <p className="text-lg font-semibold text-foreground mb-2">
                            No venues yet
                        </p>
                        <p className="text-sm text-foreground-muted">
                            Venues will appear here once suppliers are approved and add their
                            locations. Check back soon!
                        </p>
                    </div>
                </div>
                <BottomNav />
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
            <div className="flex-1 min-h-0 relative">
                <MapView
                    venues={searchFilteredVenues}
                    filters={filters}
                    onSelectVenue={setSelectedVenueId}
                />

                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm rounded-xl p-3 text-xs border border-border">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-foreground-muted">Active Event</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-500" />
                        <span className="text-foreground-muted">Venue</span>
                    </div>
                </div>

                {/* Stats badge */}
                <div className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs border border-border">
                    <div className="text-foreground font-semibold">
                        {searchFilteredVenues.length} venues
                    </div>
                    {venues.some((v) => v.has_active_event) && (
                        <div className="text-red-400 font-medium">
                            {venues.filter((v) => v.has_active_event).length} live
                        </div>
                    )}
                </div>
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
