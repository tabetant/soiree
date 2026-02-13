"use client";

import { useState } from "react";
import { isDevMode } from "@/lib/devMode";

export default function CreateAccountPage() {
    const [accountType, setAccountType] = useState<"admin" | "supplier">("supplier");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [sendEmail, setSendEmail] = useState(true);
    const [businessName, setBusinessName] = useState("");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");
    const [verificationStatus, setVerificationStatus] = useState("pending");
    const [plan, setPlan] = useState("basic");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("");

    const generatePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
        let pw = "";
        for (let i = 0; i < 16; i++) pw += chars[Math.floor(Math.random() * chars.length)];
        setPassword(pw);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (isDevMode()) {
            // Mock mode — simulate success
            setGeneratedPassword(password || "MockP@ss123!");
            setSuccess(true);
            setLoading(false);
            setTimeout(() => setSuccess(false), 8000);
            return;
        }

        try {
            if (accountType === "supplier") {
                const res = await fetch("/api/admin/create-supplier", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        business_name: businessName,
                        auto_approve: verificationStatus === "approved",
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to create supplier");
                setGeneratedPassword(data.password);
                setSuccess(true);
            } else {
                // Admin account creation handled differently (or same endpoint)
                const res = await fetch("/api/admin/create-account", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role: "admin" }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to create admin");
                setGeneratedPassword(password);
                setSuccess(true);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(false), 8000);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Create Account</h1>
            </div>

            {success && (
                <div className="admin-success">
                    ✓ Account created successfully! {sendEmail ? "Welcome email sent." : ""}
                    {password && (
                        <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 13, color: "#fff" }}>
                            Temporary password: {password}
                        </div>
                    )}
                </div>
            )}

            <div className="admin-card">
                <form className="admin-form" onSubmit={handleSubmit}>
                    {/* Account Type */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">Account Type</label>
                        <div className="admin-form-radio-group">
                            <label className="admin-form-radio">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={accountType === "supplier"}
                                    onChange={() => setAccountType("supplier")}
                                />
                                Supplier
                            </label>
                            <label className="admin-form-radio">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={accountType === "admin"}
                                    onChange={() => setAccountType("admin")}
                                />
                                Admin
                            </label>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">Email</label>
                        <input
                            type="email"
                            className="admin-form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="email@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">Temporary Password</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter or generate password"
                            />
                            <button type="button" className="admin-btn admin-btn--outline" onClick={generatePassword}>
                                🎲 Generate
                            </button>
                        </div>
                    </div>

                    {/* Send Email */}
                    <div className="admin-form-group">
                        <label className="admin-form-checkbox">
                            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                            Send welcome email with credentials
                        </label>
                    </div>

                    {/* Supplier Fields */}
                    {accountType === "supplier" && (
                        <>
                            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "20px 0" }} />
                            <h3 className="admin-section-title" style={{ fontSize: 14 }}>Supplier Details</h3>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Business Name</label>
                                <input
                                    type="text"
                                    className="admin-form-input"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    required
                                    placeholder="Business name"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Contact Name</label>
                                <input
                                    type="text"
                                    className="admin-form-input"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="Primary contact name"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="admin-form-input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 416-555-0000"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Verification Status</label>
                                <select
                                    className="admin-form-select"
                                    value={verificationStatus}
                                    onChange={(e) => setVerificationStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved (skip verification)</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Plan</label>
                                <select className="admin-form-select" value={plan} onChange={(e) => setPlan(e.target.value)}>
                                    <option value="basic">Basic</option>
                                    <option value="pro">Pro</option>
                                    <option value="tickets">Tickets</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button type="submit" className="admin-btn admin-btn--primary" style={{ marginTop: 8 }}>
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
