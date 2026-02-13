"use client";

/**
 * Admin Suppliers Page — Direct Supabase Fetching
 *
 * Shows all suppliers with filtering by status and search.
 * Fetches directly from Supabase (no useData hook).
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected", "Banned"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

interface SupplierRow {
    id: string;
    user_id: string;
    business_name: string;
    verification_status: string;
    plan?: string;
    created_at: string;
    contact_email?: string;
    // Joined data
    email?: string;
    contact_name?: string;
    venues_count: number;
    events_count: number;
    total_checkins: number;
}

export default function SuppliersPage() {
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
    }, []);

    async function loadSuppliers() {
        console.log("=== ADMIN SUPPLIERS: Loading ===");
        setLoading(true);

        try {
            const supabase = createClient();

            // Fetch all suppliers
            const { data, error } = await supabase
                .from("suppliers")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("[Suppliers] Error:", error);
                throw error;
            }

            console.log("[Suppliers] Raw data:", data);

            // For each supplier, get counts and user info
            const enriched: SupplierRow[] = await Promise.all(
                (data || []).map(async (s) => {
                    // Get user email/username
                    let email = s.contact_email || "";
                    let contactName = "";

                    if (s.user_id) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("email, username")
                            .eq("id", s.user_id)
                            .maybeSingle();

                        if (profile) {
                            email = profile.email || email;
                            contactName = profile.username || "";
                        }
                    }

                    // Get venue count
                    const { count: venueCount } = await supabase
                        .from("venues")
                        .select("*", { count: "exact", head: true })
                        .eq("supplier_id", s.id);

                    // Get event count
                    const { count: eventCount } = await supabase
                        .from("events")
                        .select("*", { count: "exact", head: true })
                        .eq("supplier_id", s.id);

                    return {
                        id: s.id,
                        user_id: s.user_id,
                        business_name: s.business_name,
                        verification_status: s.verification_status,
                        plan: s.plan || undefined,
                        created_at: s.created_at,
                        contact_email: s.contact_email,
                        email,
                        contact_name: contactName,
                        venues_count: venueCount || 0,
                        events_count: eventCount || 0,
                        total_checkins: 0,
                    };
                })
            );

            console.log("[Suppliers] Enriched:", enriched);
            setSuppliers(enriched);

        } catch (err) {
            console.error("[Suppliers] Error loading:", err);
            alert("Error loading suppliers. Check console.");
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        let list = [...suppliers];

        // Status filter
        if (tab !== "All") {
            const status = tab.toLowerCase();
            list = list.filter((s) => s.verification_status === status);
        }

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (s) =>
                    s.business_name.toLowerCase().includes(q) ||
                    (s.email && s.email.toLowerCase().includes(q)) ||
                    (s.contact_name && s.contact_name.toLowerCase().includes(q))
            );
        }

        return list;
    }, [tab, search, suppliers]);

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Suppliers</h1>
                <button className="admin-btn admin-btn--outline" onClick={loadSuppliers}>
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
                            <span style={{ marginLeft: 6, opacity: 0.5 }}>
                                ({t === "All"
                                    ? suppliers.length
                                    : suppliers.filter(s => s.verification_status === t.toLowerCase()).length
                                })
                            </span>
                        </button>
                    ))}
                </div>
                <input
                    className="admin-search"
                    placeholder="Search business name, email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="admin-card">
                {loading ? (
                    <p className="admin-empty" style={{ padding: 32 }}>Loading suppliers…</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th>Venues</th>
                                    <th>Events</th>
                                    <th>Check-ins</th>
                                    <th>Member Since</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="admin-empty">
                                            {search ? "No suppliers match your search" : `No ${tab.toLowerCase()} suppliers`}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((s) => (
                                        <tr key={s.id} className="admin-table__clickable">
                                            <td className="admin-table__primary">
                                                <Link href={`/admin/suppliers/${s.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                                    {s.business_name}
                                                </Link>
                                            </td>
                                            <td>{s.email}</td>
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
                                            <td>{s.venues_count}</td>
                                            <td>{s.events_count}</td>
                                            <td>{s.total_checkins}</td>
                                            <td>{new Date(s.created_at || "").toLocaleDateString()}</td>
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
