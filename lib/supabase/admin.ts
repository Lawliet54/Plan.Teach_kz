import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for trusted mutations.
 * Never import this module from a Client Component and never expose the key
 * through a NEXT_PUBLIC_* environment variable.
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL табылмады.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY табылмады. Сервердің .env.local файлын тексеріңіз.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
