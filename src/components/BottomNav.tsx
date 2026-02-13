"use client";

/**
 * BottomNav Component
 *
 * Persistent bottom navigation bar.
 * 4 tabs: Map, Social, Rewards, Profile.
 * Highlights the active route using Next.js usePathname().
 */

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
    {
        label: "Map",
        path: "/home",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
                <path d="M2 12h20" />
            </svg>
        ),
    },
    {
        label: "Feed",
        path: "/feed",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "1.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: "Rewards",
        path: "/rewards",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
    },
    {
        label: "Profile",
        path: "/profile",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background/95 backdrop-blur-xl border-t border-border h-16 md:h-[72px] pb-[env(safe-area-inset-bottom)]">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-5 transition-colors duration-200 ${isActive
                            ? "text-accent"
                            : "text-foreground-muted hover:text-foreground"
                            }`}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {/* Active dot */}
                        {isActive && (
                            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-accent" />
                        )}
                        {item.icon(isActive)}
                        <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
