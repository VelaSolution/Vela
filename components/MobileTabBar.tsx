"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

const TABS_LOGGED_IN = [
  { href: "/home", icon: "🏠", label: "홈" },
  { href: "/simulator", icon: "📊", label: "시뮬레이터" },
  { href: "/tools", icon: "🛠️", label: "도구" },
  { href: "/tools/cashbook", icon: "📒", label: "가계부" },
  { href: "/dashboard", icon: "📈", label: "대시보드" },
  { href: "/profile", icon: "👤", label: "내 정보" },
];

const TABS_LOGGED_OUT = [
  { href: "/", icon: "🏠", label: "홈" },
  { href: "/simulator", icon: "📊", label: "시뮬레이터" },
  { href: "/tools", icon: "🛠️", label: "도구" },
  { href: "/guide", icon: "📖", label: "가이드" },
  { href: "/login", icon: "🔑", label: "로그인" },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHqMember, setIsHqMember] = useState(false);
  const [open, setOpen] = useState(false);

  const isHidden = pathname?.startsWith("/hq") || pathname?.startsWith("/game") ||
    pathname?.startsWith("/login") || pathname?.startsWith("/signup") ||
    pathname?.startsWith("/reset-password");

  useEffect(() => {
    if (isHidden) return;
    (async () => {
      try {
        const sb = createSupabaseBrowserClient();
        if (!sb) return;
        const { data: { user } } = await sb.auth.getUser();
        if (!user?.email) return;
        setIsLoggedIn(true);

        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").split(",").map(e => e.trim().toLowerCase());
        if (adminEmails.includes(user.email.toLowerCase())) { setIsHqMember(true); return; }

        const { data: td } = await sb.from("hq_team").select("email, approved");
        if (td) {
          const email = user.email.trim().toLowerCase();
          const found = td.find((t: any) => (t.email ?? "").trim().toLowerCase() === email && t.approved !== false);
          if (found) setIsHqMember(true);
        }
      } catch {}
    })();
  }, [isHidden]);

  if (isHidden) return null;

  const baseTabs = isLoggedIn ? TABS_LOGGED_IN : TABS_LOGGED_OUT;
  const tabs = isHqMember
    ? [...baseTabs.slice(0, 3), { href: "/hq", icon: "⚓", label: "Bridge" }, ...baseTabs.slice(3)]
    : baseTabs;

  // 현재 활성 탭
  const activeTab = tabs.find(t =>
    t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)
  );

  return (
    <div className="md:hidden">
      {/* 열린 상태: 메뉴 패널 */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 right-5 flex flex-col-reverse items-end gap-2"
            style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
          >
            {tabs.map(tab => {
              const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lg transition-all ${
                    isActive
                      ? "bg-[#3182F6] text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200"
                  }`}
                  style={{ animation: "slideUp 0.15s ease-out" }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm font-semibold">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* FAB 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed z-50 right-5 w-14 h-14 rounded-full bg-[#3182F6] text-white shadow-xl shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-all"
        style={{ bottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
        aria-label="내비게이션 메뉴"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4l12 12M16 4L4 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <span className="text-xl">{activeTab?.icon ?? "🏠"}</span>
        )}
      </button>
    </div>
  );
}
