import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Supabase client for use in the browser (Client Components).
 *
 * Reads the public URL/anon key from env vars — never hardcode keys here.
 * The anon key is safe to expose to the browser; RLS policies (see
 * supabase/migrations/0001_init_schema.sql) are what actually restrict what
 * this client can read or write.
 *
 * Parameterized with the generated Database type so every .from(...) call is
 * typed against the real schema (see src/lib/database.types.ts).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
