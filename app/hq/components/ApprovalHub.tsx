"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const ApprovalTab = dynamic(() => import("./ApprovalTab"));
const ReportTab = dynamic(() => import("./ReportTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "approval", label: "결재" },
  { key: "report", label: "보고서" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function ApprovalHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("approval");

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

      {sub === "approval" && <ApprovalTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "report" && <ReportTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}
