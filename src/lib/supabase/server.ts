import { createClient } from "@supabase/supabase-js";

/**
 * サーバー側(Server Component / ISR ビルド)用の Supabase クライアント。
 * 認証は使わないため anon キーで読み取り専用に使用する(RLS で published のみ取得可)。
 * service_role はここでは使わない(露出防止)。
 */
export function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
