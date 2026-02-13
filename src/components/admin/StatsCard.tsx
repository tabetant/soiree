/**
 * Admin Stats Card
 *
 * Displays a key metric with optional subtitle and change indicator.
 */

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: number; // +/- percentage
    icon: string;
}

export default function StatsCard({ title, value, subtitle, change, icon }: StatsCardProps) {
    return (
        <div className="admin-stat-card">
            <div className="admin-stat-card__header">
                <span className="admin-stat-card__icon">{icon}</span>
                <span className="admin-stat-card__title">{title}</span>
            </div>
            <div className="admin-stat-card__value">{value}</div>
            {subtitle && <div className="admin-stat-card__subtitle">{subtitle}</div>}
            {change !== undefined && (
                <div className={`admin-stat-card__change ${change >= 0 ? "positive" : "negative"}`}>
                    {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% last 7 days
                </div>
            )}
        </div>
    );
}
