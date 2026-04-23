"use client";
import { useState, useEffect, useCallback } from "react";
import type { HQRole } from "@/app/hq/types";
import { sb, I, C, B2, BADGE, useTeamDisplayNames } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

type AuditEntry = {
  id: string;
  type: string;
  icon: string;
  description: string;
  author: string;
  createdAt: string;
  detail?: string;
  browser?: string;
  ip?: string;
};

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  "로그인": { icon: "🔑", label: "로그인", color: "bg-indigo-50 text-indigo-700" },
  "태스크 생성": { icon: "✅", label: "태스크", color: "bg-blue-50 text-blue-700" },
  "결재 요청": { icon: "📋", label: "결재", color: "bg-amber-50 text-amber-700" },
  "결재 승인": { icon: "✔️", label: "승인", color: "bg-emerald-50 text-emerald-700" },
  "결재 반려": { icon: "❌", label: "반려", color: "bg-red-50 text-red-700" },
  "공지 등록": { icon: "📢", label: "공지", color: "bg-emerald-50 text-emerald-700" },
  "피드백 등록": { icon: "🐛", label: "피드백", color: "bg-purple-50 text-purple-700" },
  "의사결정 등록": { icon: "⚖️", label: "의사결정", color: "bg-slate-100 text-slate-700" },
  "휴가 신청": { icon: "🏖️", label: "휴가", color: "bg-orange-50 text-orange-700" },
  "팀원 변경": { icon: "👥", label: "팀원", color: "bg-teal-50 text-teal-700" },
  "문서 생성": { icon: "📄", label: "문서", color: "bg-cyan-50 text-cyan-700" },
  "증명서 발급": { icon: "📜", label: "증명서", color: "bg-pink-50 text-pink-700" },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "방금";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function getBrowserInfo(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} / ${os}`;
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

/** Insert audit log entry to hq_audit_log table */
export async function insertAuditLog(opts: {
  userName: string;
  action: string;
  detail?: string;
}) {
  const s = sb();
  if (!s) return;
  const browser = getBrowserInfo();
  await s.from("hq_audit_log").insert({
    user_name: opts.userName,
    action: opts.action,
    detail: opts.detail ?? "",
    browser: browser,
    ip: "",
    created_at: new Date().toISOString(),
  }).then(() => {});
}

export default function AuditLog({ userId, userName, myRole, flash }: Props) {
  const { displayName } = useTeamDisplayNames();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("전체");
  const [filterUser, setFilterUser] = useState<string>("전체");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [userNames, setUserNames] = useState<string[]>([]);
  const [loginLogged, setLoginLogged] = useState(false);

  // Log login event on first load
  useEffect(() => {
    if (!loginLogged && userName) {
      insertAuditLog({
        userName,
        action: "로그인",
        detail: `HQ 접속 (${getBrowserInfo()})`,
      });
      setLoginLogged(true);
    }
  }, [userName, loginLogged]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    const s = sb();
    if (!s) { setLoading(false); return; }

    try {
      const [tasks, approvals, notices, feedback, decisions, leaves, auditLogs] = await Promise.all([
        s.from("hq_tasks").select("id, created_at, title").order("created_at", { ascending: false }).limit(50),
        s.from("hq_approvals").select("id, created_at, title, author, status").order("created_at", { ascending: false }).limit(50),
        s.from("hq_notices").select("id, created_at, title, author").order("created_at", { ascending: false }).limit(50),
        s.from("hq_feedback").select("id, created_at, title, author").order("created_at", { ascending: false }).limit(50),
        s.from("hq_decisions").select("id, created_at, title").order("created_at", { ascending: false }).limit(50),
        s.from("hq_leave").select("id, created_at, requester, type").order("created_at", { ascending: false }).limit(50),
        s.from("hq_audit_log").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      const all: AuditEntry[] = [];

      // Audit log entries (login, key actions)
      (auditLogs.data ?? []).forEach((r: any) => {
        const cfg = TYPE_CONFIG[r.action];
        all.push({
          id: `audit-${r.id}`,
          type: r.action,
          icon: cfg?.icon ?? "📝",
          description: r.detail || r.action,
          author: r.user_name || "",
          createdAt: r.created_at,
          detail: r.detail || "",
          browser: r.browser || "",
          ip: r.ip || "",
        });
      });

      (tasks.data ?? []).forEach((r: any) => all.push({
        id: `task-${r.id}`, type: "태스크 생성", icon: "✅",
        description: r.title || "새 태스크", author: "", createdAt: r.created_at,
      }));
      (approvals.data ?? []).forEach((r: any) => {
        all.push({
          id: `appr-${r.id}`, type: "결재 요청", icon: "📋",
          description: r.title || "결재 요청", author: r.author || "", createdAt: r.created_at,
        });
      });
      (notices.data ?? []).forEach((r: any) => all.push({
        id: `notice-${r.id}`, type: "공지 등록", icon: "📢",
        description: r.title || "새 공지", author: r.author || "", createdAt: r.created_at,
      }));
      (feedback.data ?? []).forEach((r: any) => all.push({
        id: `fb-${r.id}`, type: "피드백 등록", icon: "🐛",
        description: r.title || "피드백", author: r.author || "", createdAt: r.created_at,
      }));
      (decisions.data ?? []).forEach((r: any) => all.push({
        id: `dec-${r.id}`, type: "의사결정 등록", icon: "⚖️",
        description: r.title || "의사결정", author: "", createdAt: r.created_at,
      }));
      (leaves.data ?? []).forEach((r: any) => all.push({
        id: `leave-${r.id}`, type: "휴가 신청", icon: "🏖️",
        description: `${r.requester || ""}님 ${r.type || "휴가"} 신청`, author: r.requester || "", createdAt: r.created_at,
      }));

      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Collect unique user names
      const names = new Set<string>();
      all.forEach(e => { if (e.author) names.add(e.author); });
      setUserNames(Array.from(names).sort());

      setEntries(all.slice(0, 200));
    } catch (e) {
      flash("활동 로그 로드 실패");
    }
    setLoading(false);
  }, [flash]);

  const types = ["전체", ...Object.keys(TYPE_CONFIG)];

  const filtered = entries.filter(e => {
    if (filterType !== "전체" && e.type !== filterType) return false;
    if (filterUser !== "전체" && e.author !== filterUser) return false;
    if (filterDateFrom) {
      const entryDate = new Date(e.createdAt).toISOString().slice(0, 10);
      if (entryDate < filterDateFrom) return false;
    }
    if (filterDateTo) {
      const entryDate = new Date(e.createdAt).toISOString().slice(0, 10);
      if (entryDate > filterDateTo) return false;
    }
    return true;
  });

  function exportCSV() {
    const header = "시간,사용자,유형,설명,브라우저,IP";
    const rows = filtered.map(e => {
      const time = formatDateFull(e.createdAt);
      const user = e.author || "-";
      const type = e.type;
      const desc = `"${(e.description || "").replace(/"/g, '""')}"`;
      const browser = e.browser || "-";
      const ip = e.ip || "-";
      return `${time},${user},${type},${desc},${browser},${ip}`;
    });
    const csv = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash("CSV 내보내기 완료");
  }

  if (loading) return <p className="text-center text-sm text-slate-400 py-12">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">관리자 접근 로그</h2>
        <button className={B2} onClick={exportCSV}>CSV 내보내기</button>
      </div>

      {/* Filters */}
      <div className={C}>
        <div className="space-y-4">
          {/* Type filter */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">유형 필터</p>
            <div className="flex flex-wrap gap-1.5">
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    filterType === t ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {t === "전체" ? "전체" : `${TYPE_CONFIG[t]?.icon} ${TYPE_CONFIG[t]?.label}`}
                </button>
              ))}
            </div>
          </div>

          {/* User + Date filters */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <p className="text-xs font-semibold text-slate-500 mb-2">사용자</p>
              <select className={`${I} !py-2 !text-sm`} value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                <option value="전체">전체</option>
                {userNames.map(n => (
                  <option key={n} value={n}>{displayName(n)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <p className="text-xs font-semibold text-slate-500 mb-2">시작일</p>
              <input type="date" className={`${I} !py-2 !text-sm`}
                value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[150px]">
              <p className="text-xs font-semibold text-slate-500 mb-2">종료일</p>
              <input type="date" className={`${I} !py-2 !text-sm`}
                value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
            </div>
            <button className={`${B2} !py-2 text-sm`}
              onClick={() => { setFilterType("전체"); setFilterUser("전체"); setFilterDateFrom(""); setFilterDateTo(""); }}>
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* Log count */}
      <p className="text-xs text-slate-400 text-right">{filtered.length}건 표시</p>

      {/* Timeline */}
      <div className={C}>
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">활동 내역이 없습니다</p>
        ) : (
          <div className="space-y-1">
            {filtered.map((entry) => {
              const cfg = TYPE_CONFIG[entry.type];
              return (
                <div key={entry.id} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-base">
                    {entry.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold ${cfg?.color ?? "bg-slate-100 text-slate-600"}`}>
                        {entry.type}
                      </span>
                      {entry.author && (
                        <span className="text-[11px] text-slate-400 font-medium">{displayName(entry.author)}</span>
                      )}
                      {entry.browser && (
                        <span className="text-[10px] text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded font-mono">
                          {entry.browser}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 font-medium truncate">{entry.description}</p>
                    {entry.ip && (
                      <p className="text-[10px] text-slate-300 mt-0.5">IP: {entry.ip}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {relativeTime(entry.createdAt)}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">
                      {formatDateFull(entry.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
