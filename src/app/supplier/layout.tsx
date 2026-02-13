/**
 * Supplier Layout
 *
 * Wraps all /supplier/* pages with the SupplierNav bottom navigation.
 */

"use client";

import DevModeToggle from "@/components/DevModeToggle";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh bg-background">
            {children}
            <DevModeToggle />
        </div>
    );
}

