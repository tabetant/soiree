"use client";

/**
 * SupplierApplicationModal
 *
 * A form for venue owners to apply for a supplier account on Soirée.
 * Collects business email, name, address, music types, and vibe types.
 * Inserts directly into the `supplier_applications` table.
 */

import { useState } from "react";
import { createClient } from "@/lib/supabase";

const MUSIC_TYPES = [
    "House", "Techno", "Hip-Hop", "R&B", "Jazz",
    "Latin", "Pop", "EDM", "Afrobeats", "Disco",
];

const VIBE_TYPES = [
    "Chill", "Upscale", "Rave", "Hip hop", "Rooftop",
    "Lounge", "Karaoke", "Party", "Intimate", "Late night", "Live music",
];

interface SupplierApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SupplierApplicationModal({ isOpen, onClose }: SupplierApplicationModalProps) {
    const [formData, setFormData] = useState({
        email: "",
        business_name: "",
        venue_address: "",
        music_types: [] as string[],
        vibe_types: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.business_name || !formData.venue_address) {
            setError("Please fill in all required fields");
            return;
        }
        if (formData.music_types.length === 0) {
            setError("Please select at least one music type");
            return;
        }
        if (formData.vibe_types.length === 0) {
            setError("Please select at least one vibe");
            return;
        }

        setLoading(true);
        setError("");

        const supabase = createClient();

        const { error: submitError } = await supabase
            .from("supplier_applications")
            .insert({
                email: formData.email,
                business_name: formData.business_name,
                venue_address: formData.venue_address,
                music_types: formData.music_types,
                vibe_types: formData.vibe_types,
                status: "pending",
            });

        setLoading(false);

        if (submitError) {
            setError("Error submitting application. Please try again.");
            console.error(submitError);
            return;
        }

        setSubmitted(true);
    };

    const toggleMusic = (music: string) => {
        setFormData(prev => ({
            ...prev,
            music_types: prev.music_types.includes(music)
                ? prev.music_types.filter(m => m !== music)
                : [...prev.music_types, music],
        }));
    };

    const toggleVibe = (vibe: string) => {
        setFormData(prev => ({
            ...prev,
            vibe_types: prev.vibe_types.includes(vibe)
                ? prev.vibe_types.filter(v => v !== vibe)
                : [...prev.vibe_types, vibe],
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border">
                {/* Header */}
                <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-foreground">Apply as a Venue Partner</h2>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground text-2xl leading-none">×</button>
                </div>

                {submitted ? (
                    <div className="px-6 py-12 text-center space-y-4">
                        <div className="text-5xl">🎉</div>
                        <h3 className="text-xl font-bold text-foreground">Application Submitted!</h3>
                        <p className="text-foreground-muted text-sm max-w-xs mx-auto">
                            We&apos;ll review your application and get back to you within 2-3 business days.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-glow transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                                Business Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
                                placeholder="contact@yourvenue.com"
                            />
                        </div>

                        {/* Business Name */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                                Business / Venue Name *
                            </label>
                            <input
                                type="text"
                                value={formData.business_name}
                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
                                placeholder="Your Venue Name"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                                Venue Address *
                            </label>
                            <input
                                type="text"
                                value={formData.venue_address}
                                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
                                placeholder="123 King St W, Toronto, ON"
                            />
                        </div>

                        {/* Music Types */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                                Music Types * <span className="normal-case font-normal">(select all that apply)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {MUSIC_TYPES.map(music => (
                                    <button
                                        key={music}
                                        type="button"
                                        onClick={() => toggleMusic(music)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.music_types.includes(music)
                                                ? "bg-accent text-white shadow-sm shadow-accent/30"
                                                : "bg-surface-hover text-foreground-muted hover:text-foreground border border-border"
                                            }`}
                                    >
                                        {music}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Vibe Types */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                                Vibes * <span className="normal-case font-normal">(select all that apply)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {VIBE_TYPES.map(vibe => (
                                    <button
                                        key={vibe}
                                        type="button"
                                        onClick={() => toggleVibe(vibe)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.vibe_types.includes(vibe)
                                                ? "bg-accent text-white shadow-sm shadow-accent/30"
                                                : "bg-surface-hover text-foreground-muted hover:text-foreground border border-border"
                                            }`}
                                    >
                                        {vibe}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-2xl bg-accent font-semibold text-white text-sm transition-all hover:bg-accent-glow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting…" : "Submit Application"}
                        </button>

                        <p className="text-[10px] text-foreground-muted text-center">
                            We&apos;ll review your application and get back to you within 2-3 business days.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
