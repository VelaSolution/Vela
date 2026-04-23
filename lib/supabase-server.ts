import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// 서버용 (Server Component / API Route에서만 사용)
export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { /* Server Component에서는 무시 */ }
      },
    },
  });
}

// 어드민용 (서버에서만) — 빌드 시 env 없으면 런타임에 에러
export const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : new Proxy({} as ReturnType<typeof createClient>, {
      get() { throw new Error("Supabase admin 환경변수가 설정되지 않았습니다."); },
    });
