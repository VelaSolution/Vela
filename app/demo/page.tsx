"use client";

import { useState, useMemo } from "react";
import { INDUSTRY_CONFIG, INDUSTRY_BENCHMARK, sanitizeFullForm, calcResult, fmt, pct } from "@/lib/vela";

const INDUSTRIES = [
  { key: "cafe", icon: "☕", label: "카페" },
  { key: "restaurant", icon: "🍽️", label: "음식점" },
  { key: "bar", icon: "🍺", label: "술집/바" },
  { key: "gogi", icon: "🥩", label: "고깃집" },
];

const PRESETS: Record<string, Record<string, number>> = {
  cafe: { seats: 20, avgSpend: 7000, turnover: 1.5, cogsRate: 32, rent: 2000000, utilities: 500000 },
  restaurant: { seats: 40, avgSpend: 12000, turnover: 1.8, cogsRate: 35, rent: 3500000, utilities: 800000 },
  bar: { seats: 30, avgSpend: 25000, turnover: 0.8, cogsRate: 28, rent: 4000000, utilities: 600000 },
  gogi: { seats: 50, avgSpend: 30000, turnover: 1.2, cogsRate: 40, rent: 5000000, utilities: 1000000 },
};

export default function DemoPage() {
  const [ind, setInd] = useState("cafe");
  const preset = PRESETS[ind];
  const [seats, setSeats] = useState(preset.seats);
  const [spend, setSpend] = useState(preset.avgSpend);
  const [turn, setTurn] = useState(preset.turnover);
  const [cogs, setCogs] = useState(preset.cogsRate);

  const switchIndustry = (key: string) => {
    setInd(key);
    const p = PRESETS[key];
    setSeats(p.seats);
    setSpend(p.avgSpend);
    setTurn(p.turnover);
    setCogs(p.cogsRate);
  };

  const form = useMemo(() => sanitizeFullForm({
    industry: ind, seats, avgSpend: spend, turnover: turn, cogsRate: cogs,
    rent: PRESETS[ind].rent, utilities: PRESETS[ind].utilities,
    weekdayDays: 22, weekendDays: 8, weekendMultiplier: 1.3,
  }), [ind, seats, spend, turn, cogs]);

  const result = useMemo(() => calcResult(form), [form]);
  const bench = INDUSTRY_BENCHMARK[form.industry as keyof typeof INDUSTRY_BENCHMARK];
  const isProfit = result.profit >= 0;

  const metrics = [
    { label: "원가율", mine: result.cogsRatio, avg: bench.cogsRate, lower: true },
    { label: "인건비율", mine: result.laborRatio, avg: bench.laborRate, lower: true },
    { label: "임대료율", mine: result.rentRatio, avg: bench.rentRate, lower: true },
    { label: "순이익률", mine: result.netMargin, avg: bench.netMargin, lower: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-slate-900 text-white px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
          VELA 분석 엔진 데모
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">POS 데이터 → 경영 인사이트</h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          매출 숫자를 입력하면 실시간으로 손익 분석, 업종 벤치마크, AI 전략을 생성합니다.
          귀사 POS에 이 분석 엔진을 통합할 수 있습니다.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* 업종 선택 */}
        <div className="flex gap-2 justify-center">
          {INDUSTRIES.map(i => (
            <button key={i.key} onClick={() => switchIndustry(i.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${ind === i.key ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
              {i.icon} {i.label}
            </button>
          ))}
        </div>

        {/* 입력 슬라이더 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "좌석", value: seats, set: setSeats, min: 5, max: 100, step: 1, suffix: "석" },
            { label: "객단가", value: spend, set: setSpend, min: 3000, max: 100000, step: 1000, suffix: "원" },
            { label: "회전율", value: turn, set: (v: number) => setTurn(v), min: 0.3, max: 5, step: 0.1, suffix: "회" },
            { label: "원가율", value: cogs, set: setCogs, min: 15, max: 60, step: 1, suffix: "%" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 ring-1 ring-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{s.label}</span>
                <span className="font-bold text-slate-900">{typeof s.value === "number" && s.value % 1 !== 0 ? s.value.toFixed(1) : s.value.toLocaleString()}{s.suffix}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                onChange={e => s.set(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
          ))}
        </div>

        {/* 핵심 지표 */}
        <div className={`rounded-2xl p-6 text-center ${isProfit ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-red-50 ring-1 ring-red-200"}`}>
          <p className="text-sm text-slate-500 mb-1">세후 실수령</p>
          <p className={`text-4xl font-extrabold tracking-tight ${isProfit ? "text-emerald-700" : "text-red-600"}`}>
            {isProfit ? "+" : ""}{fmt(result.netProfit)}원
          </p>
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <span className="text-slate-500">월매출 <b className="text-slate-900">{fmt(result.totalSales)}원</b></span>
            <span className="text-slate-500">순이익률 <b className={isProfit ? "text-emerald-600" : "text-red-500"}>{pct(result.netMargin)}</b></span>
            <span className="text-slate-500">BEP <b className="text-slate-900">{fmt(result.bep)}원</b></span>
          </div>
        </div>

        {/* 비용 구조 */}
        <div className="bg-white rounded-2xl p-6 ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">비용 구조</h2>
          <div className="space-y-3">
            {[
              { label: "원가", value: result.cogs, ratio: result.cogsRatio, color: "#0f172a" },
              { label: "인건비", value: result.laborCost, ratio: result.laborRatio, color: "#334155" },
              { label: "임대료", value: form.rent, ratio: result.rentRatio, color: "#64748b" },
              { label: "공과금", value: form.utilities + form.telecom, ratio: (form.utilities + form.telecom) / result.totalSales * 100, color: "#94a3b8" },
            ].map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{c.label}</span>
                  <span className="font-semibold text-slate-900">{fmt(c.value)}원 <span className="text-slate-400">({c.ratio.toFixed(1)}%)</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(c.ratio * 2, 100)}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 업종 벤치마크 */}
        <div className="bg-white rounded-2xl p-6 ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">업종 평균 비교</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.map(m => {
              const diff = m.mine - m.avg;
              const good = m.lower ? diff <= 0 : diff >= 0;
              return (
                <div key={m.label} className="text-center">
                  <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{pct(m.mine)}</p>
                  <p className={`text-xs font-semibold mt-1 ${good ? "text-emerald-600" : "text-red-500"}`}>
                    업종 평균 {pct(m.avg)} ({diff > 0 ? "+" : ""}{pct(diff)})
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* API 연동 안내 */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">이 분석을 귀사 POS에 통합하세요</h2>
          <p className="text-slate-400 text-sm mb-4">API 한 줄이면 됩니다. 매출 데이터를 보내면 위 분석 결과를 JSON으로 반환합니다.</p>
          <pre className="bg-slate-800 rounded-xl p-4 text-left text-sm text-slate-300 overflow-x-auto mb-4">
{`POST /api/v1/analyze
{
  "industry": "${ind}",
  "seats": ${seats},
  "avgSpend": ${spend},
  "turnover": ${turn},
  "cogsRate": ${cogs}
}

→ { "summary": { "netProfit": ${result.netProfit}, "netMargin": ${result.netMargin.toFixed(1)} }, ... }`}
          </pre>
          <div className="flex gap-3 justify-center">
            <a href="/api/v1/docs" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-500 transition">API 문서 보기</a>
            <a href="mailto:mnhyuk@velaanalytics.com" className="bg-white text-slate-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition">파트너십 문의</a>
          </div>
        </div>
      </div>
    </div>
  );
}
