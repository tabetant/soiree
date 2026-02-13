"use client";

/**
 * CreatePostModal Component
 *
 * Full-screen modal for creating a new post.
 * - Image URL input (mock upload for MVP)
 * - Caption textarea
 * - Venue tag auto-suggest
 * - Share button
 */

import { useState, useRef, useEffect } from "react";
import { MOCK_VENUES } from "@/lib/mockData";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPost: (post: { caption: string; imageUrl: string; venueName: string | null; venueId: string | null }) => void;
}

// Predefined gradient "photos" for quick selection
const QUICK_IMAGES = [
    "linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)",
    "linear-gradient(135deg, #7c3aed 0%, #f43f5e 100%)",
    "linear-gradient(135deg, #0f172a 0%, #581c87 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
];

export default function CreatePostModal({ isOpen, onClose, onPost }: CreatePostModalProps) {
    const [caption, setCaption] = useState("");
    const [selectedImage, setSelectedImage] = useState(QUICK_IMAGES[0]);
    const [venueSearch, setVenueSearch] = useState("");
    const [selectedVenue, setSelectedVenue] = useState<{ id: string; name: string } | null>(null);
    const [showVenueDropdown, setShowVenueDropdown] = useState(false);
    const captionRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen && captionRef.current) {
            setTimeout(() => captionRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Filter venues for autocomplete
    const filteredVenues = venueSearch.trim()
        ? MOCK_VENUES.filter((v) =>
            v.name.toLowerCase().includes(venueSearch.toLowerCase())
        ).slice(0, 5)
        : [];

    const handleShare = () => {
        if (!selectedImage) return;
        onPost({
            caption: caption.trim(),
            imageUrl: selectedImage,
            venueName: selectedVenue?.name || null,
            venueId: selectedVenue?.id || null,
        });
        // Reset
        setCaption("");
        setSelectedImage(QUICK_IMAGES[0]);
        setSelectedVenue(null);
        setVenueSearch("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <button
                    onClick={onClose}
                    className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                    Cancel
                </button>
                <h2 className="text-base font-bold text-foreground">New Post</h2>
                <button
                    onClick={handleShare}
                    disabled={!selectedImage}
                    className="text-sm font-bold text-accent hover:text-accent-glow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Share
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Image Preview */}
                <div
                    className="w-full aspect-square"
                    style={{ background: selectedImage }}
                />

                {/* Quick image picker */}
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                        Choose a vibe
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {QUICK_IMAGES.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(img)}
                                className={`shrink-0 h-14 w-14 rounded-xl border-2 transition-all ${selectedImage === img
                                    ? "border-accent scale-105"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                                style={{ background: img }}
                                aria-label={`Image option ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Caption */}
                <div className="px-4 py-3 border-b border-border">
                    <textarea
                        ref={captionRef}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption…"
                        maxLength={500}
                        rows={3}
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted/50 outline-none resize-none"
                    />
                    <p className="text-right text-[10px] text-foreground-muted/40">
                        {caption.length}/500
                    </p>
                </div>

                {/* Venue Tag */}
                <div className="px-4 py-3 relative">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">📍</span>
                        {selectedVenue ? (
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm text-foreground font-medium">
                                    {selectedVenue.name}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedVenue(null);
                                        setVenueSearch("");
                                    }}
                                    className="text-xs text-foreground-muted hover:text-error transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={venueSearch}
                                onChange={(e) => {
                                    setVenueSearch(e.target.value);
                                    setShowVenueDropdown(true);
                                }}
                                onFocus={() => setShowVenueDropdown(true)}
                                placeholder="Tag a venue…"
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted/50 outline-none"
                            />
                        )}
                    </div>

                    {/* Venue dropdown */}
                    {showVenueDropdown && filteredVenues.length > 0 && (
                        <div className="absolute left-4 right-4 top-14 z-10 rounded-xl border border-border bg-background-secondary shadow-xl overflow-hidden">
                            {filteredVenues.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => {
                                        setSelectedVenue({ id: v.id, name: v.name });
                                        setVenueSearch("");
                                        setShowVenueDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                                >
                                    <span className="text-xs">📍</span>
                                    <span>{v.name}</span>
                                    <span className="text-xs text-foreground-muted ml-auto">{v.venue_type === "nights" ? "🟣" : v.venue_type === "tickets" ? "🟡" : "⚪"}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
