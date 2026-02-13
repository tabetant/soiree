/**
 * useAdminData — Data hooks for all admin pages.
 *
 * Each hook checks isDevMode():
 *   true  → returns mock data from adminMockData.ts
 *   false → fetches from Supabase
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

function useData<T>(
    mockData: T,
    fetcher: () => Promise<T>,
): UseDataResult<T> {
    const [data, setData] = useState<T>(mockData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (isDevMode()) {
                setData(mockData);
            } else {
                const result = await fetcher();
                setData(result);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
            // Fall back to mock data on error
            setData(mockData);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/* ─── Admin Stats ────────────────────────────────────────── */

export function useAdminStats(): UseDataResult<AdminStats> {
    return useData<AdminStats>(getAdminStats(), async () => {
        const supabase = createClient();

        // Parallel queries
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
    return useData<AdminSupplier[]>(MOCK_ADMIN_SUPPLIERS, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("suppliers")
            .select(`
                id, user_id, business_name, contact_email, phone, website,
                verification_status, stripe_connect_id, plan, social_links,
                rejection_reason, created_at, updated_at
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((s): AdminSupplier => ({
            ...s,
            email: s.contact_email,
            contact_name: undefined,
            venues_count: 0,
            events_count: 0,
            total_checkins: 0,
        }));
    });
}

export function useAdminSupplier(id: string): UseDataResult<AdminSupplier | null> {
    const mock = MOCK_ADMIN_SUPPLIERS.find(s => s.id === id) || null;
    return useData<AdminSupplier | null>(mock, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("suppliers")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        if (!data) return null;

        // Get venue + event counts
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
    return useData<SupplierEvent[]>(MOCK_ADMIN_EVENTS, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("event_date", { ascending: false });

        if (error) throw error;
        return (data || []) as SupplierEvent[];
    });
}

export function useAdminEvent(id: string): UseDataResult<SupplierEvent | null> {
    const mock = MOCK_ADMIN_EVENTS.find(e => e.id === id) || null;
    return useData<SupplierEvent | null>(mock, async () => {
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
    return useData<AdminUser[]>(MOCK_ADMIN_USERS, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select(`
                id, username, display_name, email, role, level, total_xp, stars,
                date_of_birth, music_preferences, vibe_preferences,
                is_banned, ban_reason, created_at
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
            checkins_count: 0,
            posts_count: 0,
            flags_count: 0,
        }));
    });
}

export function useAdminUser(id: string): UseDataResult<AdminUser | null> {
    const mock = MOCK_ADMIN_USERS.find(u => u.id === id) || null;
    return useData<AdminUser | null>(mock, async () => {
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
    return useData<AdminAction[]>(MOCK_ADMIN_ACTIONS, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("admin_actions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        return (data || []).map((a): AdminAction => ({
            id: a.id,
            admin_id: a.admin_id,
            admin_name: "Admin",
            action_type: a.action_type,
            target_type: a.target_type,
            target_id: a.target_id,
            target_name: a.target_type,
            reason: a.reason,
            created_at: a.created_at,
        }));
    });
}

export function useAdminFlags(): UseDataResult<Flag[]> {
    return useData<Flag[]>(MOCK_FLAGS, async () => {
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

/* ─── Growth & Analytics ─────────────────────────────────── */

export function useGrowthData(): UseDataResult<PlatformGrowthPoint[]> {
    return useData<PlatformGrowthPoint[]>(MOCK_GROWTH_DATA, async () => {
        // Growth data isn't stored in a single table yet — fall back to mock
        return MOCK_GROWTH_DATA;
    });
}

export function useVenueAnalytics(): UseDataResult<typeof MOCK_VENUE_ANALYTICS> {
    return useData(MOCK_VENUE_ANALYTICS, async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("venues")
            .select("name, supplier_id")
            .limit(10);

        if (error) throw error;

        return (data || []).map(v => ({
            venue_name: v.name,
            supplier: v.supplier_id || "—",
            checkins: 0,
            opens: 0,
            saves: 0,
            status: "Active",
        }));
    });
}
