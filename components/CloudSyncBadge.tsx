"use client";

import type { SyncStatus } from "@/lib/useCloudSync";

const STATUS_MAP: Record<SyncStatus, { label: string; bg: string; text: string; icon: string }> = {
  idle:    { label: "",         bg: "",                    text: "",              icon: "" },
  saving:  { label: "저장 중…", bg: "bg-blue-50",          text: "text-blue-600", icon: "⏳" },
  saved:   { label: "저장 완료", bg: "bg-emerald-50",      text: "text-emerald-600", icon: "☁️" },
  offline: { label: "오프라인",  bg: "bg-slate-100",        text: "text-slate-500", icon: "📴" },
  error:   { label: "저장 실패", bg: "bg-red-50",           text: "text-red-500",  icon: "⚠️" },
};

export default function CloudSyncBadge({
  status,
  userId,
  onRetry,
}: {
  status: SyncStatus;
  userId: string | null;
  onRetry?: () => void;
}) {
  if (status === "idle" && !userId) {
    return (
      <span role="status" className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
        📱 로컬 저장 · <a href="/login" className="underline underline-offset-2 hover:text-amber-700">로그인하면 클라우드 동기화</a>
      </span>
    );
  }
  if (status === "idle") {
    // 로그인 상태에서 idle이면 클라우드 연결 표시
    return (
      <span role="status" aria-live="polite" className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
        ☁️ 클라우드 연결됨
      </span>
    );
  }

  const s = STATUS_MAP[status];

  if (status === "error") {
    return (
      <span role="status" aria-live="assertive" className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-200 transition-all">
        ⚠️ 동기화 실패
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-1 px-1.5 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold transition"
          >
            재시도
          </button>
        )}
      </span>
    );
  }

  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg ${s.bg} ${s.text} transition-all`}>
      {s.icon} {s.label}
    </span>
  );
}
