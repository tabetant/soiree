/**
 * Role-Based Router
 *
 * Queries the user's role from profiles table and returns
 * the appropriate redirect path after login.
 */

import { createClient } from "@/lib/supabase";
import type { UserRole } from "@/lib/types";

const ROLE_ROUTES: Record<UserRole, string> = {
    consumer: "/home",
    supplier: "/supplier/dashboard",
    admin: "/admin/dashboard",
};

export async function routeByRole(userId: string): Promise<string> {
    const supabase = createClient();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    if (error || !profile?.role) {
        return "/home"; // Default fallback
    }

    return ROLE_ROUTES[profile.role as UserRole] || "/home";
}
