// lib/useSimulatorData.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  STORAGE_KEYS,
  FORM_UPDATED_EVENT,
  loadFormData,
  saveFormData,
  getSaveSlots,
  addSaveSlot,
  deleteSaveSlot,
  type SaveSlot,
} from "./storage";

export type SimulatorSnapshot = {
  industry: string;
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

function parse(raw: string): SimulatorSnapshot | null {
  try {
    const f = JSON.parse(raw);
    const seats = Number(f.seats ?? 0);
    const avgSpend = Number(f.avgSpend ?? 0);
    const turnover = Number(f.turnover ?? 0);
    const weekdayDays = Number(f.weekdayDays ?? 0);
    const weekendDays = Number(f.weekendDays ?? 0);
    const weekendMultiplier = Number(f.weekendMultiplier ?? 1);
    const hallSales = seats * avgSpend * turnover * (weekdayDays + weekendDays * weekendMultiplier) * 4.345;
    const deliverySales = f.deliveryEnabled ? Number(f.deliverySales ?? 0) : 0;
    const deliveryNet = deliverySales * (1 - Number(f.deliveryFeeRate ?? 15) / 100);
    const totalSales = hallSales + deliveryNet;
    if (totalSales === 0) return null;
    const cogsRate = Number(f.cogsRate ?? 30) / 100;
    const cogs = totalSales * cogsRate;
    const labor = Number(f.labor ?? 0);
    const rent = Number(f.rent ?? 0);
    const cardFee = totalSales * (Number(f.cardFeeRate ?? 1.5) / 100);
    const totalCost = cogs + labor + rent + Number(f.utilities ?? 0) + Number(f.marketing ?? 0) + Number(f.etc ?? 0) + cardFee;
    const profit = totalSales - totalCost;
    const netProfit = profit * (1 - Number(f.incomeTaxRate ?? 15) / 100);
    const netMargin = (profit / totalSales) * 100;
    return {
      industry: f.industry ?? "restaurant",
      totalSales: Math.round(totalSales),
      profit: Math.round(profit),
      netProfit: Math.round(netProfit),
      netMargin: Math.round(netMargin * 10) / 10,
      bep: Math.round(totalCost / (1 - cogsRate)),
      laborRatio: Math.round((labor / totalSales) * 1000) / 10,
      cogsRatio: Number(f.cogsRate ?? 30),
      seats, avgSpend, rent,
      deliveryEnabled: !!f.deliveryEnabled,
    };
  } catch { return null; }
}

/**
 * 시뮬레이터 폼 데이터의 계산된 스냅샷을 반환하는 훅
 * - localStorage 변경 (같은 탭 + 다른 탭) 자동 감지
 * - storage.ts의 saveFormData()를 통해 저장하면 자동으로 업데이트됨
 */
export function useSimulatorData(): SimulatorSnapshot | null {
  const [data, setData] = useState<SimulatorSnapshot | null>(null);

  const refresh = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.FORM);
    if (raw) setData(parse(raw));
    else setData(null);
  }, []);

  useEffect(() => {
    // 초기 로드
    refresh();

    // 다른 탭에서 변경 감지
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.FORM && e.newValue) setData(parse(e.newValue));
    };
    // 같은 탭에서 변경 감지 (saveFormData에서 발생시키는 커스텀 이벤트)
    const onUpdate = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener(FORM_UPDATED_EVENT, onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FORM_UPDATED_EVENT, onUpdate);
    };
  }, [refresh]);

  return data;
}

// ─── 저장 슬롯 훅 ───────────────────────────────────────────────
// simulator/page.tsx 등에서 직접 localStorage 접근 대신 사용

export { type SaveSlot } from "./storage";

/**
 * 시뮬레이터 저장 슬롯을 관리하는 훅
 */
export function useSaveSlots() {
  const [saves, setSaves] = useState<SaveSlot[]>([]);

  useEffect(() => {
    setSaves(getSaveSlots());
  }, []);

  const save = useCallback((form: Record<string, unknown>) => {
    const label = addSaveSlot(form);
    setSaves(getSaveSlots());
    return label;
  }, []);

  const remove = useCallback((id: string) => {
    deleteSaveSlot(id);
    setSaves(getSaveSlots());
  }, []);

  const reload = useCallback(() => {
    setSaves(getSaveSlots());
  }, []);

  return { saves, save, remove, reload };
}

// Re-export storage helpers for convenient access
export { saveFormData, loadFormData, mergeFormData } from "./storage";
