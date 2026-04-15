import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-error";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase-server";

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("인증 필요", 401);

    // 구독이 있는지 확인
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, status, current_period_end")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .single();

    if (sub) {
      // 구독이 있으면: 만료일까지 유지하고 자동갱신만 중단
      await supabaseAdmin.from("subscriptions").update({
        cancel_at_period_end: true,
        status: "cancelled",
        updated_at: new Date().toISOString(),
      }).eq("id", sub.id);

      await supabaseAdmin.from("subscription_events").insert({
        subscription_id: sub.id,
        user_id: user.id,
        event_type: "cancelled",
      });
    } else {
      // 구독 없으면 (레거시): 즉시 free 전환
      await supabaseAdmin.from("profiles").update({
        plan: "free",
        plan_updated_at: new Date().toISOString(),
        plan_expires_at: null,
      }).eq("id", user.id);
    }

    // 관리자 알림
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const expiresAt = sub?.current_period_end
        ? new Date(sub.current_period_end).toLocaleDateString("ko-KR")
        : "즉시";
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "VELA <noreply@velaanalytics.com>",
          to: [process.env.ADMIN_EMAIL || "mnhyuk@velaanalytics.com"],
          subject: `[VELA] 구독 해지 — ${user.email}`,
          html: `<p>${user.email}님이 구독을 해지했습니다.</p><p>만료 예정: ${expiresAt}</p><p>시간: ${new Date().toLocaleString("ko-KR")}</p>`,
        }),
      }).catch(() => {});
    }

    return apiSuccess({
      ok: true,
      expiresAt: sub?.current_period_end || null,
      message: sub ? "다음 결제일까지 프로 기능을 계속 이용하실 수 있습니다." : "구독이 해지되었습니다.",
    });
  } catch {
    return apiError("서버 오류", 500);
  }
}
