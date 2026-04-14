"use client";

import { fmt } from "@/lib/vela";
import type { MenuItem } from "./types";
import { calcMenu, CATEGORY_COLOR } from "./types";

export default function SummaryDashboard({ menus }: { menus: MenuItem[] }) {
  const allCalc = menus.map((m) => ({ item: m, calc: calcMenu(m) }));
  const validMenus = allCalc.filter((m) => m.calc.price > 0);

  const avgCostRatio =
    validMenus.length > 0
      ? validMenus.reduce((s, m) => s + m.calc.costRatio, 0) / validMenus.length
      : 0;
  const avgProfit =
    validMenus.length > 0
      ? validMenus.reduce((s, m) => s + m.calc.profit, 0) / validMenus.length
      : 0;
  const dangerCount = validMenus.filter((m) => m.calc.costRatio > 40).length;
  const bestMenu = validMenus.length > 0
    ? validMenus.reduce((best, m) => (m.calc.profitRatio > best.calc.profitRatio ? m : best), validMenus[0])
    : null;

  if (validMenus.length === 0) return null;

  return (
    <>
      {/* 요약 대시보드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">분석 메뉴</p>
          <p className="text-2xl font-extrabold text-slate-900">{validMenus.length}개</p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">평균 원가율</p>
          <p
            className="text-2xl font-extrabold"
            style={{
              color: avgCostRatio <= 30 ? "#059669" : avgCostRatio <= 40 ? "#D97706" : "#EF4444",
            }}
          >
            {avgCostRatio.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">평균 건당 순익</p>
          <p className="text-2xl font-extrabold text-slate-900">{fmt(Math.round(avgProfit))}원</p>
        </div>
        <div className={`rounded-2xl shadow-sm ring-1 p-4 ${dangerCount > 0 ? "bg-red-50 ring-red-200" : "bg-white ring-slate-200"}`}>
          <p className={`text-xs mb-1 ${dangerCount > 0 ? "text-red-400" : "text-slate-400"}`}>원가율 위험 메뉴</p>
          <p className={`text-2xl font-extrabold ${dangerCount > 0 ? "text-red-500" : "text-slate-300"}`}>
            {dangerCount}개
          </p>
        </div>
      </div>

      {/* 최우수 메뉴 배너 */}
      {bestMenu && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-0.5">마진율 최고 메뉴</p>
            <p className="text-white font-bold text-lg">{bestMenu.item.name || "미입력 메뉴"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">마진율</p>
            <p className="text-emerald-400 font-extrabold text-xl">{bestMenu.calc.profitRatio.toFixed(1)}%</p>
          </div>
        </div>
      )}
    </>
  );
}

// 전체 메뉴 원가 비교 테이블
export function MenuCompareTable({ menus }: { menus: MenuItem[] }) {
  const validMenus = menus
    .map((m) => ({ item: m, calc: calcMenu(m) }))
    .filter((m) => m.calc.price > 0);

  if (validMenus.length <= 1) return null;

  return (
    <section className="mt-10 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">전체 메뉴 원가 비교</h2>
        <p className="text-xs text-slate-400 mt-0.5">판매가 입력된 메뉴만 표시됩니다</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-400 font-semibold uppercase tracking-wide">
              <th className="px-6 py-3 text-left">메뉴</th>
              <th className="px-4 py-3 text-right">판매가</th>
              <th className="px-4 py-3 text-right">원가</th>
              <th className="px-4 py-3 text-right">원가율</th>
              <th className="px-4 py-3 text-right">건당 순익</th>
              <th className="px-4 py-3 text-center">평가</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {validMenus
              .sort((a, b) => a.calc.costRatio - b.calc.costRatio)
              .map((m) => {
                const statusColor =
                  m.calc.costRatio <= 30 ? "#059669" : m.calc.costRatio <= 40 ? "#D97706" : "#EF4444";
                const statusLabel =
                  m.calc.costRatio <= 30 ? "우수" : m.calc.costRatio <= 40 ? "양호" : "위험";
                return (
                  <tr key={m.item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{m.item.name || "—"}</span>
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: `${CATEGORY_COLOR[m.item.category] ?? "#9EA6B3"}18`,
                          color: CATEGORY_COLOR[m.item.category] ?? "#9EA6B3",
                        }}
                      >
                        {m.item.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-600">{fmt(m.calc.price)}원</td>
                    <td className="px-4 py-4 text-right text-slate-600">{fmt(m.calc.costTotal)}원</td>
                    <td className="px-4 py-4 text-right font-bold" style={{ color: statusColor }}>
                      {m.calc.costRatio.toFixed(1)}%
                    </td>
                    <td className={`px-4 py-4 text-right font-semibold ${m.calc.profit >= 0 ? "text-slate-900" : "text-red-500"}`}>
                      {fmt(m.calc.profit)}원
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: `${statusColor}18`, color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
