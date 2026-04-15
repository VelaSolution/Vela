"use client";

import { useState } from "react";
import Link from "next/link";

function MiniSim() {
  const [seats, setSeats] = useState(28);
  const [spend, setSpend] = useState(20000);
  const [turn, setTurn] = useState(1.4);
  const [cogsRate, setCogsRate] = useState(33);

  const sales = Math.round(seats * spend * turn * 26);
  const cost = Math.round(sales * cogsRate / 100 + 600 * 10000 + 250 * 10000 + 500000);
  const profit = sales - cost;
  const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : "0";
  const fmt = (n: number) => Math.abs(n).toLocaleString("ko-KR");

  const sliders = [
    { label: "좌석 수", value: seats, display: `${seats}석`, min: 5, max: 80, step: 1, set: setSeats },
    { label: "객단가", value: spend, display: `${spend.toLocaleString()}원`, min: 3000, max: 100000, step: 1000, set: setSpend },
    { label: "회전율", value: turn, display: `${turn.toFixed(1)}회`, min: 0.5, max: 6, step: 0.1, set: setTurn },
    { label: "원가율", value: cogsRate, display: `${cogsRate}%`, min: 15, max: 55, step: 1, set: setCogsRate },
  ];

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-900">수익 미리보기</span>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">슬라이더를 움직여보세요</span>
      </div>
      <div className="space-y-3 mb-4">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">{s.label}</span>
              <span className="text-xs font-bold text-slate-900">{s.display}</span>
            </div>
            <input
              type="range" min={s.min} max={s.max} step={s.step} value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full accent-blue-500 h-1.5"
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-slate-50 p-4 mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-semibold">예상 월 매출</span>
          <span className="text-base font-extrabold text-slate-900">{fmt(sales)}원</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-semibold">예상 순이익</span>
          <span className={`text-lg font-extrabold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {profit >= 0 ? "+" : "-"}{fmt(profit)}원
          </span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${profit >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(Math.max(Number(margin), 0), 100)}%` }}
          />
        </div>
        <p className={`text-right text-xs font-semibold mt-1 ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          순이익률 {margin}%
        </p>
      </div>
      <Link href="/simulator" className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition">
        상세 분석하기 →
      </Link>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg" /><div className="hero-bg2" />
      <div className="hero-inner">
        <div>
          <div className="fade-init d1">
            <div className="hero-tag"><span className="hero-tag-dot" />외식업 경영 분석 플랫폼</div>
            <h1 className="hero-title">외식업 사장님을 위한<br /><span>숫자 경영</span> 파트너</h1>
            <p className="hero-desc">매출·원가·인건비·대출을 한 번에 시뮬레이션하고<br />AI 컨설턴트의 맞춤 전략을 받아보세요.</p>
            <div className="hero-actions">
              <Link href="/signup" className="btn-primary">무료로 시작하기 →</Link>
              <a href="#features" className="btn-secondary">서비스 알아보기</a>
            </div>
            <div className="hero-stats">
              <div><div className="stat-num">4<span>개</span></div><div className="stat-label">업종 지원</div></div>
              <div><div className="stat-num">20<span>+</span></div><div className="stat-label">재무 지표</div></div>
              <div><div className="stat-num">AI</div><div className="stat-label">실시간 전략</div></div>
            </div>
          </div>
        </div>
        <div className="fade-init d2">
          <MiniSim />
        </div>
      </div>
    </section>
  );
}
