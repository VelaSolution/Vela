"use client";

// components/SendToSimulator.tsx
// 도구에서 수정한 값을 시뮬레이터로 돌려보내는 버튼

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mergeFormData } from "@/lib/storage";

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
    // 도구에서 수정한 값을 시뮬레이터 폼에 병합
    const partial: Record<string, unknown> = {};
    if (data.industry) partial.industry = data.industry;
    if (data.seats) partial.seats = data.seats;
    if (data.avgSpend) partial.avgSpend = data.avgSpend;
    if (data.rent !== undefined) partial.rent = data.rent;
    if (data.laborCost !== undefined) partial.labor = data.laborCost;
    if (data.cogsRate !== undefined) partial.cogsRate = data.cogsRate;
    if (data.etc !== undefined) partial.etc = data.etc;

    const success = mergeFormData(partial);

    if (success) {
      setDone(true);
      setTimeout(() => {
        router.push("/simulator");
      }, 600);
    } else {
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
