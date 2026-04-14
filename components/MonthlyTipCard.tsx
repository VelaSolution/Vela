"use client";

import { useMonthlyTip } from "@/lib/useMonthlyTip";

const MONTH_EMOJI: Record<number, string> = {
  1: "🎍", 2: "💝", 3: "🌸", 4: "🌷", 5: "🎏", 6: "🌧️",
  7: "☀️", 8: "🏖️", 9: "🍂", 10: "🎃", 11: "🍁", 12: "🎄",
};

export default function MonthlyTipCard() {
  const { tip, loading, error, generate, hasSimData, hasCachedTip, monthNum } = useMonthlyTip();

  if (!hasSimData) {
    return (
      <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{MONTH_EMOJI[monthNum] ?? "📅"}</span>
          <div>
            <p className="text-sm font-bold text-slate-900">{monthNum}월 맞춤 경영 팁</p>
            <p className="text-xs text-slate-400">시뮬레이터를 먼저 실행하면 AI가 맞춤 팁을 생성해요</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasCachedTip) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{MONTH_EMOJI[monthNum] ?? "📅"}</span>
          <div>
            <p className="text-sm font-bold text-slate-900">{monthNum}월 맞춤 경영 팁</p>
            <p className="text-xs text-slate-500">내 매장 데이터 + 시즌 정보 기반 AI 분석</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ 생성 중..." : "✨ AI 맞춤 팁 생성하기 (이번 달 1회)"}
        </button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{MONTH_EMOJI[monthNum] ?? "📅"}</span>
          <div>
            <p className="text-sm font-bold text-slate-900">{monthNum}월 맞춤 경영 팁</p>
            <p className="text-[11px] text-slate-400">
              {new Date(tip!.generatedAt).toLocaleDateString("ko-KR")} 생성 · 이번 달 유효
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">AI</span>
      </div>
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {tip!.tips}
      </div>
    </div>
  );
}
