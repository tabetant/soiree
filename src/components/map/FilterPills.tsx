"use client";

/**
 * FilterPills Component
 *
 * Horizontal scrollable row of pill-shaped filter buttons.
 * Each pill opens a FilterModal for its category.
 * Active pills show accent color + selection count badge.
 */

import type { MapFilters } from "@/lib/types";
import { FILTER_LABELS, type FilterCategory, categoryCount } from "@/lib/mapFilters";

interface FilterPillsProps {
    filters: MapFilters;
    onOpenFilter: (category: FilterCategory) => void;
}

const CATEGORIES: FilterCategory[] = ["type", "venue", "crowd", "music", "age"];

export default function FilterPills({ filters, onOpenFilter }: FilterPillsProps) {
    return (
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
                const count = categoryCount(filters, cat);
                const isActive = count > 0;

                return (
                    <button
                        key={cat}
                        onClick={() => onOpenFilter(cat)}
                        className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-accent text-white shadow-md shadow-accent/20"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                            }`}
                    >
                        <span>{FILTER_LABELS[cat]}</span>
                        {isActive && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                                {count}
                            </span>
                        )}
                        {/* Dropdown chevron */}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
