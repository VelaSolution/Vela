"use client";

import React, { useMemo } from "react";
import { calcResult, fmt, pct, type FullForm } from "@/lib/vela";

export function StepIndicator({ current }: { current: number }) {
  const steps = ["매출 정보", "운영 비용", "초기비용 & 부채"];

  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : done
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {done ? "✓" : step}
              </div>
              <span
                className={`text-sm ${
                  active
                    ? "font-semibold text-slate-900"
                    : done
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function PreviewBar({ form }: { form: FullForm }) {
  const result = useMemo(() => calcResult(form), [form]);
  const isProfit = result.profit >= 0;

  return (
    <div className="rounded-[28px] bg-slate-900 p-5 text-white">
      <p className="mb-3 text-xs font-medium text-slate-400">실시간 미리보기</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">월 총 매출</p>
          <p className="mt-1 text-sm font-bold break-all">{fmt(result.totalSales)}원</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">세전 순이익</p>
          <p className={`mt-1 text-sm font-bold break-all ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            {fmt(result.profit)}원
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">세후 실수령</p>
          <p className={`mt-1 text-sm font-bold break-all ${result.netProfit >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            {fmt(result.netProfit)}원
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">현금흐름</p>
          <p className={`mt-1 text-sm font-bold break-all ${result.cashFlow >= 0 ? "text-blue-300" : "text-red-300"}`}>
            {fmt(result.cashFlow)}원
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isProfit ? "bg-emerald-400" : "bg-red-400"}`}
            style={{ width: `${Math.min(Math.abs(result.netMargin) * 5, 100)}%` }}
          />
        </div>
        <span className={`text-xs font-semibold whitespace-nowrap ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
          순이익률 {pct(result.netMargin)}
        </span>
      </div>
    </div>
  );
}
