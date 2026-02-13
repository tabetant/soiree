"use client";

/**
 * EventCard — Supplier event list item
 */

import type { SupplierEvent } from "@/lib/types";
import Link from "next/link";

interface EventCardProps {
    event: SupplierEvent;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    published: { bg: "bg-green-500/15", text: "text-green-400", label: "Published" },
    draft: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "Draft" },
    ended: { bg: "bg-foreground-muted/15", text: "text-foreground-muted", label: "Ended" },
};

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    nights: { bg: "bg-accent/15", text: "text-accent", label: "Nights" },
    tickets: { bg: "bg-neon-pink/15", text: "text-neon-pink", label: "Tickets" },
    listings: { bg: "bg-blue-400/15", text: "text-blue-400", label: "Listings" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function EventCard({ event }: EventCardProps) {
    const status = STATUS_BADGE[event.status] || STATUS_BADGE.draft;
    const type = TYPE_BADGE[event.venue_type] || TYPE_BADGE.nights;

    return (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            {/* Top row: name + badges */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">{event.name}</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">{event.venue_name}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${type.bg} ${type.text}`}>
                        {type.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Date */}
            <p className="text-xs text-foreground-muted">
                📅 {formatDate(event.event_date)}
                {event.end_date && ` — ${formatDate(event.end_date)}`}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: "Views", value: event.views ?? 0 },
                    { label: "Opens", value: event.opens ?? 0 },
                    { label: "Saves", value: event.saves ?? 0 },
                    { label: "Check-ins", value: event.checkins ?? 0 },
                ].map((stat) => (
                    <div key={stat.label} className="text-center">
                        <p className="text-sm font-bold text-foreground tabular-nums">{stat.value.toLocaleString()}</p>
                        <p className="text-[9px] text-foreground-muted uppercase">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
                {event.status === "published" && (
                    <Link
                        href={`/supplier/door-mode?event=${event.id}`}
                        className="flex-1 py-2 text-center text-xs font-medium rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    >
                        🚪 Door Mode
                    </Link>
                )}
                <Link
                    href={`/supplier/events/${event.id}/qr`}
                    className="flex-1 py-2 text-center text-xs font-medium rounded-xl bg-surface-hover text-foreground-muted hover:text-foreground transition-colors border border-border"
                >
                    📱 QR Code
                </Link>
                <button className="py-2 px-3 text-xs font-medium rounded-xl bg-surface-hover text-foreground-muted hover:text-foreground transition-colors border border-border">
                    •••
                </button>
            </div>
        </div>
    );
}
