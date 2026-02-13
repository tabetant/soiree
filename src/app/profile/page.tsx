"use client";

/**
 * Profile Page — Placeholder
 *
 * Shows basic user info (username, XP, level) and a "full profile coming soon" message.
 */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";
import { getInitials, stringToHue } from "@/lib/feedUtils";

export default function ProfilePage() {
    const [username, setUsername] = useState("nightowl");
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        async function loadProfile() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
                    .from("profiles")
                    .select("username, total_xp, level")
                    .eq("id", user.id)
                    .single();

                if (data) {
                    setUsername(data.username || "nightowl");
                    setXp(data.total_xp || 0);
                    setLevel(data.level || 1);
                }
            } catch {
                // Use defaults
            }
        }
        loadProfile();
    }, []);

    const hue = stringToHue(username);

    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="bg-nightlife-gradient pt-12 pb-8 px-6 text-center">
                {/* Avatar */}
                <div
                    className="mx-auto h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold text-white ring-4 ring-accent/30 shadow-lg shadow-accent/20 mb-4"
                    style={{ background: `hsl(${hue}, 55%, 38%)` }}
                >
                    {getInitials(username)}
                </div>

                <h1 className="text-2xl font-bold text-foreground">@{username}</h1>

                {/* Stats row */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="text-center">
                        <p className="text-lg font-bold text-accent">{xp}</p>
                        <p className="text-[10px] text-foreground-muted uppercase tracking-wider">XP</p>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="text-center">
                        <p className="text-lg font-bold text-foreground">Lvl {level}</p>
                        <p className="text-[10px] text-foreground-muted uppercase tracking-wider">Level</p>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="text-center">
                        <p className="text-lg font-bold text-foreground">0</p>
                        <p className="text-[10px] text-foreground-muted uppercase tracking-wider">Check-ins</p>
                    </div>
                </div>
            </div>

            {/* Coming soon sections */}
            <div className="px-6 pt-6 space-y-4">
                {/* Achievements */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🏆</span>
                        <h2 className="text-base font-bold text-foreground">Achievements</h2>
                    </div>
                    <div className="flex gap-3">
                        {["🦉", "🦋", "🎉", "⭐", "📸"].map((icon, i) => (
                            <div
                                key={i}
                                className="h-12 w-12 rounded-xl bg-surface-hover border border-border flex items-center justify-center text-lg opacity-40"
                            >
                                {icon}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-foreground-muted mt-3">
                        Start checking in to unlock achievements
                    </p>
                </div>

                {/* Your Posts */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📸</span>
                        <h2 className="text-base font-bold text-foreground">Your Posts</h2>
                    </div>
                    <p className="text-sm text-foreground-muted">
                        Posts you share will appear here.
                    </p>
                </div>

                {/* Settings */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⚙️</span>
                        <h2 className="text-base font-bold text-foreground">Settings</h2>
                    </div>
                    <p className="text-sm text-foreground-muted">
                        Full profile editing coming soon.
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
