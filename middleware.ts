import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request that passes through
 * this middleware, so auth cookies stay valid and Server Components always
 * see an up-to-date session. This does not do any authorization itself — it
 * only keeps the session cookie fresh. Access control is enforced by RLS
 * policies in the database (see supabase/migrations/0001_init_schema.sql),
 * and any route-level redirects for signed-out users are layered on top of
 * this.
 *
 * Inlined here (rather than imported from src/lib/supabase/middleware.ts)
 * because the root middleware.ts is bundled standalone for Vercel's runtime,
 * and "@/" path-alias imports were not being resolved in that bundle
 * (ERR_MODULE_NOT_FOUND at runtime). Importing only real npm packages
 * (@supabase/ssr, next/server) avoids that entirely. The generic
 * `createServerClient<Database>` type param is intentionally dropped here for
 * the same reason — it isn't load-bearing (this function never reads/writes
 * table rows, just refreshes the auth cookie), so it's not worth the alias
 * risk. src/lib/supabase/middleware.ts is kept as-is for any other code that
 * wants the typed version.
 */
export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
