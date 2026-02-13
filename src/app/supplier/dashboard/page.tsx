"use client";

/**
 * Supplier Dashboard — Main Overview
 *
 * Welcome header, verification badge, 4 KPI stat cards,
 * weekly performance chart, active events list, quick actions.
 */

import { useMemo } from "react";
import Link from "next/link";
import SupplierNav from "@/components/SupplierNav";
import StatsCard from "@/components/supplier/StatsCard";
import PerformanceChart from "@/components/supplier/PerformanceChart";
import EventCard from "@/components/supplier/EventCard";
import { useCurrentSupplier, useSupplierEvents, useSupplierStats, useSupplierAnalytics } from "@/hooks/useSupplierData";

const VERIFICATION_STYLES = {
    approved: { bg: "bg-green-500/15", text: "text-green-400", label: "✓ Verified" },
    pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "⏳ Verification Pending" },
    rejected: { bg: "bg-red-500/15", text: "text-red-400", label: "✕ Verification Rejected" },
    banned: { bg: "bg-gray-500/15", text: "text-gray-400", label: "🚫 Account Banned" },
} as const;

export default function SupplierDashboardPage() {
    const { data: supplier } = useCurrentSupplier();
    const { data: stats } = useSupplierStats();
    const { data: events } = useSupplierEvents();
    const { data: analytics } = useSupplierAnalytics();
    const badge = VERIFICATION_STYLES[supplier.verification_status];

    const activeEvents = events
        .filter((e) => e.status === "published")
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
        .slice(0, 5);

    const nextEvent = activeEvents[0];

    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* ── Header ─────────────────────────────────── */}
            <div className="bg-nightlife-gradient px-5 pt-12 pb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-foreground-muted">Welcome back</p>
                        <h1 className="text-2xl font-bold text-foreground mt-0.5">
                            {supplier.business_name}
                        </h1>
                        <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${supplier.plan === "pro" ? "bg-accent/20 text-accent" : "bg-surface text-foreground-muted"
                            }`}>
                            {supplier.plan}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-5 space-y-4 mt-4">
                {/* ── Quick Stats ─────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    <StatsCard
                        title="Impressions"
                        value={stats.impressions.value}
                        change={stats.impressions.change}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Event Opens"
                        value={stats.opens.value}
                        change={stats.opens.change}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Check-ins"
                        value={stats.checkins.value}
                        change={stats.checkins.change}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Ticket Sales"
                        value={stats.ticketSales.value}
                        change={stats.ticketSales.change}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v6a3 3 0 01-3 3H5a3 3 0 01-3-3V9z" />
                                <path d="M9 6v12M15 6v12" />
                            </svg>
                        }
                    />
                </div>

                {/* ── Performance Chart ───────────────────── */}
                <PerformanceChart data={analytics} />

                {/* ── Conversion Funnel ───────────────────── */}
                <div className="rounded-2xl border border-border bg-surface p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Conversion Funnel</h3>
                    <div className="space-y-2">
                        {[
                            { label: "Map Views", value: stats.impressions.value, pct: 100 },
                            { label: "Event Opens", value: stats.opens.value, pct: Math.round((stats.opens.value / stats.impressions.value) * 100) },
                            { label: "Check-ins", value: stats.checkins.value, pct: Math.round((stats.checkins.value / stats.impressions.value) * 100) },
                            { label: "Ticket Sales", value: stats.ticketSales.value, pct: Math.round((stats.ticketSales.value / stats.impressions.value) * 100) },
                        ].map((step) => (
                            <div key={step.label} className="flex items-center gap-3">
                                <div className="w-24 text-xs text-foreground-muted shrink-0">{step.label}</div>
                                <div className="flex-1 h-6 bg-surface-hover rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent to-neon-pink rounded-lg transition-all duration-500"
                                        style={{ width: `${step.pct}%` }}
                                    />
                                </div>
                                <div className="w-16 text-right">
                                    <span className="text-xs font-medium text-foreground tabular-nums">{step.value.toLocaleString()}</span>
                                    <span className="text-[10px] text-foreground-muted ml-1">{step.pct}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Quick Actions ───────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/supplier/events/create"
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent text-white text-sm font-semibold hover:bg-accent-glow transition-colors"
                    >
                        <span className="text-lg">+</span> Create Event
                    </Link>
                    {nextEvent && (
                        <Link
                            href={`/supplier/door-mode?event=${nextEvent.id}`}
                            className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-accent text-accent text-sm font-semibold hover:bg-accent/10 transition-colors"
                        >
                            🚪 Door Mode
                        </Link>
                    )}
                </div>

                {/* ── Active Events ───────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Active Events</h3>
                        <Link href="/supplier/events" className="text-xs text-accent font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {activeEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-foreground-muted">No active events</p>
                                <Link href="/supplier/events/create" className="text-sm text-accent font-medium mt-2 inline-block">
                                    Create your first event →
                                </Link>
                            </div>
                        ) : (
                            activeEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <SupplierNav />
        </div>
    );
}
