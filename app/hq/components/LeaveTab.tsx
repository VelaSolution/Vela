"use client";
import { useState, useEffect } from "react";
import { HQRole, LeaveRequest } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const LEAVE_TYPES: LeaveRequest["type"][] = ["연차", "반차(오전)", "반차(오후)", "병가", "경조", "출장", "기타"];

const STATUS_STYLE: Record<string, string> = {
  "대기": "bg-amber-50 text-amber-700",
  "승인": "bg-emerald-50 text-emerald-700",
  "반려": "bg-red-50 text-red-700",
};

function calcDays(start: string, end: string, type: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1);
  if (type === "반차(오전)" || type === "반차(오후)") return diff * 0.5;
  return diff;
}

export default function LeaveTab({ userId, userName, myRole, flash }: Props) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [type, setType] = useState<LeaveRequest["type"]>("연차");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "mine" | "pending">("mine");

  useEffect(() => {
    (async () => {
      const s = sb();
      if (s) {
        try {
          const { data } = await s.from("hq_leave").select("*").order("created_at", { ascending: false });
          if (data && data.length >= 0) { setRequests(data as LeaveRequest[]); return; }
        } catch {}
      }
      try { const d = localStorage.getItem("vela-hq-leave"); if (d) setRequests(JSON.parse(d)); } catch {}
    })();
  }, []);

  const persist = (next: LeaveRequest[]) => { setRequests(next); localStorage.setItem("vela-hq-leave", JSON.stringify(next)); };

  const isManager = myRole === "팀장" || myRole === "이사" || myRole === "대표";

  // Remaining leave
  const year = new Date().getFullYear();
  const usedDays = requests
    .filter(r => r.requester === userName && r.status !== "반려" && r.startDate.startsWith(String(year)))
    .reduce((a, r) => a + r.days, 0);
  const totalLeave = 15;
  const remaining = totalLeave - usedDays;

  const days = calcDays(startDate, endDate, type);

  const submit = () => {
    if (!reason.trim()) { flash("사유를 입력하세요"); return; }
    if (days > remaining && (type === "연차" || type === "반차(오전)" || type === "반차(오후)")) {
      flash("잔여 연차가 부족합니다"); return;
    }
    const req: LeaveRequest = {
      id: crypto.randomUUID(),
      type,
      startDate,
      endDate,
      reason: reason.trim(),
      status: "대기",
      approver: "",
      requester: userName,
      days,
      date: today(),
    };
    persist([req, ...requests]);
    flash("휴가 신청이 완료되었습니다");
    setReason("");
    setStartDate(today());
    setEndDate(today());
    setType("연차");
    setShowForm(false);
  };

  const approve = (id: string) => {
    persist(requests.map(r => r.id === id ? { ...r, status: "승인" as const, approver: userName } : r));
    flash("승인 완료");
  };
  const reject = (id: string) => {
    persist(requests.map(r => r.id === id ? { ...r, status: "반려" as const, approver: userName } : r));
    flash("반려 완료");
  };

  const filtered = requests.filter(r => {
    if (filter === "mine") return r.requester === userName;
    if (filter === "pending") return r.status === "대기";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Remaining leave */}
      <div className={C}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">잔여 연차</h3>
          <button onClick={() => setShowForm(!showForm)} className={B}>
            {showForm ? "닫기" : "+ 휴가 신청"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-xs text-blue-600 font-semibold mb-1">총 연차</p>
            <p className="text-2xl font-bold text-blue-700">{totalLeave}일</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-4 text-center">
            <p className="text-xs text-orange-600 font-semibold mb-1">사용</p>
            <p className="text-2xl font-bold text-orange-700">{usedDays}일</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 text-center">
            <p className="text-xs text-emerald-600 font-semibold mb-1">잔여</p>
            <p className="text-2xl font-bold text-emerald-700">{remaining}일</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-[#3182F6] h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (usedDays / totalLeave) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">{((usedDays / totalLeave) * 100).toFixed(0)}% 사용</p>
        </div>
      </div>

      {/* Application form */}
      {showForm && (
        <div className={C}>
          <h3 className="text-sm font-bold text-slate-700 mb-4">휴가 신청</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={L}>휴가 종류</label>
              <select value={type} onChange={e => setType(e.target.value as LeaveRequest["type"])} className={I}>
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={L}>사용 일수</label>
              <div className="flex items-center h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-[#3182F6]">
                {days}일
              </div>
            </div>
            <div>
              <label className={L}>시작일</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={I} />
            </div>
            <div>
              <label className={L}>종료일</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={I} />
            </div>
            <div className="sm:col-span-2">
              <label className={L}>사유</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="휴가 사유를 입력하세요"
                rows={3}
                className={I}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className={B2}>취소</button>
            <button onClick={submit} className={B}>신청하기</button>
          </div>
        </div>
      )}

      {/* Filter & List */}
      <div className={C}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">신청 내역</h3>
          <div className="flex gap-1">
            {([["mine", "내 신청"], ["pending", "대기중"], ["all", "전체"]] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filter === k ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">신청 내역이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${BADGE} text-[11px] bg-blue-50 text-blue-600`}>{r.type}</span>
                    <span className={`${BADGE} text-[11px] ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                    {r.approver && <span className="text-[11px] text-slate-400">결재: {r.approver}</span>}
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    {r.requester} &middot; {r.startDate} ~ {r.endDate} ({r.days}일)
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.reason}</p>
                </div>
                {isManager && r.status === "대기" && r.requester !== userName && (
                  <div className="flex gap-2 ml-3 shrink-0">
                    <button onClick={() => approve(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors">
                      승인
                    </button>
                    <button onClick={() => reject(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors">
                      반려
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
