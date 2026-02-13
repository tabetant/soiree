"use client";

/**
 * VenueMarker Component
 *
 * Renders a custom-styled marker on the map for a single venue.
 * Color-coded:
 *   - Red pulsing = Active event happening NOW
 *   - Density-based (pink/white) = No active event
 */

import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { Venue } from "@/lib/types";
import { densityMarkerColor, MARKER_COLORS } from "@/lib/mapUtils";

interface VenueMarkerProps {
    venue: Venue;
    onSelect: (venueId: string) => void;
}

export default function VenueMarker({ venue, onSelect }: VenueMarkerProps) {
    const hasActiveEvent = venue.has_active_event === true;

    // Active event → red markers; otherwise density-based colors
    const colors = hasActiveEvent
        ? { bg: "#EF4444", border: "#DC2626" }
        : densityMarkerColor(venue.current_density);

    const glyphColor = hasActiveEvent ? "#fff" : venue.current_density > 66 ? "#fff" : "#333";
    const typeGlyph = MARKER_COLORS[venue.venue_type]?.glyph || "📍";

    return (
        <AdvancedMarker
            position={{ lat: venue.latitude, lng: venue.longitude }}
            title={venue.name}
            onClick={() => onSelect(venue.id)}
        >
            <div className={hasActiveEvent ? "animate-pulse" : ""}>
                <Pin
                    background={colors.bg}
                    borderColor={colors.border}
                    glyphColor={glyphColor}
                >
                    <span className="text-sm">{typeGlyph}</span>
                </Pin>
            </div>
        </AdvancedMarker>
    );
}
