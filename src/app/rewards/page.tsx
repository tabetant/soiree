"use client";

/**
 * Rewards Page — Placeholder
 *
 * Shows loyalty rewards summary and coming soon message.
 */

import BottomNav from "@/components/BottomNav";

export default function RewardsPage() {
    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border px-4 py-3">
                <h1 className="text-lg font-bold text-foreground">Rewards</h1>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center px-6 pt-16 text-center">
                <span className="text-6xl mb-4">⭐</span>
                <h2 className="text-xl font-bold text-foreground mb-2">
                    Loyalty Rewards
                </h2>
                <p className="text-sm text-foreground-muted max-w-xs mb-8">
                    Check in at venues, complete challenges, and earn XP to unlock exclusive rewards and perks.
                </p>

                {/* Preview cards */}
                <div className="w-full max-w-sm space-y-3">
                    {[
                        { icon: "🎫", title: "Skip-the-Line Pass", venue: "Rebel", xp: "150 XP" },
                        { icon: "🍸", title: "Free Welcome Drink", venue: "Lavelle", xp: "100 XP" },
                        { icon: "🎉", title: "VIP Section Upgrade", venue: "EFS", xp: "250 XP" },
                    ].map((reward, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 opacity-60"
                        >
                            <span className="text-2xl">{reward.icon}</span>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-foreground">{reward.title}</p>
                                <p className="text-xs text-foreground-muted">{reward.venue}</p>
                            </div>
                            <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                                {reward.xp}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-foreground-muted/50 mt-8">
                    Full rewards system coming soon 🚀
                </p>
            </div>

            <BottomNav />
        </div>
    );
}
