"use client";

/**
 * StatsCard — Supplier dashboard KPI card
 */

interface StatsCardProps {
    title: string;
    value: string | number;
    change: number; // percentage
    icon: React.ReactNode;
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
    const isPositive = change >= 0;

    return (
        <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-foreground-muted text-xs font-medium uppercase tracking-wider">
                    {title}
                </span>
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <div className="flex items-center gap-1">
                <span className={`text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-[10px] text-foreground-muted">vs last week</span>
            </div>
        </div>
    );
}
