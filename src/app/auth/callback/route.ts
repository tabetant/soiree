/**
 * OAuth Callback Route Handler
 *
 * After Supabase OAuth (Google/Apple), the user is redirected here.
 * We exchange the authorization code for a session and redirect
 * the user to the next onboarding step.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/onboarding/step-2-dob";

    if (code) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // If something went wrong, redirect back to auth with error
    return NextResponse.redirect(
        `${origin}/onboarding/step-1-auth?error=auth_failed`
    );
}
