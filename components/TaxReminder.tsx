"use client";
import { useState, useEffect } from "react";

const TAX_DEADLINES = [
  { month: 1, day: 25, name: "부가세 확정신고", target: "공통" },
  { month: 2, day: 10, name: "사업장현황신고", target: "면세사업자" },
  { month: 3, day: 31, name: "법인세 신고", target: "법인" },
  { month: 4, day: 25, name: "부가세 예정신고", target: "법인" },
  { month: 5, day: 31, name: "종합소득세 신고", target: "개인" },
  { month: 6, day: 30, name: "성실신고 확인대상 소득세", target: "개인" },
  { month: 7, day: 25, name: "부가세 확정신고", target: "공통" },
  { month: 8, day: 31, name: "주민세 사업소분", target: "공통" },
  { month: 10, day: 25, name: "부가세 예정신고", target: "법인" },
  { month: 11, day: 30, name: "종합소득세 중간예납", target: "개인" },
];

export default function TaxReminder() {
  const [dismissed, setDismissed] = useState(false);
  const [upcoming, setUpcoming] = useState<typeof TAX_DEADLINES[0] | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const dismissKey = `vela-tax-dismiss-${new Date().toISOString().slice(0, 7)}`;
    if (localStorage.getItem(dismissKey)) { setDismissed(true); return; }

    const now = new Date();
    const thisYear = now.getFullYear();

    // Find next upcoming deadline within 14 days
    for (const dl of TAX_DEADLINES) {
      const deadline = new Date(thisYear, dl.month - 1, dl.day);
      if (deadline < now) deadline.setFullYear(thisYear + 1);
      const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 14) {
        setUpcoming(dl);
        setDaysLeft(diff);
        break;
      }
    }
  }, []);

  if (dismissed || !upcoming) return null;

  const dismissKey = `vela-tax-dismiss-${new Date().toISOString().slice(0, 7)}`;
  const urgency = daysLeft <= 3 ? "bg-red-50 border-red-200 text-red-700" : daysLeft <= 7 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 text-sm ${urgency}`}>
      <span className="text-lg">🧾</span>
      <div className="flex-1">
        <span className="font-bold">{upcoming.name}</span>
        <span className="ml-2 opacity-70">D-{daysLeft} ({upcoming.month}/{upcoming.day})</span>
        <span className="ml-2 text-xs opacity-60">{upcoming.target}</span>
      </div>
      <a href="/tools/tax-guide" className="text-xs font-semibold underline">세무 가이드 →</a>
      <button onClick={() => { setDismissed(true); localStorage.setItem(dismissKey, "1"); }} className="text-xs opacity-50 hover:opacity-100">✕</button>
    </div>
  );
}
