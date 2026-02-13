"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAdminActions } from "@/hooks/useAdminData";

export default function SettingsPage() {
    const router = useRouter();
    const { data: actions } = useAdminActions();

    // Feature toggles (UI-only for now)
    const [ticketing, setTicketing] = useState(true);
    const [socialFeed, setSocialFeed] = useState(true);
    const [rewards, setRewards] = useState(true);
    const [maintenance, setMaintenance] = useState(false);
    const [autoApprove, setAutoApprove] = useState(false);
    const [eventReview, setEventReview] = useState(false);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/onboarding/step-1-auth");
    };

    const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
        <button className={`admin-toggle ${on ? "admin-toggle--on" : ""}`} onClick={onToggle} type="button">
            <div className="admin-toggle__knob" />
        </button>
    );

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Settings</h1>
            </div>

            {/* Admin Account */}
            <div className="admin-card">
                <h3 className="admin-section-title">Admin Account</h3>
                <div className="admin-info-row">
                    <span className="admin-info-row__label">Role</span>
                    <span className="admin-info-row__value">
                        <span className="admin-badge admin-badge--admin">Admin</span>
                    </span>
                </div>
                <div style={{ marginTop: 16 }}>
                    <button className="admin-btn admin-btn--danger" onClick={handleSignOut}>
                        🚪 Sign Out
                    </button>
                </div>
            </div>

            {/* Create Account */}
            <div className="admin-card">
                <h3 className="admin-section-title">Admin Team</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
                    Create admin or supplier accounts manually.
                </p>
                <Link href="/admin/create-account" className="admin-btn admin-btn--primary">
                    + Create Account
                </Link>
            </div>

            {/* Feature Toggles */}
            <div className="admin-card">
                <h3 className="admin-section-title">Feature Toggles</h3>
                <div className="admin-toggle-row">
                    <div className="admin-toggle-row__info">
                        <span className="admin-toggle-row__label">Ticketing</span>
                        <span className="admin-toggle-row__desc">Enable ticket sales across the platform</span>
                    </div>
                    <Toggle on={ticketing} onToggle={() => setTicketing(!ticketing)} />
                </div>
                <div className="admin-toggle-row">
                    <div className="admin-toggle-row__info">
                        <span className="admin-toggle-row__label">Social Feed</span>
                        <span className="admin-toggle-row__desc">Enable social posts and comments</span>
                    </div>
                    <Toggle on={socialFeed} onToggle={() => setSocialFeed(!socialFeed)} />
                </div>
                <div className="admin-toggle-row">
                    <div className="admin-toggle-row__info">
                        <span className="admin-toggle-row__label">Rewards System</span>
                        <span className="admin-toggle-row__desc">Enable XP, levels, and rewards</span>
                    </div>
                    <Toggle on={rewards} onToggle={() => setRewards(!rewards)} />
                </div>
                <div className="admin-toggle-row">
                    <div className="admin-toggle-row__info">
                        <span className="admin-toggle-row__label">Maintenance Mode</span>
                        <span className="admin-toggle-row__desc">Show &quot;Under Maintenance&quot; to consumers</span>
                    </div>
                    <Toggle on={maintenance} onToggle={() => setMaintenance(!maintenance)} />
                </div>
            </div>

            {/* Approval Settings */}
            <div className="admin-card">
                <h3 className="admin-section-title">Approval Settings</h3>
                <div className="admin-toggle-row">
                    <div className="admin-toggle-row__info">
                        <span className="admin-toggle-row__label">Auto-approve Suppliers</span>
                        <span className="admin-toggle-row__desc">Skip manual verification for new suppliers</span>
                    </div>
                    <Toggle on={autoApprove} onToggle={() => setAutoApprove(!autoApprove)} />
                </div>
                <div className="admin-toggle-row">
                    <div className="admin-toggle-row__info">
                        <span className="admin-toggle-row__label">Require Event Review</span>
                        <span className="admin-toggle-row__desc">Events require admin approval before publishing</span>
                    </div>
                    <Toggle on={eventReview} onToggle={() => setEventReview(!eventReview)} />
                </div>
            </div>

            {/* Activity Log */}
            <div className="admin-card">
                <h3 className="admin-section-title">Activity Log</h3>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Admin</th>
                                <th>Action</th>
                                <th>Target</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actions.map((a) => (
                                <tr key={a.id}>
                                    <td>{new Date(a.created_at).toLocaleString()}</td>
                                    <td>{a.admin_name}</td>
                                    <td>{a.action_type.replace(/_/g, " ")}</td>
                                    <td>{a.target_name}</td>
                                    <td>{a.reason || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
