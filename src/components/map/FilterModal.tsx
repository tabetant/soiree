"use client";

/**
 * FilterModal Component
 *
 * Bottom-sheet modal with multi-select checkboxes for a single filter category.
 * Slides up from bottom with backdrop blur.
 */

import { useState, useEffect } from "react";
import { FILTER_OPTIONS, FILTER_LABELS, type FilterCategory } from "@/lib/mapFilters";

interface FilterModalProps {
    filterType: FilterCategory;
    isOpen: boolean;
    onClose: () => void;
    selectedValues: string[];
    onApply: (selected: string[]) => void;
}

export default function FilterModal({
    filterType,
    isOpen,
    onClose,
    selectedValues,
    onApply,
}: FilterModalProps) {
    const [local, setLocal] = useState<string[]>(selectedValues);

    // Sync when opening
    useEffect(() => {
        if (isOpen) setLocal(selectedValues);
    }, [isOpen, selectedValues]);

    const options = FILTER_OPTIONS[filterType];

    const toggle = (value: string) => {
        setLocal((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleApply = () => {
        onApply(local);
        onClose();
    };

    const handleClear = () => {
        setLocal([]);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-0 left-0 right-0 z-[70] animate-slide-up">
                <div className="mx-auto max-w-lg rounded-t-3xl bg-[#111118] border-t border-border shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h2 className="text-lg font-bold text-foreground">
                            {FILTER_LABELS[filterType]} Filter
                        </h2>
                        <button
                            onClick={handleClear}
                            className="text-sm font-medium text-accent hover:text-accent-glow transition-colors"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Checkbox list */}
                    <div className="px-5 pb-4 space-y-1 max-h-[50dvh] overflow-y-auto">
                        {options.map((opt) => {
                            const checked = local.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => toggle(opt.value)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-colors ${checked
                                            ? "bg-accent/10"
                                            : "hover:bg-white/5"
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <div
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${checked
                                                ? "bg-accent border-accent"
                                                : "border-gray-600 bg-transparent"
                                            }`}
                                    >
                                        {checked && (
                                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                                <path
                                                    d="M1 5L4.5 8.5L11 1"
                                                    stroke="white"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Label + description */}
                                    <div className="flex-1 text-left">
                                        <p className={`text-sm font-medium ${checked ? "text-foreground" : "text-gray-300"}`}>
                                            {opt.label}
                                        </p>
                                        {"description" in opt && opt.description && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {(opt as { description?: string }).description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Apply button */}
                    <div className="px-5 pb-5 pt-2 border-t border-border">
                        <button
                            onClick={handleApply}
                            className="h-12 w-full rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-glow transition-colors active:scale-[0.98]"
                        >
                            Apply{local.length > 0 ? ` (${local.length})` : ""}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
