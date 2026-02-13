/**
 * useSupplierData — Data hooks for supplier pages.
 *
 * Each hook checks isDevMode():
 *   true  → returns mock data from supplierMockData.ts
 *   false → fetches from Supabase for the current logged-in supplier
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
            setData(mockData);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/* ─── Current Supplier ───────────────────────────────────── */

export function useCurrentSupplier(): UseDataResult<Supplier> {
    return useData<Supplier>(MOCK_SUPPLIER, async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
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
    return useData<SupplierEvent[]>(MOCK_EVENTS, async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Get supplier id first
        const { data: supplier } = await supabase
            .from("suppliers")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!supplier) throw new Error("Supplier not found");

        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("supplier_id", supplier.id)
            .order("event_date", { ascending: false });

        if (error) throw error;
        return (data || []) as SupplierEvent[];
    });
}

/* ─── Supplier Stats ─────────────────────────────────────── */

type SupplierStats = ReturnType<typeof getSupplierStats>;

export function useSupplierStats(): UseDataResult<SupplierStats> {
    return useData<SupplierStats>(getSupplierStats(), async () => {
        // For now return mock stats — real implementation would
        // aggregate from event_analytics table
        return getSupplierStats();
    });
}

/* ─── Analytics ──────────────────────────────────────────── */

export function useSupplierAnalytics(): UseDataResult<EventAnalytics[]> {
    return useData<EventAnalytics[]>(MOCK_ANALYTICS, async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: supplier } = await supabase
            .from("suppliers")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!supplier) throw new Error("Supplier not found");

        const { data, error } = await supabase
            .from("event_analytics")
            .select("*")
            .eq("supplier_id", supplier.id)
            .order("date", { ascending: false })
            .limit(7);

        if (error) throw error;
        return (data || []) as EventAnalytics[];
    });
}
