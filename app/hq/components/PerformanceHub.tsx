"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const KpiTab = dynamic(() => import("./KpiTab"));
const GoalTab = dynamic(() => import("./GoalTab"));
const EvaluationTab = dynamic(() => import("./EvaluationTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "kpi", label: "KPI" },
  { key: "goal", label: "목표" },
  { key: "evaluation", label: "인사평가" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function PerformanceHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("kpi");

  return (
    <div>
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setSub(t.key)}
            className={`px-4 py-2.5 text-[14px] font-semibold rounded-xl transition-all ${
              sub === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {sub === "kpi" && <KpiTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "goal" && <GoalTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "evaluation" && <EvaluationTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}
