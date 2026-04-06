"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export type Plan = "free" | "standard" | "pro";

export function usePlan(): { plan: Plan; userId: string | null; loading: boolean } {
  const [plan, setPlan] = useState<Plan>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // 1순위: payments 테이블 (결제 완료된 플랜)
      // 2순위: profiles 테이블 (이벤트/관리자 부여 플랜)
      Promise.all([
        sb.from("payments").select("plan").eq("user_id", user.id).eq("status", "done")
          .order("created_at", { ascending: false }).limit(1),
        sb.from("profiles").select("plan").eq("id", user.id).single(),
      ]).then(([paymentsRes, profileRes]) => {
        const paymentPlan = paymentsRes.data?.[0]?.plan;
        const profilePlan = profileRes.data?.plan;

        // 결제 플랜 > 프로필 플랜 > free
        const resolved = paymentPlan ?? profilePlan ?? "free";
        setPlan(resolved as Plan);
        setLoading(false);
      });
    });
  }, []);

  return { plan, userId, loading };
}
