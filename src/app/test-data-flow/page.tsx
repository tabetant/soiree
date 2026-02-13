"use client";

/**
 * Test Data Flow — Debug page
 *
 * Queries suppliers, venues, events, posts tables
 * and displays counts + raw data for debugging.
 *
 * Access at: /test-data-flow
 */

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function TestDataFlowPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<Record<string, any>>({});
    const [running, setRunning] = useState(false);

    async function runTests() {
        setRunning(true);
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const testResults: Record<string, any> = {};

        try {
            // Test 1: Suppliers
            const { data: suppliers } = await supabase.from("suppliers").select("*");
            testResults.suppliers = {
                count: suppliers?.length || 0,
                approved: suppliers?.filter((s) => s.verification_status === "approved").length || 0,
                data: suppliers,
            };

            // Test 2: Venues
            const { data: venues } = await supabase.from("venues").select("*, supplier:suppliers(id, business_name, verification_status)");
            testResults.venues = {
                count: venues?.length || 0,
                withSupplier: venues?.filter((v) => v.supplier_id).length || 0,
                withApprovedSupplier: venues?.filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (v: any) => v.supplier?.verification_status === "approved"
                ).length || 0,
                data: venues,
            };

            // Test 3: Events
            const { data: events } = await supabase.from("events").select("*, venue:venues(*), supplier:suppliers(business_name, verification_status)");
            testResults.events = {
                count: events?.length || 0,
                published: events?.filter((e) => e.status === "published").length || 0,
                active: events?.filter((e) => new Date(e.end_date || e.event_date) >= new Date()).length || 0,
                data: events,
            };

            // Test 4: Posts
            const { data: posts } = await supabase.from("posts").select("*, user:profiles!posts_user_id_fkey(username, display_name)");
            testResults.posts = {
                count: posts?.length || 0,
                data: posts,
            };
        } catch (err) {
            testResults.error = String(err);
        }

        setResults(testResults);
        setRunning(false);
    }

    return (
        <div className="min-h-dvh bg-background text-foreground p-6">
            <h1 className="text-2xl font-bold mb-2">🔍 Data Flow Test</h1>
            <p className="text-sm text-foreground-muted mb-6">
                Queries Supabase tables directly to verify data flow between dashboards.
            </p>

            <button
                onClick={runTests}
                disabled={running}
                className="px-6 py-3 bg-accent hover:bg-accent-glow text-white rounded-xl font-semibold mb-6 disabled:opacity-50"
            >
                {running ? "Running…" : "Run Tests"}
            </button>

            <div className="space-y-4">
                {Object.entries(results).map(([key, value]) => (
                    <div key={key} className="bg-surface rounded-xl p-4 border border-border">
                        <h2 className="text-lg font-semibold mb-1 capitalize">{key}</h2>
                        {typeof value === "object" && value.count !== undefined && (
                            <div className="flex gap-4 mb-2 text-sm text-foreground-muted">
                                <span>Total: <strong className="text-foreground">{value.count}</strong></span>
                                {value.approved !== undefined && (
                                    <span>Approved: <strong className="text-green-400">{value.approved}</strong></span>
                                )}
                                {value.published !== undefined && (
                                    <span>Published: <strong className="text-accent">{value.published}</strong></span>
                                )}
                                {value.active !== undefined && (
                                    <span>Active: <strong className="text-red-400">{value.active}</strong></span>
                                )}
                            </div>
                        )}
                        <pre className="text-xs text-foreground-muted overflow-auto max-h-60 bg-background rounded-lg p-3">
                            {JSON.stringify(value, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
}
