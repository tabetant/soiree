"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import ActionModal from "@/components/admin/ActionModal";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<any>(null);
    const [supplier, setSupplier] = useState<any>(null);
    const [flags, setFlags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"unpublish" | "delete" | null>(null);
    const [eventStatus, setEventStatus] = useState("draft");

    useEffect(() => { loadEvent(); }, [id]);

    async function loadEvent() {
        setLoading(true);
        try {
            const sb = createClient();
            const { data, error } = await sb.from("events").select("*").eq("id", id).single();
            if (error || !data) { setEvent(null); setLoading(false); return; }
            setEvent(data);
            setEventStatus(data.status || "draft");

            if (data.supplier_id) {
                const { data: s } = await sb.from("suppliers").select("id, business_name").eq("id", data.supplier_id).maybeSingle();
                setSupplier(s);
            }

            const { data: f } = await sb.from("flags").select("*").eq("target_type", "event").eq("target_id", id).order("created_at", { ascending: false });
            setFlags(f || []);
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    }

    if (loading) return <div className="admin-page"><p className="admin-empty">Loading…</p></div>;
    if (!event) return <div className="admin-page"><p className="admin-empty">Event not found.</p><Link href="/admin/events" className="admin-btn admin-btn--outline">← Back</Link></div>;

    return (
        <div className="admin-page">
            <div className="admin-detail-header">
                <Link href="/admin/events" className="admin-detail-header__back">←</Link>
                <div><h1 className="admin-page__title">{event.name}</h1><span className={`admin-badge admin-badge--${eventStatus}`}>{eventStatus}</span></div>
            </div>
            <div className="admin-detail-actions">
                {eventStatus === "published" && <button className="admin-btn admin-btn--warning" onClick={() => setModal("unpublish")}>⏸ Unpublish</button>}
                <button className="admin-btn admin-btn--danger" onClick={() => setModal("delete")}>🗑 Delete Event</button>
                {supplier && <Link href={`/admin/suppliers/${supplier.id}`} className="admin-btn admin-btn--outline">🏢 View Supplier</Link>}
            </div>
            <div className="admin-detail-grid">
                <div className="admin-card">
                    <h3 className="admin-section-title">Event Details</h3>
                    {[["Name", event.name], ["Venue", event.venue_name || "—"], ["Supplier", supplier?.business_name || "—"], ["Type", event.venue_type], ["Date", new Date(event.event_date).toLocaleString()], ["Age", `${event.age_requirement}+`], ["Capacity", event.capacity || "—"], ["Price", event.cover_range || event.price_tier], ["Music", (event.music_types || []).join(", ")], ["Vibes", (event.vibes || []).join(", ")]].map(([l, v]) => (
                        <div key={l} className="admin-info-row"><span className="admin-info-row__label">{l}</span><span className="admin-info-row__value">{v}</span></div>
                    ))}
                </div>
                <div className="admin-card">
                    <h3 className="admin-section-title">Performance Stats</h3>
                    {[["Map Views", event.views?.toLocaleString() || 0], ["Event Opens", event.opens?.toLocaleString() || 0], ["Saves", event.saves || 0], ["Check-ins", event.checkins || 0], ["Tasks Enabled", event.tasks_enabled ? "Yes" : "No"], ["Rewards Enabled", event.rewards_enabled ? "Yes" : "No"]].map(([l, v]) => (
                        <div key={l} className="admin-info-row"><span className="admin-info-row__label">{l}</span><span className="admin-info-row__value">{v}</span></div>
                    ))}
                </div>
            </div>
            {flags.length > 0 && (
                <div className="admin-card">
                    <h3 className="admin-section-title">🚩 Flags ({flags.length})</h3>
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Reporter</th><th>Reason</th><th>Status</th><th>Date</th></tr></thead><tbody>
                        {flags.map(f => <tr key={f.id}><td>{f.reporter_name || "User"}</td><td>{f.reason}</td><td><span className={`admin-badge admin-badge--${f.status}`}>{f.status}</span></td><td>{new Date(f.created_at).toLocaleDateString()}</td></tr>)}
                    </tbody></table></div>
                </div>
            )}
            <ActionModal open={modal === "unpublish"} title="Unpublish Event" description={`Remove "${event.name}" from the map?`} confirmLabel="Unpublish" confirmVariant="warning" onConfirm={() => { setEventStatus("draft"); setModal(null); }} onCancel={() => setModal(null)} />
            <ActionModal open={modal === "delete"} title="Delete Event" description={`Permanently delete "${event.name}"?`} confirmLabel="Delete Event" confirmVariant="danger" requireReason reasonLabel="Reason for deletion" onConfirm={() => setModal(null)} onCancel={() => setModal(null)} />
        </div>
    );
}
