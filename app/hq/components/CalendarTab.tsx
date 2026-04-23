"use client";

import { useState, useEffect, useMemo } from "react";
import { HQRole } from "@/app/hq/types";
import { sb, I, C, B, B2, useTeamDisplayNames } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

type CalEvent = {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  color: string;
  author: string;
  memo?: string;
  eventType?: "calendar" | "booking" | "shift";
  recurrence?: Recurrence;
  recurrence_end?: string;
  is_exception?: boolean;
  original_event_id?: string;
  original_date?: string;
  _instanceDate?: string;
  _isRecurring?: boolean;
};

type ViewMode = "month" | "week";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const COLORS = [
  { value: "blue", label: "파랑", bg: "bg-[#3182F6]", text: "text-[#3182F6]", light: "bg-[#3182F6]/10 text-[#3182F6]" },
  { value: "red", label: "빨강", bg: "bg-red-500", text: "text-red-500", light: "bg-red-50 text-red-600" },
  { value: "emerald", label: "초록", bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50 text-emerald-600" },
  { value: "amber", label: "노랑", bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-50 text-amber-600" },
  { value: "purple", label: "보라", bg: "bg-purple-500", text: "text-purple-500", light: "bg-purple-50 text-purple-600" },
  { value: "pink", label: "분홍", bg: "bg-pink-500", text: "text-pink-500", light: "bg-pink-50 text-pink-600" },
];
const EXTRA_COLORS: Record<string, { bg: string; light: string }> = {
  teal: { bg: "bg-teal-500", light: "bg-teal-50 text-teal-700" },
};
const colorBg = (c: string) => EXTRA_COLORS[c]?.bg ?? COLORS.find(x => x.value === c)?.bg ?? "bg-[#3182F6]";
const colorLight = (c: string) => EXTRA_COLORS[c]?.light ?? COLORS.find(x => x.value === c)?.light ?? "bg-[#3182F6]/10 text-[#3182F6]";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
  { value: "yearly", label: "매년" },
];

function addRecurrence(dateStr: string, recurrence: Recurrence, count: number): string {
  const d = new Date(dateStr + "T00:00:00");
  switch (recurrence) {
    case "daily": d.setDate(d.getDate() + count); break;
    case "weekly": d.setDate(d.getDate() + count * 7); break;
    case "monthly": d.setMonth(d.getMonth() + count); break;
    case "yearly": d.setFullYear(d.getFullYear() + count); break;
  }
  return d.toISOString().slice(0, 10);
}

function generateRecurringInstances(event: CalEvent, rangeStart: string, rangeEnd: string, exceptions: CalEvent[]): CalEvent[] {
  if (!event.recurrence || event.recurrence === "none") return [];
  const instances: CalEvent[] = [];
  const exceptionDates = new Set(
    exceptions.filter(ex => ex.original_event_id === event.id).map(ex => ex.original_date)
  );

  for (let i = 1; i < 366; i++) {
    const instanceDate = addRecurrence(event.date, event.recurrence, i);
    if (instanceDate > rangeEnd) break;
    if (event.recurrence_end && instanceDate > event.recurrence_end) break;
    if (instanceDate < rangeStart) continue;
    if (exceptionDates.has(instanceDate)) continue;

    instances.push({
      ...event,
      _instanceDate: instanceDate,
      _isRecurring: true,
      date: instanceDate,
      end_date: undefined,
    });
  }
  return instances;
}

export default function CalendarTab({ userId, userName, myRole, flash }: Props) {
  const { displayName } = useTeamDisplayNames();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [taskDates, setTaskDates] = useState<Set<string>>(new Set());
  const [goalDates, setGoalDates] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [bookingEvents, setBookingEvents] = useState<CalEvent[]>([]);
  const [shiftEvents, setShiftEvents] = useState<CalEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [form, setForm] = useState({ title: "", date: "", end_date: "", color: "blue", memo: "", recurrence: "none" as Recurrence, recurrence_end: "" });
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [editRecurringMode, setEditRecurringMode] = useState<"this" | "all" | null>(null);
  const [deleteRecurringMode, setDeleteRecurringMode] = useState<"this" | "all" | null>(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<CalEvent | null>(null);

  const load = async () => {
    const s = sb();
    if (!s) return;
    const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
    const [tRes, gRes, eRes, bRes, sRes] = await Promise.all([
      s.from("hq_tasks").select("deadline"),
      s.from("hq_goals").select("end_date"),
      s.from("hq_events").select("*").order("date", { ascending: true }),
      s.from("hq_bookings").select("id, title, date, resource_name, booked_by").gte("date", monthStart).lte("date", monthEnd),
      s.from("hq_shifts").select("id, title, date, user_id, user_name").gte("date", monthStart).lte("date", monthEnd).eq("user_id", userId),
    ]);
    if (tRes.data) setTaskDates(new Set(tRes.data.map((t: any) => t.deadline).filter(Boolean)));
    if (gRes.data) setGoalDates(new Set(gRes.data.map((g: any) => g.end_date).filter(Boolean)));
    if (eRes.data) setEvents(eRes.data.map((r: any) => ({
      id: r.id, title: r.title ?? "", date: r.date ?? "", end_date: r.end_date,
      color: r.color ?? "blue", author: r.author ?? "", memo: r.memo ?? "", eventType: "calendar" as const,
      recurrence: r.recurrence ?? "none", recurrence_end: r.recurrence_end ?? undefined,
      is_exception: r.is_exception ?? false, original_event_id: r.original_event_id ?? undefined,
      original_date: r.original_date ?? undefined,
    })));
    if (bRes.data) setBookingEvents(bRes.data.map((r: any) => ({
      id: r.id, title: r.title || r.resource_name || "예약", date: r.date ?? "",
      color: "purple", author: r.booked_by ?? "", eventType: "booking" as const,
    })));
    if (sRes.data) setShiftEvents(sRes.data.map((r: any) => ({
      id: r.id, title: r.title || "근무", date: r.date ?? "",
      color: "teal", author: r.user_name ?? "", eventType: "shift" as const,
    })));
  };

  useEffect(() => { load(); }, [year, month]);

  const saveEvent = async () => {
    if (!form.title.trim() || !form.date) return;
    const s = sb();
    if (!s) return;

    if (editingEvent) {
      if (editingEvent._isRecurring && editRecurringMode === "this") {
        // Create exception for this specific date
        const { error: exErr } = await s.from("hq_events").insert({
          title: form.title, date: form.date, end_date: form.end_date || null,
          color: form.color, author: editingEvent.author, memo: form.memo || null,
          recurrence: "none", is_exception: true,
          original_event_id: editingEvent.id, original_date: editingEvent._instanceDate || editingEvent.date,
        });
        if (exErr) return flash("수정 실패: " + exErr.message);
        flash("이 일정만 수정되었습니다");
      } else {
        // Update the original event (all instances)
        const updateData: any = {
          title: form.title, date: form.date, end_date: form.end_date || null,
          color: form.color, memo: form.memo || null,
          recurrence: form.recurrence, recurrence_end: form.recurrence_end || null,
        };
        const targetId = editingEvent.original_event_id || editingEvent.id;
        const { error } = await s.from("hq_events").update(updateData).eq("id", targetId);
        if (error) return flash("수정 실패: " + error.message);
        flash("일정이 수정되었습니다");
      }
    } else {
      const { error } = await s.from("hq_events").insert({
        title: form.title, date: form.date, end_date: form.end_date || null,
        color: form.color, author: userName, memo: form.memo || null,
        recurrence: form.recurrence, recurrence_end: form.recurrence_end || null,
      });
      if (error) return flash("저장 실패: " + error.message);
      flash("일정이 추가되었습니다");
    }
    setForm({ title: "", date: "", end_date: "", color: "blue", memo: "", recurrence: "none", recurrence_end: "" });
    setShowForm(false);
    setEditingEvent(null);
    setEditRecurringMode(null);
    load();
  };

  const delEvent = async (ev: CalEvent) => {
    if (ev._isRecurring || (ev.recurrence && ev.recurrence !== "none")) {
      setPendingDeleteEvent(ev);
      setDeleteRecurringMode(null);
      return;
    }
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_events").delete().eq("id", ev.id);
    flash("일정이 삭제되었습니다");
    load();
  };

  const confirmDeleteRecurring = async (mode: "this" | "all") => {
    const ev = pendingDeleteEvent;
    if (!ev) return;
    const s = sb();
    if (!s) return;

    if (mode === "this") {
      // Create an exception entry that "deletes" this instance
      const { error } = await s.from("hq_events").insert({
        title: "[삭제됨]", date: ev._instanceDate || ev.date,
        color: ev.color, author: ev.author,
        recurrence: "none", is_exception: true,
        original_event_id: ev.original_event_id || ev.id,
        original_date: ev._instanceDate || ev.date,
      });
      // Also delete the exception entry we just created (effectively blocking that date)
      // Better approach: we keep a hidden exception record
      if (error) flash("삭제 실패: " + error.message);
      else flash("이 일정만 삭제되었습니다");
    } else {
      // Delete original + all exceptions
      const targetId = ev.original_event_id || ev.id;
      await s.from("hq_events").delete().eq("original_event_id", targetId);
      await s.from("hq_events").delete().eq("id", targetId);
      flash("모든 반복 일정이 삭제되었습니다");
    }
    setPendingDeleteEvent(null);
    setDeleteRecurringMode(null);
    load();
  };

  const openEditEvent = (e: CalEvent) => {
    if (e._isRecurring || (e.recurrence && e.recurrence !== "none")) {
      setEditingEvent(e);
      setForm({
        title: e.title, date: e._instanceDate || e.date, end_date: e.end_date || "",
        color: e.color, memo: e.memo || "",
        recurrence: e.recurrence || "none", recurrence_end: e.recurrence_end || "",
      });
      setEditRecurringMode(null);
      setShowForm(false);
      return;
    }
    setEditingEvent(e);
    setForm({
      title: e.title, date: e.date, end_date: e.end_date || "",
      color: e.color, memo: e.memo || "",
      recurrence: e.recurrence || "none", recurrence_end: e.recurrence_end || "",
    });
    setEditRecurringMode(null);
    setShowForm(true);
  };

  const chooseEditRecurringMode = (mode: "this" | "all") => {
    setEditRecurringMode(mode);
    setShowForm(true);
  };

  const goToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(now.toISOString().slice(0, 10));
    if (viewMode === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      setWeekStart(d);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => {
    if (viewMode === "week") {
      const d = new Date(weekStart);
      d.setDate(d.getDate() - 7);
      setWeekStart(d);
    } else {
      if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1);
    }
  };
  const next = () => {
    if (viewMode === "week") {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + 7);
      setWeekStart(d);
    } else {
      if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1);
    }
  };
  const dateStr = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // Range for recurring instance generation
  const rangeStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const rangeEnd = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

  // Build expanded events including recurring instances
  const expandedEvents = useMemo(() => {
    const baseEvents = events.filter(e => !e.is_exception);
    const exceptions = events.filter(e => e.is_exception);
    const allInstances: CalEvent[] = [];

    for (const ev of baseEvents) {
      // Add the original event itself
      allInstances.push(ev);
      // Generate recurring instances
      if (ev.recurrence && ev.recurrence !== "none") {
        const instances = generateRecurringInstances(ev, rangeStart, rangeEnd, exceptions);
        allInstances.push(...instances);
      }
    }

    // Also add exception events that have actual content (not just deletion markers)
    for (const ex of exceptions) {
      if (ex.title !== "[삭제됨]") {
        allInstances.push(ex);
      }
    }

    return allInstances;
  }, [events, rangeStart, rangeEnd]);

  const eventsOnDate = (ds: string): CalEvent[] => {
    const calEvents = expandedEvents.filter(e => {
      if (e.end_date && e.end_date >= ds && e.date <= ds) return true;
      return e.date === ds;
    });
    const bkEvents = bookingEvents.filter(e => e.date === ds);
    const shEvents = shiftEvents.filter(e => e.date === ds);
    return [...calEvents, ...bkEvents, ...shEvents];
  };

  const selectedEvents = selectedDate ? eventsOnDate(selectedDate) : [];
  const selectedHasTask = selectedDate ? taskDates.has(selectedDate) : false;
  const selectedHasGoal = selectedDate ? goalDates.has(selectedDate) : false;

  // Week view data
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekStart]);

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.slice(0, 7)} ${start.slice(8)}일 ~ ${end.slice(8)}일`;
  }, [weekDays]);

  const recurrenceLabel = (r: Recurrence | undefined) => {
    const opt = RECURRENCE_OPTIONS.find(o => o.value === r);
    return opt?.label || "없음";
  };

  return (
    <div className="space-y-5">
      <div className={C}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={prev} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">&lsaquo;</button>
            <h3 className="text-lg font-bold text-slate-800">
              {viewMode === "month" ? `${year}년 ${month + 1}월` : weekLabel}
            </h3>
            <button onClick={next} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">&rsaquo;</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="rounded-xl bg-[#3182F6]/10 text-[#3182F6] font-semibold px-3 py-1.5 text-xs hover:bg-[#3182F6]/20 transition-all">
              오늘
            </button>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "month" ? "bg-white text-[#3182F6] shadow-sm" : "text-slate-500"}`}
              >
                월
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "week" ? "bg-white text-[#3182F6] shadow-sm" : "text-slate-500"}`}
              >
                주
              </button>
            </div>
          </div>
        </div>

        {viewMode === "month" && (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d, i) => (
                <div key={d} className={`text-center text-xs font-semibold py-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"}`}>{d}</div>
              ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7">
              {cells.map((d, i) => {
                if (d === null) return <div key={`e-${i}`} className="h-20 md:h-24" />;
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
                    onClick={() => { setSelectedDate(ds); setShowForm(false); setEditingEvent(null); setEditRecurringMode(null); }}
                    className={`h-20 md:h-24 flex flex-col pt-1 px-0.5 rounded-xl transition-all cursor-pointer border ${
                      isSelected ? "bg-[#3182F6]/5 border-[#3182F6]/30" : isToday ? "bg-blue-50/50 border-transparent" : "hover:bg-slate-50 border-transparent"
                    }`}
                  >
                    <span className={`text-[10px] md:text-xs font-medium leading-none self-center mb-0.5 ${
                      isToday ? "bg-[#3182F6] text-white w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full text-[10px] md:text-[11px]"
                        : dayOfWeek === 0 ? "text-red-400" : dayOfWeek === 6 ? "text-blue-400" : "text-slate-700"
                    }`}>{d}</span>
                    {/* Event titles in cells */}
                    <div className="flex-1 overflow-hidden space-y-0.5 min-h-0">
                      {dayEvents.slice(0, 2).map((e, idx) => (
                        <div key={`${e.id}-${idx}`} className={`text-[8px] md:text-[9px] leading-tight px-0.5 md:px-1 py-0.5 rounded truncate font-medium ${colorLight(e.color)}`}>
                          {(e._isRecurring || (e.recurrence && e.recurrence !== "none")) ? "🔄 " : ""}{e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[8px] md:text-[9px] text-slate-400 px-0.5 md:px-1 font-medium">+{dayEvents.length - 2} more</p>
                      )}
                      {dayEvents.length === 0 && (hasTask || hasGoal) && (
                        <div className="flex gap-0.5 mt-0.5 px-1">
                          {hasTask && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                          {hasGoal && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewMode === "week" && (
          <>
            <p className="md:hidden text-xs text-slate-400 mb-2">← 좌우로 스크롤하세요</p>
            <div className="overflow-x-auto">
            <div className="min-w-[500px]">
            {/* Week view headers */}
            <div className="grid grid-cols-8 border-b border-slate-200">
              <div className="w-14 shrink-0" />
              {weekDays.map((ds, i) => {
                const d = new Date(ds + "T00:00:00");
                const isToday = ds === todayStr;
                return (
                  <div key={ds} className="text-center py-2">
                    <p className={`text-[10px] font-semibold ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"}`}>{DAYS[i]}</p>
                    <p className={`text-sm font-bold mt-0.5 ${isToday ? "bg-[#3182F6] text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto" : "text-slate-700"}`}>
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* Week grid with time slots */}
            <div className="max-h-[500px] overflow-y-auto">
              {HOURS.filter(h => h >= 6 && h <= 22).map(hour => (
                <div key={hour} className="grid grid-cols-8 min-h-[40px] border-b border-slate-50">
                  <div className="w-14 shrink-0 text-[10px] text-slate-400 font-medium pr-2 text-right pt-1">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  {weekDays.map(ds => {
                    const dayEvents = eventsOnDate(ds);
                    const isSelected = ds === selectedDate;
                    return (
                      <div
                        key={ds}
                        onClick={() => { setSelectedDate(ds); setShowForm(false); setEditingEvent(null); setEditRecurringMode(null); }}
                        className={`border-l border-slate-100 px-0.5 py-0.5 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? "bg-[#3182F6]/5" : ""}`}
                      >
                        {hour === 8 && dayEvents.slice(0, 2).map((e, idx) => (
                          <div key={`${e.id}-${idx}`} className={`text-[9px] leading-tight px-1 py-0.5 rounded truncate font-medium mb-0.5 ${colorLight(e.color)}`}>
                            {(e._isRecurring || (e.recurrence && e.recurrence !== "none")) ? "🔄 " : ""}{e.title}
                          </div>
                        ))}
                        {hour === 8 && dayEvents.length > 2 && (
                          <p className="text-[9px] text-slate-400 px-1">+{dayEvents.length - 2}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            </div>
            </div>
          </>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-[#3182F6]" />오늘</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-400" />태스크</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-400" />목표</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-purple-500" />자원예약</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-teal-500" />근무</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">🔄 반복</div>
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
            <button onClick={() => { setShowForm(true); setEditingEvent(null); setEditRecurringMode(null); setForm({ title: "", date: selectedDate, end_date: "", color: "blue", memo: "", recurrence: "none", recurrence_end: "" }); }} className={B}>
              + 일정 추가
            </button>
          </div>

          {/* Recurring edit mode chooser */}
          {editingEvent && (editingEvent._isRecurring || (editingEvent.recurrence && editingEvent.recurrence !== "none")) && !editRecurringMode && !showForm && (
            <div className="bg-amber-50/80 rounded-xl p-4 mb-4 border border-amber-200/60">
              <p className="text-sm font-semibold text-amber-800 mb-3">반복 일정입니다. 수정 범위를 선택하세요.</p>
              <div className="flex gap-2">
                <button onClick={() => chooseEditRecurringMode("this")} className={B2 + " !text-sm"}>이 일정만 수정</button>
                <button onClick={() => chooseEditRecurringMode("all")} className={B + " !text-sm"}>모든 반복 일정 수정</button>
                <button onClick={() => { setEditingEvent(null); setEditRecurringMode(null); }} className="text-sm text-slate-400 hover:text-slate-600 px-3">취소</button>
              </div>
            </div>
          )}

          {/* 일정 추가/편집 폼 */}
          {showForm && (
            <div className="bg-slate-50/80 rounded-xl p-4 mb-4 space-y-3 border border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-600">
                {editingEvent
                  ? editRecurringMode === "this" ? "이 일정만 수정" : editRecurringMode === "all" ? "모든 반복 일정 수정" : "일정 수정"
                  : "새 일정"}
              </h4>
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
              {/* Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">반복</label>
                  <select className={I} value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value as Recurrence })}>
                    {RECURRENCE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {form.recurrence !== "none" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">종료일 (선택)</label>
                    <input type="date" className={I} value={form.recurrence_end} onChange={e => setForm({ ...form, recurrence_end: e.target.value })} />
                  </div>
                )}
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
                <button onClick={saveEvent} className={B}>{editingEvent ? "수정 완료" : "저장"}</button>
                <button onClick={() => { setShowForm(false); setEditingEvent(null); setEditRecurringMode(null); }} className={B2}>취소</button>
              </div>
            </div>
          )}

          {/* Delete recurring modal */}
          {pendingDeleteEvent && (
            <div className="bg-red-50/80 rounded-xl p-4 mb-4 border border-red-200/60">
              <p className="text-sm font-semibold text-red-800 mb-3">반복 일정입니다. 삭제 범위를 선택하세요.</p>
              <div className="flex gap-2">
                <button onClick={() => confirmDeleteRecurring("this")} className={B2 + " !text-sm"}>이 일정만 삭제</button>
                <button onClick={() => confirmDeleteRecurring("all")} className="rounded-2xl bg-red-500 text-white font-semibold px-5 py-2.5 text-sm hover:bg-red-600 transition-all">모든 반복 일정 삭제</button>
                <button onClick={() => { setPendingDeleteEvent(null); setDeleteRecurringMode(null); }} className="text-sm text-slate-400 hover:text-slate-600 px-3">취소</button>
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
          {selectedEvents.map((e, idx) => (
            <div key={`${e.eventType ?? "cal"}-${e.id}-${idx}`} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <span className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${colorBg(e.color)}`} />
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { if (!e.eventType || e.eventType === "calendar") openEditEvent(e); }}>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-800">
                    {(e._isRecurring || (e.recurrence && e.recurrence !== "none")) ? "🔄 " : ""}{e.title}
                  </p>
                  {e.eventType === "booking" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-semibold">예약</span>}
                  {e.eventType === "shift" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold">근무</span>}
                  {e.recurrence && e.recurrence !== "none" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold">{recurrenceLabel(e.recurrence)}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {e.date}{e.end_date && e.end_date !== e.date ? ` ~ ${e.end_date}` : ""}
                  {e.author && ` · ${displayName(e.author)}`}
                </p>
                {e.memo && <p className="text-xs text-slate-500 mt-0.5">{e.memo}</p>}
              </div>
              {(!e.eventType || e.eventType === "calendar") && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEditEvent(e)} className="text-xs text-slate-400 hover:text-[#3182F6]">수정</button>
                  <button onClick={() => delEvent(e)} className="text-xs text-slate-300 hover:text-red-500">삭제</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
