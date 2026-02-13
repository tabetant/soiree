"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdminSuppliers } from "@/hooks/useAdminData";
import type { AdminSupplier } from "@/lib/adminMockData";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected", "Banned"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

function statusFromTab(tab: StatusTab): string | null {
    if (tab === "All") return null;
    return tab.toLowerCase();
}

export default function SuppliersPage() {
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get("status") || "All") as StatusTab;

    const [tab, setTab] = useState<StatusTab>(
        STATUS_TABS.includes(initialTab as StatusTab) ? initialTab as StatusTab : "All"
    );
    const [search, setSearch] = useState("");
    const { data: suppliers } = useAdminSuppliers();

    const filtered = useMemo(() => {
        let list: AdminSupplier[] = [...suppliers];
        const st = statusFromTab(tab);
        if (st) list = list.filter((s) => s.verification_status === st);
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
    }, [tab, search]);

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Suppliers</h1>
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
                <input
                    className="admin-search"
                    placeholder="Search business name, email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="admin-card">
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
                                    <td colSpan={8} className="admin-empty">No suppliers found</td>
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
                                            <span className={`admin-badge admin-badge--${s.plan}`}>
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
            </div>
        </div>
    );
}
