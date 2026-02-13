/**
 * POST /api/admin/create-supplier
 *
 * Creates a supplier account using Supabase Admin API:
 * 1. Verify admin auth
 * 2. Generate secure password
 * 3. Create auth user (email_confirm: true)
 * 4. Create profile (role='supplier')
 * 5. Create supplier record
 * 6. Log admin action
 * 7. Return credentials
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, logAdminAction } from "@/lib/adminAuth";

export async function POST(request: Request) {
    try {
        const { adminId, supabase } = await requireAdmin();

        const { email, business_name, auto_approve } = await request.json();

        if (!email || !business_name) {
            return NextResponse.json(
                { error: "Email and business name are required" },
                { status: 400 }
            );
        }

        // Generate secure random password (16 chars, base64)
        const password = crypto.randomBytes(12).toString("base64").slice(0, 16);

        // Create auth user via admin API (bypasses email confirmation)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
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

        // Create profile with supplier role — include required NOT NULL fields
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: userId,
                role: "supplier",
                date_of_birth: "2000-01-01",
                music_preferences: [],
                vibe_preferences: [],
            });

        if (profileError) {
            // Rollback: delete the auth user we just created
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
                business_name,
                verification_status: auto_approve ? "approved" : "pending",
                plan: "basic",
            });

        if (supplierError) {
            return NextResponse.json(
                { error: `User created but supplier record failed: ${supplierError.message}` },
                { status: 500 }
            );
        }

        // Log admin action
        await logAdminAction(
            supabase,
            adminId,
            "create_supplier",
            "supplier",
            userId,
            undefined,
            { business_name, auto_approve, email }
        );

        return NextResponse.json({
            success: true,
            email,
            password,
            user_id: userId,
            verification_status: auto_approve ? "approved" : "pending",
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const status = (err as { statusCode?: number })?.statusCode || 500;
        return NextResponse.json({ error: message }, { status });
    }
}
