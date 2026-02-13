/**
 * useSupplierData — Data hooks for supplier pages.
 *
 * Each hook checks isDevMode():
 *   true  → returns mock data from supplierMockData.ts
 *   false → fetches from Supabase for the current logged-in supplier
 *
 * CRITICAL: When dev mode is OFF and a fetch fails, we return EMPTY data
 * (not mock data) so the UI shows real state.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { isDevMode } from "@/lib/devMode";
import {
    MOCK_SUPPLIER,
    MOCK_EVENTS,
    MOCK_ANALYTICS,
    getSupplierStats,
} from "@/lib/supplierMockData";
import type { Supplier, SupplierEvent, EventAnalytics } from "@/lib/types";

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
                console.log("[useSupplierData] Dev mode ON → returning mock data");
                setData(mockData);
            } else {
                console.log("[useSupplierData] Dev mode OFF → fetching from Supabase…");
                const result = await fetcher();
                console.log("[useSupplierData] Fetched:", result);
                setData(result);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("[useSupplierData] Fetch error:", msg);
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

/* ─── Current Supplier ───────────────────────────────────── */

export function useCurrentSupplier(): UseDataResult<Supplier> {
    return useData<Supplier>(MOCK_SUPPLIER, MOCK_SUPPLIER, async () => {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error(`Auth error: ${authError.message}`);
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("suppliers")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error) throw error;
        return data as Supplier;
    });
}

/* ─── Supplier Events ────────────────────────────────────── */

export function useSupplierEvents(): UseDataResult<SupplierEvent[]> {
    return useData<SupplierEvent[]>(MOCK_EVENTS, [], async () => {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error(`Auth error: ${authError.message}`);
        if (!user) throw new Error("Not authenticated");

        const { data: supplier } = await supabase
            .from("suppliers")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!supplier) throw new Error("Supplier not found");

        const { data, error } = await supabase
            .from("events")
            .select(`
                *,
                venue:venues(name),
                attendances:attendances(count)
            `)
            .eq("supplier_id", supplier.id)
            .order("event_date", { ascending: false });

        if (error) throw error;

        return (data || []).map(e => ({
            ...e,
            venue_name: e.venue?.name || e.venue_name,
            checkins: e.attendances?.[0]?.count || 0,
        })) as SupplierEvent[];
    });
}

/* ─── Supplier Stats ─────────────────────────────────────── */

type SupplierStats = ReturnType<typeof getSupplierStats>;

const EMPTY_STATS: SupplierStats = {
    impressions: { value: 0, change: 0 },
    opens: { value: 0, change: 0 },
    checkins: { value: 0, change: 0 },
    ticketSales: { value: 0, change: 0 },
};

export function useSupplierStats(): UseDataResult<SupplierStats> {
    return useData<SupplierStats>(getSupplierStats(), EMPTY_STATS, async () => {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error(`Auth error: ${authError.message}`);
        if (!user) throw new Error("Not authenticated");

        const { data: supplier } = await supabase
            .from("suppliers")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!supplier) throw new Error("Supplier not found");

        // Get event IDs for this supplier
        const { data: events } = await supabase
            .from("events")
            .select("id")
            .eq("supplier_id", supplier.id);

        const eventIds = events?.map(e => e.id) || [];
        if (eventIds.length === 0) return EMPTY_STATS;

        // Current week analytics
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: thisWeek } = await supabase
            .from("event_analytics")
            .select("map_impressions, event_opens, check_ins, ticket_sales")
            .in("event_id", eventIds)
            .gte("date", sevenDaysAgo.toISOString().split("T")[0]);

        // Previous week analytics (for % change)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const { data: prevWeek } = await supabase
            .from("event_analytics")
            .select("map_impressions, event_opens, check_ins, ticket_sales")
            .in("event_id", eventIds)
            .gte("date", fourteenDaysAgo.toISOString().split("T")[0])
            .lt("date", sevenDaysAgo.toISOString().split("T")[0]);

        const sumField = (arr: typeof thisWeek, field: string) =>
            (arr || []).reduce((acc, row) => acc + ((row as Record<string, number>)[field] || 0), 0);

        const pctChange = (curr: number, prev: number) =>
            prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 1000) / 10;

        const currImpressions = sumField(thisWeek, "map_impressions");
        const currOpens = sumField(thisWeek, "event_opens");
        const currCheckins = sumField(thisWeek, "check_ins");
        const currTickets = sumField(thisWeek, "ticket_sales");

        const prevImpressions = sumField(prevWeek, "map_impressions");
        const prevOpens = sumField(prevWeek, "event_opens");
        const prevCheckins = sumField(prevWeek, "check_ins");
        const prevTickets = sumField(prevWeek, "ticket_sales");

        return {
            impressions: { value: currImpressions, change: pctChange(currImpressions, prevImpressions) },
            opens: { value: currOpens, change: pctChange(currOpens, prevOpens) },
            checkins: { value: currCheckins, change: pctChange(currCheckins, prevCheckins) },
            ticketSales: { value: currTickets, change: pctChange(currTickets, prevTickets) },
        };
    });
}

/* ─── Analytics ──────────────────────────────────────────── */

export function useSupplierAnalytics(): UseDataResult<EventAnalytics[]> {
    return useData<EventAnalytics[]>(MOCK_ANALYTICS, [], async () => {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error(`Auth error: ${authError.message}`);
        if (!user) throw new Error("Not authenticated");

        const { data: supplier } = await supabase
            .from("suppliers")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!supplier) throw new Error("Supplier not found");

        // Get event IDs for this supplier
        const { data: events } = await supabase
            .from("events")
            .select("id")
            .eq("supplier_id", supplier.id);

        const eventIds = events?.map(e => e.id) || [];
        if (eventIds.length === 0) return [];

        const { data, error } = await supabase
            .from("event_analytics")
            .select("*")
            .in("event_id", eventIds)
            .order("date", { ascending: false })
            .limit(7);

        if (error) throw error;
        return (data || []) as EventAnalytics[];
    });
}
