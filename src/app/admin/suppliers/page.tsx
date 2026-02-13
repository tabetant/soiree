"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected", "Banned"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupplierRow = any;

export default function SuppliersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get("status") || "All") as StatusTab;

    const [tab, setTab] = useState<StatusTab>(
        STATUS_TABS.includes(initialTab as StatusTab) ? initialTab as StatusTab : "All"
    );
    const [search, setSearch] = useState("");
    const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSuppliers();

        // Real-time subscription
        const supabase = createClient();
        const channel = supabase
            .channel("suppliers-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "suppliers" }, (payload) => {
                console.log("Supplier changed:", payload);
                loadSuppliers();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    async function loadSuppliers() {
        console.log("=== LOADING SUPPLIERS FROM SUPABASE ===");
        setLoading(true);

        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("suppliers")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching suppliers:", error);
                throw error;
            }

            console.log("Raw suppliers data:", data);

            if (!data || data.length === 0) {
                console.log("No suppliers found in database");
                setSuppliers([]);
                setLoading(false);
                return;
            }

            // Get counts for each supplier
            const suppliersWithCounts = await Promise.all(
                data.map(async (supplier) => {
                    // Get user profile
                    let email = supplier.contact_email || "";
                    let username = "";
                    if (supplier.user_id) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("email, username")
                            .eq("id", supplier.user_id)
                            .maybeSingle();
                        if (profile) {
                            email = profile.email || email;
                            username = profile.username || "";
                        }
                    }

                    const { count: venueCount } = await supabase
                        .from("venues")
                        .select("*", { count: "exact", head: true })
                        .eq("supplier_id", supplier.id);

                    const { count: eventCount } = await supabase
                        .from("events")
                        .select("*", { count: "exact", head: true })
                        .eq("supplier_id", supplier.id);

                    return {
                        ...supplier,
                        user_email: email,
                        user_username: username,
                        venue_count: venueCount || 0,
                        event_count: eventCount || 0,
                    };
                })
            );

            console.log("Suppliers with counts:", suppliersWithCounts);
            setSuppliers(suppliersWithCounts);
        } catch (error) {
            console.error("Error loading suppliers:", error);
            alert(`Error loading suppliers: ${error}`);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        let list = [...suppliers];

        if (tab !== "All") {
            const status = tab.toLowerCase();
            list = list.filter((s) => s.verification_status === status);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (s) =>
                    s.business_name?.toLowerCase().includes(q) ||
                    s.user_email?.toLowerCase().includes(q) ||
                    s.user_username?.toLowerCase().includes(q)
            );
        }

        return list;
    }, [tab, search, suppliers]);

    const counts = {
        all: suppliers.length,
        pending: suppliers.filter((s) => s.verification_status === "pending").length,
        approved: suppliers.filter((s) => s.verification_status === "approved").length,
        rejected: suppliers.filter((s) => s.verification_status === "rejected").length,
        banned: suppliers.filter((s) => s.verification_status === "banned").length,
    };

    console.log("Filter counts:", counts);
    console.log("Filtered suppliers:", filtered.length);

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Suppliers Management</h1>
                <button className="admin-btn admin-btn--outline" onClick={loadSuppliers}>
                    🔄 Refresh
                </button>
            </div>

            {/* Debug Info */}
            <div style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.4)", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <p style={{ color: "#eab308", fontSize: 13 }}>
                    Total in DB: {suppliers.length} |
                    Pending: {counts.pending} |
                    Approved: {counts.approved} |
                    Showing: {filtered.length}
                </p>
            </div>

            <div className="admin-filters">
                <div className="admin-filter-tabs">
                    {STATUS_TABS.map((t) => (
                        <button
                            key={t}
                            className={`admin-filter-tab ${tab === t ? "admin-filter-tab--active" : ""}`}
                            onClick={() => setTab(t)}
                        >
                            {t} ({counts[t.toLowerCase() as keyof typeof counts]})
                        </button>
                    ))}
                </div>
                <input
                    className="admin-search"
                    placeholder="Search suppliers…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="admin-card">
                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                        <p className="admin-empty">Loading suppliers…</p>
                    </div>
                ) : suppliers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <p className="admin-empty" style={{ fontSize: 16, marginBottom: 8 }}>No suppliers in database</p>
                        <p className="admin-empty">Suppliers will appear here when they apply or are created</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="admin-empty" style={{ padding: 32 }}>
                        {search ? "No suppliers match your search" : `No ${tab.toLowerCase()} suppliers`}
                    </p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th>Venues</th>
                                    <th>Events</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s.id} className="admin-table__clickable">
                                        <td className="admin-table__primary">{s.business_name}</td>
                                        <td>{s.user_email || "N/A"}</td>
                                        <td>
                                            <span className={`admin-badge admin-badge--${s.verification_status}`}>
                                                {s.verification_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`admin-badge admin-badge--${s.plan || "free"}`}>
                                                {s.plan || "—"}
                                            </span>
                                        </td>
                                        <td>{s.venue_count}</td>
                                        <td>{s.event_count}</td>
                                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="admin-btn admin-btn--sm admin-btn--outline"
                                                onClick={() => router.push(`/admin/suppliers/${s.id}`)}
                                            >
                                                View →
                                            </button>
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
