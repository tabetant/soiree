/**
 * Admin Authorization Helper
 *
 * Verifies the current user has role='admin' in the profiles table.
 * Used by all admin API routes.
 */

import { createServerSupabaseClient } from "@/lib/supabase-server";

export class AdminAuthError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

/**
 * Verify the current request is from an admin user.
 * Returns { adminId, supabase } or throws AdminAuthError.
 */
export async function requireAdmin() {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new AdminAuthError("Not authenticated", 401);
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        throw new AdminAuthError("Not authorized — admin access required", 403);
    }

    return { adminId: user.id, supabase };
}

/**
 * Log an admin action to the admin_actions table.
 */
export async function logAdminAction(
    supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
    adminId: string,
    actionType: string,
    targetType: string,
    targetId: string,
    reason?: string,
    metadata?: Record<string, unknown>
) {
    await supabase.from("admin_actions").insert({
        admin_id: adminId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        reason,
        metadata,
    });
}
