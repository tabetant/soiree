import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction, AdminAuthError } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();
        const { user_id } = await request.json();

        if (!user_id) {
            return NextResponse.json({ error: "user_id is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                is_banned: false,
                banned_at: null,
                banned_by: null,
                ban_reason: null,
            })
            .eq("id", user_id);

        if (error) throw error;

        await logAdminAction(supabase, adminId, "unban_user", "user", user_id);

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof AdminAuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
