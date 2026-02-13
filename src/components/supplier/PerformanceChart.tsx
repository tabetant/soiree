"use client";

/**
 * PerformanceChart — Weekly line chart for supplier dashboard
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { EventAnalytics } from "@/lib/types";

interface PerformanceChartProps {
    data: EventAnalytics[];
}

const LINES = [
    { key: "map_impressions", label: "Views", color: "#a78bfa" },
    { key: "event_opens", label: "Opens", color: "#60a5fa" },
    { key: "check_ins", label: "Check-ins", color: "#34d399" },
    { key: "ticket_sales", label: "Tickets", color: "#f472b6" },
] as const;

export default function PerformanceChart({ data }: PerformanceChartProps) {
    const chartData = data.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
        Views: d.map_impressions,
        Opens: d.event_opens,
        "Check-ins": d.check_ins,
        Tickets: d.ticket_sales,
    }));

    return (
        <div className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Performance</h3>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        />
                        <YAxis
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                            width={35}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1a1a2e",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                fontSize: 12,
                                color: "#e5e7eb",
                            }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 11 }}
                            iconType="circle"
                            iconSize={8}
                        />
                        {LINES.map((line) => (
                            <Line
                                key={line.key}
                                type="monotone"
                                dataKey={line.label}
                                stroke={line.color}
                                strokeWidth={2}
                                dot={{ r: 3, fill: line.color }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
