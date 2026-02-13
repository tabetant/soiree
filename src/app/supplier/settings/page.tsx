"use client";

/**
 * Supplier Settings Page
 *
 * Business profile, venue management, plan info,
 * notification toggles, and sign out.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import SupplierNav from "@/components/SupplierNav";
import { createClient } from "@/lib/supabase";
import { MOCK_SUPPLIER } from "@/lib/supplierMockData";

export default function SupplierSettingsPage() {
    const router = useRouter();
    const supplier = MOCK_SUPPLIER;

    // ── Business Profile State ──
    const [businessName, setBusinessName] = useState(supplier.business_name);
    const [contactEmail, setContactEmail] = useState(supplier.contact_email || "");
    const [phone, setPhone] = useState(supplier.phone || "");
    const [website, setWebsite] = useState(supplier.website || "");
    const [instagram, setInstagram] = useState(supplier.social_links?.instagram || "");
    const [facebook, setFacebook] = useState(supplier.social_links?.facebook || "");
    const [tiktok, setTiktok] = useState(supplier.social_links?.tiktok || "");

    // ── Notifications ──
    const [notifyTicketSale, setNotifyTicketSale] = useState(true);
    const [notifyCrowdSpike, setNotifyCrowdSpike] = useState(true);
    const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(true);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const handleSave = () => {
        setSaving(true);
        // Mock save
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 600);
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/onboarding/step-1-auth");
        } catch {
            setSigningOut(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50";
    const labelClass = "block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1.5";
    const sectionTitle = (text: string) => (
        <h2 className="text-sm font-semibold text-foreground mt-6 mb-3">{text}</h2>
    );

    const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative w-10 h-5 rounded-full transition-colors ${on ? "bg-accent" : "bg-border"}`}
        >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </button>
    );

    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="px-5 pt-12 pb-4">
                <h1 className="text-xl font-bold text-foreground">Settings</h1>
            </div>

            <div className="px-5 space-y-0">
                {/* ── Business Profile ──────────────── */}
                {sectionTitle("Business Profile")}
                <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                    <div>
                        <label className={labelClass}>Business Name</label>
                        <input className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Contact Email</label>
                        <input type="email" className={inputClass} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Phone</label>
                        <input type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Website</label>
                        <input type="url" className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                </div>

                {/* ── Social Links ──────────────────── */}
                {sectionTitle("Social Links")}
                <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                    <div>
                        <label className={labelClass}>Instagram</label>
                        <input className={inputClass} placeholder="@handle" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Facebook</label>
                        <input className={inputClass} placeholder="Page name" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>TikTok</label>
                        <input className={inputClass} placeholder="@handle" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                    </div>
                </div>

                {/* ── Subscription Plan ─────────────── */}
                {sectionTitle("Subscription Plan")}
                <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground capitalize">
                                {supplier.plan} Plan
                            </p>
                            <p className="text-xs text-foreground-muted mt-0.5">
                                {supplier.plan === "pro" ? "Unlimited events, analytics, door mode" :
                                    supplier.plan === "tickets" ? "Full ticketing + Stripe Connect" :
                                        "Basic listing features"}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${supplier.plan === "pro" ? "bg-accent/20 text-accent" : "bg-surface-hover text-foreground-muted"
                            }`}>
                            {supplier.plan}
                        </span>
                    </div>
                    <button className="w-full mt-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground-muted hover:text-foreground transition-colors">
                        Upgrade Plan
                    </button>
                </div>

                {/* ── Stripe ───────────────────────── */}
                {sectionTitle("Payments")}
                <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Stripe Connect</p>
                            <p className="text-xs text-foreground-muted mt-0.5">
                                {supplier.stripe_connect_id ? "Connected" : "Not connected"}
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${supplier.stripe_connect_id ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"
                            }`}>
                            {supplier.stripe_connect_id ? "✓ Connected" : "Required for tickets"}
                        </span>
                    </div>
                    {!supplier.stripe_connect_id && (
                        <button className="w-full mt-3 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-glow transition-colors">
                            Connect Stripe
                        </button>
                    )}
                </div>

                {/* ── Notifications ─────────────────── */}
                {sectionTitle("Notifications")}
                <div className="rounded-2xl border border-border bg-surface divide-y divide-border">
                    {[
                        { label: "New ticket sale", on: notifyTicketSale, toggle: () => setNotifyTicketSale(!notifyTicketSale) },
                        { label: "Crowd spike alerts", on: notifyCrowdSpike, toggle: () => setNotifyCrowdSpike(!notifyCrowdSpike) },
                        { label: "Weekly analytics summary", on: notifyWeeklySummary, toggle: () => setNotifyWeeklySummary(!notifyWeeklySummary) },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between px-4 py-3">
                            <span className="text-sm text-foreground">{item.label}</span>
                            <Toggle on={item.on} onChange={item.toggle} />
                        </div>
                    ))}
                </div>

                {/* ── Save + Sign Out ───────────────── */}
                <div className="pt-6 space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-glow transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
                    </button>
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {signingOut ? "Signing out…" : "Sign Out"}
                    </button>
                </div>
            </div>

            <SupplierNav />
        </div>
    );
}
