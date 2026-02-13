/**
 * Map Utilities for Soirée Homepage
 *
 * Contains Google Maps styling, marker colors,
 * and heat map data builders.
 */

import type { VenueType } from "./types";

// ── Marker Colors by Venue Type ─────────────────────────────

export const MARKER_COLORS: Record<VenueType, { bg: string; border: string; glyph: string }> = {
    nights: { bg: "#8b5cf6", border: "#6d28d9", glyph: "🌙" },
    tickets: { bg: "#f59e0b", border: "#d97706", glyph: "🎫" },
    listings: { bg: "#6b7280", border: "#4b5563", glyph: "📍" },
};

// ── Density-based marker colors ─────────────────────────────

export function densityMarkerColor(density: number): { bg: string; border: string } {
    if (density > 66) return { bg: "#ef4444", border: "#dc2626" }; // Red (busy)
    return { bg: "#ffffff", border: "#d1d5db" }; // White (quiet/moderate)
}

// ── Google Maps Default Style (light) ───────────────────────
// We use the default Google Maps light theme so users can see
// street names, landmarks, and neighborhoods clearly.
// The surrounding app UI stays dark.

export const NIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [];

// ── Heat Map Gradient ───────────────────────────────────────

export const HEAT_MAP_GRADIENT = [
    "rgba(0, 0, 0, 0)",
    "rgba(107, 77, 182, 0.4)",  // Purple (low)
    "rgba(139, 92, 246, 0.6)",  // Violet
    "rgba(196, 141, 255, 0.7)", // Lavender
    "rgba(245, 158, 11, 0.8)",  // Yellow/Orange (medium)
    "rgba(249, 115, 22, 0.85)", // Orange
    "rgba(239, 68, 68, 0.9)",   // Red (high)
    "rgba(236, 72, 153, 0.95)", // Pink (very high)
];

// ── Density Helpers ─────────────────────────────────────────

/** Generate a realistic fluctuation for mock density data */
export function fluctuateDensity(current: number): number {
    const delta = Math.floor(Math.random() * 21) - 10; // -10 to +10
    return Math.max(0, Math.min(100, current + delta));
}

/** Map density value (0-100) to a human-readable label */
export function densityLabel(density: number): string {
    if (density < 25) return "Quiet";
    if (density < 50) return "Moderate";
    if (density < 75) return "Busy";
    return "Packed";
}

/** Map density value to a color for display */
export function densityColor(density: number): string {
    if (density < 25) return "#06b6d4"; // cyan
    if (density < 50) return "#22c55e"; // green
    if (density < 75) return "#f59e0b"; // amber
    return "#ef4444"; // red
}
