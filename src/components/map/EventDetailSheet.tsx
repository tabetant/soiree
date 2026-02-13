"use client";

/**
 * EventDetailSheet Component
 *
 * Bottom sheet that slides up when a venue marker is clicked.
 * Shows venue details, density stats, gallery, loyalty tasks, and actions.
 *
 * Uses mock data for fields not yet in the database (hours, gallery, gender ratio).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { Venue, LoyaltyTask } from "@/lib/types";
import { VENUE_TYPE_LABELS } from "@/lib/types";
import { MARKER_COLORS, densityLabel, densityColor } from "@/lib/mapUtils";
import { MOCK_VENUES, MOCK_LOYALTY_TASKS, MOCK_GALLERY, MOCK_HOURS, MOCK_GENDER_RATIOS } from "@/lib/mockData";

interface EventDetailSheetProps {
    venueId: string | null;
    onClose: () => void;
    /** Pass the venues array from the parent so lookups work with any data source */
    venues?: Venue[];
}

export default function EventDetailSheet({ venueId, onClose, venues: parentVenues }: EventDetailSheetProps) {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [tasks, setTasks] = useState<LoyaltyTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragStartY = useRef(0);
    const sheetStartY = useRef(0);

    // Load venue data when venueId changes
    useEffect(() => {
        if (!venueId) {
            setVenue(null);
            setTasks([]);
            return;
        }

        console.log("[Soirée] Fetching venue:", venueId);
        setLoading(true);
        setError(null);

        // Search provided venues first (from parent), then mock data as fallback
        const allSources = parentVenues && parentVenues.length > 0 ? parentVenues : MOCK_VENUES;
        const found = allSources.find((v) => v.id === venueId)
            || MOCK_VENUES.find((v) => v.id === venueId)
            || MOCK_VENUES.find((v) => v.name.toLowerCase().replace(/\s+/g, '') === venueId.toLowerCase().replace(/\s+/g, ''));

        if (found) {
            console.log("[Soirée] Found venue:", found.name);
            // Enrich with mock detail data — check venue's own fields first, then lookup maps
            const enriched: Venue = {
                ...found,
                hours: found.hours || MOCK_HOURS[found.id] || null,
                gallery_images: found.gallery_images || MOCK_GALLERY[found.id] || null,
                gender_ratio: found.gender_ratio || MOCK_GENDER_RATIOS[found.id] || { male: 55, female: 45 },
            };
            setVenue(enriched);
            setTasks(MOCK_LOYALTY_TASKS.filter((t) => t.venue_id === found.id));
            console.log("[Soirée] Venue enriched:", {
                name: enriched.name,
                hasHours: !!enriched.hours,
                hasGallery: !!enriched.gallery_images,
                hasGenderRatio: !!enriched.gender_ratio,
                taskCount: MOCK_LOYALTY_TASKS.filter((t) => t.venue_id === found.id).length,
            });
        } else {
            console.warn("[Soirée] Venue not found in mock data:", venueId);
            setError("Venue not found");
        }
        setLoading(false);
    }, [venueId]);

    // Drag-to-dismiss handling
    const handleDragStart = useCallback((clientY: number) => {
        dragStartY.current = clientY;
        if (sheetRef.current) {
            sheetStartY.current = sheetRef.current.getBoundingClientRect().top;
        }
    }, []);

    const handleDragMove = useCallback((clientY: number) => {
        const delta = clientY - dragStartY.current;
        if (delta > 0 && sheetRef.current) {
            sheetRef.current.style.transform = `translateY(${delta}px)`;
        }
    }, []);

    const handleDragEnd = useCallback((clientY: number) => {
        const delta = clientY - dragStartY.current;
        if (sheetRef.current) {
            sheetRef.current.style.transform = "";
        }
        // If dragged more than 100px down, close
        if (delta > 100) {
            onClose();
        }
    }, [onClose]);

    // Touch handlers
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        handleDragStart(e.touches[0].clientY);
    }, [handleDragStart]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        handleDragMove(e.touches[0].clientY);
    }, [handleDragMove]);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        handleDragEnd(e.changedTouches[0].clientY);
    }, [handleDragEnd]);

    // Mouse handlers for desktop
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        handleDragStart(e.clientY);
        const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
        const onUp = (ev: MouseEvent) => {
            handleDragEnd(ev.clientY);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }, [handleDragStart, handleDragMove, handleDragEnd]);

    const isOpen = venueId !== null;

    if (!isOpen) return null;

    const handleCheckIn = () => {
        console.log("[Soirée] Check-in at:", venue?.name, venue?.id);
        // TODO: Implement actual check-in
    };

    const handleShare = async () => {
        if (navigator.share && venue) {
            try {
                await navigator.share({
                    title: `${venue.name} — Soirée`,
                    text: `Check out ${venue.name} on Soirée!`,
                    url: window.location.href,
                });
            } catch {
                // User cancelled
            }
        }
    };

    const handleDirections = () => {
        if (venue) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}&destination_place_id=${encodeURIComponent(venue.name)}`;
            window.open(url, "_blank");
        }
    };

    // Get today's hours
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const todayHours = venue?.hours?.[today];

    const isPartner = venue?.venue_type === "nights" || venue?.venue_type === "tickets";
    const colors = venue ? MARKER_COLORS[venue.venue_type] : MARKER_COLORS.listings;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className={`fixed bottom-0 left-0 right-0 z-50 max-h-[80dvh] rounded-t-3xl bg-background-secondary border-t border-border shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{ willChange: "transform" }}
            >
                {/* Drag handle */}
                <div
                    className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseDown={onMouseDown}
                >
                    <div className="h-1 w-10 rounded-full bg-foreground-muted/30" />
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto max-h-[calc(80dvh-120px)] px-5 pb-4 space-y-5">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-float text-4xl">🌙</div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-xl bg-error-surface px-4 py-3 text-sm text-error" role="alert">
                            {error}
                        </div>
                    )}

                    {venue && !loading && (
                        <>
                            {/* ── 1. Header ──────────────────────────────── */}
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                                        {venue.name}
                                    </h2>
                                    <div className="flex flex-col items-end gap-1 shrink-0 mt-1">
                                        <span
                                            className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                                            style={{ backgroundColor: colors.bg }}
                                        >
                                            {VENUE_TYPE_LABELS[venue.venue_type]}
                                        </span>
                                        {venue.has_active_event && (
                                            <span className="rounded-full px-3 py-1 text-xs font-semibold text-white bg-red-600 animate-pulse">
                                                🔴 Live Event
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleDirections}
                                    className="mt-2 flex items-center gap-1.5 text-sm text-accent hover:text-accent-glow transition-colors"
                                >
                                    <span>📍</span>
                                    <span className="underline underline-offset-2">{venue.address}</span>
                                    <span className="text-foreground-muted text-xs">→ Directions</span>
                                </button>
                                {venue.supplier && (
                                    <p className="mt-1 text-xs text-foreground-muted">
                                        Operated by {venue.supplier.business_name}
                                    </p>
                                )}
                            </div>

                            {/* ── 1b. Active Events ──────────────────────── */}
                            {venue.active_events && venue.active_events.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2.5">
                                        🎉 Events at this venue
                                    </h3>
                                    <div className="space-y-2">
                                        {venue.active_events.map((event) => {
                                            const isNow =
                                                new Date(event.event_date) <= new Date() &&
                                                new Date(event.end_date || event.event_date) >= new Date();
                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`rounded-xl border p-3.5 ${isNow
                                                            ? "border-red-500/40 bg-red-500/10"
                                                            : "border-border bg-surface"
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {event.name}
                                                            </p>
                                                            <p className="text-xs text-foreground-muted mt-0.5">
                                                                {new Date(event.event_date).toLocaleDateString()} •{" "}
                                                                {new Date(event.event_date).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </p>
                                                        </div>
                                                        {isNow && (
                                                            <span className="shrink-0 rounded-full bg-red-600 text-white text-[10px] font-bold px-2 py-0.5">
                                                                NOW
                                                            </span>
                                                        )}
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-foreground-muted mt-1.5 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── 2. Key Stats Grid ──────────────────────── */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Density */}
                                <StatCard
                                    icon={
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: densityColor(venue.current_density) }}
                                        />
                                    }
                                    label="Crowd Level"
                                    value={`${venue.current_density}% — ${densityLabel(venue.current_density)}`}
                                />

                                {/* Age Range */}
                                <StatCard
                                    icon={<span className="text-sm">👥</span>}
                                    label="Age Range"
                                    value={`${venue.age_range_min}–${venue.age_range_max}`}
                                />

                                {/* Gender Ratio */}
                                {venue.gender_ratio && (
                                    <StatCard
                                        icon={<span className="text-sm">⚖️</span>}
                                        label="Gender Ratio"
                                        value={
                                            <div className="space-y-1">
                                                <span className="text-xs">
                                                    {venue.gender_ratio.male}% M / {venue.gender_ratio.female}% F
                                                </span>
                                                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface">
                                                    <div
                                                        className="h-full rounded-l-full bg-neon-blue"
                                                        style={{ width: `${venue.gender_ratio.male}%` }}
                                                    />
                                                    <div
                                                        className="h-full rounded-r-full bg-neon-pink"
                                                        style={{ width: `${venue.gender_ratio.female}%` }}
                                                    />
                                                </div>
                                            </div>
                                        }
                                    />
                                )}

                                {/* Dress Code */}
                                {venue.dress_code && (
                                    <StatCard
                                        icon={<span className="text-sm">👔</span>}
                                        label="Dress Code"
                                        value={venue.dress_code}
                                    />
                                )}
                            </div>

                            {/* ── 3. Vibe & Music ────────────────────────── */}
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                                        Music
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {venue.music_types?.map((m, i) => (
                                            <span
                                                key={`music-${i}`}
                                                className="rounded-full bg-accent-surface px-3 py-1 text-xs font-medium text-accent"
                                            >
                                                🎵 {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                                        Vibe
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {venue.vibes?.map((v, i) => (
                                            <span
                                                key={`vibe-${i}`}
                                                className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground-muted border border-border"
                                            >
                                                ✨ {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── 4. Hours ───────────────────────────────── */}
                            {todayHours && (
                                <div className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3">
                                    <span className="text-sm">🕐</span>
                                    <div>
                                        <p className="text-xs text-foreground-muted">Today</p>
                                        <p className="text-sm font-medium text-foreground">{todayHours}</p>
                                    </div>
                                </div>
                            )}

                            {/* ── 5. Gallery ─────────────────────────────── */}
                            {venue.gallery_images && venue.gallery_images.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2.5">
                                        Gallery
                                    </h3>
                                    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                                        {venue.gallery_images.map((url, i) => (
                                            <div
                                                key={i}
                                                className="shrink-0 snap-start h-36 w-52 rounded-xl overflow-hidden bg-surface border border-border"
                                            >
                                                {url.startsWith("#") ? (
                                                    // Colored placeholder
                                                    <div
                                                        className="h-full w-full flex items-center justify-center text-sm font-medium text-white/60"
                                                        style={{ background: url }}
                                                    >
                                                        Photo {i + 1}
                                                    </div>
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={url}
                                                        alt={`${venue.name} photo ${i + 1}`}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── 6. Loyalty Program ─────────────────────── */}
                            {isPartner && tasks.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2.5">
                                        🏆 Rewards Available
                                    </h3>
                                    <div className="space-y-2">
                                        {tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="rounded-xl border border-border bg-surface p-3.5"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {task.task_description}
                                                        </p>
                                                        <p className="text-xs text-accent mt-1">
                                                            🎁 {task.reward_description}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-accent-surface px-2.5 py-1 text-xs font-bold text-accent">
                                                        +{task.xp_value} XP
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── 7. Sticky Action Buttons ────────────────── */}
                {venue && !loading && (
                    <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background-secondary/95 backdrop-blur-lg px-5 py-4">
                        {/* Check In */}
                        <button
                            onClick={handleCheckIn}
                            className="flex-1 h-12 rounded-2xl bg-accent font-semibold text-white text-sm transition-all duration-200 hover:bg-accent-glow active:scale-[0.98]"
                        >
                            ✓ Check In
                        </button>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-foreground hover:bg-surface-hover transition-colors"
                            aria-label="Share venue"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                        </button>

                        {/* Save / Bookmark */}
                        <button
                            onClick={() => setSaved(!saved)}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors ${saved
                                ? "border-accent bg-accent-surface text-accent"
                                : "border-border bg-surface text-foreground hover:bg-surface-hover"
                                }`}
                            aria-label={saved ? "Unsave venue" : "Save venue"}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

// ── StatCard Subcomponent ────────────────────────────────────

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-[11px] font-medium text-foreground-muted uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <div className="text-sm font-semibold text-foreground">{value}</div>
        </div>
    );
}
