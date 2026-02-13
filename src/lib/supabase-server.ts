/**
 * Server-side Supabase Client
 *
 * Used in Server Components, Route Handlers, and Server Actions.
 * Reads/writes cookies for session management via Next.js cookies() API.
 */

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createSupabaseServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method is called from a Server Component where
                        // cookies can't be set. This is safe to ignore if middleware
                        // is refreshing user sessions.
                    }
                },
            },
        }
    );
}
