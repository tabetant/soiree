import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction, AdminAuthError } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();
        const { supplier_id } = await request.json();

        if (!supplier_id) {
            return NextResponse.json({ error: "supplier_id is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("suppliers")
            .update({ verification_status: "approved" })
            .eq("id", supplier_id);

        if (error) throw error;

        await logAdminAction(supabase, adminId, "approve_supplier", "supplier", supplier_id);

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof AdminAuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
