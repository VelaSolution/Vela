import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-error";
import { verifyWebhookSignature } from "@/lib/toss-billing";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("toss-signature") || "";

  // 서명 검증 (TOSS_WEBHOOK_SECRET이 설정된 경우에만)
  if (process.env.TOSS_WEBHOOK_SECRET && !verifyWebhookSignature(body, signature)) {
    return apiError("Invalid signature", 401);
  }

  try {
    const event = JSON.parse(body);
    const eventType = event.eventType || event.type;

    if (eventType === "BILLING_KEY_DELETED") {
      // 빌링키 삭제됨 → 구독 만료 처리
      const billingKey = event.data?.billingKey;
      if (billingKey) {
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("id, user_id")
          .eq("billing_key", billingKey)
          .single();

        if (sub) {
          await supabaseAdmin.from("subscriptions").update({
            status: "expired",
            updated_at: new Date().toISOString(),
          }).eq("id", sub.id);

          await supabaseAdmin.from("profiles").update({
            plan: "free",
            plan_expires_at: null,
          }).eq("id", sub.user_id);

          await supabaseAdmin.from("subscription_events").insert({
            subscription_id: sub.id,
            user_id: sub.user_id,
            event_type: "expired",
            metadata: { reason: "billing_key_deleted" },
          });
        }
      }
    }

    return apiSuccess({ received: true });
  } catch (e) {
    console.error("Webhook parse error:", e);
    return apiError("Invalid payload", 400);
  }
}
