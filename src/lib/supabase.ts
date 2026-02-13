/**
 * Supabase Client Configuration
 *
 * Two clients are provided:
 * - `createClient()` for browser/client components
 * - `createServerClient()` for server components and route handlers
 *
 * Both use @supabase/ssr for cookie-based session management,
 * which is required for Next.js App Router compatibility.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser/client components.
 * Uses environment variables set in .env.local.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
