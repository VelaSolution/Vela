"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";

function fmt(v: number) { return v.toLocaleString("ko-KR"); }
function fmtM(v: number) {
  if (Math.abs(v) >= 100_000_000) return (v / 100_000_000).toFixed(1) + "억";
  if (Math.abs(v) >= 10_000) return (v / 10_000).toFixed(0) + "만";
  return String(v);
}

type Snapshot = {
  month: string;
  industry: string;
  monthly_sales: number;
  rent: number;
  labor_cost: number;
  food_cost: number;
  cogs_rate: number;
  utilities: number;
  marketing: number;
  etc: number;
  profit: number;
  profit_margin: number;
  labor_ratio: number;
  memo?: string;
};

const INDUSTRY_LABEL: Record<string, string> = {
  cafe: "카페", restaurant: "음식점", bar: "술집/바", finedining: "파인다이닝", gogi: "고깃집",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 p-3 text-xs">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">
            {p.name.includes("율") ? `${Number(p.value).toFixed(1)}%` : `${fmt(p.value)}원`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sales" | "profit" | "ratio" | "bep">("sales");

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=/dashboard"); return; }

      const { data } = await supabase
        .from("monthly_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: true })
        .limit(24);

      setSnapshots(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </main>
  );

  if (snapshots.length === 0) return (
    <>
      <NavBar />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">아직 입력된 데이터가 없어요</h2>
          <p className="text-slate-500 text-sm mb-6">이번 달 매장 현황을 먼저 입력해주세요.</p>
          <Link href="/monthly-input"
            className="inline-block rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white hover:bg-slate-700 transition">
            📝 이번 달 입력하기
          </Link>
        </div>
      </main>
    </>
  );

  const chartData = snapshots.map((s, i) => {
    const prev = snapshots[i - 1];
    const momSales = prev ? ((s.monthly_sales - prev.monthly_sales) / prev.monthly_sales * 100) : 0;
    const totalCost = s.rent + s.labor_cost + s.food_cost + s.utilities + s.marketing + s.etc;
    const bep = totalCost > 0 ? totalCost / (1 - (s.cogs_rate / 100)) : 0;
    return {
      month: s.month.slice(5) + "월",
      매출: s.monthly_sales,
      순이익: s.profit ?? (s.monthly_sales - totalCost),
      전월대비: Math.round(momSales * 10) / 10,
      순이익률: s.profit_margin ?? 0,
      인건비율: s.labor_ratio ?? 0,
      원가율: s.cogs_rate ?? 0,
      BEP: Math.round(bep),
      BEP달성: s.monthly_sales >= bep,
    };
  });

  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots[snapshots.length - 2];
  const latestProfit = latest.profit ?? 0;
  const latestTotalCost = latest.rent + latest.labor_cost + latest.food_cost + latest.utilities + latest.marketing + latest.etc;
  const latestBep = latestTotalCost > 0 ? latestTotalCost / (1 - (latest.cogs_rate / 100)) : 0;
  const bepAchieved = latest.monthly_sales >= latestBep;
  const momChange = prev ? ((latest.monthly_sales - prev.monthly_sales) / prev.monthly_sales * 100) : 0;

  const TABS = [
    { id: "sales" as const, label: "매출 추이" },
    { id: "profit" as const, label: "순이익 변화" },
    { id: "ratio" as const, label: "비율 추이" },
    { id: "bep" as const, label: "BEP 달성" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');
        body{font-family:'Pretendard',-apple-system,sans-serif}
      `}</style>
      <NavBar />
      <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mt-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">월별 매출 현황</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {INDUSTRY_LABEL[latest.industry] ?? latest.industry} · 최근 {snapshots.length}개월
              </p>
            </div>
            <Link href="/monthly-input"
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition">
              + 이번 달 입력
            </Link>
          </div>

          {/* KPI 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">이번 달 매출</p>
              <p className="text-xl font-extrabold text-slate-900">{fmtM(latest.monthly_sales)}원</p>
              <p className={`text-xs mt-1 font-semibold ${momChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {momChange >= 0 ? "▲" : "▼"} {Math.abs(momChange).toFixed(1)}% 전월비
              </p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">이번 달 순이익</p>
              <p className={`text-xl font-extrabold ${latestProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {fmtM(latestProfit)}원
              </p>
              <p className="text-xs text-slate-400 mt-1">{latest.profit_margin?.toFixed(1)}% 이익률</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">인건비 비율</p>
              <p className="text-xl font-extrabold text-slate-900">{latest.labor_ratio?.toFixed(1)}%</p>
              <p className="text-xs text-slate-400 mt-1">권장 25~35%</p>
            </div>
            <div className={`rounded-2xl shadow-sm ring-1 p-4 ${bepAchieved ? "bg-emerald-50 ring-emerald-200" : "bg-red-50 ring-red-200"}`}>
              <p className={`text-xs mb-1 ${bepAchieved ? "text-emerald-500" : "text-red-400"}`}>BEP 달성</p>
              <p className={`text-xl font-extrabold ${bepAchieved ? "text-emerald-600" : "text-red-500"}`}>
                {bepAchieved ? "✅ 달성" : "❌ 미달"}
              </p>
              <p className="text-xs text-slate-400 mt-1">기준 {fmtM(Math.round(latestBep))}원</p>
            </div>
          </div>

          {/* 차트 */}
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden mb-6">
            <div className="flex border-b border-slate-100">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-xs font-semibold transition ${activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "sales" && (
                <>
                  <p className="text-xs font-semibold text-slate-400 mb-4">월별 매출 추이</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="매출" fill="#0f172a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {chartData.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 mb-3">전월 대비 변화율</p>
                      <div className="flex gap-2 flex-wrap">
                        {chartData.slice(1).map(d => (
                          <span key={d.month} className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${d.전월대비 >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {d.month} {d.전월대비 >= 0 ? "▲" : "▼"}{Math.abs(d.전월대비).toFixed(1)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "profit" && (
                <>
                  <p className="text-xs font-semibold text-slate-400 mb-4">월별 순이익 변화</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="순이익" stroke="#059669" strokeWidth={2.5} dot={{ r: 5, fill: "#059669" }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {chartData.map(d => (
                      <div key={d.month} className={`rounded-xl p-3 text-xs ${d.순이익 >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                        <p className="text-slate-500">{d.month}</p>
                        <p className={`font-bold mt-0.5 ${d.순이익 >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtM(d.순이익)}원</p>
                        <p className="text-slate-400">{d.순이익률.toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "ratio" && (
                <>
                  <p className="text-xs font-semibold text-slate-400 mb-4">원가율·인건비율 추이</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 70]} tickFormatter={v => v + "%"} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" />
                      <ReferenceLine y={30} stroke="#3182F6" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="원가율" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
                      <Line type="monotone" dataKey="인건비율" stroke="#3182F6" strokeWidth={2.5} dot={{ r: 4, fill: "#3182F6" }} />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-400 mt-3 text-center">점선: 권장 기준 (원가 35%, 인건비 30%)</p>
                </>
              )}

              {activeTab === "bep" && (
                <>
                  <p className="text-xs font-semibold text-slate-400 mb-4">매출 vs BEP(손익분기점)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="매출" fill="#0f172a" radius={[6, 6, 0, 0]} />
                      <Line type="monotone" dataKey="BEP" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {chartData.map(d => (
                      <span key={d.month} className={`rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1 ${d.BEP달성 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {d.BEP달성 ? "✅" : "❌"} {d.month}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 월별 테이블 */}
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">월별 상세 데이터</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">월</th>
                    <th className="px-4 py-3 text-right">매출</th>
                    <th className="px-4 py-3 text-right">순이익</th>
                    <th className="px-4 py-3 text-right">이익률</th>
                    <th className="px-4 py-3 text-right">인건비율</th>
                    <th className="px-4 py-3 text-center">BEP</th>
                    <th className="px-4 py-3 text-center">수정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...snapshots].reverse().map(s => {
                    const totalCost = s.rent + s.labor_cost + s.food_cost + s.utilities + s.marketing + s.etc;
                    const bep = totalCost > 0 ? totalCost / (1 - s.cogs_rate / 100) : 0;
                    const profit = s.profit ?? (s.monthly_sales - totalCost);
                    return (
                      <tr key={s.month} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-700">{s.month}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmtM(s.monthly_sales)}원</td>
                        <td className={`px-4 py-3 text-right font-semibold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtM(profit)}원</td>
                        <td className="px-4 py-3 text-right text-slate-600">{s.profit_margin?.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right text-slate-600">{s.labor_ratio?.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.monthly_sales >= bep ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                            {s.monthly_sales >= bep ? "달성" : "미달"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link href={`/monthly-input?month=${s.month}`} className="text-xs text-blue-500 hover:text-blue-700 font-semibold">수정</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
