import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction, AdminAuthError } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();
        const { supplier_id, reason } = await request.json();

        if (!supplier_id || !reason) {
            return NextResponse.json({ error: "supplier_id and reason are required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("suppliers")
            .update({ verification_status: "rejected", rejection_reason: reason })
            .eq("id", supplier_id);

        if (error) throw error;

        await logAdminAction(supabase, adminId, "reject_supplier", "supplier", supplier_id, reason);

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof AdminAuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
