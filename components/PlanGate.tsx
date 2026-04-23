"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

/** 무료 플랜 사용자에게 업그레이드 오버레이를 보여주는 게이트 */
export default function PlanGate({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (!data?.user) { setPlan("free"); return; }
      const user = data.user;

      Promise.all([
        sb.from("payments").select("plan").eq("user_id", user.id).eq("status", "done")
          .order("created_at", { ascending: false }).limit(1),
        sb.from("profiles").select("plan").eq("id", user.id).single(),
      ]).then(([paymentsRes, profileRes]) => {
        const paymentPlan = paymentsRes.data?.[0]?.plan;
        const profilePlan = profileRes.data?.plan;
        setPlan(paymentPlan ?? profilePlan ?? "free");
      }).catch(() => setPlan("free"));
    }).catch(() => setPlan("free"));
  }, []);

  if (plan === null) return null; // 로딩 중
  if (plan !== "free") return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[2px] opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-200 p-8 max-w-sm text-center mx-4">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">유료 플랜 전용 기능</h2>
          <p className="text-sm text-slate-500 mb-6">
            이 AI 도구는 스탠다드 플랜 이상에서 사용할 수 있어요.<br />
            업그레이드하고 모든 AI 기능을 무제한으로 이용하세요.
          </p>
          <Link
            href="/pricing"
            className="inline-block w-full rounded-2xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition"
          >
            요금제 보기 →
          </Link>
          <Link
            href="/tools"
            className="block mt-3 text-sm text-slate-400 hover:text-slate-600 transition"
          >
            도구 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
