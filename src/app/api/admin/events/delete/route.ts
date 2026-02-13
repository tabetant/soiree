import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction, AdminAuthError } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();
        const { event_id, reason } = await request.json();

        if (!event_id || !reason) {
            return NextResponse.json({ error: "event_id and reason are required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", event_id);

        if (error) throw error;

        await logAdminAction(supabase, adminId, "delete_event", "event", event_id, reason);

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof AdminAuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
