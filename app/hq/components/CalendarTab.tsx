"use client";

import { useState, useEffect } from "react";
import { HQRole, Task, Goal } from "@/app/hq/types";
import { sb, C } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarTab({ userId, userName, myRole, flash }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [taskDates, setTaskDates] = useState<Set<string>>(new Set());
  const [goalDates, setGoalDates] = useState<Set<string>>(new Set());

  const load = async () => {
    const s = sb();
    if (!s) return;
    const { data: tasks } = await s.from("hq_tasks").select("deadline");
    const { data: goals } = await s.from("hq_goals").select("end_date");
    if (tasks) setTaskDates(new Set(tasks.map((t: any) => t.deadline).filter(Boolean)));
    if (goals) setGoalDates(new Set(goals.map((g: any) => g.end_date).filter(Boolean)));
  };

  useEffect(() => {
    load();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const dateStr = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className={C}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
        >
          ‹
        </button>
        <h3 className="text-lg font-bold text-slate-800">
          {year}년 {month + 1}월
        </h3>
        <button
          onClick={next}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-semibold py-2 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (d === null)
            return <div key={`e-${i}`} className="h-16" />;
          const ds = dateStr(d);
          const isToday = ds === todayStr;
          const hasTask = taskDates.has(ds);
          const hasGoal = goalDates.has(ds);
          const dayOfWeek = new Date(year, month, d).getDay();

          return (
            <div
              key={ds}
              className={`h-16 flex flex-col items-center justify-start pt-2 rounded-xl transition-colors ${
                isToday ? "bg-[#3182F6]/10 ring-1 ring-[#3182F6]/30" : "hover:bg-slate-50"
              }`}
            >
              <span
                className={`text-sm font-medium leading-none ${
                  isToday
                    ? "bg-[#3182F6] text-white w-7 h-7 flex items-center justify-center rounded-full"
                    : dayOfWeek === 0
                    ? "text-red-400"
                    : dayOfWeek === 6
                    ? "text-blue-400"
                    : "text-slate-700"
                }`}
              >
                {d}
              </span>
              <div className="flex gap-1 mt-1.5">
                {hasTask && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {hasGoal && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-[#3182F6]" />
          오늘
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          태스크 마감
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          목표 마감
        </div>
      </div>
    </div>
  );
}
