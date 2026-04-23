"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const TaskTab = dynamic(() => import("./TaskTab"));
const CalendarTab = dynamic(() => import("./CalendarTab"));
const GanttTab = dynamic(() => import("./GanttTab"));
const CheckinTab = dynamic(() => import("./CheckinTab"));
const KanbanTab = dynamic(() => import("./KanbanTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "task", label: "태스크" },
  { key: "kanban", label: "칸반" },
  { key: "calendar", label: "일정" },
  { key: "gantt", label: "간트" },
  { key: "checkin", label: "체크아웃" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function TaskHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("task");

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

      {sub === "task" && <TaskTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "kanban" && <KanbanTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "calendar" && <CalendarTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "gantt" && <GanttTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "checkin" && <CheckinTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}
