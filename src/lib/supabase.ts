import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Browser client (lazy singleton) ─────────────────────────────────────────
// Used in "use client" components. Reads NEXT_PUBLIC_* env vars.
let _supabase: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (_supabase !== undefined) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  _supabase = url && anonKey ? createClient(url, anonKey) : null;
  return _supabase;
}

// For convenience — components can still `import { supabase }` but it will be
// lazily initialised on first access via a module-level getter.
// However, since module-level getters don't work in all bundlers, we export
// a simple constant that is initialised when the module is first loaded client-side.
// To avoid build-time crashes we guard with typeof window.
export const supabase: SupabaseClient | null =
  typeof window !== "undefined" ? getSupabase() : null;

// ── Server-side admin client (lazy singleton) ───────────────────────────────
// Used in API routes. Reads SUPABASE_SERVICE_ROLE_KEY (server-only).
let _supabaseAdmin: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_supabaseAdmin !== undefined) return _supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  _supabaseAdmin =
    url && serviceKey
      ? createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

  return _supabaseAdmin;
}
