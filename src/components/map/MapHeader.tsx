"use client";

/**
 * MapHeader Component
 *
 * Fixed header bar with SOIRÉE logo (left) and notification bell (right).
 */

import { useRouter } from "next/navigation";

export default function MapHeader() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-accent-glow via-accent to-neon-pink bg-clip-text text-transparent">
                SOIRÉE
            </span>

            {/* Notification bell */}
            <button
                onClick={() => router.push("/notifications")}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                aria-label="Notifications"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {/* Red dot */}
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
            </button>
        </div>
    );
}
