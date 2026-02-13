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
} from "@/hooks/useAdminData";

export default function AdminDashboard() {
    const { data: stats } = useAdminStats();
    const { data: actions } = useAdminActions();
    const { data: growthData } = useGrowthData();
    const { data: venueAnalytics } = useVenueAnalytics();

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
                    value={stats.totalUsers}
                    change={stats.usersChange}
                    icon="👥"
                />
                <StatsCard
                    title="Total Suppliers"
                    value={stats.totalSuppliers}
                    subtitle={`${stats.suppliersPending} pending · ${stats.suppliersApproved} approved · ${stats.suppliersRejected} rejected`}
                    icon="🏢"
                />
                <StatsCard
                    title="Active Events"
                    value={stats.activeEvents}
                    icon="📅"
                />
                <StatsCard
                    title="Check-ins (7d)"
                    value={stats.totalCheckins7d.toLocaleString()}
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
                </div>
            </div>

            {/* Growth Chart + Activity Feed */}
            <div className="admin-two-col">
                <GrowthChart data={growthData} />
                <ActivityFeed actions={actions} limit={10} />
            </div>

            {/* Top Venues */}
            <div className="admin-card">
                <h3 className="admin-section-title">🏆 Top Venues This Week</h3>
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
            </div>
        </div>
    );
}
