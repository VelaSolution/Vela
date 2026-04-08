"use client";

import { useState, useEffect } from "react";
import { HQRole } from "@/app/hq/types";
import { sb, I, C, B, B2 } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

type CalEvent = {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  color: string;
  author: string;
  memo?: string;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const COLORS = [
  { value: "blue", label: "파랑", bg: "bg-[#3182F6]" },
  { value: "red", label: "빨강", bg: "bg-red-500" },
  { value: "emerald", label: "초록", bg: "bg-emerald-500" },
  { value: "amber", label: "노랑", bg: "bg-amber-500" },
  { value: "purple", label: "보라", bg: "bg-purple-500" },
  { value: "pink", label: "분홍", bg: "bg-pink-500" },
];
const colorBg = (c: string) => COLORS.find(x => x.value === c)?.bg ?? "bg-[#3182F6]";

export default function CalendarTab({ userId, userName, myRole, flash }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [taskDates, setTaskDates] = useState<Set<string>>(new Set());
  const [goalDates, setGoalDates] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", end_date: "", color: "blue", memo: "" });

  const load = async () => {
    const s = sb();
    if (!s) return;
    const [tRes, gRes, eRes] = await Promise.all([
      s.from("hq_tasks").select("deadline"),
      s.from("hq_goals").select("end_date"),
      s.from("hq_events").select("*").order("date", { ascending: true }),
    ]);
    if (tRes.data) setTaskDates(new Set(tRes.data.map((t: any) => t.deadline).filter(Boolean)));
    if (gRes.data) setGoalDates(new Set(gRes.data.map((g: any) => g.end_date).filter(Boolean)));
    if (eRes.data) setEvents(eRes.data.map((r: any) => ({
      id: r.id, title: r.title ?? "", date: r.date ?? "", end_date: r.end_date,
      color: r.color ?? "blue", author: r.author ?? "", memo: r.memo ?? "",
    })));
  };

  useEffect(() => { load(); }, []);

  const saveEvent = async () => {
    if (!form.title.trim() || !form.date) return;
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_events").insert({
      title: form.title, date: form.date, end_date: form.end_date || null,
      color: form.color, author: userName, memo: form.memo || null,
    });
    if (error) return flash("저장 실패: " + error.message);
    flash("일정이 추가되었습니다");
    setForm({ title: "", date: "", end_date: "", color: "blue", memo: "" });
    setShowForm(false);
    load();
  };

  const delEvent = async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_events").delete().eq("id", id);
    flash("일정이 삭제되었습니다");
    load();
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => { if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1); };
  const dateStr = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const eventsOnDate = (ds: string) => events.filter(e => {
    if (e.end_date && e.end_date >= ds && e.date <= ds) return true;
    return e.date === ds;
  });

  const selectedEvents = selectedDate ? eventsOnDate(selectedDate) : [];
  const selectedHasTask = selectedDate ? taskDates.has(selectedDate) : false;
  const selectedHasGoal = selectedDate ? goalDates.has(selectedDate) : false;

  return (
    <div className="space-y-5">
      <div className={C}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">‹</button>
          <h3 className="text-lg font-bold text-slate-800">{year}년 {month + 1}월</h3>
          <button onClick={next} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-center text-xs font-semibold py-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"}`}>{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (d === null) return <div key={`e-${i}`} className="h-20" />;
            const ds = dateStr(d);
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;
            const hasTask = taskDates.has(ds);
            const hasGoal = goalDates.has(ds);
            const dayEvents = eventsOnDate(ds);
            const dayOfWeek = new Date(year, month, d).getDay();

            return (
              <div
                key={ds}
                onClick={() => { setSelectedDate(ds); setShowForm(false); }}
                className={`h-20 flex flex-col items-center pt-1.5 rounded-xl transition-all cursor-pointer ${
                  isSelected ? "bg-[#3182F6]/10 ring-2 ring-[#3182F6]/40" : isToday ? "bg-blue-50/50" : "hover:bg-slate-50"
                }`}
              >
                <span className={`text-sm font-medium leading-none ${
                  isToday ? "bg-[#3182F6] text-white w-7 h-7 flex items-center justify-center rounded-full"
                    : dayOfWeek === 0 ? "text-red-400" : dayOfWeek === 6 ? "text-blue-400" : "text-slate-700"
                }`}>{d}</span>
                <div className="flex flex-wrap gap-0.5 mt-1 justify-center max-w-full px-0.5">
                  {hasTask && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                  {hasGoal && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                  {dayEvents.slice(0, 3).map(e => (
                    <span key={e.id} className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorBg(e.color)}`} />
                  ))}
                </div>
                {dayEvents.length > 0 && (
                  <p className="text-[9px] text-slate-500 mt-0.5 truncate max-w-full px-1">{dayEvents[0].title}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-[#3182F6]" />오늘</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-400" />태스크</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-400" />목표</div>
          {COLORS.map(c => (
            <div key={c.value} className="flex items-center gap-1.5 text-xs text-slate-500"><span className={`w-2 h-2 rounded-full ${c.bg}`} />{c.label}</div>
          ))}
        </div>
      </div>

      {/* 선택한 날짜 상세 */}
      {selectedDate && (
        <div className={C}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
            </h3>
            <button onClick={() => { setShowForm(true); setForm({ ...form, date: selectedDate, end_date: "" }); }} className={B}>
              + 일정 추가
            </button>
          </div>

          {/* 일정 추가 폼 */}
          {showForm && (
            <div className="bg-slate-50/80 rounded-xl p-4 mb-4 space-y-3 border border-slate-200/60">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">제목</label>
                <input className={I} placeholder="일정 제목" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">시작일</label>
                  <input type="date" className={I} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">종료일 (선택)</label>
                  <input type="date" className={I} value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">색상</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c.value} onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-7 h-7 rounded-full ${c.bg} transition-all ${form.color === c.value ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "opacity-60 hover:opacity-100"}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">메모 (선택)</label>
                <input className={I} placeholder="메모" value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button onClick={saveEvent} className={B}>저장</button>
                <button onClick={() => setShowForm(false)} className={B2}>취소</button>
              </div>
            </div>
          )}

          {/* 해당 날짜 일정 목록 */}
          {selectedHasTask && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/60 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-700 font-medium">태스크 마감일</span>
            </div>
          )}
          {selectedHasGoal && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/60 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-xs text-emerald-700 font-medium">목표 마감일</span>
            </div>
          )}
          {selectedEvents.length === 0 && !selectedHasTask && !selectedHasGoal && !showForm && (
            <p className="text-sm text-slate-400 text-center py-4">등록된 일정이 없습니다</p>
          )}
          {selectedEvents.map(e => (
            <div key={e.id} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <span className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${colorBg(e.color)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{e.title}</p>
                <p className="text-xs text-slate-400">
                  {e.date}{e.end_date && e.end_date !== e.date ? ` ~ ${e.end_date}` : ""}
                  {e.author && ` · ${e.author}`}
                </p>
                {e.memo && <p className="text-xs text-slate-500 mt-0.5">{e.memo}</p>}
              </div>
              <button onClick={() => delEvent(e.id)} className="text-xs text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">삭제</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
