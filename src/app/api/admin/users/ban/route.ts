import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction, AdminAuthError } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();
        const { user_id, reason } = await request.json();

        if (!user_id || !reason) {
            return NextResponse.json({ error: "user_id and reason are required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                is_banned: true,
                banned_at: new Date().toISOString(),
                banned_by: adminId,
                ban_reason: reason,
            })
            .eq("id", user_id);

        if (error) throw error;

        await logAdminAction(supabase, adminId, "ban_user", "user", user_id, reason);

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof AdminAuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
