"use client";

/**
 * MapView Component
 *
 * Full-screen Google Maps with:
 * - Night mode styling
 * - Venue markers (density-colored, click to select)
 * - Heat map density overlay
 * - 60-second polling to simulate live density updates
 */

import { useState, useEffect, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import type { Venue, MapFilters } from "@/lib/types";
import { filterVenues } from "@/lib/mapFilters";
import { fluctuateDensity, NIGHT_MAP_STYLES } from "@/lib/mapUtils";
import VenueMarker from "./VenueMarker";
import HeatMapLayer from "./HeatMapLayer";

// Toronto center
const TORONTO = { lat: 43.6532, lng: -79.3832 };
const MAP_ID = "soiree-night-map";

interface MapViewProps {
    venues: Venue[];
    filters: MapFilters;
    onSelectVenue: (venueId: string) => void;
}

export default function MapView({ venues: initialVenues, filters, onSelectVenue }: MapViewProps) {
    const [venues, setVenues] = useState<Venue[]>(initialVenues);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    // Filter venues based on active filters
    const visibleVenues = filterVenues(venues, filters);

    // Simulate density fluctuations every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setVenues((prev) =>
                prev.map((v) => ({
                    ...v,
                    current_density: fluctuateDensity(v.current_density),
                }))
            );
        }, 60_000);

        return () => clearInterval(interval);
    }, []);

    // Update venues when initial data changes
    useEffect(() => {
        setVenues(initialVenues);
    }, [initialVenues]);

    // Locate user
    const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
    const handleLocate = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {/* Permission denied — just ignore */ }
        );
    }, []);

    if (!apiKey) {
        return (
            <div className="flex h-full items-center justify-center bg-background">
                <div className="text-center px-6">
                    <p className="text-4xl mb-3">🗺️</p>
                    <p className="text-lg font-semibold text-foreground">
                        Google Maps API key required
                    </p>
                    <p className="text-sm text-foreground-muted mt-2 max-w-xs">
                        Add <code className="text-accent">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
                        your <code className="text-accent">.env.local</code> file to see the map.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey} libraries={["visualization"]}>
            <Map
                defaultCenter={userPos || TORONTO}
                defaultZoom={13}
                mapId={MAP_ID}
                styles={NIGHT_MAP_STYLES}
                disableDefaultUI
                zoomControl
                gestureHandling="greedy"
                className="h-full w-full"
            >
                {/* Heat map layer */}
                <HeatMapLayer venues={visibleVenues} />

                {/* Venue markers */}
                {visibleVenues.map((venue) => (
                    <VenueMarker
                        key={venue.id}
                        venue={venue}
                        onSelect={onSelectVenue}
                    />
                ))}
            </Map>

            {/* Locate me button */}
            <button
                onClick={handleLocate}
                className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary/90 backdrop-blur-md border border-border shadow-xl text-foreground hover:bg-surface-hover transition-colors"
                aria-label="Find my location"
                title="Find my location"
            >
                📍
            </button>
        </APIProvider>
    );
}
