"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const STATUS_TABS = ["All", "Published", "Draft", "Ended", "Flagged"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventRow = any;

export default function EventsPage() {
    const searchParams = useSearchParams();
    const showFlagged = searchParams.get("flagged") === "true";

    const [tab, setTab] = useState<StatusTab>(showFlagged ? "Flagged" : "All");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [events, setEvents] = useState<EventRow[]>([]);
    const [flaggedEventIds, setFlaggedEventIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();

        // Real-time subscription
        const supabase = createClient();
        const channel = supabase
            .channel("events-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
                console.log("Event changed, reloading…");
                loadEvents();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    async function loadEvents() {
        console.log("=== LOADING EVENTS FROM SUPABASE ===");
        setLoading(true);

        try {
            const supabase = createClient();

            // Fetch events with venue + supplier info
            const { data, error } = await supabase
                .from("events")
                .select(`
                    *,
                    venue:venues(name),
                    supplier:suppliers(business_name)
                `)
                .order("event_date", { ascending: false });

            if (error) {
                console.error("Error fetching events:", error);
                throw error;
            }

            console.log("Raw events:", data);

            // Get checkin counts for each event
            const enriched = await Promise.all(
                (data || []).map(async (e) => {
                    const { count } = await supabase
                        .from("attendances")
                        .select("*", { count: "exact", head: true })
                        .eq("event_id", e.id);

                    return {
                        ...e,
                        venue_name: e.venue?.name || e.venue_name || "—",
                        supplier_name: e.supplier?.business_name || "—",
                        checkins: count || 0,
                    };
                })
            );

            // Fetch flags
            const { data: flags } = await supabase
                .from("flags")
                .select("target_id")
                .eq("target_type", "event")
                .eq("status", "pending");

            const flagIds = new Set((flags || []).map((f) => f.target_id));

            console.log("Events enriched:", enriched.length, "Flagged:", flagIds.size);
            setEvents(enriched);
            setFlaggedEventIds(flagIds);
        } catch (error) {
            console.error("Error loading events:", error);
            alert(`Error loading events: ${error}`);
        } finally {
            setLoading(false);
        }
    }

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
                    e.name?.toLowerCase().includes(q) ||
                    e.venue_name?.toLowerCase().includes(q)
            );
        }

        return list;
    }, [tab, search, typeFilter, events, flaggedEventIds]);

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Events</h1>
                <button className="admin-btn admin-btn--outline" onClick={loadEvents}>
                    🔄 Refresh
                </button>
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
                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                        <p className="admin-empty">Loading events…</p>
                    </div>
                ) : (
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
                                    filtered.map((e) => (
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
                                            <td>{e.checkins}</td>
                                            <td>
                                                {flaggedEventIds.has(e.id) ? (
                                                    <span className="admin-badge admin-badge--flagged">🚩</span>
                                                ) : "—"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
