"use client";

import { useState, useEffect } from "react";
import Toggle from "@/components/Toggle";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = (v: boolean) => {
    setIsDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("vela-theme", v ? "dark" : "light");
  };

  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">🌙 다크 모드</h3>
          <p className="text-xs text-slate-400 mt-0.5">화면 테마를 변경합니다</p>
        </div>
        <Toggle checked={isDark} onChange={toggle} label="다크 모드" />
      </div>
    </div>
  );
}
