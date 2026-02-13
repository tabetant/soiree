"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminEvent, useAdminSuppliers, useAdminFlags } from "@/hooks/useAdminData";
import ActionModal from "@/components/admin/ActionModal";

export default function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: event } = useAdminEvent(id);
    const [modal, setModal] = useState<"unpublish" | "delete" | null>(null);
    const [eventStatus, setEventStatus] = useState(event?.status || "draft");
    const { data: allSuppliers } = useAdminSuppliers();
    const { data: allFlags } = useAdminFlags();

    if (!event) {
        return (
            <div className="admin-page">
                <p className="admin-empty">Event not found.</p>
                <Link href="/admin/events" className="admin-btn admin-btn--outline">← Back</Link>
            </div>
        );
    }

    const supplier = allSuppliers.find((s) => s.id === event.supplier_id);
    const flags = allFlags.filter((f) => f.target_type === "event" && f.target_id === event.id);

    return (
        <div className="admin-page">
            <div className="admin-detail-header">
                <Link href="/admin/events" className="admin-detail-header__back">←</Link>
                <div>
                    <h1 className="admin-page__title">{event.name}</h1>
                    <span className={`admin-badge admin-badge--${eventStatus}`}>{eventStatus}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="admin-detail-actions">
                {eventStatus === "published" && (
                    <button className="admin-btn admin-btn--warning" onClick={() => setModal("unpublish")}>
                        ⏸ Unpublish Event
                    </button>
                )}
                <button className="admin-btn admin-btn--danger" onClick={() => setModal("delete")}>
                    🗑 Delete Event
                </button>
                {supplier && (
                    <Link href={`/admin/suppliers/${supplier.id}`} className="admin-btn admin-btn--outline">
                        🏢 View Supplier
                    </Link>
                )}
            </div>

            {/* Info Grid */}
            <div className="admin-detail-grid">
                <div className="admin-card">
                    <h3 className="admin-section-title">Event Details</h3>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Name</span>
                        <span className="admin-info-row__value">{event.name}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Venue</span>
                        <span className="admin-info-row__value">{event.venue_name}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Supplier</span>
                        <span className="admin-info-row__value">{supplier?.business_name || "—"}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Type</span>
                        <span className="admin-info-row__value">{event.venue_type}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Date</span>
                        <span className="admin-info-row__value">{new Date(event.event_date).toLocaleString()}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Age</span>
                        <span className="admin-info-row__value">{event.age_requirement}+</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Capacity</span>
                        <span className="admin-info-row__value">{event.capacity || "—"}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Price</span>
                        <span className="admin-info-row__value">{event.cover_range || event.price_tier}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Music</span>
                        <span className="admin-info-row__value">{event.music_types.join(", ")}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Vibes</span>
                        <span className="admin-info-row__value">{event.vibes.join(", ")}</span>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 className="admin-section-title">Performance Stats</h3>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Map Views</span>
                        <span className="admin-info-row__value">{event.views?.toLocaleString() || 0}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Event Opens</span>
                        <span className="admin-info-row__value">{event.opens?.toLocaleString() || 0}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Saves</span>
                        <span className="admin-info-row__value">{event.saves || 0}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Check-ins</span>
                        <span className="admin-info-row__value">{event.checkins || 0}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Tasks Enabled</span>
                        <span className="admin-info-row__value">{event.tasks_enabled ? "Yes" : "No"}</span>
                    </div>
                    <div className="admin-info-row">
                        <span className="admin-info-row__label">Rewards Enabled</span>
                        <span className="admin-info-row__value">{event.rewards_enabled ? "Yes" : "No"}</span>
                    </div>
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
                open={modal === "unpublish"}
                title="Unpublish Event"
                description={`Remove "${event.name}" from the map? It will no longer be visible to consumers.`}
                confirmLabel="Unpublish"
                confirmVariant="warning"
                onConfirm={() => { setEventStatus("draft"); setModal(null); }}
                onCancel={() => setModal(null)}
            />
            <ActionModal
                open={modal === "delete"}
                title="Delete Event"
                description={`Permanently delete "${event.name}"? This action cannot be undone.`}
                confirmLabel="Delete Event"
                confirmVariant="danger"
                requireReason
                reasonLabel="Reason for deletion"
                onConfirm={() => { setModal(null); }}
                onCancel={() => setModal(null)}
            />
        </div>
    );
}
