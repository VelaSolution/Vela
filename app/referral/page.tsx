"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function ReferralPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    (async () => {
      const sb = createSupabaseBrowserClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setReferralCode(user.id.slice(0, 8).toUpperCase());

      // 추천 횟수 조회
      const { count } = await sb.from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user.id);
      setReferralCount(count ?? 0);
    })();
  }, []);

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  };

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
        <div className="mx-auto max-w-md text-center py-20">
          <p className="text-3xl mb-4">🔒</p>
          <p className="text-lg font-bold text-slate-900 mb-2">로그인이 필요합니다</p>
          <a href="/login" className="text-blue-600 text-sm font-semibold">로그인하기 →</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8 mt-4">
          <p className="text-5xl mb-4">🎁</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">사장님 추천 프로그램</h1>
          <p className="text-slate-500 text-sm">친구를 초대하면 양쪽 모두 스탠다드 플랜 1개월 무료!</p>
        </div>

        {/* 보상 설명 */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs text-blue-500 font-semibold mb-1">나에게</p>
              <p className="text-lg font-extrabold text-blue-600">1개월 무료</p>
              <p className="text-xs text-blue-400 mt-1">스탠다드 플랜</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-500 font-semibold mb-1">친구에게</p>
              <p className="text-lg font-extrabold text-emerald-600">1개월 무료</p>
              <p className="text-xs text-emerald-400 mt-1">스탠다드 플랜</p>
            </div>
          </div>
        </div>

        {/* 추천 코드 */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 mb-4">
          <p className="text-sm font-bold text-slate-900 mb-3">내 추천 코드</p>
          <div className="rounded-xl bg-slate-50 p-4 text-center mb-4">
            <p className="text-2xl font-mono font-extrabold text-slate-900 tracking-widest">{referralCode}</p>
          </div>

          <p className="text-sm font-bold text-slate-900 mb-3">추천 링크</p>
          <div className="flex gap-2">
            <input value={referralLink} readOnly className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 truncate" />
            <button onClick={handleCopy} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shrink-0">
              {copied ? "복사됨!" : "복사"}
            </button>
          </div>
        </div>

        {/* 추천 현황 */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 mb-4">
          <p className="text-sm font-bold text-slate-900 mb-3">추천 현황</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">가입한 친구</span>
            <span className="text-lg font-bold text-slate-900">{referralCount}명</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-slate-500">무료 혜택 적립</span>
            <span className="text-lg font-bold text-blue-600">{referralCount}개월</span>
          </div>
        </div>

        {/* 공유 버튼 */}
        <div className="space-y-3">
          <button onClick={handleCopy} className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-700 transition">
            링크 복사해서 공유하기
          </button>
          <button onClick={() => {
            const text = encodeURIComponent(`외식업 경영 분석 플랫폼 VELA 추천합니다! 지금 가입하면 1개월 무료! ${referralLink}`);
            window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(referralLink)}&text=${text}`, "_blank");
          }} className="w-full rounded-2xl bg-yellow-400 py-4 text-sm font-bold text-slate-900 hover:bg-yellow-300 transition">
            카카오톡으로 공유
          </button>
        </div>
      </div>
    </main>
  );
}
