"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const AttendanceTab = dynamic(() => import("./AttendanceTab"));
const LeaveTab = dynamic(() => import("./LeaveTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "attendance", label: "출퇴근" },
  { key: "leave", label: "휴가" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function AttendanceHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("attendance");

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

      {sub === "attendance" && <AttendanceTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "leave" && <LeaveTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}
