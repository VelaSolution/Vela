"use client";
import { useState, useEffect } from "react";
import type { Tab } from "@/app/hq/types";

interface Props {
  loading: boolean;
  todayAttendance: { clockIn: string; clockOut: string } | null;
  onClockIn: () => void;
  onNavigate: (tab: Tab) => void;
}

function WorkTimer({ clockIn }: { clockIn: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const calcElapsed = () => {
      const [h, m] = clockIn.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) { setElapsed("--:--:--"); return; }
      const start = new Date(); start.setHours(h, m, 0, 0);
      const now = new Date();
      let diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      if (diff < 0) diff += 86400;
      const hh = String(Math.floor(diff / 3600)).padStart(2, "0");
      const mm = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const ss = String(diff % 60).padStart(2, "0");
      setElapsed(`${hh}:${mm}:${ss}`);
    };
    calcElapsed();
    const id = setInterval(calcElapsed, 1000);
    return () => clearInterval(id);
  }, [clockIn]);

  return <span className="font-mono text-2xl font-bold tabular-nums">{elapsed}</span>;
}

export default function AttendanceBanner({ loading, todayAttendance, onClockIn, onNavigate }: Props) {
  if (loading) return null;

  // 미출근
  if (!todayAttendance) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3182F6] to-[#7C3AED] p-5 text-white shadow-lg shadow-[#3182F6]/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-[5rem]" />
        <div className="flex items-center justify-between gap-4 relative">
          <div>
            <p className="text-xs text-white/60 font-semibold mb-1">출근 대기</p>
            <h3 className="text-lg font-bold">출근 버튼을 눌러주세요</h3>
            <p className="text-sm text-white/60 mt-1">{new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}</p>
          </div>
          <button onClick={onClockIn} className="rounded-xl bg-white text-[#3182F6] font-bold px-6 py-3.5 text-sm hover:bg-white/90 active:scale-[0.97] transition-all flex-shrink-0 shadow-lg">
            출근하기
          </button>
        </div>
      </div>
    );
  }

  // 근무 중 — 실시간 카운터
  if (!todayAttendance.clockOut) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-lg shadow-emerald-500/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-[5rem]" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <p className="text-xs text-white/70 font-semibold">근무 중</p>
              </div>
              <WorkTimer clockIn={todayAttendance.clockIn} />
              <p className="text-xs text-white/60 mt-1.5">{todayAttendance.clockIn} 출근</p>
            </div>
            <button onClick={() => onNavigate("attendance")} className="rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold px-5 py-3 text-sm hover:bg-white/30 active:scale-[0.97] transition-all flex-shrink-0 ring-1 ring-white/30">
              퇴근하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 퇴근 완료
  const [h1, m1] = todayAttendance.clockIn.split(":").map(Number);
  const [h2, m2] = todayAttendance.clockOut.split(":").map(Number);
  let worked = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (worked < 0) worked += 1440;
  const wH = Math.floor(worked / 60);
  const wM = worked % 60;

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">✅</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">오늘 근무 완료</p>
            <p className="text-xs text-slate-400">{todayAttendance.clockIn} → {todayAttendance.clockOut}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">{wH}시간 {wM}분</p>
          <p className="text-[10px] text-slate-400">총 근무시간</p>
        </div>
      </div>
    </div>
  );
}
