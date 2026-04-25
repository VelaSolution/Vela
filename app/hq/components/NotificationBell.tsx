"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { HQRole } from "@/app/hq/types";
import { sb, today, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  onNavigate: (tab: string) => void;
}

interface NotiRow {
  id: string;
  type: string;
  message: string;
  target_user: string;
  created_by: string;
  read: boolean;
  created_at: string;
}

type FilterType = "all" | "approval" | "expense" | "leave" | "chat" | "board" | "task" | "system";

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: "all", label: "전체", icon: "🔔" },
  { key: "approval", label: "결재", icon: "📋" },
  { key: "expense", label: "경비", icon: "💰" },
  { key: "leave", label: "휴가", icon: "🏖️" },
  { key: "task", label: "업무", icon: "✅" },
  { key: "chat", label: "메시지", icon: "💬" },
  { key: "board", label: "게시판", icon: "📢" },
  { key: "system", label: "시스템", icon: "⚙️" },
];

const TYPE_ICON: Record<string, string> = {
  approval: "📋", expense: "💰", leave: "🏖️", task: "✅",
  chat: "💬", dm: "✉️", board: "📢", notice: "📢",
  booking: "📅", kudos: "🎉", mail: "✉️", system: "⚙️",
  report: "📄", wiki: "📖", file: "📁", survey: "📊",
};

const TYPE_TAB: Record<string, string> = {
  approval: "approval", expense: "finance", leave: "attendance",
  task: "task", chat: "chat", dm: "chat", board: "board",
  notice: "board", booking: "resource", kudos: "board",
  mail: "mail", report: "approval", wiki: "docs", file: "docs",
  survey: "board", system: "dashboard",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return `${Math.floor(d / 30)}개월 전`;
}

function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (window.Notification.permission !== "granted") return;
  if (document.hasFocus()) return;
  try { new window.Notification(title, { body, icon: "/icon.svg", tag: `vela-${Date.now()}` }); } catch {}
}

export default function NotificationBell({ userId, userName, myRole, onNavigate }: Props) {
  const [notifications, setNotifications] = useState<NotiRow[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [pushEnabled, setPushEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // 브라우저 알림 권한
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (window.Notification.permission === "granted") { setPushEnabled(true); return; }
    if (window.Notification.permission === "default") {
      window.Notification.requestPermission().then(p => setPushEnabled(p === "granted"));
    }
  }, []);

  // ── 알림 로드 (hq_notifications 단일 소스) ──
  const fetchNotifications = useCallback(async () => {
    const s = sb();
    if (!s) return;
    const { data } = await s
      .from("hq_notifications")
      .select("*")
      .eq("target_user", userName)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) {
      const rows = data as NotiRow[];
      // 새 알림이 왔으면 브라우저 알림
      const unreadCount = rows.filter(n => !n.read).length;
      if (unreadCount > prevCountRef.current && prevCountRef.current > 0) {
        const newest = rows.find(n => !n.read);
        if (newest) sendBrowserNotification("VELA Bridge", newest.message);
      }
      prevCountRef.current = unreadCount;
      setNotifications(rows);
    }
  }, [userName]);

  // 주기적 새로고침 (30초)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Realtime: hq_notifications INSERT 감지
  useEffect(() => {
    const s = sb();
    if (!s) return;
    const channel = s
      .channel("noti_realtime")
      .on(
        "postgres_changes" as "system",
        { event: "INSERT", schema: "public", table: "hq_notifications", filter: `target_user=eq.${userName}` } as Record<string, string>,
        () => fetchNotifications(),
      )
      .subscribe();
    return () => { s.removeChannel(channel); };
  }, [fetchNotifications, userName]);

  // 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── 액션 ──
  const markAsRead = async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const s = sb();
    if (!s) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await s.from("hq_notifications").update({ read: true }).eq("target_user", userName).eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    if (!confirm("모든 알림을 삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_notifications").delete().eq("target_user", userName);
    setNotifications([]);
  };

  const handleClick = async (n: NotiRow) => {
    if (!n.read) await markAsRead(n.id);
    setOpen(false);
    onNavigate(TYPE_TAB[n.type] || "dashboard");
  };

  // ── 필터링 ──
  const filtered = filter === "all"
    ? notifications
    : notifications.filter(n => {
        if (filter === "system") return !["approval", "expense", "leave", "chat", "dm", "board", "task"].includes(n.type);
        if (filter === "chat") return n.type === "chat" || n.type === "dm" || n.type === "mail";
        if (filter === "board") return n.type === "board" || n.type === "notice" || n.type === "kudos" || n.type === "survey";
        return n.type === filter;
      });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-500 relative"
        title="알림"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-[calc(100vw-2rem)] sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">알림</h3>
                {unreadCount > 0 && <span className={`${BADGE} bg-red-50 text-red-600`}>{unreadCount}</span>}
                {pushEnabled && <span className="text-[10px] text-emerald-500 font-semibold">푸시 ON</span>}
              </div>
              <div className="flex items-center gap-2">
                {!pushEnabled && typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default" && (
                  <button onClick={() => window.Notification.requestPermission().then(p => setPushEnabled(p === "granted"))} className="text-[10px] text-slate-400 hover:text-[#3182F6] font-semibold">
                    푸시 허용
                  </button>
                )}
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#3182F6] font-semibold hover:underline">
                    모두 읽음
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 font-semibold">
                    전체 삭제
                  </button>
                )}
              </div>
            </div>
            {/* 카테고리 필터 */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    filter === f.key ? "bg-[#3182F6] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">
                {filter === "all" ? "알림이 없습니다" : "해당 알림이 없습니다"}
              </p>
            ) : (
              filtered.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition border-b border-slate-50/80 ${
                    n.read ? "opacity-50" : "bg-blue-50/30"
                  }`}
                >
                  <span className="text-base mt-0.5 flex-shrink-0">{TYPE_ICON[n.type] || "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] leading-snug ${n.read ? "text-slate-500" : "text-slate-800 font-semibold"}`}>{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-400">{timeAgo(n.created_at)}</span>
                      {n.created_by && <span className="text-[11px] text-slate-300">· {n.created_by}</span>}
                    </div>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-[#3182F6] mt-1.5 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
