"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdminEvents, useAdminFlags } from "@/hooks/useAdminData";

const STATUS_TABS = ["All", "Published", "Draft", "Ended", "Flagged"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function EventsPage() {
    const searchParams = useSearchParams();
    const showFlagged = searchParams.get("flagged") === "true";

    const [tab, setTab] = useState<StatusTab>(showFlagged ? "Flagged" : "All");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const { data: events } = useAdminEvents();
    const { data: flags } = useAdminFlags();

    const flaggedEventIds = useMemo(
        () => new Set(flags.filter((f) => f.target_type === "event" && f.status === "pending").map((f) => f.target_id)),
        [flags]
    );

    const filtered = useMemo(() => {
        let list = [...events];

        // Status filter
        if (tab === "Flagged") {
            list = list.filter((e) => flaggedEventIds.has(e.id));
        } else if (tab !== "All") {
            list = list.filter((e) => e.status === tab.toLowerCase());
        }

        // Type filter
        if (typeFilter !== "all") {
            list = list.filter((e) => e.venue_type === typeFilter);
        }

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (e) =>
                    e.name.toLowerCase().includes(q) ||
                    (e.venue_name && e.venue_name.toLowerCase().includes(q))
            );
        }

        return list;
    }, [tab, search, typeFilter, flaggedEventIds]);

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Events</h1>
            </div>

            <div className="admin-filters">
                <div className="admin-filter-tabs">
                    {STATUS_TABS.map((t) => (
                        <button
                            key={t}
                            className={`admin-filter-tab ${tab === t ? "admin-filter-tab--active" : ""}`}
                            onClick={() => setTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <select
                    className="admin-search"
                    style={{ width: 140 }}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="nights">Nights</option>
                    <option value="tickets">Tickets</option>
                    <option value="listings">Listings</option>
                </select>
                <input
                    className="admin-search"
                    placeholder="Search events…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Venue</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Check-ins</th>
                                <th>Flags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="admin-empty">No events found</td>
                                </tr>
                            ) : (
                                filtered.map((e) => {
                                    const flagCount = flags.filter(
                                        (f) => f.target_type === "event" && f.target_id === e.id && f.status === "pending"
                                    ).length;
                                    return (
                                        <tr key={e.id} className="admin-table__clickable">
                                            <td className="admin-table__primary">
                                                <Link href={`/admin/events/${e.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                                    {e.name}
                                                </Link>
                                            </td>
                                            <td>{e.venue_name}</td>
                                            <td><span className="admin-badge admin-badge--listing">{e.venue_type}</span></td>
                                            <td>{new Date(e.event_date).toLocaleDateString()}</td>
                                            <td><span className={`admin-badge admin-badge--${e.status}`}>{e.status}</span></td>
                                            <td>{e.checkins || 0}</td>
                                            <td>
                                                {flagCount > 0 ? (
                                                    <span className="admin-badge admin-badge--flagged">{flagCount} 🚩</span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
