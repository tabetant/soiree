/**
 * Activity Feed Component
 *
 * Shows recent admin actions as a timeline list.
 */

import type { AdminAction } from "@/lib/adminMockData";
import { ACTION_LABELS } from "@/lib/adminMockData";

interface ActivityFeedProps {
    actions: AdminAction[];
    limit?: number;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function ActivityFeed({ actions, limit = 10 }: ActivityFeedProps) {
    const items = actions.slice(0, limit);

    return (
        <div className="admin-activity-feed">
            <h3 className="admin-section-title">Recent Activity</h3>
            {items.length === 0 ? (
                <p className="admin-empty">No recent activity</p>
            ) : (
                <ul className="admin-activity-list">
                    {items.map((a) => (
                        <li key={a.id} className="admin-activity-item">
                            <div className="admin-activity-item__dot" />
                            <div className="admin-activity-item__content">
                                <span className="admin-activity-item__label">
                                    {ACTION_LABELS[a.action_type] || a.action_type}:{" "}
                                    <strong>{a.target_name}</strong>
                                </span>
                                {a.reason && (
                                    <span className="admin-activity-item__reason">— {a.reason}</span>
                                )}
                                <span className="admin-activity-item__time">{timeAgo(a.created_at)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
