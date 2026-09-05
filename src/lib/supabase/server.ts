import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * Supabase client for use on the server (Server Components, Route Handlers,
 * Server Actions). Wires the auth session to Next.js's cookie store so the
 * user's session is read/refreshed consistently between server and client.
 *
 * Must be created per-request (it reads `cookies()`, which is request-scoped)
 * — never module-level singleton this.
 *
 * Parameterized with the generated Database type so every .from(...) call is
 * typed against the real schema (see src/lib/database.types.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
            // `set` called from a Server Component — safe to ignore because
            // the middleware (see middleware.ts) already refreshes the
            // session cookie on every request. Only Route Handlers / Server
            // Actions need to actually persist the cookie here.
          }
        },
      },
    }
  );
}
