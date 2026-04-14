"use client";
import { useState, useEffect, useMemo } from "react";
import type { HQRole, Metric, Goal } from "@/app/hq/types";
import { sb, fmt, today, I, C, L, B, B2 } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const EMPTY = { date: today(), revenue: "", users_count: "", conversion_rate: "", profit: "" };

function PulseSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={C}>
            <div className="h-3 bg-slate-100 rounded w-20 mb-2" />
            <div className="h-7 bg-slate-200 rounded-lg w-32 mb-1" />
            <div className="h-3 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
      <div className={C}>
        <div className="h-4 bg-slate-200 rounded-lg w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="h-3 bg-slate-100 rounded w-20" />
              <div className="h-3 bg-slate-100 rounded w-16" />
              <div className="h-3 bg-slate-100 rounded w-12" />
              <div className="h-3 bg-slate-100 rounded w-14" />
              <div className="h-3 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KpiTab({ userId, flash }: Props) {
  const [records, setRecords] = useState<Metric[]>([]);
  const [allRecords, setAllRecords] = useState<Metric[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const [recentRes, allRes, goalRes] = await Promise.all([
      s.from("hq_metrics").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(15),
      s.from("hq_metrics").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(60),
      s.from("hq_goals").select("*").eq("status", "active").order("created_at", { ascending: false }),
    ]);
    setRecords((recentRes.data as Metric[]) ?? []);
    setAllRecords((allRes.data as Metric[]) ?? []);
    setGoals((goalRes.data as Goal[]) ?? []);
    setLoading(false);
  }

  async function save() {
    if (!form.date) { flash("날짜를 입력하세요"); return; }
    setSaving(true);
    const s = sb();
    if (!s) return;
    const payload = {
      user_id: userId,
      date: form.date,
      revenue: Number(form.revenue) || 0,
      users_count: Number(form.users_count) || 0,
      conversion_rate: Number(form.conversion_rate) || 0,
      profit: Number(form.profit) || 0,
    };
    const { error } = await s.from("hq_metrics").upsert(payload, { onConflict: "user_id,date" });
    if (error) flash("저장 실패: " + error.message);
    else { flash("저장 완료"); setForm({ ...EMPTY }); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_metrics").delete().eq("id", id);
    flash("삭제 완료");
    await load();
  }

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Analytics computations
  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;

    const thisMonthData = allRecords.filter(r => r.date.startsWith(thisMonthStr));
    const lastMonthData = allRecords.filter(r => r.date.startsWith(lastMonthStr));

    const thisRevenue = thisMonthData.reduce((s, r) => s + r.revenue, 0);
    const lastRevenue = lastMonthData.reduce((s, r) => s + r.revenue, 0);
    const thisProfit = thisMonthData.reduce((s, r) => s + r.profit, 0);
    const lastProfit = lastMonthData.reduce((s, r) => s + r.profit, 0);
    const avgConversion = thisMonthData.length > 0
      ? thisMonthData.reduce((s, r) => s + r.conversion_rate, 0) / thisMonthData.length
      : 0;
    const lastAvgConversion = lastMonthData.length > 0
      ? lastMonthData.reduce((s, r) => s + r.conversion_rate, 0) / lastMonthData.length
      : 0;

    const revenueDelta = lastRevenue > 0 ? ((thisRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    const profitDelta = lastProfit > 0 ? ((thisProfit - lastProfit) / lastProfit) * 100 : 0;
    const conversionDelta = lastAvgConversion > 0 ? ((avgConversion - lastAvgConversion) / lastAvgConversion) * 100 : 0;

    // Best/worst day by revenue
    const bestDay = thisMonthData.length > 0
      ? thisMonthData.reduce((best, r) => r.revenue > best.revenue ? r : best, thisMonthData[0])
      : null;
    const worstDay = thisMonthData.length > 0
      ? thisMonthData.reduce((worst, r) => r.revenue < worst.revenue ? r : worst, thisMonthData[0])
      : null;

    // Last 30 days for chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDayStr = thirtyDaysAgo.toISOString().slice(0, 10);
    const chartData = allRecords
      .filter(r => r.date >= thirtyDayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Revenue goal
    const revenueGoal = goals.find(g => g.metric_type === "revenue");

    return {
      thisRevenue, lastRevenue, thisProfit, lastProfit,
      avgConversion, revenueDelta, profitDelta, conversionDelta,
      bestDay, worstDay, chartData, revenueGoal,
      thisMonthCount: thisMonthData.length, lastMonthCount: lastMonthData.length,
    };
  }, [allRecords, goals]);

  const deltaArrow = (v: number) => v > 0 ? "+" : "";
  const deltaColor = (v: number) => v > 0 ? "text-emerald-600" : v < 0 ? "text-red-500" : "text-slate-400";

  // Mini line chart (div-based)
  const MiniChart = ({ data, field }: { data: Metric[]; field: "revenue" | "profit" }) => {
    if (data.length < 2) return <p className="text-xs text-slate-400 py-4 text-center">데이터가 부족합니다</p>;
    const values = data.map(d => d[field]);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const chartH = 120;

    const points = values.map((v, i) => ({
      x: (i / (values.length - 1)) * 100,
      y: ((v - min) / range) * chartH,
      val: v,
      date: data[i].date,
    }));

    return (
      <div className="relative w-full" style={{ height: chartH + 40 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 w-12">
          <span>₩{fmt(max)}</span>
          <span>₩{fmt(Math.round((max + min) / 2))}</span>
          <span>₩{fmt(min)}</span>
        </div>
        {/* Chart area */}
        <div className="ml-14 mr-2 relative" style={{ height: chartH }}>
          {/* Grid lines */}
          {[0, 0.5, 1].map(f => (
            <div key={f} className="absolute w-full border-t border-dashed border-slate-100" style={{ top: `${f * 100}%` }} />
          ))}
          {/* Line segments and dots */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Area fill */}
            <polygon
              points={
                points.map(p => `${p.x}%,${chartH - p.y}`).join(" ") +
                ` 100%,${chartH} 0%,${chartH}`
              }
              fill="url(#chartGrad)"
              opacity="0.15"
            />
            <defs>
              <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3182F6" />
                <stop offset="100%" stopColor="#3182F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Line */}
            <polyline
              points={points.map(p => `${p.x}%,${chartH - p.y}`).join(" ")}
              fill="none"
              stroke="#3182F6"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Dots */}
            {points.map((p, i) => (
              <circle key={i} cx={`${p.x}%`} cy={chartH - p.y} r="3" fill="#3182F6" stroke="white" strokeWidth="1.5" />
            ))}
          </svg>
        </div>
        {/* X-axis labels */}
        <div className="ml-14 mr-2 flex justify-between mt-1">
          {data.length <= 10
            ? data.map((d, i) => <span key={i} className="text-[9px] text-slate-400">{d.date.slice(5)}</span>)
            : [0, Math.floor(data.length / 2), data.length - 1].map(i => (
                <span key={i} className="text-[9px] text-slate-400">{data[i]?.date.slice(5)}</span>
              ))
          }
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">KPI 트래킹</h2>

      {/* Loading skeleton */}
      {loading && <PulseSkeleton />}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 이번 달 총 매출 */}
        <div className={C}>
          <p className="text-xs font-semibold text-slate-400 mb-1">이번 달 총 매출</p>
          <p className="text-2xl font-bold text-slate-900">₩{fmt(analytics.thisRevenue)}</p>
          <p className={`text-xs font-semibold mt-1 ${deltaColor(analytics.revenueDelta)}`}>
            {analytics.revenueDelta !== 0 ? `${deltaArrow(analytics.revenueDelta)}${analytics.revenueDelta.toFixed(1)}% 전월 대비` : "전월 데이터 없음"}
          </p>
        </div>
        {/* 평균 전환율 */}
        <div className={C}>
          <p className="text-xs font-semibold text-slate-400 mb-1">평균 전환율</p>
          <p className="text-2xl font-bold text-slate-900">{analytics.avgConversion.toFixed(1)}%</p>
          <p className={`text-xs font-semibold mt-1 ${deltaColor(analytics.conversionDelta)}`}>
            {analytics.conversionDelta !== 0 ? `${deltaArrow(analytics.conversionDelta)}${analytics.conversionDelta.toFixed(1)}% 전월 대비` : "전월 데이터 없음"}
          </p>
        </div>
        {/* 총 이익 */}
        <div className={C}>
          <p className="text-xs font-semibold text-slate-400 mb-1">이번 달 총 이익</p>
          <p className={`text-2xl font-bold ${analytics.thisProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>₩{fmt(analytics.thisProfit)}</p>
          <p className={`text-xs font-semibold mt-1 ${deltaColor(analytics.profitDelta)}`}>
            {analytics.profitDelta !== 0 ? `${deltaArrow(analytics.profitDelta)}${analytics.profitDelta.toFixed(1)}% 전월 대비` : "전월 데이터 없음"}
          </p>
        </div>
        {/* 전월 대비 */}
        <div className={C}>
          <p className="text-xs font-semibold text-slate-400 mb-1">전월 대비 매출 증감</p>
          <p className={`text-2xl font-bold ${analytics.thisRevenue - analytics.lastRevenue >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            ₩{fmt(Math.abs(analytics.thisRevenue - analytics.lastRevenue))}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            전월 매출: ₩{fmt(analytics.lastRevenue)}
          </p>
        </div>
      </div>

      {/* Revenue Goal Tracking */}
      {analytics.revenueGoal && (
        <div className={C}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">매출 목표 달성률</h3>
            <span className="text-xs text-slate-400">{analytics.revenueGoal.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">현재: ₩{fmt(analytics.revenueGoal.current_value)}</span>
                <span className="font-semibold text-[#3182F6]">
                  {analytics.revenueGoal.target_value > 0
                    ? `${Math.round((analytics.revenueGoal.current_value / analytics.revenueGoal.target_value) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3182F6] rounded-full transition-all"
                  style={{ width: `${Math.min(100, analytics.revenueGoal.target_value > 0 ? (analytics.revenueGoal.current_value / analytics.revenueGoal.target_value) * 100 : 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>₩0</span>
                <span>목표: ₩{fmt(analytics.revenueGoal.target_value)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
            <span>기간: {analytics.revenueGoal.start_date} ~ {analytics.revenueGoal.end_date}</span>
            <span>남은 금액: ₩{fmt(Math.max(0, analytics.revenueGoal.target_value - analytics.revenueGoal.current_value))}</span>
          </div>
        </div>
      )}

      {/* Best/Worst Day + Month Comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Best/Worst Day */}
        <div className={C}>
          <h3 className="text-sm font-bold text-slate-700 mb-3">이번 달 최고/최저 매출일</h3>
          {analytics.bestDay ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">H</div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-600 font-semibold">최고 매출일</p>
                  <p className="text-sm font-bold text-slate-800">{analytics.bestDay.date} - ₩{fmt(analytics.bestDay.revenue)}</p>
                </div>
              </div>
              {analytics.worstDay && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/60">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500 font-bold text-sm">L</div>
                  <div className="flex-1">
                    <p className="text-xs text-red-500 font-semibold">최저 매출일</p>
                    <p className="text-sm font-bold text-slate-800">{analytics.worstDay.date} - ₩{fmt(analytics.worstDay.revenue)}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">이번 달 데이터가 없습니다</p>
          )}
        </div>

        {/* Month-over-month comparison */}
        <div className={C}>
          <h3 className="text-sm font-bold text-slate-700 mb-3">월간 비교</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">이번 달 매출</span>
                <span className="font-semibold text-slate-700">₩{fmt(analytics.thisRevenue)}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#3182F6] rounded-full transition-all" style={{
                  width: `${Math.max(analytics.thisRevenue, analytics.lastRevenue) > 0 ? (analytics.thisRevenue / Math.max(analytics.thisRevenue, analytics.lastRevenue)) * 100 : 0}%`
                }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">전월 매출</span>
                <span className="font-semibold text-slate-700">₩{fmt(analytics.lastRevenue)}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full transition-all" style={{
                  width: `${Math.max(analytics.thisRevenue, analytics.lastRevenue) > 0 ? (analytics.lastRevenue / Math.max(analytics.thisRevenue, analytics.lastRevenue)) * 100 : 0}%`
                }} />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">이번 달 이익</span>
                <span className={`font-semibold ${analytics.thisProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>₩{fmt(analytics.thisProfit)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">전월 이익</span>
                <span className={`font-semibold ${analytics.lastProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>₩{fmt(analytics.lastProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart - Last 30 days */}
      <div className={C}>
        <h3 className="text-sm font-bold text-slate-700 mb-4">최근 30일 매출 추이</h3>
        <MiniChart data={analytics.chartData} field="revenue" />
      </div>

      <div className={C}>
        <h3 className="text-sm font-bold text-slate-700 mb-4">최근 30일 이익 추이</h3>
        <MiniChart data={analytics.chartData} field="profit" />
      </div>

      {/* Form */}
      <div className={C}>
        <h3 className="mb-4 text-sm font-bold text-slate-700">KPI 입력</h3>
        <div className="grid gap-4 sm:grid-cols-5">
          <div>
            <label className={L}>날짜</label>
            <input type="date" className={I} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className={L}>매출 (&#8361;)</label>
            <input type="number" className={I} placeholder="0" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
          </div>
          <div>
            <label className={L}>사용자 수</label>
            <input type="number" className={I} placeholder="0" value={form.users_count} onChange={(e) => set("users_count", e.target.value)} />
          </div>
          <div>
            <label className={L}>전환율 (%)</label>
            <input type="number" step="0.1" className={I} placeholder="0.0" value={form.conversion_rate} onChange={(e) => set("conversion_rate", e.target.value)} />
          </div>
          <div>
            <label className={L}>이익 (&#8361;)</label>
            <input type="number" className={I} placeholder="0" value={form.profit} onChange={(e) => set("profit", e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className={B} onClick={save} disabled={saving}>
            {saving ? "저장 중..." : "저장 (날짜 중복 시 갱신)"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={C}>
        <h3 className="mb-3 text-sm font-bold text-slate-700">최근 15일 기록</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                <th className="pb-2 pr-4">날짜</th>
                <th className="pb-2 pr-4 text-right">매출</th>
                <th className="pb-2 pr-4 text-right">사용자</th>
                <th className="pb-2 pr-4 text-right">전환율</th>
                <th className="pb-2 pr-4 text-right">이익</th>
                <th className="pb-2 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-slate-700">{r.date}</td>
                  <td className="py-2.5 pr-4 text-right text-slate-700">&#8361;{fmt(r.revenue)}</td>
                  <td className="py-2.5 pr-4 text-right text-slate-700">{fmt(r.users_count)}</td>
                  <td className="py-2.5 pr-4 text-right text-slate-700">{r.conversion_rate}%</td>
                  <td className={`py-2.5 pr-4 text-right font-semibold ${r.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    &#8361;{fmt(r.profit)}
                  </td>
                  <td className="py-2.5 text-right">
                    <button className="text-xs text-red-400 hover:text-red-600" onClick={() => remove(r.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">KPI 기록이 없습니다</p>
              <p className="text-xs text-slate-400">위 폼에서 매출, 사용자, 전환율을 입력해보세요</p>
            </div>
          )}
        </div>
        {records.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const header = "날짜,매출,사용자,전환율,이익";
                const rows = records.map(r =>
                  [r.date, r.revenue, r.users_count, r.conversion_rate, r.profit].join(",")
                );
                const csv = "﻿" + [header, ...rows].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `KPI_${today()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 text-xs hover:bg-emerald-100 transition-all"
            >
              CSV 다운로드
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
