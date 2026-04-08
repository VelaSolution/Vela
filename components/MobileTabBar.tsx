"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", icon: "🏠", label: "홈" },
  { href: "/simulator", icon: "📊", label: "시뮬레이터" },
  { href: "/tools", icon: "🛠️", label: "도구" },
  { href: "/dashboard", icon: "📈", label: "대시보드" },
  { href: "/profile", icon: "👤", label: "내 정보" },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  // 도구 페이지에서는 ToolNav 탭바가 대신 보이므로 숨김
  if (pathname.startsWith("/tools/") && pathname !== "/tools") return null;
  // 게임에서는 숨김
  if (pathname.startsWith("/game")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-12">
        {TABS.map(tab => {
          const isActive = tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
