"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import ActionModal from "@/components/admin/ActionModal";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<any>(null);
    const [flags, setFlags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"ban" | "unban" | "delete" | null>(null);
    const [isBanned, setIsBanned] = useState(false);

    useEffect(() => { loadUser(); }, [id]);

    async function loadUser() {
        setLoading(true);
        try {
            const sb = createClient();
            const { data, error } = await sb.from("profiles").select("*").eq("id", id).single();
            if (error || !data) { setUser(null); setLoading(false); return; }

            const [checkinRes, postRes] = await Promise.all([
                sb.from("attendances").select("*", { count: "exact", head: true }).eq("user_id", id),
                sb.from("posts").select("*", { count: "exact", head: true }).eq("user_id", id),
            ]);

            const enriched = {
                ...data,
                email: data.email || "",
                username: data.username || data.id.slice(0, 8),
                role: data.role || "consumer",
                level: data.level || 1,
                total_xp: data.total_xp || 0,
                stars: data.stars || 0,
                date_of_birth: data.date_of_birth || "",
                music_preferences: data.music_preferences || [],
                vibe_preferences: data.vibe_preferences || [],
                is_banned: data.is_banned || false,
                checkins_count: checkinRes.count || 0,
                posts_count: postRes.count || 0,
            };

            setUser(enriched);
            setIsBanned(enriched.is_banned);

            const { data: flagsData } = await sb.from("flags").select("*").eq("target_type", "user").eq("target_id", id).order("created_at", { ascending: false });
            setFlags(flagsData || []);
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    }

    if (loading) return <div className="admin-page"><p className="admin-empty">Loading…</p></div>;
    if (!user) return <div className="admin-page"><p className="admin-empty">User not found.</p><Link href="/admin/users" className="admin-btn admin-btn--outline">← Back</Link></div>;

    return (
        <div className="admin-page">
            <div className="admin-detail-header">
                <Link href="/admin/users" className="admin-detail-header__back">←</Link>
                <div>
                    <h1 className="admin-page__title">{user.username}</h1>
                    {user.display_name && <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>{user.display_name}</span>}
                    &nbsp;
                    {isBanned ? <span className="admin-badge admin-badge--banned">Banned</span> : <span className="admin-badge admin-badge--active">Active</span>}
                </div>
            </div>
            <div className="admin-detail-actions">
                {!isBanned ? <button className="admin-btn admin-btn--danger" onClick={() => setModal("ban")}>🚫 Ban User</button> : <button className="admin-btn admin-btn--success" onClick={() => setModal("unban")}>↩ Unban User</button>}
                <a href={`mailto:${user.email}`} className="admin-btn admin-btn--outline">✉ Send Email</a>
                <button className="admin-btn admin-btn--danger" onClick={() => setModal("delete")} style={{ marginLeft: "auto" }}>🗑 Delete Account</button>
            </div>
            <div className="admin-detail-grid">
                <div className="admin-card">
                    <h3 className="admin-section-title">User Profile</h3>
                    {[["Username", user.username], ["Display Name", user.display_name || "—"], ["Email", user.email], ["Role", null], ["Date of Birth", user.date_of_birth], ["Member Since", new Date(user.created_at).toLocaleDateString()]].map(([l, v]) => (
                        <div key={l} className="admin-info-row"><span className="admin-info-row__label">{l}</span><span className="admin-info-row__value">{l === "Role" ? <span className={`admin-badge admin-badge--${user.role}`}>{user.role}</span> : v}</span></div>
                    ))}
                    {user.ban_reason && <div className="admin-info-row"><span className="admin-info-row__label">Ban Reason</span><span className="admin-info-row__value" style={{ color: "#f87171" }}>{user.ban_reason}</span></div>}
                </div>
                <div className="admin-card">
                    <h3 className="admin-section-title">Platform Stats</h3>
                    {[["Level", `Lv.${user.level}`], ["XP", user.total_xp], ["Stars", `⭐ ${user.stars}`], ["Check-ins", user.checkins_count], ["Posts", user.posts_count]].map(([l, v]) => (
                        <div key={l} className="admin-info-row"><span className="admin-info-row__label">{l}</span><span className="admin-info-row__value">{v}</span></div>
                    ))}
                </div>
            </div>
            <div className="admin-card">
                <h3 className="admin-section-title">Preferences</h3>
                <div className="admin-info-row"><span className="admin-info-row__label">Music</span><span className="admin-info-row__value">{user.music_preferences.join(", ") || "—"}</span></div>
                <div className="admin-info-row"><span className="admin-info-row__label">Vibes</span><span className="admin-info-row__value">{user.vibe_preferences.join(", ") || "—"}</span></div>
            </div>
            {flags.length > 0 && (
                <div className="admin-card">
                    <h3 className="admin-section-title">🚩 Flags ({flags.length})</h3>
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Reporter</th><th>Reason</th><th>Status</th><th>Date</th></tr></thead><tbody>
                        {flags.map(f => <tr key={f.id}><td>{f.reporter_name || "User"}</td><td>{f.reason}</td><td><span className={`admin-badge admin-badge--${f.status}`}>{f.status}</span></td><td>{new Date(f.created_at).toLocaleDateString()}</td></tr>)}
                    </tbody></table></div>
                </div>
            )}
            <ActionModal open={modal === "ban"} title="Ban User" description={`Ban "${user.username}"?`} confirmLabel="Ban User" confirmVariant="danger" requireReason reasonLabel="Ban Reason" onConfirm={() => { setIsBanned(true); setModal(null); }} onCancel={() => setModal(null)} />
            <ActionModal open={modal === "unban"} title="Unban User" description={`Unban "${user.username}"?`} confirmLabel="Unban User" confirmVariant="success" onConfirm={() => { setIsBanned(false); setModal(null); }} onCancel={() => setModal(null)} />
            <ActionModal open={modal === "delete"} title="Delete Account" description={`Permanently delete "${user.username}"?`} confirmLabel="Delete Account" confirmVariant="danger" requireReason reasonLabel="Reason for deletion" onConfirm={() => setModal(null)} onCancel={() => setModal(null)} />
        </div>
    );
}
