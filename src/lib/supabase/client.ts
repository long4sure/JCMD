import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in the browser (Client Components).
 *
 * Reads the public URL/anon key from env vars — never hardcode keys here.
 * The anon key is safe to expose to the browser; RLS policies (see
 * supabase/migrations/0001_init_schema.sql) are what actually restrict what
 * this client can read or write.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
