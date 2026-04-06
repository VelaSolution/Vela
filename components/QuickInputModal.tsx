"use client";

// components/QuickInputModal.tsx
// 로그인 직후 표시되는 빠른 매출 입력 모달

import { useState, useEffect } from "react";
import { saveQuickData, loadQuickData, applyQuickToSimulator, type QuickData } from "@/lib/quickStore";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { fmt } from "@/lib/vela";

const INDUSTRY_OPTIONS = [
  { id: "cafe", label: "☕ 카페" },
  { id: "restaurant", label: "🍽️ 음식점" },
  { id: "bar", label: "🍺 술집/바" },
  { id: "finedining", label: "✨ 파인다이닝" },
  { id: "gogi", label: "🥩 고깃집" },
];

function num(v: string) { const n = Number(v.replace(/,/g, "")); return isNaN(n) ? 0 : n; }

const SHOW_KEY = "vela-quick-modal-shown";
const currentMonth = new Date().toISOString().slice(0, 7);

export default function QuickInputModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: 업종/기본, 2: 비용
  const [industry, setIndustry] = useState("restaurant");
  const [monthlySales, setMonthlySales] = useState("");
  const [seats, setSeats] = useState("");
  const [avgSpend, setAvgSpend] = useState("");
  const [rent, setRent] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [cogsRate, setCogsRate] = useState("30");
  const [etc, setEtc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 로그인 여부 먼저 확인
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string; email?: string } | null } }) => {
      if (!user) return; // 비로그인 시 모달 표시 안 함

      // 이번 달 이미 입력했으면 표시 안 함
      const shown = sessionStorage.getItem(SHOW_KEY);
      if (shown === currentMonth) return;

      // 기존 데이터 있으면 채움
      const existing = loadQuickData();
      if (existing) {
        setIndustry(existing.industry);
        setMonthlySales(String(existing.monthlySales));
        setSeats(String(existing.seats));
        setAvgSpend(String(existing.avgSpend));
        setRent(String(existing.rent));
        setLaborCost(String(existing.laborCost));
        setCogsRate(String(existing.cogsRate));
        setEtc(String(existing.etc));
      }

      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    });
  }, []);

  async function handleSave() {
    setSaving(true);

    const data: QuickData = {
      industry,
      monthlySales: num(monthlySales),
      seats: num(seats),
      avgSpend: num(avgSpend),
      rent: num(rent),
      laborCost: num(laborCost),
      cogsRate: num(cogsRate),
      etc: num(etc),
      updatedAt: new Date().toISOString(),
      month: currentMonth,
    };

    // localStorage 저장 + 시뮬레이터 자동 채움
    saveQuickData(data);
    applyQuickToSimulator(data);

    // Supabase 월별 스냅샷 저장
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("monthly_snapshots").upsert({
          user_id: user.id,
          month: currentMonth,
          industry: data.industry,
          monthly_sales: data.monthlySales,
          seats: data.seats,
          avg_spend: data.avgSpend,
          rent: data.rent,
          labor_cost: data.laborCost,
          cogs_rate: data.cogsRate,
          etc: data.etc,
          updated_at: data.updatedAt,
        }, { onConflict: "user_id,month" });
      }
    } catch (e) {
      console.error("스냅샷 저장 실패:", e);
    }

    sessionStorage.setItem(SHOW_KEY, currentMonth);
    setSaving(false);
    setVisible(false);
  }

  function handleSkip() {
    sessionStorage.setItem(SHOW_KEY, currentMonth);
    setVisible(false);
  }

  if (!visible) return null;

  const profit = num(monthlySales)
    - num(rent)
    - num(laborCost)
    - num(monthlySales) * (num(cogsRate) / 100)
    - num(etc);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden">

        {/* 헤더 */}
        <div className="bg-slate-900 px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">{currentMonth.replace("-", "년 ")}월 데이터</p>
            <div className="flex gap-1">
              {[1, 2].map(s => (
                <div key={s} className={`w-2 h-2 rounded-full ${step >= s ? "bg-white" : "bg-slate-600"}`} />
              ))}
            </div>
          </div>
          <h2 className="text-white font-extrabold text-xl">
            {step === 1 ? "이번 달 매장 현황" : "비용 정보 입력"}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {step === 1 ? "입력하면 시뮬레이터와 모든 도구에 자동 반영돼요" : "대략적인 수치도 괜찮아요"}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === 1 ? (
            <>
              {/* 업종 */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">업종</label>
                <div className="grid grid-cols-3 gap-2">
                  {INDUSTRY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setIndustry(opt.id)}
                      className={`rounded-xl py-2 text-xs font-semibold transition ${
                        industry === opt.id
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 월 매출 */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">이번 달 매출</label>
                <div className="relative">
                  <input
                    type="text" inputMode="numeric"
                    value={monthlySales ? Number(monthlySales.replace(/,/g, "")).toLocaleString("ko-KR") : ""}
                    onChange={e => setMonthlySales(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="예) 15,000,000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-right pr-8 outline-none focus:border-slate-400 focus:bg-white transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
                </div>
              </div>

              {/* 좌석·객단가 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">좌석 수</label>
                  <div className="relative">
                    <input
                      type="text" inputMode="numeric"
                      value={seats}
                      onChange={e => setSeats(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="20"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-right pr-8 outline-none focus:border-slate-400 focus:bg-white transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">석</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">객단가</label>
                  <div className="relative">
                    <input
                      type="text" inputMode="numeric"
                      value={avgSpend ? Number(avgSpend.replace(/,/g, "")).toLocaleString("ko-KR") : ""}
                      onChange={e => setAvgSpend(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="15,000"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-right pr-8 outline-none focus:border-slate-400 focus:bg-white transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 비용 입력 */}
              {[
                { label: "임대료", value: rent, setter: setRent, placeholder: "1,500,000" },
                { label: "인건비 (4대보험 포함)", value: laborCost, setter: setLaborCost, placeholder: "3,000,000" },
                { label: "기타 비용 (공과금·마케팅 등)", value: etc, setter: setEtc, placeholder: "500,000" },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</label>
                  <div className="relative">
                    <input
                      type="text" inputMode="numeric"
                      value={value ? Number(value.replace(/,/g, "")).toLocaleString("ko-KR") : ""}
                      onChange={e => setter(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-right pr-8 outline-none focus:border-slate-400 focus:bg-white transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
                  </div>
                </div>
              ))}

              {/* 원가율 슬라이더 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">식재료 원가율</label>
                  <span className="text-sm font-bold text-slate-900">{cogsRate}%</span>
                </div>
                <input
                  type="range" min="10" max="70" step="1"
                  value={cogsRate}
                  onChange={e => setCogsRate(e.target.value)}
                  className="w-full accent-slate-900"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10%</span><span>70%</span>
                </div>
              </div>

              {/* 예상 순이익 미리보기 */}
              {num(monthlySales) > 0 && (
                <div className={`rounded-2xl p-4 ${profit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                  <p className="text-xs text-slate-500 mb-1">예상 월 순이익 (간략 계산)</p>
                  <p className={`text-xl font-extrabold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {fmt(Math.round(profit))}원
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    순이익률 {num(monthlySales) > 0 ? ((profit / num(monthlySales)) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 버튼 */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-shrink-0 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
          >
            나중에
          </button>
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!monthlySales}
              className="flex-1 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition disabled:opacity-40"
            >
              다음 →
            </button>
          ) : (
            <div className="flex flex-1 gap-2">
              <button
                onClick={() => setStep(1)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
              >
                ←
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition disabled:opacity-40"
              >
                {saving ? "저장 중..." : "✅ 저장하고 시작"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
