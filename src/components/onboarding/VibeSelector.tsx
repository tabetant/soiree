"use client";

/**
 * VibeSelector Component
 *
 * Grid of selectable vibe cards with visual toggle states.
 * On finish, saves the entire profile to Supabase.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { VIBE_OPTIONS, VIBE_ICONS, VIBE_DESCRIPTIONS, type VibeOption, type MusicGenre } from "@/lib/types";

export default function VibeSelector() {
    const router = useRouter();

    const [selected, setSelected] = useState<VibeOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Restore from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem("soiree_vibes");
        if (saved) {
            try {
                setSelected(JSON.parse(saved));
            } catch {
                // ignore
            }
        }
    }, []);

    const toggleVibe = useCallback(
        (vibe: VibeOption) => {
            const updated = selected.includes(vibe)
                ? selected.filter((v) => v !== vibe)
                : [...selected, vibe];
            setSelected(updated);
            sessionStorage.setItem("soiree_vibes", JSON.stringify(updated));
        },
        [selected]
    );

    const handleFinish = async () => {
        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();

            // Get authenticated user
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                setError("Authentication error. Please sign in again.");
                setLoading(false);
                return;
            }

            // Retrieve stored onboarding data from sessionStorage
            const dob = sessionStorage.getItem("soiree_dob");
            const musicRaw = sessionStorage.getItem("soiree_music");
            const username = sessionStorage.getItem("soiree_username");

            if (!dob || !musicRaw || !username) {
                setError("Missing onboarding data. Please start over.");
                setLoading(false);
                return;
            }

            const musicPreferences: MusicGenre[] = JSON.parse(musicRaw);

            // Save profile to Supabase
            const { error: insertError } = await supabase.from("profiles").upsert({
                id: user.id,
                username,
                date_of_birth: dob,
                music_preferences: musicPreferences,
                vibe_preferences: selected,
            });

            if (insertError) {
                console.error("Profile insert error:", insertError);
                setError("Failed to save your profile. Please try again.");
                setLoading(false);
                return;
            }

            // Clear sessionStorage and redirect to home
            sessionStorage.removeItem("soiree_dob");
            sessionStorage.removeItem("soiree_music");
            sessionStorage.removeItem("soiree_vibes");
            sessionStorage.removeItem("soiree_username");

            router.push("/home");
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Vibe grid */}
            <div className="grid grid-cols-3 gap-2 stagger-children">
                {VIBE_OPTIONS.map((vibe) => {
                    const isSelected = selected.includes(vibe);
                    return (
                        <button
                            key={vibe}
                            onClick={() => toggleVibe(vibe)}
                            className={`animate-fade-in group relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all duration-300 active:scale-95 ${isSelected
                                ? "border-accent bg-accent/10 shadow-lg shadow-accent/10"
                                : "border-border bg-surface hover:border-accent/30 hover:bg-surface-hover"
                                }`}
                            aria-pressed={isSelected}
                            aria-label={`${vibe} vibe`}
                        >
                            {/* Glow effect when selected */}
                            {isSelected && (
                                <div className="absolute inset-0 rounded-xl bg-accent/5 animate-pulse-glow" />
                            )}

                            <span className="relative text-2xl transition-transform duration-300 group-hover:scale-110">
                                {VIBE_ICONS[vibe]}
                            </span>
                            <span
                                className={`relative text-xs font-medium transition-colors leading-tight text-center ${isSelected ? "text-accent-glow" : "text-foreground-muted"
                                    }`}
                            >
                                {vibe}
                            </span>
                            <span className="relative text-[9px] text-foreground-muted/60 leading-tight text-center">
                                {VIBE_DESCRIPTIONS[vibe]}
                            </span>

                            {/* Checkmark */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                                    <svg
                                        width="10"
                                        height="8"
                                        viewBox="0 0 10 8"
                                        fill="none"
                                    >
                                        <path
                                            d="M1 4L3.5 6.5L9 1"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Error */}
            {error && (
                <div
                    className="animate-fade-in rounded-xl bg-error-surface px-4 py-3 text-sm text-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Finish */}
            <button
                onClick={handleFinish}
                disabled={selected.length === 0 || loading}
                className="h-14 w-full rounded-2xl bg-accent font-semibold text-white text-base transition-all duration-200 hover:bg-accent-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="h-5 w-5 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Saving…
                    </span>
                ) : (
                    "Finish Setup"
                )}
            </button>
        </div>
    );
}
