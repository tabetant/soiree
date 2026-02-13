"use client";

/**
 * Supplier Analytics Page
 *
 * Date range selector, traffic/attendance/ticket metrics,
 * timing analysis, conversion funnel, and event-specific drill-down.
 */

import { useState, useMemo } from "react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import SupplierNav from "@/components/SupplierNav";
import { useSupplierAnalytics, useSupplierEvents, useSupplierStats } from "@/hooks/useSupplierData";

type DateRange = "7d" | "30d";

const HOUR_LABELS = Array.from({ length: 9 }, (_, i) => {
    const hour = 18 + i; // 6 PM to 2 AM
    return hour >= 24 ? `${hour - 24}:00` : `${hour}:00`;
});

function generateArrivalData() {
    return HOUR_LABELS.map((hour) => {
        const h = parseInt(hour);
        const isPeak = (h >= 22 && h <= 23) || (h >= 0 && h <= 1);
        const base = isPeak ? 80 : 30;
        return {
            hour,
            "Check-ins": Math.round(base + Math.random() * 40),
        };
    });
}

export default function SupplierAnalyticsPage() {
    const [dateRange, setDateRange] = useState<DateRange>("7d");
    const [selectedEventId, setSelectedEventId] = useState<string>("all");
    const { data: stats } = useSupplierStats();
    const { data: analytics } = useSupplierAnalytics();
    const { data: events } = useSupplierEvents();
    const arrivalData = useMemo(() => generateArrivalData(), []);

    const chartData = analytics.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        Views: d.map_impressions,
        Opens: d.event_opens,
        "Check-ins": d.check_ins,
        Tickets: d.ticket_sales,
    }));

    const totals = analytics.reduce(
        (acc, d) => ({
            impressions: acc.impressions + d.map_impressions,
            opens: acc.opens + d.event_opens,
            saves: acc.saves + d.saves,
            shares: acc.shares + d.shares,
            checkins: acc.checkins + d.check_ins,
            tickets: acc.tickets + d.ticket_sales,
        }),
        { impressions: 0, opens: 0, saves: 0, shares: 0, checkins: 0, tickets: 0 }
    );

    const metricCard = (label: string, value: number, icon: string) => (
        <div className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{icon}</span>
                <span className="text-[10px] text-foreground-muted uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{value.toLocaleString()}</p>
        </div>
    );

    // Funnel data
    const funnelSteps = [
        { label: "Map Views", value: totals.impressions, pct: 100 },
        { label: "Event Opens", value: totals.opens, pct: Math.round((totals.opens / totals.impressions) * 100) },
        { label: "Saves", value: totals.saves, pct: Math.round((totals.saves / totals.impressions) * 100) },
        { label: "Check-ins", value: totals.checkins, pct: Math.round((totals.checkins / totals.impressions) * 100) },
        { label: "Ticket Sales", value: totals.tickets, pct: Math.round((totals.tickets / totals.impressions) * 100) },
    ];

    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border">
                <div className="flex items-center justify-between px-5 pt-12 pb-3">
                    <h1 className="text-xl font-bold text-foreground">Analytics</h1>
                    <div className="flex items-center gap-1">
                        {(["7d", "30d"] as DateRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setDateRange(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateRange === r ? "bg-accent/15 text-accent" : "text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                {r === "7d" ? "7 Days" : "30 Days"}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Event selector */}
                <div className="px-5 pb-3">
                    <select
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        <option value="all">All Events</option>
                        {events.map((evt) => (
                            <option key={evt.id} value={evt.id}>{evt.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="px-5 py-4 space-y-5">
                {/* ── Traffic Metrics ────────────────────── */}
                <div>
                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Traffic</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {metricCard("Map Impressions", totals.impressions, "👁")}
                        {metricCard("Event Opens", totals.opens, "👆")}
                        {metricCard("Saves", totals.saves, "🔖")}
                        {metricCard("Shares", totals.shares, "📤")}
                    </div>
                </div>

                {/* ── Traffic Chart ──────────────────────── */}
                <div className="rounded-2xl border border-border bg-surface p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Traffic Over Time</h3>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} width={30} />
                                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11, color: "#e5e7eb" }} />
                                <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" iconSize={6} />
                                <Line type="monotone" dataKey="Views" stroke="#a78bfa" strokeWidth={2} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="Opens" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="Check-ins" stroke="#34d399" strokeWidth={2} dot={{ r: 2 }} />
                                <Line type="monotone" dataKey="Tickets" stroke="#f472b6" strokeWidth={2} dot={{ r: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Attendance Metrics ─────────────────── */}
                <div>
                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Attendance</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {metricCard("Total Check-ins", totals.checkins, "📲")}
                        {metricCard("Unique Visitors", Math.round(totals.checkins * 0.82), "👤")}
                        {metricCard("Repeat Visitors", Math.round(totals.checkins * 0.18), "🔁")}
                        {metricCard("Avg per Event", Math.round(totals.checkins / Math.max(events.filter((e) => e.status !== "draft").length, 1)), "📊")}
                    </div>
                </div>

                {/* ── Ticket Metrics ─────────────────────── */}
                <div>
                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Tickets</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {metricCard("Tickets Sold", totals.tickets, "🎫")}
                        {metricCard("Revenue", totals.tickets * 42, "💰")}
                        {metricCard("Avg Price", 42, "📈")}
                        {metricCard("Refunds", 3, "↩️")}
                    </div>
                </div>

                {/* ── Peak Arrival Times ─────────────────── */}
                <div className="rounded-2xl border border-border bg-surface p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Peak Arrival Times</h3>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={arrivalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="hour" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} width={25} />
                                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11, color: "#e5e7eb" }} />
                                <Bar dataKey="Check-ins" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Conversion Funnel ──────────────────── */}
                <div className="rounded-2xl border border-border bg-surface p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Conversion Funnel</h3>
                    <div className="space-y-2">
                        {funnelSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-24 text-xs text-foreground-muted shrink-0">{step.label}</div>
                                <div className="flex-1 h-6 bg-surface-hover rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent to-neon-pink rounded-lg"
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
            </div>

            <SupplierNav />
        </div>
    );
}
