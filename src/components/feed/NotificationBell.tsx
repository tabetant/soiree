"use client";

/**
 * NotificationBell Component
 *
 * Bell icon button with unread count badge.
 * Clicking navigates to a placeholder notifications page.
 */

import { useRouter } from "next/navigation";

interface NotificationBellProps {
    unreadCount: number;
}

export default function NotificationBell({ unreadCount }: NotificationBellProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-hover transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>

            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-neon-pink px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
}
