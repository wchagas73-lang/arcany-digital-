import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Returns a browser-storage key namespaced to the authenticated Supabase user.
 * Legacy unscoped keys are intentionally not imported automatically: doing so
 * could expose one account's local data to another account on a shared device.
 */
export async function getAccountScopedStorageKey(baseKey: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return `${baseKey}:${data.user.id}`;
}
