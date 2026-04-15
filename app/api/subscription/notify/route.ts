import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-error";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getSubscriptionAmount } from "@/lib/toss-billing";
import { sendRenewalReminder } from "@/lib/subscription-email";

export const dynamic = "force-dynamic";

function verifyCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) return apiError("Unauthorized", 401);

  const admin = supabaseAdmin;
  const now = new Date();

  // 3일 후 만료되는 구독 찾기
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const rangeStart = new Date(threeDaysLater);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(threeDaysLater);
  rangeEnd.setHours(23, 59, 59, 999);

  const { data: upcoming } = await admin
    .from("subscriptions")
    .select("*, profiles!inner(email)")
    .eq("status", "active")
    .gte("current_period_end", rangeStart.toISOString())
    .lte("current_period_end", rangeEnd.toISOString());

  let notified = 0;

  for (const sub of upcoming ?? []) {
    const email = (sub as any).profiles?.email;
    if (!email) continue;

    const cycle = sub.billing_cycle as "monthly" | "annual";
    const amount = getSubscriptionAmount(cycle);
    const dateStr = new Date(sub.current_period_end).toLocaleDateString("ko-KR", {
      year: "numeric", month: "long", day: "numeric",
    });

    await sendRenewalReminder(email, amount, dateStr, sub.card_last4 || "****");
    notified++;
  }

  return apiSuccess({ notified, timestamp: now.toISOString() });
}
