"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const NAV_ITEMS = [
    { label: "Overview", href: "/admin/dashboard", icon: "📊" },
    { label: "Suppliers", href: "/admin/suppliers", icon: "🏢" },
    { label: "Events", href: "/admin/events", icon: "📅" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/onboarding/step-1-auth");
    };

    return (
        <>
            {/* ── Desktop Sidebar ─────────────────────────── */}
            <nav className="admin-sidebar">
                <div className="admin-sidebar__logo">
                    <span className="admin-sidebar__logo-icon">🎉</span>
                    <span className="admin-sidebar__logo-text">Soirée</span>
                    <span className="admin-sidebar__logo-badge">Admin</span>
                </div>

                <ul className="admin-sidebar__nav">
                    {NAV_ITEMS.map(({ label, href, icon }) => {
                        const isActive = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
                                >
                                    <span className="admin-sidebar__link-icon">{icon}</span>
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <button className="admin-sidebar__signout" onClick={handleSignOut}>
                    🚪 Sign Out
                </button>
            </nav>

            {/* ── Mobile Top Bar ──────────────────────────── */}
            <nav className="admin-topbar">
                <div className="admin-topbar__header">
                    <span className="admin-sidebar__logo-icon">🎉</span>
                    <span className="admin-sidebar__logo-text">Soirée</span>
                    <span className="admin-sidebar__logo-badge">Admin</span>
                </div>
                <div className="admin-topbar__tabs">
                    {NAV_ITEMS.map(({ label, href, icon }) => {
                        const isActive = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`admin-topbar__tab ${isActive ? "admin-topbar__tab--active" : ""}`}
                            >
                                <span>{icon}</span>
                                <span className="admin-topbar__tab-label">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
