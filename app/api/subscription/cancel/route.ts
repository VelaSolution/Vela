import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase-server";

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    // 플랜을 free로 변경
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ plan: "free", plan_updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: "구독 해지 실패" }, { status: 500 });
    }

    // 해지 이메일 알림 (관리자에게)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "VELA <contact@velaanalytics.com>",
          to: [process.env.ADMIN_EMAIL || "mnhyuk@velaanalytics.com"],
          subject: `[VELA] 구독 해지 — ${user.email}`,
          html: `<p>${user.email}님이 구독을 해지했습니다.</p><p>시간: ${new Date().toLocaleString("ko-KR")}</p>`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
