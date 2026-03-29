"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { useSimulatorData } from "@/lib/useSimulatorData";

const TOOLS = [
  {
    href: "/tools/menu-cost",
    emoji: "🧮",
    title: "메뉴별 원가 계산기",
    desc: "식재료 원가 입력 → 원가율·건당 순익 자동 계산",
    color: "#059669",
    bg: "#ECFDF5",
    badge: null,
  },
  {
    href: "/tools/labor",
    emoji: "👥",
    title: "인건비 스케줄러",
    desc: "직원별 시급·근무시간 설정 → 주간·월간 인건비 예측",
    color: "#3182F6",
    bg: "#EBF3FF",
    badge: null,
  },
  {
    href: "/tools/tax",
    emoji: "🧾",
    title: "세금 계산기",
    desc: "매출 기반 부가세·종합소득세 예상액 자동 산출",
    color: "#D97706",
    bg: "#FFFBEB",
    badge: null,
  },
  {
    href: "/tools/pl-report",
    emoji: "📄",
    title: "손익계산서 PDF",
    desc: "시뮬레이션 데이터로 월별 P&L 리포트 PDF 출력",
    color: "#7C3AED",
    bg: "#F5F3FF",
    badge: null,
  },
  {
    href: "/tools/startup-checklist",
    emoji: "✅",
    title: "창업 체크리스트",
    desc: "업종별 인허가·준비물·타임라인 단계별 가이드",
    color: "#0891B2",
    bg: "#ECFEFF",
    badge: null,
  },
  {
    href: "/tools/sns-content",
    emoji: "📱",
    title: "SNS 콘텐츠 생성기",
    desc: "메뉴·이벤트 정보 입력 → 인스타 캡션 AI 자동 생성",
    color: "#DB2777",
    bg: "#FDF2F8",
    badge: "AI",
  },
  {
    href: "/tools/review-reply",
    emoji: "💬",
    title: "리뷰 답변 생성기",
    desc: "고객 리뷰 붙여넣기 → AI가 맞춤 답변 초안 작성",
    color: "#EA580C",
    bg: "#FFF7ED",
    badge: "AI",
  },
  {
    href: "/tools/area-analysis",
    emoji: "🗺️",
    title: "상권 분석 도우미",
    desc: "입지 조건 입력 → AI 상권 적합도 평가 리포트",
    color: "#65A30D",
    bg: "#F7FEE7",
    badge: "AI",
  },
];

export default function ToolsPage() {
  const simData = useSimulatorData();
  const fmt = (n: number) => n.toLocaleString("ko-KR");

  const industryLabel: Record<string, string> = {
    cafe: "카페", restaurant: "음식점", bar: "술집/바", finedining: "파인다이닝", gogi: "고깃집",
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');
        body{font-family:'Pretendard',-apple-system,sans-serif}
      `}</style>
      <NavBar />
      <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mt-6 mb-10">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              🛠️ VELA 도구 모음
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              사업에 필요한 모든 도구
            </h1>
            <p className="text-slate-500 text-sm">
              외식업 창업과 운영에 필요한 계산기·AI 도구를 모두 모았습니다.
            </p>
          </div>

          {/* 시뮬레이터 연계 배너 */}
          {simData ? (
            <div className="rounded-2xl bg-slate-900 px-5 py-4 mb-6 flex items-center gap-4 flex-wrap">
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">
                  🔗 시뮬레이터 마지막 데이터 연결됨 · {industryLabel[simData.industry] ?? simData.industry}
                </p>
                <div className="flex gap-4 flex-wrap">
                  <span className="text-white text-sm">
                    월매출 <b className="text-blue-300">{fmt(simData.totalSales)}원</b>
                  </span>
                  <span className="text-white text-sm">
                    순이익 <b className={simData.profit >= 0 ? "text-emerald-300" : "text-red-400"}>{fmt(simData.profit)}원</b>
                  </span>
                  <span className="text-white text-sm">
                    순이익률 <b className="text-slate-300">{simData.netMargin}%</b>
                  </span>
                </div>
              </div>
              <Link href="/simulator" className="flex-shrink-0 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 transition">
                시뮬레이터 →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-100 px-5 py-4 mb-6 flex items-center gap-3">
              <span className="text-slate-400 text-sm">💡 시뮬레이터를 먼저 실행하면 도구들과 데이터가 연결됩니다.</span>
              <Link href="/simulator" className="ml-auto flex-shrink-0 rounded-xl bg-slate-900 text-white text-xs font-semibold px-3 py-2">
                시뮬레이터 →
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6 flex gap-4 items-start hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: tool.bg }}
                >
                  {tool.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-base">{tool.title}</span>
                    {tool.badge && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: tool.bg, color: tool.color }}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
                </div>
                <svg
                  className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition flex-shrink-0 mt-1"
                  viewBox="0 0 16 16" fill="none"
                >
                  <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-slate-900 px-6 py-5 flex items-center gap-4">
            <span className="text-3xl">🚀</span>
            <div>
              <p className="text-white font-bold text-sm">수익 시뮬레이터도 함께 사용해보세요</p>
              <p className="text-slate-400 text-xs mt-0.5">매장 전체 수익 구조를 한눈에 시뮬레이션</p>
            </div>
            <Link
              href="/simulator"
              className="ml-auto flex-shrink-0 rounded-xl bg-white text-slate-900 text-sm font-bold px-4 py-2 hover:bg-slate-100 transition"
            >
              시작 →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
