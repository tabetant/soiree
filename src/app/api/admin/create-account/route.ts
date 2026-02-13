import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction, AdminAuthError } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();
        const body = await request.json();
        const { email, password, role, business_name, verification_status, plan, send_email } = body;

        if (!email || !password || !role) {
            return NextResponse.json(
                { error: "email, password, and role are required" },
                { status: 400 }
            );
        }

        if (!["admin", "supplier"].includes(role)) {
            return NextResponse.json(
                { error: "role must be 'admin' or 'supplier'" },
                { status: 400 }
            );
        }

        // Create the auth user via Supabase Admin API
        // Note: In production, use supabase.auth.admin.createUser()
        // For now, we use the sign-up flow
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: authError?.message || "Failed to create auth user" },
                { status: 400 }
            );
        }

        const userId = authData.user.id;

        // Create profile
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            role,
        });

        if (profileError) {
            return NextResponse.json(
                { error: "User created but failed to set profile role" },
                { status: 500 }
            );
        }

        // Create supplier record if applicable
        if (role === "supplier" && business_name) {
            await supabase.from("suppliers").insert({
                user_id: userId,
                business_name,
                contact_email: email,
                verification_status: verification_status || "pending",
                plan: plan || "basic",
            });
        }

        await logAdminAction(supabase, adminId, "create_account", role, userId, undefined, {
            email,
            role,
            business_name,
        });

        return NextResponse.json({
            success: true,
            user_id: userId,
            email,
            role,
        });
    } catch (err) {
        if (err instanceof AdminAuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
