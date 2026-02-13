/**
 * Next.js Middleware for Supabase Auth
 *
 * Refreshes the user session on every request (required for server-side auth)
 * and protects onboarding steps 2-4 and /home from unauthenticated access.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
    "/onboarding/step-2-dob",
    "/onboarding/step-3-music",
    "/onboarding/step-4-vibe",
    "/home",
    "/feed",
    "/notifications",
    "/profile",
    "/rewards",
    "/supplier",
    "/admin",
];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    // Skip auth if Supabase is not configured (allows UI preview without credentials)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        // Still handle root redirect
        if (request.nextUrl.pathname === "/") {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding/step-0-role";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session — IMPORTANT: don't remove this
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users trying to access protected routes
    const pathname = request.nextUrl.pathname;
    if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding/step-0-role";
        return NextResponse.redirect(url);
    }

    // Admin route protection — verify user has admin role
    if (user && pathname.startsWith("/admin")) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            const url = request.nextUrl.clone();
            url.pathname = profile?.role === "supplier" ? "/supplier/dashboard" : "/home";
            return NextResponse.redirect(url);
        }
    }

    // Redirect root based on role
    if (pathname === "/") {
        const url = request.nextUrl.clone();
        if (!user) {
            url.pathname = "/onboarding/step-0-role";
        } else {
            // Check role for proper routing
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === "supplier") {
                url.pathname = "/supplier/dashboard";
            } else if (profile?.role === "admin") {
                url.pathname = "/admin/dashboard";
            } else {
                url.pathname = "/home";
            }
        }
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        // Match all routes except static files and Next.js internals
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
