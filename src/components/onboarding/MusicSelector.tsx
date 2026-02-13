"use client";

/**
 * MusicSelector Component
 *
 * Autocomplete text input for selecting music genres.
 * Selected genres appear as dismissible chips.
 * Filters from a hardcoded genre list as the user types.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MUSIC_GENRES, type MusicGenre } from "@/lib/types";

export default function MusicSelector() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<MusicGenre[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Restore from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem("soiree_music");
        if (saved) {
            try {
                setSelected(JSON.parse(saved));
            } catch {
                // ignore
            }
        }
    }, []);

    // Filter genres based on query, excluding already selected
    const filteredGenres = MUSIC_GENRES.filter(
        (genre) =>
            !selected.includes(genre) &&
            genre.toLowerCase().includes(query.toLowerCase())
    );

    const addGenre = useCallback(
        (genre: MusicGenre) => {
            const updated = [...selected, genre];
            setSelected(updated);
            sessionStorage.setItem("soiree_music", JSON.stringify(updated));
            setQuery("");
            inputRef.current?.focus();
        },
        [selected]
    );

    const removeGenre = useCallback(
        (genre: MusicGenre) => {
            const updated = selected.filter((g) => g !== genre);
            setSelected(updated);
            sessionStorage.setItem("soiree_music", JSON.stringify(updated));
        },
        [selected]
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleContinue = () => {
        setLoading(true);
        sessionStorage.setItem("soiree_music", JSON.stringify(selected));
        router.push("/onboarding/step-4-vibe");
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Search input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search genres…"
                    className="h-14 w-full rounded-xl border border-border bg-surface px-4 text-foreground text-base placeholder:text-foreground-muted outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    aria-label="Search music genres"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    autoComplete="off"
                />

                {/* Autocomplete dropdown */}
                {isOpen && filteredGenres.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl shadow-black/40"
                        role="listbox"
                    >
                        {filteredGenres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => addGenre(genre)}
                                className="flex h-12 w-full items-center px-4 text-left text-base text-foreground transition-colors hover:bg-surface-hover"
                                role="option"
                                aria-selected={false}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                )}

                {isOpen && filteredGenres.length === 0 && query.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-surface p-4 text-sm text-foreground-muted shadow-2xl shadow-black/40">
                        No matching genres found
                    </div>
                )}
            </div>

            {/* Selected chips */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((genre) => (
                        <span
                            key={genre}
                            className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-2 text-sm font-medium text-accent-glow border border-accent/20"
                        >
                            {genre}
                            <button
                                onClick={() => removeGenre(genre)}
                                className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-accent/30"
                                aria-label={`Remove ${genre}`}
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path
                                        d="M9 3L3 9M3 3l6 6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Quick-add all genres if none selected */}
            {selected.length === 0 && (
                <div className="flex flex-wrap gap-2 stagger-children">
                    {MUSIC_GENRES.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => addGenre(genre)}
                            className="animate-fade-in rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground-muted transition-all duration-200 hover:border-accent/40 hover:bg-surface-hover hover:text-foreground active:scale-95"
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            )}

            {/* Continue */}
            <button
                onClick={handleContinue}
                disabled={selected.length === 0 || loading}
                className="h-14 w-full rounded-2xl bg-accent font-semibold text-white text-base transition-all duration-200 hover:bg-accent-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {loading ? "Loading…" : "Continue"}
            </button>
        </div>
    );
}
