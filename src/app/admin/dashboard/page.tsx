"use client";

/**
 * Admin Dashboard — Direct Supabase Fetching
 *
 * Removed useData hooks entirely in favour of inline async/await.
 * Each data section is fetched independently with its own error handling
 * so a failure in one query doesn't take down the whole dashboard.
 */

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import StatsCard from "@/components/admin/StatsCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import GrowthChart from "@/components/admin/GrowthChart";
import type { AdminStats, AdminAction, PlatformGrowthPoint } from "@/lib/adminMockData";

/* ─── Pending-application type (matches DB row) ───────── */
interface SupplierApplication {
    id: string;
    email: string;
    business_name: string;
    venue_address: string;
    music_types: string[];
    vibe_types: string[];
    status: "pending" | "approved" | "rejected";
    notes?: string;
    created_at: string;
}

/* ─── helpers ─────────────────────────────────────────── */

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

/* ═══════════════════════════════════════════════════════ */

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);

    // Stats
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0, usersChange: 0, totalSuppliers: 0,
        suppliersPending: 0, suppliersApproved: 0, suppliersRejected: 0,
        activeEvents: 0, totalCheckins7d: 0, checkinsChange: 0,
        pendingFlags: 0, flaggedEvents: 0, flaggedUsers: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Activity feed
    const [actions, setActions] = useState<AdminAction[]>([]);
    const [actionsLoading, setActionsLoading] = useState(true);

    // Growth chart
    const [growthData, setGrowthData] = useState<PlatformGrowthPoint[]>([]);
    const [growthLoading, setGrowthLoading] = useState(true);

    // Venue analytics
    const [venueAnalytics, setVenueAnalytics] = useState<
        { venue_name: string; supplier: string; checkins: number; opens: number; saves: number; status: string }[]
    >([]);
    const [venuesLoading, setVenuesLoading] = useState(true);

    // Applications
    const [applications, setApplications] = useState<SupplierApplication[]>([]);
    const [appsLoading, setAppsLoading] = useState(true);

    useEffect(() => {
        loadAllData();
    }, []);

    async function loadAllData() {
        console.log("=== ADMIN DASHBOARD: Starting data load ===");
        setLoading(true);
        await Promise.all([
            loadStats(),
            loadActions(),
            loadGrowthData(),
            loadVenueAnalytics(),
            loadApplications(),
        ]);
        setLoading(false);
    }

    /* ─── Stats ──────────────────────────────────────────── */
    async function loadStats() {
        setStatsLoading(true);
        try {
            const supabase = createClient();

            const [profilesRes, suppliersRes, eventsRes, flagsRes, checkinsRes] = await Promise.all([
                supabase.from("profiles").select("id", { count: "exact", head: true }),
                supabase.from("suppliers").select("id, verification_status"),
                supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published"),
                supabase.from("flags").select("id, target_type, status").eq("status", "pending"),
                supabase.from("attendances").select("id", { count: "exact", head: true })
                    .gte("checked_in_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
            ]);

            const suppliers = suppliersRes.data || [];
            const flags = flagsRes.data || [];

            const result: AdminStats = {
                totalUsers: profilesRes.count || 0,
                usersChange: 0,
                totalSuppliers: suppliers.length,
                suppliersPending: suppliers.filter(s => s.verification_status === "pending").length,
                suppliersApproved: suppliers.filter(s => s.verification_status === "approved").length,
                suppliersRejected: suppliers.filter(s => s.verification_status === "rejected").length,
                activeEvents: eventsRes.count || 0,
                totalCheckins7d: checkinsRes.count || 0,
                checkinsChange: 0,
                pendingFlags: flags.length,
                flaggedEvents: flags.filter(f => f.target_type === "event").length,
                flaggedUsers: flags.filter(f => f.target_type === "user").length,
            };

            console.log("[Admin] Stats:", result);
            setStats(result);
        } catch (err) {
            console.error("[Admin] Error loading stats:", err);
        } finally {
            setStatsLoading(false);
        }
    }

    /* ─── Activity Feed ──────────────────────────────────── */
    async function loadActions() {
        setActionsLoading(true);
        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("admin_actions")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) {
                console.error("[Admin] Error fetching admin_actions:", error);
                setActions([]);
                return;
            }

            console.log("[Admin] Raw admin_actions:", data);

            const mapped: AdminAction[] = (data || []).map((a) => ({
                id: a.id,
                admin_id: a.admin_id || "",
                admin_name: a.admin_name || "Admin",
                action_type: a.action_type,
                target_type: a.target_type,
                target_id: a.target_id || "",
                target_name: a.target_name || "—",
                reason: a.reason || undefined,
                created_at: a.created_at,
            }));

            setActions(mapped);
        } catch (err) {
            console.error("[Admin] Error loading actions:", err);
            setActions([]);
        } finally {
            setActionsLoading(false);
        }
    }

    /* ─── Growth Chart Data ──────────────────────────────── */
    async function loadGrowthData() {
        setGrowthLoading(true);
        try {
            const supabase = createClient();
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const dates: string[] = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dates.push(d.toISOString().split("T")[0]);
            }

            const [usersRes, suppliersRes, checkinsRes, eventsRes] = await Promise.all([
                supabase.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo.toISOString()),
                supabase.from("suppliers").select("created_at").gte("created_at", thirtyDaysAgo.toISOString()),
                supabase.from("attendances").select("checked_in_at").gte("checked_in_at", thirtyDaysAgo.toISOString()),
                supabase.from("events").select("created_at").eq("status", "published").gte("created_at", thirtyDaysAgo.toISOString()),
            ]);

            const chartData: PlatformGrowthPoint[] = dates.map(date => ({
                date,
                new_users: (usersRes.data || []).filter(u => u.created_at?.split("T")[0] === date).length,
                new_suppliers: (suppliersRes.data || []).filter(s => s.created_at?.split("T")[0] === date).length,
                check_ins: (checkinsRes.data || []).filter(c => c.checked_in_at?.split("T")[0] === date).length,
                events_published: (eventsRes.data || []).filter(e => e.created_at?.split("T")[0] === date).length,
            }));

            console.log("[Admin] Growth data:", chartData.length, "days");
            setGrowthData(chartData);
        } catch (err) {
            console.error("[Admin] Error loading growth data:", err);
            setGrowthData([]);
        } finally {
            setGrowthLoading(false);
        }
    }

    /* ─── Venue Analytics (top venues by check-ins) ───── */
    async function loadVenueAnalytics() {
        setVenuesLoading(true);
        try {
            const supabase = createClient();

            // Fetch venues with supplier info
            const { data: venues, error } = await supabase
                .from("venues")
                .select(`
                    id,
                    name,
                    supplier:suppliers ( business_name, verification_status )
                `)
                .order("name");

            if (error) {
                console.error("[Admin] Error fetching venues:", error);
                setVenueAnalytics([]);
                return;
            }

            console.log("[Admin] Venues:", venues);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped = (venues || []).map((v: any) => ({
                venue_name: v.name,
                supplier: v.supplier?.business_name || "—",
                checkins: 0, // Will be filled with real data when attendances exist
                opens: 0,
                saves: 0,
                status: v.supplier?.verification_status || "unknown",
            }));

            setVenueAnalytics(mapped);
        } catch (err) {
            console.error("[Admin] Error loading venue analytics:", err);
            setVenueAnalytics([]);
        } finally {
            setVenuesLoading(false);
        }
    }

    /* ─── Supplier Applications ──────────────────────────── */
    async function loadApplications() {
        setAppsLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("supplier_applications")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("[Admin] Error fetching applications:", error);
                setApplications([]);
                return;
            }

            console.log("[Admin] Pending applications:", data);
            setApplications(data || []);
        } catch (err) {
            console.error("[Admin] Error loading applications:", err);
            setApplications([]);
        } finally {
            setAppsLoading(false);
        }
    }

    /* ─── Render ─────────────────────────────────────────── */

    if (loading && statsLoading) {
        return (
            <div className="admin-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
                <div className="text-center">
                    <div className="animate-float text-5xl mb-3">📊</div>
                    <p className="admin-empty">Loading dashboard…</p>
                </div>
            </div>
        );
    }

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
                <button className="admin-btn admin-btn--outline" onClick={() => loadAllData()}>
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
                onUpdate={loadApplications}
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
                    <p className="admin-empty">No venue data yet. Venues will appear here once suppliers add them.</p>
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
