"use client";

// components/SendToSimulator.tsx
// 도구에서 수정한 값을 시뮬레이터로 돌려보내는 버튼

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  data: {
    monthlySales?: number;
    rent?: number;
    laborCost?: number;
    cogsRate?: number;
    etc?: number;
    industry?: string;
    seats?: number;
    avgSpend?: number;
  };
  label?: string;
};

export default function SendToSimulator({ data, label = "시뮬레이터에서 확인" }: Props) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  function handleSend() {
    try {
      const STORAGE_KEY = "vela-form-v3";
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};

      // 도구에서 수정한 값을 시뮬레이터 폼에 병합
      const merged = {
        ...existing,
        ...(data.industry && { industry: data.industry }),
        ...(data.seats && { seats: data.seats }),
        ...(data.avgSpend && { avgSpend: data.avgSpend }),
        ...(data.rent !== undefined && { rent: data.rent }),
        ...(data.laborCost !== undefined && { labor: data.laborCost }),
        ...(data.cogsRate !== undefined && { cogsRate: data.cogsRate }),
        ...(data.etc !== undefined && { etc: data.etc }),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      setDone(true);

      setTimeout(() => {
        router.push("/simulator");
      }, 600);
    } catch {
      router.push("/simulator");
    }
  }

  return (
    <button
      onClick={handleSend}
      className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
        done
          ? "bg-emerald-500 text-white"
          : "bg-slate-900 text-white hover:bg-slate-700"
      }`}
    >
      {done ? (
        <>✓ 반영됨 — 이동 중...</>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
