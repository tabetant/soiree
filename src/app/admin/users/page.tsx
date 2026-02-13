"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const STATUS_TABS = ["All", "Consumers", "Flagged", "Banned"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserRow = any;

export default function UsersPage() {
    const searchParams = useSearchParams();
    const showFlagged = searchParams.get("flagged") === "true";

    const [tab, setTab] = useState<StatusTab>(showFlagged ? "Flagged" : "All");
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();

        // Real-time subscription
        const supabase = createClient();
        const channel = supabase
            .channel("profiles-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
                console.log("User profile changed:", payload);
                loadUsers();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    async function loadUsers() {
        console.log("=== LOADING USERS FROM SUPABASE ===");
        setLoading(true);

        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching users:", error);
                throw error;
            }

            console.log("Fetched users:", data);

            if (!data || data.length === 0) {
                setUsers([]);
                setLoading(false);
                return;
            }

            // Get additional stats for each user
            const usersWithStats = await Promise.all(
                data.map(async (user) => {
                    const { count: checkInCount } = await supabase
                        .from("attendances")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", user.id);

                    const { count: postCount } = await supabase
                        .from("posts")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", user.id);

                    const { count: flagCount } = await supabase
                        .from("flags")
                        .select("*", { count: "exact", head: true })
                        .eq("target_type", "user")
                        .eq("target_id", user.id);

                    return {
                        ...user,
                        checkins_count: checkInCount || 0,
                        posts_count: postCount || 0,
                        flags_count: flagCount || 0,
                    };
                })
            );

            console.log("Users with stats:", usersWithStats);
            setUsers(usersWithStats);
        } catch (error) {
            console.error("Error loading users:", error);
            alert(`Error loading users: ${error}`);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        let list = [...users];

        if (tab === "Consumers") list = list.filter((u) => (u.role === "consumer" || !u.role) && !u.is_banned);
        else if (tab === "Flagged") list = list.filter((u) => u.flags_count > 0);
        else if (tab === "Banned") list = list.filter((u) => u.is_banned);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (u) =>
                    u.username?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    (u.display_name && u.display_name.toLowerCase().includes(q))
            );
        }

        return list;
    }, [tab, search, users]);

    const counts = {
        all: users.length,
        consumers: users.filter((u) => !u.is_banned).length,
        flagged: users.filter((u) => u.flags_count > 0).length,
        banned: users.filter((u) => u.is_banned).length,
    };

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Users</h1>
                <button className="admin-btn admin-btn--outline" onClick={loadUsers}>
                    🔄 Refresh
                </button>
            </div>

            {/* Debug Info */}
            <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.4)", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <p style={{ color: "#60a5fa", fontSize: 13 }}>
                    Total users: {users.length} | Active: {counts.consumers} | Flagged: {counts.flagged} | Banned: {counts.banned}
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
                    placeholder="Search username, email, name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="admin-card">
                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                        <p className="admin-empty">Loading users…</p>
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <p className="admin-empty" style={{ fontSize: 16, marginBottom: 8 }}>No users yet</p>
                        <p className="admin-empty">Users will appear here when they sign up</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="admin-empty" style={{ padding: 32 }}>
                        {search ? "No users match your search" : `No ${tab.toLowerCase()} users`}
                    </p>
                ) : (
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
                                {filtered.map((u) => (
                                    <tr key={u.id} className="admin-table__clickable">
                                        <td className="admin-table__primary">
                                            <Link href={`/admin/users/${u.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                                {u.username || u.id.slice(0, 8)}
                                                {u.display_name && (
                                                    <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 6, fontSize: 12 }}>
                                                        {u.display_name}
                                                    </span>
                                                )}
                                            </Link>
                                        </td>
                                        <td>{u.email}</td>
                                        <td><span className={`admin-badge admin-badge--${u.role || "consumer"}`}>{u.role || "consumer"}</span></td>
                                        <td>Lv.{u.level || 1} ({u.total_xp || 0} XP)</td>
                                        <td>⭐ {u.stars || 0}</td>
                                        <td>{u.checkins_count}</td>
                                        <td>{u.posts_count}</td>
                                        <td>
                                            {u.flags_count > 0 ? (
                                                <span className="admin-badge admin-badge--flagged">{u.flags_count} 🚩</span>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
