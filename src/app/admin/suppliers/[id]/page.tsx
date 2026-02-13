"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminSupplier, useAdminEvents, useAdminActions } from "@/hooks/useAdminData";
import ActionModal from "@/components/admin/ActionModal";

export default function SupplierDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: supplier } = useAdminSupplier(id);

    const [modal, setModal] = useState<"approve" | "reject" | "ban" | "unban" | null>(null);
    const [status, setStatus] = useState(supplier?.verification_status || "pending");

    const { data: allEvents } = useAdminEvents();
    const { data: allActions } = useAdminActions();

    if (!supplier) {
        return (
            <div className="admin-page">
                <p className="admin-empty">Supplier not found.</p>
                <Link href="/admin/suppliers" className="admin-btn admin-btn--outline">← Back</Link>
            </div>
        );
    }

    const events = allEvents.filter((e) => e.supplier_id === supplier.id);
    const actions = allActions.filter(
        (a) => a.target_type === "supplier" && a.target_id === supplier.id
    );

    const handleAction = (reason?: string) => {
        if (modal === "approve") setStatus("approved");
        else if (modal === "reject") setStatus("rejected");
        else if (modal === "ban") setStatus("banned");
        else if (modal === "unban") setStatus("approved");
        setModal(null);
    };

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-detail-header">
                <Link href="/admin/suppliers" className="admin-detail-header__back">←</Link>
                <div>
                    <h1 className="admin-page__title">{supplier.business_name}</h1>
                    <span className={`admin-badge admin-badge--${status}`}>{status}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="admin-detail-actions">
                {(status === "pending") && (
                    <>
                        <button className="admin-btn admin-btn--success" onClick={() => setModal("approve")}>
                            ✓ Approve Supplier
                        </button>
                        <button className="admin-btn admin-btn--danger" onClick={() => setModal("reject")}>
                            ✕ Reject Supplier
                        </button>
                    </>
                )}
                {(status === "approved") && (
                    <button className="admin-btn admin-btn--danger" onClick={() => setModal("ban")}>
                        🚫 Ban Supplier
                    </button>
                )}
                {(status === "banned") && (
                    <button className="admin-btn admin-btn--success" onClick={() => setModal("unban")}>
                        ↩ Unban Supplier
                    </button>
                )}
                <a href={`mailto:${supplier.email}`} className="admin-btn admin-btn--outline">
                    ✉ Contact Supplier
                </a>
            </div>

            {/* Info Grid */}
            <div className="admin-detail-grid">
                <div className="admin-card">
                    <h3 className="admin-section-title">Business Information</h3>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Business Name</span>
                        <span className="admin-info-row__value">{supplier.business_name}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Contact Name</span>
                        <span className="admin-info-row__value">{supplier.contact_name || "—"}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Email</span>
                        <span className="admin-info-row__value">{supplier.email}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Phone</span>
                        <span className="admin-info-row__value">{supplier.phone || "—"}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Website</span>
                        <span className="admin-info-row__value">{supplier.website || "—"}</span>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 className="admin-section-title">Platform Usage</h3>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Plan</span>
                        <span className="admin-info-row__value">
                            <span className={`admin-badge admin-badge--${supplier.plan}`}>{supplier.plan || "—"}</span>
                        </span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Total Venues</span>
                        <span className="admin-info-row__value">{supplier.venues_count}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Total Events</span>
                        <span className="admin-info-row__value">{supplier.events_count}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Total Check-ins</span>
                        <span className="admin-info-row__value">{supplier.total_checkins}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Member Since</span>
                        <span className="admin-info-row__value">{new Date(supplier.created_at || "").toLocaleDateString()}</span>
                    </div>
                    {supplier.rejection_reason && (
                        <div className="admin-info-row">
                            <span className="admin-info-row__label">Rejection Reason</span>
                            <span className="admin-info-row__value" style={{ color: "#f87171" }}>{supplier.rejection_reason}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Events */}
            <div className="admin-card">
                <h3 className="admin-section-title">Events ({events.length})</h3>
                {events.length === 0 ? (
                    <p className="admin-empty">No events yet</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Check-ins</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((e) => (
                                    <tr key={e.id}>
                                        <td className="admin-table__primary">
                                            <Link href={`/admin/events/${e.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                                {e.name}
                                            </Link>
                                        </td>
                                        <td><span className="admin-badge admin-badge--listing">{e.venue_type}</span></td>
                                        <td>{new Date(e.event_date).toLocaleDateString()}</td>
                                        <td><span className={`admin-badge admin-badge--${e.status}`}>{e.status}</span></td>
                                        <td>{e.checkins || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Admin Action Log */}
            <div className="admin-card">
                <h3 className="admin-section-title">Admin Action Log</h3>
                {actions.length === 0 ? (
                    <p className="admin-empty">No admin actions on this supplier</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Admin</th>
                                    <th>Action</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actions.map((a) => (
                                    <tr key={a.id}>
                                        <td>{new Date(a.created_at).toLocaleString()}</td>
                                        <td>{a.admin_name}</td>
                                        <td>{a.action_type.replace(/_/g, " ")}</td>
                                        <td>{a.reason || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ActionModal
                open={modal === "approve"}
                title="Approve Supplier"
                description={`Are you sure you want to approve "${supplier.business_name}"?`}
                confirmLabel="Approve"
                confirmVariant="success"
                onConfirm={handleAction}
                onCancel={() => setModal(null)}
            />
            <ActionModal
                open={modal === "reject"}
                title="Reject Supplier"
                description={`Reject "${supplier.business_name}"? Please provide a reason.`}
                confirmLabel="Reject Supplier"
                confirmVariant="danger"
                requireReason
                reasonLabel="Rejection Reason"
                onConfirm={handleAction}
                onCancel={() => setModal(null)}
            />
            <ActionModal
                open={modal === "ban"}
                title="Ban Supplier"
                description={`Ban "${supplier.business_name}"? This will unpublish all their events.`}
                confirmLabel="Ban Supplier"
                confirmVariant="danger"
                requireReason
                reasonLabel="Ban Reason"
                onConfirm={handleAction}
                onCancel={() => setModal(null)}
            />
            <ActionModal
                open={modal === "unban"}
                title="Unban Supplier"
                description={`Unban "${supplier.business_name}"? They will be restored to approved status.`}
                confirmLabel="Unban"
                confirmVariant="success"
                onConfirm={handleAction}
                onCancel={() => setModal(null)}
            />
        </div>
    );
}
