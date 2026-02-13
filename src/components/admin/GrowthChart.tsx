"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { PlatformGrowthPoint } from "@/lib/adminMockData";

interface GrowthChartProps {
    data: PlatformGrowthPoint[];
}

const COLORS = {
    users: "#a78bfa",      // purple
    suppliers: "#f472b6",  // pink
    checkins: "#34d399",   // green
    events: "#fbbf24",     // yellow
};

export default function GrowthChart({ data }: GrowthChartProps) {
    return (
        <div className="admin-chart-wrap">
            <h3 className="admin-section-title">Platform Growth — Last 30 Days</h3>
            <div className="admin-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#aaa", fontSize: 11 }}
                            tickFormatter={(v: string) => v.slice(5)} // "MM-DD"
                            interval={4}
                        />
                        <YAxis tick={{ fill: "#aaa", fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{
                                background: "#1e1b2e",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 8,
                                color: "#fff",
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="new_users" stroke={COLORS.users} name="New Users" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="check_ins" stroke={COLORS.checkins} name="Check-ins" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="events_published" stroke={COLORS.events} name="Events" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="new_suppliers" stroke={COLORS.suppliers} name="Suppliers" dot={false} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
