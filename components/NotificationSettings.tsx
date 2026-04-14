"use client";
import { useState } from "react";
import Toggle from "@/components/Toggle";

export default function NotificationSettings() {
  const [taxReminder, setTaxReminder] = useState(true);
  const [salesReminder, setSalesReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("vela-notifications", JSON.stringify({ taxReminder, salesReminder, weeklyReport }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">🔔 알림 설정</h3>
        <p className="text-xs text-slate-400 mt-0.5">이메일 및 카카오 알림 수신을 관리합니다</p>
      </div>

      {[
        { label: "세금 마감 리마인더", desc: "신고 마감일 D-7, D-3, D-1 알림", state: taxReminder, setter: setTaxReminder },
        { label: "매출 기록 리마인더", desc: "매월 매출 등록 안내", state: salesReminder, setter: setSalesReminder },
        { label: "주간 경영 리포트", desc: "매주 월요일 AI 경영 분석 요약", state: weeklyReport, setter: setWeeklyReport },
      ].map(item => (
        <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
          <div>
            <p className="text-xs font-semibold text-slate-700">{item.label}</p>
            <p className="text-[11px] text-slate-400">{item.desc}</p>
          </div>
          <Toggle checked={item.state} onChange={item.setter} label={item.label} />
        </div>
      ))}

      <div className="flex items-center gap-2 pt-2">
        <button onClick={handleSave} className="rounded-xl bg-slate-900 text-white font-semibold px-4 py-2 text-xs hover:bg-slate-800 transition">
          저장
        </button>
        {saved && <span className="text-xs text-emerald-600 font-semibold">✓ 저장됨</span>}
        <span className="text-[10px] text-slate-400 ml-auto">카카오 알림톡 연동 — Coming Soon</span>
      </div>
    </div>
  );
}
