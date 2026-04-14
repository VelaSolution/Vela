import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-error";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** orderId 형식: VELA-{planId}-{timestamp} */
function parsePlan(orderId: string): string {
  const parts = orderId.split("-");
  return parts.length >= 2 ? parts[1] : "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return apiError("필수 값 누락", 400);
    }

    /* ── 1. 토스 결제 승인 ── */
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const encoded = Buffer.from(`${secretKey}:`).toString("base64");

    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossRes.json();

    const alreadyProcessed = !tossRes.ok && tossData.code === "ALREADY_PROCESSED_PAYMENT";

    if (!tossRes.ok && !alreadyProcessed) {
      console.error("Toss error:", tossData);
      return apiError(tossData.message || "결제 승인 실패", tossRes.status);
    }

    /* ── 2. 인증된 사용자 확인 (쿠키 기반) ── */
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error after payment:", authError);
      return apiError("사용자 인증 실패. 결제는 완료되었으나 플랜 반영에 실패했습니다.", 401);
    }

    /* ── 3. 결제 금액 검증 ── */
    const plan = parsePlan(orderId);
    const isAnnual = orderId.includes("-annual-");
    const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
      standard: { monthly: 9900, annual: 7900 * 12 },
      pro: { monthly: 29900, annual: 23900 * 12 },
    };
    const planPrices = PLAN_PRICES[plan];
    const expectedPrice = planPrices ? (isAnnual ? planPrices.annual : planPrices.monthly) : undefined;
    if (expectedPrice && Number(amount) !== expectedPrice) {
      console.error("Payment amount mismatch:", { plan, isAnnual, expected: expectedPrice, actual: amount });
      return apiError("결제 금액이 올바르지 않습니다.", 400);
    }

    // 이미 저장된 결제인지 확인 (중복 방지)
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan", plan)
      .eq("status", "done")
      .limit(1);

    if (!existing || existing.length === 0) {
      const { error: insertError } = await supabase.from("payments").insert({
        user_id: user.id,
        plan,
        amount: Number(amount),
        status: "done",
        order_id: orderId,
        payment_key: paymentKey,
      });

      if (insertError) {
        console.error("Payment insert error:", JSON.stringify(insertError));
        return apiError("결제는 완료되었으나 내역 저장에 실패했습니다. 고객센터에 문의해주세요.", 500);
      }
    }

    /* ── 4. profiles 테이블의 plan 필드 업데이트 ── */
    await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", user.id)
      .then(({ error }) => {
        if (error) console.error("Profile plan update error:", JSON.stringify(error));
      });

    return apiSuccess({ success: true, payment: tossData });
  } catch (e) {
    console.error("Payment confirm error:", e);
    return apiError("서버 오류", 500);
  }
}
