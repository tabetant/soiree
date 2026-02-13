"use client";

/**
 * Notifications Page
 *
 * Displays likes, comments, follows, achievements, and rewards
 * from Supabase notifications table.
 *
 * Uses real data when dev mode is OFF.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { isDevMode } from "@/lib/devMode";
import { timeAgo, getInitials, stringToHue } from "@/lib/feedUtils";
import BottomNav from "@/components/BottomNav";
import type { Notification } from "@/lib/types";

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: "n1", type: "like", from_user_id: "u1", from_user: { username: "maya.vibes", display_name: "Maya", profile_picture_url: null }, post_id: "p1", message: "maya.vibes liked your post", is_read: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: "n2", type: "comment", from_user_id: "u2", from_user: { username: "jord_toronto", display_name: "Jordan", profile_picture_url: null }, post_id: "p2", message: 'jord_toronto commented: "Fire 🔥"', is_read: false, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: "n3", type: "follow", from_user_id: "u3", from_user: { username: "marcusdj", display_name: "Marcus DJ", profile_picture_url: null }, message: "marcusdj started following you", is_read: true, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: "n4", type: "achievement", from_user_id: "system", message: "You earned Night Owl! +50 XP", is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "n5", type: "loyalty_reward", from_user_id: "system", message: "New reward available at Rebel!", is_read: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const ICON_MAP: Record<string, string> = {
    like: "❤️",
    comment: "💬",
    follow: "👤",
    achievement: "🏆",
    loyalty_reward: "🎁",
};

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (isDevMode()) {
                console.log("[Notifications] Dev mode ON → mock data");
                setNotifications(MOCK_NOTIFICATIONS);
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/onboarding/step-1-auth");
                    return;
                }

                const { data, error } = await supabase
                    .from("notifications")
                    .select(`
                        id,
                        type,
                        from_user_id,
                        post_id,
                        message,
                        is_read,
                        created_at,
                        from_user:profiles!notifications_from_user_id_fkey (
                            username,
                            display_name,
                            profile_picture_url
                        )
                    `)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) throw error;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const notifs: Notification[] = ((data || []) as any[]).map((n) => ({
                    id: n.id,
                    type: n.type,
                    from_user_id: n.from_user_id,
                    from_user: n.from_user ? {
                        username: n.from_user.username,
                        display_name: n.from_user.display_name,
                        profile_picture_url: n.from_user.profile_picture_url,
                    } : null,
                    post_id: n.post_id,
                    message: n.message,
                    is_read: n.is_read,
                    created_at: n.created_at,
                }));

                setNotifications(notifs);

                // Mark all as read
                const unreadIds = notifs.filter(n => !n.is_read).map(n => n.id);
                if (unreadIds.length > 0) {
                    await supabase
                        .from("notifications")
                        .update({ is_read: true })
                        .in("id", unreadIds);
                }

                console.log(`[Notifications] Loaded ${notifs.length} notifications`);
            } catch (err) {
                console.error("[Notifications] Error:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-bold text-foreground">Notifications</h1>
                {notifications.some(n => !n.is_read) && (
                    <span className="text-xs text-accent font-medium">Marking as read…</span>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pt-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-float text-4xl mb-3">🔔</div>
                        <p className="text-sm text-foreground-muted">Loading notifications…</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-5xl mb-4">🔕</span>
                        <p className="text-lg font-semibold text-foreground mb-1">No notifications yet</p>
                        <p className="text-sm text-foreground-muted max-w-xs">
                            When people like, comment, or follow you, you&apos;ll see it here!
                        </p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const icon = ICON_MAP[notif.type] || "🔔";
                        const fromUsername = notif.from_user?.username || "";
                        const hue = stringToHue(fromUsername || "system");

                        return (
                            <div
                                key={notif.id}
                                className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-colors ${!notif.is_read ? "bg-accent-surface/30" : ""
                                    }`}
                            >
                                {/* Avatar or icon */}
                                {notif.from_user ? (
                                    <div
                                        className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ background: `hsl(${hue}, 60%, 40%)` }}
                                    >
                                        {getInitials(notif.from_user.display_name || notif.from_user.username)}
                                    </div>
                                ) : (
                                    <span className="shrink-0 h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center text-lg">
                                        {icon}
                                    </span>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">{notif.message}</p>
                                    <p className="text-[10px] text-foreground-muted">{timeAgo(notif.created_at)}</p>
                                </div>

                                {!notif.is_read && (
                                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <BottomNav />
        </div>
    );
}
