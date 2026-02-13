"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdminUsers, useAdminFlags } from "@/hooks/useAdminData";
import type { AdminUser } from "@/lib/adminMockData";

const STATUS_TABS = ["All", "Consumers", "Flagged", "Banned"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function UsersPage() {
    const searchParams = useSearchParams();
    const showFlagged = searchParams.get("flagged") === "true";

    const [tab, setTab] = useState<StatusTab>(showFlagged ? "Flagged" : "All");
    const [search, setSearch] = useState("");
    const { data: users } = useAdminUsers();
    const { data: flags } = useAdminFlags();

    const flaggedUserIds = useMemo(
        () => new Set(flags.filter((f) => f.target_type === "user" && f.status === "pending").map((f) => f.target_id)),
        [flags]
    );

    const filtered = useMemo(() => {
        let list: AdminUser[] = [...users];

        if (tab === "Consumers") list = list.filter((u) => u.role === "consumer" && !u.is_banned);
        else if (tab === "Flagged") list = list.filter((u) => flaggedUserIds.has(u.id));
        else if (tab === "Banned") list = list.filter((u) => u.is_banned);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (u) =>
                    u.username.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    (u.display_name && u.display_name.toLowerCase().includes(q))
            );
        }

        return list;
    }, [tab, search, flaggedUserIds]);

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Users</h1>
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
                    placeholder="Search username, email, name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Level</th>
                                <th>Stars</th>
                                <th>Check-ins</th>
                                <th>Posts</th>
                                <th>Flags</th>
                                <th>Status</th>
                                <th>Since</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="admin-empty">No users found</td>
                                </tr>
                            ) : (
                                filtered.map((u) => {
                                    const flagCount = flags.filter(
                                        (f) => f.target_type === "user" && f.target_id === u.id && f.status === "pending"
                                    ).length;
                                    return (
                                        <tr key={u.id} className="admin-table__clickable">
                                            <td className="admin-table__primary">
                                                <Link href={`/admin/users/${u.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                                    {u.username}
                                                    {u.display_name && (
                                                        <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 6, fontSize: 12 }}>
                                                            {u.display_name}
                                                        </span>
                                                    )}
                                                </Link>
                                            </td>
                                            <td>{u.email}</td>
                                            <td><span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span></td>
                                            <td>Lv.{u.level} ({u.total_xp} XP)</td>
                                            <td>⭐ {u.stars}</td>
                                            <td>{u.checkins_count}</td>
                                            <td>{u.posts_count}</td>
                                            <td>
                                                {flagCount > 0 ? (
                                                    <span className="admin-badge admin-badge--flagged">{flagCount} 🚩</span>
                                                ) : "—"}
                                            </td>
                                            <td>
                                                {u.is_banned ? (
                                                    <span className="admin-badge admin-badge--banned">Banned</span>
                                                ) : (
                                                    <span className="admin-badge admin-badge--active">Active</span>
                                                )}
                                            </td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
