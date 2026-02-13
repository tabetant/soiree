"use client";

/**
 * Supplier Events List
 *
 * Filter tabs (All / Published / Draft / Ended) + event cards + create button.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import SupplierNav from "@/components/SupplierNav";
import EventCard from "@/components/supplier/EventCard";
import { useSupplierEvents } from "@/hooks/useSupplierData";
import type { EventStatus } from "@/lib/types";

type FilterTab = "all" | EventStatus;

const TABS: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Draft" },
    { id: "ended", label: "Ended" },
];

export default function SupplierEventsPage() {
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const { data: events } = useSupplierEvents();

    const filteredEvents = useMemo(() => {
        if (activeTab === "all") return events;
        return events.filter((e) => e.status === activeTab);
    }, [activeTab, events]);

    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border">
                <div className="flex items-center justify-between px-5 pt-12 pb-3">
                    <h1 className="text-xl font-bold text-foreground">Events</h1>
                    <Link
                        href="/supplier/events/create"
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-glow transition-colors"
                    >
                        <span>+</span> Create
                    </Link>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center px-5 gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors relative ${activeTab === tab.id
                                ? "text-accent"
                                : "text-foreground-muted hover:text-foreground"
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-accent" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events list */}
            <div className="px-5 py-4 space-y-3">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="text-4xl mb-4 block">📅</span>
                        <p className="text-sm font-medium text-foreground mb-1">No {activeTab} events</p>
                        <p className="text-xs text-foreground-muted">
                            {activeTab === "draft" ? "Start creating an event to see drafts here." : "Events will appear here as they are created."}
                        </p>
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))
                )}
            </div>

            <SupplierNav />
        </div>
    );
}
