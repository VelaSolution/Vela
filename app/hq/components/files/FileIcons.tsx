import { fileCategory } from "./fileUtils";

/* ================================================================
   SVG Icon components
   ================================================================ */
export const IconFolder = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" fill="currentColor" opacity={0.15} />
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);
export const IconFolderOpen = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19h14a2 2 0 001.84-2.77L18 9H6l-2.84 7.23A2 2 0 005 19z" fill="currentColor" opacity={0.15} />
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);
export const IconGrid = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
export const IconList = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
export const IconChevronRight = () => (
  <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
export const IconUpload = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
export const IconPlus = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
export const IconCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
export const IconX = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function LargeFileIcon({ type, name }: { type: string; name: string }) {
  const cat = fileCategory(type, name);
  const colors: Record<string, string> = {
    "이미지": "from-pink-400 to-rose-500",
    "PDF": "from-red-400 to-red-600",
    "동영상": "from-violet-400 to-purple-600",
    "오디오": "from-green-400 to-emerald-600",
    "스프레드시트": "from-emerald-400 to-green-600",
    "문서": "from-blue-400 to-indigo-600",
    "텍스트": "from-slate-400 to-slate-600",
    "기타": "from-gray-400 to-gray-600",
  };
  const icons: Record<string, string> = {
    "이미지": "🖼️", "PDF": "📄", "동영상": "🎬", "오디오": "🎵",
    "스프레드시트": "📊", "문서": "📝", "텍스트": "📃", "기타": "📎",
  };
  const ext = name.includes(".") ? name.split(".").pop()?.toUpperCase() || "" : "";
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[cat] || colors["기타"]} flex items-center justify-center shadow-sm relative`}>
      <span className="text-2xl">{icons[cat] || "📎"}</span>
      {ext && <span className="absolute -bottom-1 -right-1 bg-white text-[8px] font-bold text-slate-500 px-1 rounded shadow-sm border border-slate-100 leading-tight">{ext.slice(0, 4)}</span>}
    </div>
  );
}

export function LargeFolderIcon({ highlight }: { highlight?: boolean }) {
  return (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${highlight ? "bg-blue-100" : "bg-amber-50"}`}>
      <IconFolder className={`w-8 h-8 ${highlight ? "text-[#3182F6]" : "text-amber-400"}`} />
    </div>
  );
}
