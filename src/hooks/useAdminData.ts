/**
 * useAdminData — Data hooks for all admin pages.
 *
 * Each hook checks isDevMode():
 *   true  → returns mock data from adminMockData.ts
 *   false → fetches from Supabase
 *
 * CRITICAL: When dev mode is OFF and a fetch fails, we return EMPTY data
 * (not mock data) so the UI shows "no data" states.
 *
 * All hooks return { data, loading, error, refetch }.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { isDevMode } from "@/lib/devMode";
import {
    MOCK_ADMIN_SUPPLIERS,
    MOCK_ADMIN_USERS,
    MOCK_ADMIN_EVENTS,
    MOCK_ADMIN_ACTIONS,
    MOCK_FLAGS,
    MOCK_GROWTH_DATA,
    MOCK_VENUE_ANALYTICS,
    getAdminStats,
    type AdminSupplier,
    type AdminUser,
    type AdminAction,
    type Flag,
    type AdminStats,
    type PlatformGrowthPoint,
} from "@/lib/adminMockData";
import type { SupplierEvent } from "@/lib/types";

/* ─── Generic fetch wrapper ─────────────────────────────── */

interface UseDataResult<T> {
    data: T;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * @param mockData  — used ONLY when isDevMode() returns true
 * @param emptyData — default/empty data returned when dev mode is OFF (on error or initial)
 * @param fetcher   — async function that queries Supabase
 */
function useData<T>(
    mockData: T,
    emptyData: T,
    fetcher: () => Promise<T>,
): UseDataResult<T> {
    const devMode = isDevMode();
    const [data, setData] = useState<T>(devMode ? mockData : emptyData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const doFetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (isDevMode()) {
                console.log("[useData] Dev mode ON → returning mock data");
                setData(mockData);
            } else {
                console.log("[useData] Dev mode OFF → fetching from Supabase…");
                const result = await fetcher();
                console.log("[useData] Fetched:", result);
                setData(result);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.error("[useData] Fetch error:", msg);
            setError(msg);
            // Do NOT fall back to mock data when dev mode is off
            if (isDevMode()) {
                setData(mockData);
            } else {
                setData(emptyData);
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { doFetch(); }, [doFetch]);

    return { data, loading, error, refetch: doFetch };
}

/* ─── Admin Stats ────────────────────────────────────────── */

const EMPTY_STATS: AdminStats = {
    totalUsers: 0, usersChange: 0, totalSuppliers: 0,
    suppliersPending: 0, suppliersApproved: 0, suppliersRejected: 0,
    activeEvents: 0, totalCheckins7d: 0, checkinsChange: 0,
    pendingFlags: 0, flaggedEvents: 0, flaggedUsers: 0,
};

export function useAdminStats(): UseDataResult<AdminStats> {
    return useData<AdminStats>(getAdminStats(), EMPTY_STATS, async () => {
        const supabase = createClient();

        const [profilesRes, suppliersRes, eventsRes, flagsRes, checkinsRes] = await Promise.all([
            supabase.from("profiles").select("id", { count: "exact", head: true }),
            supabase.from("suppliers").select("id, verification_status"),
            supabase.from("events").select("id, status", { count: "exact" }).eq("status", "published"),
            supabase.from("flags").select("id, target_type, status").eq("status", "pending"),
            supabase.from("attendances").select("id", { count: "exact", head: true })
                .gte("checked_in_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const suppliers = suppliersRes.data || [];
        const flags = flagsRes.data || [];

        return {
            totalUsers: profilesRes.count || 0,
            usersChange: 0,
            totalSuppliers: suppliers.length,
            suppliersPending: suppliers.filter(s => s.verification_status === "pending").length,
            suppliersApproved: suppliers.filter(s => s.verification_status === "approved").length,
            suppliersRejected: suppliers.filter(s => s.verification_status === "rejected").length,
            activeEvents: eventsRes.count || 0,
            totalCheckins7d: checkinsRes.count || 0,
            checkinsChange: 0,
            pendingFlags: flags.length,
            flaggedEvents: flags.filter(f => f.target_type === "event").length,
            flaggedUsers: flags.filter(f => f.target_type === "user").length,
        };
    });
}

/* ─── Suppliers ──────────────────────────────────────────── */

export function useAdminSuppliers(): UseDataResult<AdminSupplier[]> {
    return useData<AdminSupplier[]>(MOCK_ADMIN_SUPPLIERS, [], async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("suppliers")
            .select(`
                *,
                user:profiles!user_id(email, username),
                venues:venues(count),
                events:events(count)
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((s): AdminSupplier => ({
            ...s,
            email: s.user?.email || s.contact_email,
            contact_name: s.user?.username,
            venues_count: s.venues?.[0]?.count || 0,
            events_count: s.events?.[0]?.count || 0,
            total_checkins: 0,
        }));
    });
}

export function useAdminSupplier(id: string): UseDataResult<AdminSupplier | null> {
    const mock = MOCK_ADMIN_SUPPLIERS.find(s => s.id === id) || null;
    return useData<AdminSupplier | null>(mock, null, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("suppliers")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        if (!data) return null;

        const [venueRes, eventRes] = await Promise.all([
            supabase.from("venues").select("id", { count: "exact", head: true }).eq("supplier_id", id),
            supabase.from("events").select("id", { count: "exact", head: true }).eq("supplier_id", id),
        ]);

        return {
            ...data,
            email: data.contact_email,
            venues_count: venueRes.count || 0,
            events_count: eventRes.count || 0,
            total_checkins: 0,
        } as AdminSupplier;
    });
}

/* ─── Events ─────────────────────────────────────────────── */

export function useAdminEvents(): UseDataResult<SupplierEvent[]> {
    return useData<SupplierEvent[]>(MOCK_ADMIN_EVENTS, [], async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .select(`
                *,
                venue:venues(name),
                supplier:suppliers(business_name),
                attendances:attendances(count),
                event_flags:flags(count)
            `)
            .order("event_date", { ascending: false });

        if (error) throw error;

        return (data || []).map(e => ({
            ...e,
            venue_name: e.venue?.name || e.venue_name,
            supplier_name: e.supplier?.business_name,
            checkins: e.attendances?.[0]?.count || 0,
            flag_count: e.event_flags?.[0]?.count || 0,
        })) as SupplierEvent[];
    });
}

export function useAdminEvent(id: string): UseDataResult<SupplierEvent | null> {
    const mock = MOCK_ADMIN_EVENTS.find(e => e.id === id) || null;
    return useData<SupplierEvent | null>(mock, null, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data as SupplierEvent | null;
    });
}

/* ─── Users ──────────────────────────────────────────────── */

export function useAdminUsers(): UseDataResult<AdminUser[]> {
    return useData<AdminUser[]>(MOCK_ADMIN_USERS, [], async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select(`
                *,
                attendances:attendances(count),
                posts:posts(count),
                flags_target:flags!target_id(count)
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((u): AdminUser => ({
            ...u,
            email: u.email || "",
            username: u.username || u.id.slice(0, 8),
            role: u.role || "consumer",
            level: u.level || 1,
            total_xp: u.total_xp || 0,
            stars: u.stars || 0,
            date_of_birth: u.date_of_birth || "",
            music_preferences: u.music_preferences || [],
            vibe_preferences: u.vibe_preferences || [],
            is_banned: u.is_banned || false,
            checkins_count: u.attendances?.[0]?.count || 0,
            posts_count: u.posts?.[0]?.count || 0,
            flags_count: u.flags_target?.[0]?.count || 0,
        }));
    });
}

export function useAdminUser(id: string): UseDataResult<AdminUser | null> {
    const mock = MOCK_ADMIN_USERS.find(u => u.id === id) || null;
    return useData<AdminUser | null>(mock, null, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        if (!data) return null;

        return {
            ...data,
            email: data.email || "",
            username: data.username || data.id.slice(0, 8),
            role: data.role || "consumer",
            level: data.level || 1,
            total_xp: data.total_xp || 0,
            stars: data.stars || 0,
            date_of_birth: data.date_of_birth || "",
            music_preferences: data.music_preferences || [],
            vibe_preferences: data.vibe_preferences || [],
            is_banned: data.is_banned || false,
            checkins_count: 0,
            posts_count: 0,
            flags_count: 0,
        } as AdminUser;
    });
}

/* ─── Actions & Flags ────────────────────────────────────── */

export function useAdminActions(): UseDataResult<AdminAction[]> {
    return useData<AdminAction[]>(MOCK_ADMIN_ACTIONS, [], async () => {
        const supabase = createClient();

        // Fetch admin actions with admin profile names
        const { data: adminActions, error: actionsError } = await supabase
            .from("admin_actions")
            .select(`
                *,
                admin:profiles!admin_id(username, display_name)
            `)
            .order("created_at", { ascending: false })
            .limit(20);

        if (actionsError) throw actionsError;

        const activities: AdminAction[] = [];

        (adminActions || []).forEach(action => {
            activities.push({
                id: action.id,
                admin_id: action.admin_id,
                admin_name: action.admin?.display_name || action.admin?.username || "Admin",
                action_type: action.action_type,
                target_type: action.target_type,
                target_id: action.target_id,
                target_name: action.target_type,
                reason: action.reason,
                created_at: action.created_at,
            });
        });

        // Recent event publications
        const { data: recentEvents } = await supabase
            .from("events")
            .select("id, name, created_at, supplier:suppliers(business_name)")
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(10);

        (recentEvents || []).forEach(event => {
            activities.push({
                id: `evt-${event.id}`,
                admin_id: "",
                admin_name: (event.supplier as { business_name?: string })?.business_name || "Supplier",
                action_type: "event_published",
                target_type: "event",
                target_id: event.id,
                target_name: event.name,
                created_at: event.created_at,
            });
        });

        // Recent supplier applications
        const { data: applications } = await supabase
            .from("supplier_applications")
            .select("id, business_name, email, status, created_at")
            .order("created_at", { ascending: false })
            .limit(10);

        (applications || []).forEach(app => {
            activities.push({
                id: `app-${app.id}`,
                admin_id: "",
                admin_name: app.business_name,
                action_type: "supplier_application",
                target_type: "supplier",
                target_id: app.id,
                target_name: app.business_name,
                created_at: app.created_at,
            });
        });

        // Recent user registrations
        const { data: newUsers } = await supabase
            .from("profiles")
            .select("id, username, created_at")
            .eq("role", "consumer")
            .order("created_at", { ascending: false })
            .limit(10);

        (newUsers || []).forEach(user => {
            activities.push({
                id: `user-${user.id}`,
                admin_id: "",
                admin_name: `@${user.username || "user"}`,
                action_type: "user_registered",
                target_type: "user",
                target_id: user.id,
                target_name: user.username || "New user",
                created_at: user.created_at,
            });
        });

        // Sort by timestamp
        activities.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return activities.slice(0, 20);
    });
}

export function useAdminFlags(): UseDataResult<Flag[]> {
    return useData<Flag[]>(MOCK_FLAGS, [], async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("flags")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((f): Flag => ({
            id: f.id,
            reporter_id: f.reporter_id,
            reporter_name: "User",
            target_type: f.target_type,
            target_id: f.target_id,
            target_name: f.target_type,
            reason: f.reason,
            status: f.status,
            reviewed_by: f.reviewed_by,
            notes: f.notes,
            created_at: f.created_at,
        }));
    });
}

/* ─── Growth Data (30-day rollup) ────────────────────────── */

export function useGrowthData(): UseDataResult<PlatformGrowthPoint[]> {
    return useData<PlatformGrowthPoint[]>(MOCK_GROWTH_DATA, [], async () => {
        const supabase = createClient();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const since = thirtyDaysAgo.toISOString();

        const dates: string[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split("T")[0]);
        }

        const [usersRes, suppliersRes, checkinsRes, eventsRes] = await Promise.all([
            supabase.from("profiles").select("created_at").eq("role", "consumer").gte("created_at", since),
            supabase.from("suppliers").select("created_at").gte("created_at", since),
            supabase.from("attendances").select("checked_in_at").gte("checked_in_at", since),
            supabase.from("events").select("created_at").eq("status", "published").gte("created_at", since),
        ]);

        const newUsers = usersRes.data || [];
        const newSuppliers = suppliersRes.data || [];
        const checkIns = checkinsRes.data || [];
        const events = eventsRes.data || [];

        return dates.map(date => ({
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            new_users: newUsers.filter(u => u.created_at?.split("T")[0] === date).length,
            new_suppliers: newSuppliers.filter(s => s.created_at?.split("T")[0] === date).length,
            check_ins: checkIns.filter(c => c.checked_in_at?.split("T")[0] === date).length,
            events_published: events.filter(e => e.created_at?.split("T")[0] === date).length,
        }));
    });
}

/* ─── Venue Analytics (top venues this week) ─────────────── */

export function useVenueAnalytics(): UseDataResult<typeof MOCK_VENUE_ANALYTICS> {
    return useData(MOCK_VENUE_ANALYTICS, [], async () => {
        const supabase = createClient();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const since = sevenDaysAgo.toISOString();

        const { data: venues, error: venueError } = await supabase
            .from("venues")
            .select("id, name, supplier:suppliers(business_name)");

        if (venueError) throw venueError;
        if (!venues || venues.length === 0) return [];

        const { data: checkIns } = await supabase
            .from("attendances")
            .select("venue_id")
            .gte("checked_in_at", since);

        const { data: analytics } = await supabase
            .from("event_analytics")
            .select("event_id, event_opens, saves, event:events(venue_id)")
            .gte("date", sevenDaysAgo.toISOString().split("T")[0]);

        const venueStats = new Map<string, { checkins: number; opens: number; saves: number }>();

        (checkIns || []).forEach(c => {
            if (!c.venue_id) return;
            const current = venueStats.get(c.venue_id) || { checkins: 0, opens: 0, saves: 0 };
            current.checkins += 1;
            venueStats.set(c.venue_id, current);
        });

        (analytics || []).forEach(a => {
            const venueId = (a.event as { venue_id?: string })?.venue_id;
            if (!venueId) return;
            const current = venueStats.get(venueId) || { checkins: 0, opens: 0, saves: 0 };
            current.opens += a.event_opens || 0;
            current.saves += a.saves || 0;
            venueStats.set(venueId, current);
        });

        return venues
            .map(v => {
                const stats = venueStats.get(v.id) || { checkins: 0, opens: 0, saves: 0 };
                return {
                    venue_name: v.name,
                    supplier: (v.supplier as { business_name?: string })?.business_name || "—",
                    checkins: stats.checkins,
                    opens: stats.opens,
                    saves: stats.saves,
                    status: "Active",
                };
            })
            .sort((a, b) => b.checkins - a.checkins)
            .slice(0, 5);
    });
}

/* ─── Supplier Applications ──────────────────────────────── */

export interface SupplierApplication {
    id: string;
    email: string;
    business_name: string;
    venue_address: string;
    music_types: string[];
    vibe_types: string[];
    status: "pending" | "approved" | "rejected";
    notes?: string;
    created_at: string;
}

export function useAdminApplications(): UseDataResult<SupplierApplication[]> {
    return useData<SupplierApplication[]>([], [], async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("supplier_applications")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return (data || []) as SupplierApplication[];
    });
}
