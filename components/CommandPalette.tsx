"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const COMMANDS = [
  { label: "시뮬레이터", href: "/simulator", icon: "📊" },
  { label: "도구 목록", href: "/tools", icon: "🛠️" },
  { label: "메뉴 원가 계산기", href: "/tools/menu-cost", icon: "🧮" },
  { label: "인건비 스케줄러", href: "/tools/labor", icon: "👥" },
  { label: "세금 계산기", href: "/tools/tax", icon: "🧾" },
  { label: "사업계획서 도우미", href: "/tools/business-plan", icon: "📝" },
  { label: "정부 지원사업", href: "/tools/gov-support", icon: "🏛️" },
  { label: "법인 설립 가이드", href: "/tools/incorporation", icon: "🏢" },
  { label: "재무 시뮬레이션", href: "/tools/financial-sim", icon: "📈" },
  { label: "투자 유치 도구", href: "/tools/fundraising", icon: "💎" },
  { label: "세무·회계 가이드", href: "/tools/tax-guide", icon: "🧾" },
  { label: "인력 채용 도구", href: "/tools/hiring", icon: "👥" },
  { label: "SNS 콘텐츠 생성기", href: "/tools/sns-content", icon: "📱" },
  { label: "리뷰 답변 생성기", href: "/tools/review-reply", icon: "💬" },
  { label: "대시보드", href: "/dashboard", icon: "📊" },
  { label: "커뮤니티", href: "/community", icon: "💬" },
  { label: "게임", href: "/game", icon: "🎮" },
  { label: "가이드", href: "/guide", icon: "📖" },
  { label: "프로필", href: "/profile", icon: "👤" },
  { label: "가격", href: "/pricing", icon: "💰" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = query.trim()
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && filtered[selected]) { handleSelect(filtered[selected].href); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[20vh] bg-black/50" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <span className="text-slate-400">🔍</span>
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="페이지 검색... (도구, 기능)"
            className="flex-1 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400" />
          <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-8">검색 결과가 없습니다</p>}
          {filtered.map((cmd, i) => (
            <button key={cmd.href} onClick={() => handleSelect(cmd.href)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${i === selected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
              <span className="text-base">{cmd.icon}</span>
              <span className="font-medium">{cmd.label}</span>
              <span className="ml-auto text-xs text-slate-400">{cmd.href}</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-slate-100 flex gap-4 text-[10px] text-slate-400">
          <span>↑↓ 이동</span><span>↵ 열기</span><span>ESC 닫기</span>
        </div>
      </div>
    </div>
  );
}
