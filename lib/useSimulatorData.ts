// lib/useSimulatorData.ts
// 시뮬레이터 마지막 데이터를 tools 페이지에서 가져오는 훅

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vela-form-v3";

export type SimulatorSnapshot = {
  industry: string;
  storeName?: string;
  totalSales: number;
  profit: number;
  netProfit: number;
  netMargin: number;
  bep: number;
  laborRatio: number;
  cogsRatio: number;
  seats: number;
  avgSpend: number;
  rent: number;
  deliveryEnabled: boolean;
};

export function useSimulatorData(): SimulatorSnapshot | null {
  const [data, setData] = useState<SimulatorSnapshot | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const form = JSON.parse(raw);

      // vela.ts calcResult 로직 간략 복제
      const seats = Number(form.seats ?? 0);
      const avgSpend = Number(form.avgSpend ?? 0);
      const turnover = Number(form.turnover ?? 0);
      const weekdayDays = Number(form.weekdayDays ?? 0);
      const weekendDays = Number(form.weekendDays ?? 0);
      const weekendMultiplier = Number(form.weekendMultiplier ?? 1);

      const weekdaySales = seats * avgSpend * turnover * weekdayDays * 4.345;
      const weekendSales = seats * avgSpend * turnover * weekendDays * 4.345 * weekendMultiplier;
      const hallSales = weekdaySales + weekendSales;
      const deliverySales = form.deliveryEnabled ? Number(form.deliverySales ?? 0) : 0;
      const deliveryFeeRate = Number(form.deliveryFeeRate ?? 15) / 100;
      const deliveryNet = deliverySales * (1 - deliveryFeeRate);
      const totalSales = hallSales + deliveryNet;

      const cogsRate = Number(form.cogsRate ?? 30) / 100;
      const cogs = totalSales * cogsRate;
      const labor = Number(form.labor ?? 0);
      const rent = Number(form.rent ?? 0);
      const utilities = Number(form.utilities ?? 0);
      const marketing = Number(form.marketing ?? 0);
      const etc = Number(form.etc ?? 0);
      const cardFee = totalSales * (Number(form.cardFeeRate ?? 1.5) / 100);
      const totalCost = cogs + labor + rent + utilities + marketing + etc + cardFee;
      const profit = totalSales - totalCost;
      const taxRate = Number(form.incomeTaxRate ?? 15) / 100;
      const netProfit = profit * (1 - taxRate);
      const netMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
      const bep = totalCost > 0 ? totalCost / (1 - cogsRate) : 0;
      const laborRatio = totalSales > 0 ? (labor / totalSales) * 100 : 0;

      setData({
        industry: form.industry ?? "restaurant",
        totalSales: Math.round(totalSales),
        profit: Math.round(profit),
        netProfit: Math.round(netProfit),
        netMargin: Math.round(netMargin * 10) / 10,
        bep: Math.round(bep),
        laborRatio: Math.round(laborRatio * 10) / 10,
        cogsRatio: Number(form.cogsRate ?? 30),
        seats,
        avgSpend,
        rent,
        deliveryEnabled: !!form.deliveryEnabled,
      });
    } catch {
      // localStorage 파싱 실패 시 무시
    }
  }, []);

  return data;
}
