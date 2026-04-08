import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const response = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user) {
      // 프로필 upsert: 플랜 부여 + 동의 기록 (회원가입 이메일 인증 후)
      const user = sessionData.user;
      const meta = user.user_metadata ?? {};
      const now = new Date().toISOString();
      await supabase.from("profiles").upsert({
        id: user.id,
        plan: "standard",
        plan_updated_at: now,
        terms_agreed_at: now,
        terms_version: "2026-01-01",
        privacy_agreed_at: now,
        privacy_version: "2026-01-01",
        marketing_agreed: meta.marketing_agreed ?? false,
        marketing_agreed_at: meta.marketing_agreed ? now : null,
      }, { onConflict: "id" });

      // 추천인 기록
      const refCode = searchParams.get("ref");
      if (refCode) {
        const { data: referrer } = await supabase.from("profiles")
          .select("id")
          .ilike("id", `${refCode.toLowerCase()}%`)
          .limit(1);
        if (referrer && referrer.length > 0) {
          try {
            await supabase.from("referrals").insert({
              referrer_id: referrer[0].id,
              referred_id: user.id,
            });
          } catch {
            // ignore duplicate referral
          }
        }
      }

      return response;
    }
  }

  // 코드가 없거나 세션 교환 실패 시 로그인으로
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}
