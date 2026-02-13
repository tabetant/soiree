"use client";

/**
 * Notifications Page — Placeholder
 *
 * Shows placeholder notification items with the shared BottomNav.
 */

import BottomNav from "@/components/BottomNav";

export default function NotificationsPage() {
    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border px-4 py-3">
                <h1 className="text-lg font-bold text-foreground">Notifications</h1>
            </div>

            {/* Placeholder notifications */}
            <div className="px-4 pt-2">
                {[
                    { icon: "❤️", text: "maya.vibes liked your post", time: "2h ago" },
                    { icon: "💬", text: "jord_toronto commented: \"Fire 🔥\"", time: "3h ago" },
                    { icon: "👤", text: "marcusdj started following you", time: "5h ago" },
                    { icon: "🏆", text: "You earned Night Owl! +50 XP", time: "1d ago" },
                    { icon: "🎁", text: "New reward available at Rebel!", time: "2d ago" },
                ].map((notif, i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-colors ${i < 2 ? "bg-accent-surface/30" : ""
                            }`}
                    >
                        <span className="shrink-0 h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center text-lg">
                            {notif.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{notif.text}</p>
                            <p className="text-[10px] text-foreground-muted">{notif.time}</p>
                        </div>
                    </div>
                ))}

                <div className="text-center py-8">
                    <p className="text-xs text-foreground-muted/50">
                        Real-time notifications coming soon 🔔
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
