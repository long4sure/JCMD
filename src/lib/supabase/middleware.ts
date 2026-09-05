import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request that passes through
 * the root middleware, so auth cookies stay valid and Server Components
 * always see an up-to-date session. This does not do any authorization
 * itself — it only keeps the session cookie fresh. Access control is
 * enforced by RLS policies in the database (see
 * supabase/migrations/0001_init_schema.sql), and any route-level redirects
 * for signed-out users should be layered on top of this.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // IMPORTANT: do not remove this call. It refreshes the auth token by
  // hitting Supabase, and the setAll above persists the refreshed cookies
  // onto the response. Skipping it causes sessions to silently expire.
  await supabase.auth.getUser();

  return supabaseResponse;
}
