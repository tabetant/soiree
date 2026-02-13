"use client";

/**
 * HeatMapLayer Component
 *
 * Renders a Google Maps HeatmapLayer using venue positions
 * weighted by their current density values.
 *
 * Uses the Maps JavaScript API visualization library directly.
 */

import { useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Venue } from "@/lib/types";
import { HEAT_MAP_GRADIENT } from "@/lib/mapUtils";

interface HeatMapLayerProps {
    venues: Venue[];
}

export default function HeatMapLayer({ venues }: HeatMapLayerProps) {
    const map = useMap();
    const visualization = useMapsLibrary("visualization");
    const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

    useEffect(() => {
        if (!map || !visualization) return;

        // Build weighted data points
        const data = venues.map((venue) => ({
            location: new google.maps.LatLng(venue.latitude, venue.longitude),
            weight: Math.max(venue.current_density / 100, 0.05), // min weight for visibility
        }));

        if (heatmapRef.current) {
            // Update existing layer data
            heatmapRef.current.setData(data);
        } else {
            // Create new heat map layer
            heatmapRef.current = new visualization.HeatmapLayer({
                data,
                map,
                radius: 60,
                opacity: 0.7,
                gradient: HEAT_MAP_GRADIENT,
            });
        }

        return () => {
            // Cleanup on unmount
            if (heatmapRef.current) {
                heatmapRef.current.setMap(null);
                heatmapRef.current = null;
            }
        };
    }, [map, visualization, venues]);

    return null; // This component only manages the map layer imperatively
}
