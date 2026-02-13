/**
 * POST /api/admin/approve-application
 *
 * Approves a pending supplier application:
 * 1. Verify admin auth
 * 2. Fetch application
 * 3. Create auth user + profile + supplier via service-role
 * 4. Mark application as approved
 * 5. Log admin action
 * 6. Return credentials
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, logAdminAction } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();
        const { application_id } = await request.json();

        if (!application_id) {
            return NextResponse.json({ error: "application_id is required" }, { status: 400 });
        }

        // Get the application
        const { data: app, error: appError } = await supabaseAdmin
            .from("supplier_applications")
            .select("*")
            .eq("id", application_id)
            .eq("status", "pending")
            .single();

        if (appError || !app) {
            return NextResponse.json(
                { error: "Application not found or already processed" },
                { status: 404 }
            );
        }

        // Generate secure password
        const password = crypto.randomBytes(12).toString("base64").slice(0, 16);

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: app.email,
            password,
            email_confirm: true,
        });

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: authError?.message || "Failed to create auth user" },
                { status: 400 }
            );
        }

        const userId = authData.user.id;

        // Create profile
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: userId,
                role: "supplier",
                date_of_birth: "2000-01-01",
                music_preferences: app.music_types || [],
                vibe_preferences: app.vibe_types || [],
            });

        if (profileError) {
            // Rollback auth user
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return NextResponse.json(
                { error: `Failed to create profile: ${profileError.message}` },
                { status: 500 }
            );
        }

        // Create supplier record
        const { error: supplierError } = await supabaseAdmin
            .from("suppliers")
            .insert({
                user_id: userId,
                business_name: app.business_name,
                verification_status: "approved",
                plan: "basic",
            });

        if (supplierError) {
            return NextResponse.json(
                { error: `Profile created but supplier failed: ${supplierError.message}` },
                { status: 500 }
            );
        }

        // Mark application approved
        await supabaseAdmin
            .from("supplier_applications")
            .update({
                status: "approved",
                reviewed_by: adminId,
                notes: "Approved by admin",
            })
            .eq("id", application_id);

        // Log admin action
        await logAdminAction(
            supabase,
            adminId,
            "approve_application",
            "supplier",
            userId,
            undefined,
            { application_id, business_name: app.business_name, email: app.email }
        );

        return NextResponse.json({
            success: true,
            email: app.email,
            password,
            user_id: userId,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const status = (err as { status?: number })?.status || 500;
        return NextResponse.json({ error: message }, { status });
    }
}
