"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import ActionModal from "@/components/admin/ActionModal";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SupplierDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [supplier, setSupplier] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"approve" | "reject" | "ban" | "unban" | null>(null);
    const [status, setStatus] = useState("pending");

    useEffect(() => { loadData(); }, [id]);

    async function loadData() {
        setLoading(true);
        try {
            const sb = createClient();
            const { data: s, error } = await sb.from("suppliers").select("*").eq("id", id).single();
            if (error || !s) { setSupplier(null); setLoading(false); return; }

            let email = s.contact_email || "";
            let contactName = "";
            if (s.user_id) {
                const { data: p } = await sb.from("profiles").select("email, username").eq("id", s.user_id).maybeSingle();
                if (p) { email = p.email || email; contactName = p.username || ""; }
            }
            const [vr, er] = await Promise.all([
                sb.from("venues").select("id", { count: "exact", head: true }).eq("supplier_id", id),
                sb.from("events").select("id", { count: "exact", head: true }).eq("supplier_id", id),
            ]);
            const enriched = { ...s, email, contact_name: contactName, venues_count: vr.count || 0, events_count: er.count || 0, total_checkins: 0 };
            setSupplier(enriched);
            setStatus(enriched.verification_status || "pending");

            const { data: ev } = await sb.from("events").select("*").eq("supplier_id", id).order("event_date", { ascending: false });
            setEvents(ev || []);
            const { data: ac } = await sb.from("admin_actions").select("*").eq("target_type", "supplier").eq("target_id", id).order("created_at", { ascending: false });
            setActions(ac || []);
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    }

    const handleAction = async (reason?: string) => {
        if (!supplier) return;
        const sb = createClient();
        let ns = status;
        if (modal === "approve") ns = "approved";
        else if (modal === "reject") ns = "rejected";
        else if (modal === "ban") ns = "banned";
        else if (modal === "unban") ns = "approved";
        const { error } = await sb.from("suppliers").update({ verification_status: ns, rejection_reason: reason || null }).eq("id", supplier.id);
        if (error) { alert(`Error: ${error.message}`); } else {
            setStatus(ns);
            await sb.from("admin_actions").insert({ action_type: `supplier_${modal}`, target_type: "supplier", target_id: supplier.id, target_name: supplier.business_name, reason });
            loadData();
        }
        setModal(null);
    };

    if (loading) return <div className="admin-page"><p className="admin-empty">Loading…</p></div>;
    if (!supplier) return <div className="admin-page"><p className="admin-empty">Supplier not found.</p><Link href="/admin/suppliers" className="admin-btn admin-btn--outline">← Back</Link></div>;

    return (
        <div className="admin-page">
            <div className="admin-detail-header">
                <Link href="/admin/suppliers" className="admin-detail-header__back">←</Link>
                <div><h1 className="admin-page__title">{supplier.business_name}</h1><span className={`admin-badge admin-badge--${status}`}>{status}</span></div>
            </div>
            <div className="admin-detail-actions">
                {status === "pending" && <><button className="admin-btn admin-btn--success" onClick={() => setModal("approve")}>✓ Approve</button><button className="admin-btn admin-btn--danger" onClick={() => setModal("reject")}>✕ Reject</button></>}
                {status === "approved" && <button className="admin-btn admin-btn--danger" onClick={() => setModal("ban")}>🚫 Ban</button>}
                {status === "banned" && <button className="admin-btn admin-btn--success" onClick={() => setModal("unban")}>↩ Unban</button>}
                <a href={`mailto:${supplier.email}`} className="admin-btn admin-btn--outline">✉ Contact</a>
            </div>
            <div className="admin-detail-grid">
                <div className="admin-card">
                    <h3 className="admin-section-title">Business Information</h3>
                    {[["Business Name", supplier.business_name], ["Contact", supplier.contact_name || "—"], ["Email", supplier.email], ["Phone", supplier.phone || "—"], ["Website", supplier.website || "—"]].map(([l, v]) => (
                        <div key={l} className="admin-info-row"><span className="admin-info-row__label">{l}</span><span className="admin-info-row__value">{v}</span></div>
                    ))}
                </div>
                <div className="admin-card">
                    <h3 className="admin-section-title">Platform Usage</h3>
                    <div className="admin-info-row"><span className="admin-info-row__label">Plan</span><span className="admin-info-row__value"><span className={`admin-badge admin-badge--${supplier.plan}`}>{supplier.plan || "—"}</span></span></div>
                    {[["Total Venues", supplier.venues_count], ["Total Events", supplier.events_count], ["Total Check-ins", supplier.total_checkins], ["Member Since", new Date(supplier.created_at || "").toLocaleDateString()]].map(([l, v]) => (
                        <div key={l} className="admin-info-row"><span className="admin-info-row__label">{l}</span><span className="admin-info-row__value">{v}</span></div>
                    ))}
                    {supplier.rejection_reason && <div className="admin-info-row"><span className="admin-info-row__label">Rejection Reason</span><span className="admin-info-row__value" style={{ color: "#f87171" }}>{supplier.rejection_reason}</span></div>}
                </div>
            </div>
            <div className="admin-card">
                <h3 className="admin-section-title">Events ({events.length})</h3>
                {events.length === 0 ? <p className="admin-empty">No events yet</p> : (
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Status</th></tr></thead><tbody>
                        {events.map(e => <tr key={e.id}><td className="admin-table__primary"><Link href={`/admin/events/${e.id}`} style={{ color: "inherit", textDecoration: "none" }}>{e.name}</Link></td><td><span className="admin-badge admin-badge--listing">{e.venue_type}</span></td><td>{new Date(e.event_date).toLocaleDateString()}</td><td><span className={`admin-badge admin-badge--${e.status}`}>{e.status}</span></td></tr>)}
                    </tbody></table></div>
                )}
            </div>
            <div className="admin-card">
                <h3 className="admin-section-title">Admin Action Log</h3>
                {actions.length === 0 ? <p className="admin-empty">No admin actions</p> : (
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Notes</th></tr></thead><tbody>
                        {actions.map(a => <tr key={a.id}><td>{new Date(a.created_at).toLocaleString()}</td><td>{a.admin_name || "Admin"}</td><td>{(a.action_type || "").replace(/_/g, " ")}</td><td>{a.reason || "—"}</td></tr>)}
                    </tbody></table></div>
                )}
            </div>
            <ActionModal open={modal === "approve"} title="Approve Supplier" description={`Approve "${supplier.business_name}"?`} confirmLabel="Approve" confirmVariant="success" onConfirm={handleAction} onCancel={() => setModal(null)} />
            <ActionModal open={modal === "reject"} title="Reject Supplier" description={`Reject "${supplier.business_name}"?`} confirmLabel="Reject" confirmVariant="danger" requireReason reasonLabel="Rejection Reason" onConfirm={handleAction} onCancel={() => setModal(null)} />
            <ActionModal open={modal === "ban"} title="Ban Supplier" description={`Ban "${supplier.business_name}"?`} confirmLabel="Ban" confirmVariant="danger" requireReason reasonLabel="Ban Reason" onConfirm={handleAction} onCancel={() => setModal(null)} />
            <ActionModal open={modal === "unban"} title="Unban Supplier" description={`Unban "${supplier.business_name}"?`} confirmLabel="Unban" confirmVariant="success" onConfirm={handleAction} onCancel={() => setModal(null)} />
        </div>
    );
}
