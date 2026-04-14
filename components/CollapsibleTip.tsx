"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleTipProps {
  children: ReactNode;
  /** Extra class names on the outer wrapper (e.g. "mt-6", "no-print") */
  className?: string;
}

export default function CollapsibleTip({ children, className = "" }: CollapsibleTipProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-2xl bg-slate-100 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          💡 맞춤 경영팁
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-4 text-xs text-slate-500 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
