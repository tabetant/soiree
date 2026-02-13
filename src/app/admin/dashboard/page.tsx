"use client";

import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import GrowthChart from "@/components/admin/GrowthChart";
import {
    useAdminStats,
    useAdminActions,
    useGrowthData,
    useVenueAnalytics,
    useAdminApplications,
} from "@/hooks/useAdminData";
import type { SupplierApplication } from "@/hooks/useAdminData";
import { createClient } from "@/lib/supabase";
import { useState } from "react";

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function AdminDashboard() {
    const { data: stats, loading: statsLoading } = useAdminStats();
    const { data: actions, loading: actionsLoading } = useAdminActions();
    const { data: growthData, loading: growthLoading } = useGrowthData();
    const { data: venueAnalytics, loading: venuesLoading } = useVenueAnalytics();
    const { data: applications, loading: appsLoading, refetch: refetchApps } = useAdminApplications();

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Admin Dashboard</h1>
                    <p className="admin-page__subtitle">
                        Last updated: {new Date().toLocaleString()}
                    </p>
                </div>
                <button className="admin-btn admin-btn--outline" onClick={() => window.location.reload()}>
                    🔄 Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="admin-stats-grid">
                <StatsCard
                    title="Total Users"
                    value={statsLoading ? "…" : stats.totalUsers}
                    change={stats.usersChange}
                    icon="👥"
                />
                <StatsCard
                    title="Total Suppliers"
                    value={statsLoading ? "…" : stats.totalSuppliers}
                    subtitle={`${stats.suppliersPending} pending · ${stats.suppliersApproved} approved · ${stats.suppliersRejected} rejected`}
                    icon="🏢"
                />
                <StatsCard
                    title="Active Events"
                    value={statsLoading ? "…" : stats.activeEvents}
                    icon="📅"
                />
                <StatsCard
                    title="Check-ins (7d)"
                    value={statsLoading ? "…" : stats.totalCheckins7d.toLocaleString()}
                    change={stats.checkinsChange}
                    icon="📱"
                />
            </div>

            {/* Pending Actions */}
            <div className="admin-pending-section">
                <h3 className="admin-section-title">⚠️ Pending Actions</h3>
                <div className="admin-pending-grid">
                    <div className="admin-pending-card">
                        <div className="admin-pending-card__count">{stats.suppliersPending}</div>
                        <div className="admin-pending-card__label">Supplier Verification Requests</div>
                        <Link href="/admin/suppliers?status=pending" className="admin-btn admin-btn--sm admin-btn--outline">
                            Review Now →
                        </Link>
                    </div>
                    <div className="admin-pending-card">
                        <div className="admin-pending-card__count">{stats.flaggedEvents}</div>
                        <div className="admin-pending-card__label">Flagged Events</div>
                        <Link href="/admin/events?flagged=true" className="admin-btn admin-btn--sm admin-btn--outline">
                            Review Now →
                        </Link>
                    </div>
                    <div className="admin-pending-card">
                        <div className="admin-pending-card__count">{stats.flaggedUsers}</div>
                        <div className="admin-pending-card__label">Flagged Users</div>
                        <Link href="/admin/users?flagged=true" className="admin-btn admin-btn--sm admin-btn--outline">
                            Review Now →
                        </Link>
                    </div>
                    <div className="admin-pending-card">
                        <div className="admin-pending-card__count">{applications.length}</div>
                        <div className="admin-pending-card__label">Supplier Applications</div>
                        <a href="#applications" className="admin-btn admin-btn--sm admin-btn--outline">
                            Review Now →
                        </a>
                    </div>
                </div>
            </div>

            {/* Pending Supplier Applications */}
            <PendingApplications
                applications={applications}
                loading={appsLoading}
                onUpdate={refetchApps}
            />

            {/* Growth Chart + Activity Feed */}
            <div className="admin-two-col">
                {growthLoading ? (
                    <div className="admin-chart-wrap">
                        <h3 className="admin-section-title">Platform Growth — Last 30 Days</h3>
                        <p className="admin-empty">Loading chart…</p>
                    </div>
                ) : growthData.length === 0 ? (
                    <div className="admin-chart-wrap">
                        <h3 className="admin-section-title">Platform Growth — Last 30 Days</h3>
                        <p className="admin-empty">No growth data yet. User signups and check-ins will appear here.</p>
                    </div>
                ) : (
                    <GrowthChart data={growthData} />
                )}

                {actionsLoading ? (
                    <div className="admin-activity-feed">
                        <h3 className="admin-section-title">Recent Activity</h3>
                        <p className="admin-empty">Loading activity…</p>
                    </div>
                ) : (
                    <ActivityFeed actions={actions} limit={10} />
                )}
            </div>

            {/* Top Venues */}
            <div className="admin-card">
                <h3 className="admin-section-title">🏆 Top Venues This Week</h3>
                {venuesLoading ? (
                    <p className="admin-empty">Loading venues…</p>
                ) : venueAnalytics.length === 0 ? (
                    <p className="admin-empty">No venue data yet. Check-ins will appear here.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Venue</th>
                                    <th>Supplier</th>
                                    <th>Check-ins</th>
                                    <th>Opens</th>
                                    <th>Saves</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venueAnalytics.map((v) => (
                                    <tr key={v.venue_name}>
                                        <td className="admin-table__primary">{v.venue_name}</td>
                                        <td>{v.supplier}</td>
                                        <td>{v.checkins}</td>
                                        <td>{v.opens}</td>
                                        <td>{v.saves}</td>
                                        <td>
                                            <span className={`admin-badge admin-badge--${v.status.toLowerCase()}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Pending Supplier Applications Section ──────────────── */

function PendingApplications({
    applications,
    loading,
    onUpdate,
}: {
    applications: SupplierApplication[];
    loading: boolean;
    onUpdate: () => void;
}) {
    const [processing, setProcessing] = useState<string | null>(null);

    async function handleApprove(app: SupplierApplication) {
        if (!confirm(`Approve "${app.business_name}" as a supplier? This will create their account.`)) return;

        setProcessing(app.id);
        try {
            const res = await fetch("/api/admin/approve-application", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ application_id: app.id }),
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Supplier approved! Credentials:\n\nEmail: ${data.email}\nPassword: ${data.password}\n\nSave these — the password cannot be recovered.`);
                onUpdate();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert("Network error approving application");
            console.error(err);
        } finally {
            setProcessing(null);
        }
    }

    async function handleReject(app: SupplierApplication) {
        const reason = prompt("Reason for rejection:");
        if (!reason) return;

        setProcessing(app.id);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("supplier_applications")
                .update({ status: "rejected", notes: reason })
                .eq("id", app.id);

            if (error) {
                alert(`Error: ${error.message}`);
            } else {
                alert("Application rejected.");
                onUpdate();
            }
        } catch (err) {
            alert("Network error rejecting application");
            console.error(err);
        } finally {
            setProcessing(null);
        }
    }

    return (
        <div id="applications" className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 className="admin-section-title" style={{ margin: 0 }}>📋 Pending Supplier Applications</h3>
                {applications.length > 0 && (
                    <span className="admin-badge admin-badge--pending">{applications.length} pending</span>
                )}
            </div>

            {loading ? (
                <p className="admin-empty">Loading applications…</p>
            ) : applications.length === 0 ? (
                <p className="admin-empty">No pending applications. New supplier applications will appear here.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {applications.map((app) => (
                        <div key={app.id} className="admin-pending-card" style={{ padding: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ fontWeight: 600, fontSize: 16 }}>{app.business_name}</div>
                                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>{app.email}</div>
                                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{app.venue_address}</div>
                                    <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                                        {app.music_types?.slice(0, 3).map(m => (
                                            <span key={m} className="admin-badge admin-badge--listing">{m}</span>
                                        ))}
                                        {app.vibe_types?.slice(0, 3).map(v => (
                                            <span key={v} className="admin-badge admin-badge--active">{v}</span>
                                        ))}
                                        {(app.music_types?.length || 0) + (app.vibe_types?.length || 0) > 6 && (
                                            <span className="admin-badge">+more</span>
                                        )}
                                    </div>
                                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
                                        Applied {timeAgo(app.created_at)}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <button
                                        className="admin-btn admin-btn--sm"
                                        style={{ backgroundColor: "#16a34a" }}
                                        disabled={processing === app.id}
                                        onClick={() => handleApprove(app)}
                                    >
                                        {processing === app.id ? "…" : "✅ Approve"}
                                    </button>
                                    <button
                                        className="admin-btn admin-btn--sm admin-btn--danger"
                                        disabled={processing === app.id}
                                        onClick={() => handleReject(app)}
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
