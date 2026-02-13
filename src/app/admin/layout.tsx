"use client";

import AdminNav from "@/components/AdminNav";
import DevModeToggle from "@/components/DevModeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-layout">
            <AdminNav />
            <main className="admin-main">{children}</main>
            <DevModeToggle />
        </div>
    );
}

