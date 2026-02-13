"use client";

/**
 * VenueMarker Component
 *
 * Renders a custom-styled marker on the map for a single venue.
 * Color-coded by crowd density:
 *   - Red/pink pulse = Busy (67-100%)
 *   - White = Quiet/Moderate
 */

import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { Venue } from "@/lib/types";
import { densityMarkerColor, MARKER_COLORS } from "@/lib/mapUtils";

interface VenueMarkerProps {
    venue: Venue;
    onSelect: (venueId: string) => void;
}

export default function VenueMarker({ venue, onSelect }: VenueMarkerProps) {
    const densityColors = densityMarkerColor(venue.current_density);
    const isBusy = venue.current_density > 66;
    const typeGlyph = MARKER_COLORS[venue.venue_type]?.glyph || "📍";

    return (
        <AdvancedMarker
            position={{ lat: venue.latitude, lng: venue.longitude }}
            title={venue.name}
            onClick={() => onSelect(venue.id)}
        >
            <div className={isBusy ? "animate-pulse" : ""}>
                <Pin
                    background={densityColors.bg}
                    borderColor={densityColors.border}
                    glyphColor={isBusy ? "#fff" : "#333"}
                >
                    <span className="text-sm">{typeGlyph}</span>
                </Pin>
            </div>
        </AdvancedMarker>
    );
}
