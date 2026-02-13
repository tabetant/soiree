"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminUser, useAdminFlags } from "@/hooks/useAdminData";
import ActionModal from "@/components/admin/ActionModal";

export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: user } = useAdminUser(id);
    const [modal, setModal] = useState<"ban" | "unban" | "delete" | null>(null);
    const [isBanned, setIsBanned] = useState(user?.is_banned || false);
    const { data: allFlags } = useAdminFlags();

    if (!user) {
        return (
            <div className="admin-page">
                <p className="admin-empty">User not found.</p>
                <Link href="/admin/users" className="admin-btn admin-btn--outline">← Back</Link>
            </div>
        );
    }

    const flags = allFlags.filter((f) => f.target_type === "user" && f.target_id === user.id);

    return (
        <div className="admin-page">
            <div className="admin-detail-header">
                <Link href="/admin/users" className="admin-detail-header__back">←</Link>
                <div>
                    <h1 className="admin-page__title">{user.username}</h1>
                    {user.display_name && (
                        <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>{user.display_name}</span>
                    )}
                    &nbsp;
                    {isBanned ? (
                        <span className="admin-badge admin-badge--banned">Banned</span>
                    ) : (
                        <span className="admin-badge admin-badge--active">Active</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="admin-detail-actions">
                {!isBanned ? (
                    <button className="admin-btn admin-btn--danger" onClick={() => setModal("ban")}>
                        🚫 Ban User
                    </button>
                ) : (
                    <button className="admin-btn admin-btn--success" onClick={() => setModal("unban")}>
                        ↩ Unban User
                    </button>
                )}
                <a href={`mailto:${user.email}`} className="admin-btn admin-btn--outline">
                    ✉ Send Email
                </a>
                <button className="admin-btn admin-btn--danger" onClick={() => setModal("delete")} style={{ marginLeft: "auto" }}>
                    🗑 Delete Account
                </button>
            </div>

            {/* Info Grid */}
            <div className="admin-detail-grid">
                <div className="admin-card">
                    <h3 className="admin-section-title">User Profile</h3>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Username</span>
                        <span className="admin-info-row__value">{user.username}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Display Name</span>
                        <span className="admin-info-row__value">{user.display_name || "—"}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Email</span>
                        <span className="admin-info-row__value">{user.email}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Role</span>
                        <span className="admin-info-row__value">
                            <span className={`admin-badge admin-badge--${user.role}`}>{user.role}</span>
                        </span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Date of Birth</span>
                        <span className="admin-info-row__value">{user.date_of_birth}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Member Since</span>
                        <span className="admin-info-row__value">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    {user.ban_reason && (
                        <div className="admin-info-row">
                            <span className="admin-info-row__label">Ban Reason</span>
                            <span className="admin-info-row__value" style={{ color: "#f87171" }}>{user.ban_reason}</span>
                        </div>
                    )}
                </div>

                <div className="admin-card">
                    <h3 className="admin-section-title">Platform Stats</h3>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Level</span>
                        <span className="admin-info-row__value">Lv.{user.level}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">XP</span>
                        <span className="admin-info-row__value">{user.total_xp}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Stars</span>
                        <span className="admin-info-row__value">⭐ {user.stars}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Check-ins</span>
                        <span className="admin-info-row__value">{user.checkins_count}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Posts</span>
                        <span className="admin-info-row__value">{user.posts_count}</span>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="admin-card">
                <h3 className="admin-section-title">Preferences</h3>
                <div className="admin-info-row">
                    <span className="admin-info-row__label">Music</span>
                    <span className="admin-info-row__value">{user.music_preferences.join(", ") || "—"}</span>
                </div>
                <div className="admin-info-row">
                    <span className="admin-info-row__label">Vibes</span>
                    <span className="admin-info-row__value">{user.vibe_preferences.join(", ") || "—"}</span>
                </div>
            </div>

            {/* Flags */}
            {flags.length > 0 && (
                <div className="admin-card">
                    <h3 className="admin-section-title">🚩 Flags ({flags.length})</h3>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Reporter</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flags.map((f) => (
                                    <tr key={f.id}>
                                        <td>{f.reporter_name}</td>
                                        <td>{f.reason}</td>
                                        <td><span className={`admin-badge admin-badge--${f.status}`}>{f.status}</span></td>
                                        <td>{new Date(f.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ActionModal
                open={modal === "ban"}
                title="Ban User"
                description={`Ban "${user.username}"? This will prevent them from logging in and hide their posts.`}
                confirmLabel="Ban User"
                confirmVariant="danger"
                requireReason
                reasonLabel="Ban Reason"
                onConfirm={() => { setIsBanned(true); setModal(null); }}
                onCancel={() => setModal(null)}
            />
            <ActionModal
                open={modal === "unban"}
                title="Unban User"
                description={`Unban "${user.username}"? They will be able to log in again.`}
                confirmLabel="Unban User"
                confirmVariant="success"
                onConfirm={() => { setIsBanned(false); setModal(null); }}
                onCancel={() => setModal(null)}
            />
            <ActionModal
                open={modal === "delete"}
                title="Delete Account"
                description={`Permanently delete "${user.username}"? This action cannot be undone.`}
                confirmLabel="Delete Account"
                confirmVariant="danger"
                requireReason
                reasonLabel="Reason for deletion"
                onConfirm={() => setModal(null)}
                onCancel={() => setModal(null)}
            />
        </div>
    );
}
