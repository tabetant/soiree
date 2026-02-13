"use client";

/**
 * Step 0: Role Selection
 *
 * Three role cards: Consumer (proceed), Venue Owner (apply), Admin (hidden).
 * Consumer can self-signup. Venue Owner opens supplier application modal.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import SupplierApplicationModal from "@/components/SupplierApplicationModal";

const ROLES = [
    {
        id: "consumer",
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        title: "Party-goer",
        description: "Discover events, earn rewards, connect with nightlife",
        action: "proceed" as const,
    },
    {
        id: "supplier",
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 22V12h6v10" />
                <path d="M3 9h18" />
            </svg>
        ),
        title: "Venue Owner",
        description: "Manage events, track analytics, engage customers",
        action: "apply" as const,
    },
    {
        id: "admin",
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Admin",
        description: "Platform management",
        action: "disabled" as const,
        hidden: true,
    },
];

export default function Step0RolePage() {
    const router = useRouter();
    const [showApplicationModal, setShowApplicationModal] = useState(false);

    return (
        <div className="animate-slide-up flex flex-col items-center gap-8">
            {/* Logo / Brand */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="animate-float text-5xl">🌙</div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-accent-glow via-accent to-neon-pink bg-clip-text text-transparent">
                    Join Soirée
                </h1>
                <p className="text-base text-foreground-muted max-w-xs">
                    Choose how you want to experience Toronto&apos;s nightlife.
                </p>
            </div>

            {/* Role cards */}
            <div className="flex w-full flex-col gap-3">
                {ROLES.filter((r) => !r.hidden).map((role) => (
                    <button
                        key={role.id}
                        onClick={() => {
                            if (role.action === "proceed") {
                                sessionStorage.setItem("soiree_role", role.id);
                                router.push("/onboarding/step-1-auth");
                            } else if (role.action === "apply") {
                                setShowApplicationModal(true);
                            }
                        }}
                        disabled={role.action === "disabled"}
                        className={`group relative flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-300 ${role.action !== "disabled"
                                ? "border-accent bg-accent/5 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/10 cursor-pointer"
                                : "border-border bg-surface/50 opacity-60 cursor-not-allowed"
                            }`}
                    >
                        {/* Selected indicator for consumer */}
                        {role.action === "proceed" && (
                            <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}

                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${role.action !== "disabled"
                                ? "bg-accent/20 text-accent"
                                : "bg-surface text-foreground-muted"
                            }`}>
                            {role.icon}
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className={`text-base font-semibold ${role.action !== "disabled" ? "text-foreground" : "text-foreground-muted"
                                }`}>
                                {role.title}
                            </span>
                            <span className="text-sm text-foreground-muted leading-snug">
                                {role.description}
                            </span>
                            {role.action === "apply" && (
                                <span className="mt-1 text-xs text-accent font-medium">
                                    Apply Now →
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Continue button */}
            <button
                onClick={() => {
                    sessionStorage.setItem("soiree_role", "consumer");
                    router.push("/onboarding/step-1-auth");
                }}
                className="h-14 w-full rounded-2xl bg-accent font-semibold text-white text-base transition-all duration-200 hover:bg-accent-glow active:scale-[0.98]"
            >
                Get Started
            </button>

            {/* Supplier Application Modal */}
            <SupplierApplicationModal
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
            />
        </div>
    );
}
