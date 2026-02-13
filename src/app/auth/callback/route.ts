/**
 * OAuth Callback Route Handler
 *
 * After Supabase OAuth (Google/Apple), the user is redirected here.
 * We exchange the authorization code for a session and redirect
 * based on the user's role: supplier → dashboard, admin → admin,
 * consumer → onboarding or /home.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const defaultNext = "/onboarding/step-2-dob";

    if (code) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check the user's role to determine redirect
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role, date_of_birth, music_preferences, vibe_preferences")
                    .eq("id", user.id)
                    .single();

                if (profile?.role === "supplier") {
                    return NextResponse.redirect(`${origin}/supplier/dashboard`);
                }
                if (profile?.role === "admin") {
                    return NextResponse.redirect(`${origin}/admin/dashboard`);
                }
                // Consumer with completed profile → /home
                if (
                    profile?.date_of_birth &&
                    profile?.music_preferences?.length &&
                    profile?.vibe_preferences?.length
                ) {
                    return NextResponse.redirect(`${origin}/home`);
                }
            }

            // Default: new user or incomplete profile → onboarding
            return NextResponse.redirect(`${origin}${defaultNext}`);
        }
    }

    // If something went wrong, redirect back to auth with error
    return NextResponse.redirect(
        `${origin}/onboarding/step-1-auth?error=auth_failed`
    );
}
