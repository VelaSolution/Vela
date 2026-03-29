"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        .vela-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:64px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid #E5E8EB;display:flex;align-items:center}
        .vela-nav-inner{max-width:1200px;margin:0 auto;padding:0 24px;width:100%;display:flex;align-items:center;justify-content:space-between}
        .vela-nav-logo{font-size:20px;font-weight:800;color:#191F28;text-decoration:none;letter-spacing:-0.02em}
        .vela-nav-logo span{color:#3182F6}
        .vela-nav-links{display:flex;align-items:center;gap:32px}
        .vela-nav-links a{font-size:15px;font-weight:500;color:#6B7684;text-decoration:none;transition:color .15s}
        .vela-nav-links a:hover{color:#191F28}
        .vela-dropdown{position:relative}
        .vela-dropdown-btn{font-size:15px;font-weight:500;color:#6B7684;background:none;border:none;cursor:pointer;font-family:inherit;transition:color .15s;padding:0}
        .vela-dropdown-btn:hover{color:#191F28}
        .vela-dropdown-menu{display:none;position:absolute;top:calc(100% + 16px);left:50%;transform:translateX(-50%);background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.12);border:1px solid #E5E8EB;padding:16px;width:560px;z-index:200;display:none;grid-template-columns:1fr 1fr 1fr;gap:0}
        .vela-dropdown:hover .vela-dropdown-menu{display:grid}
        .vela-dropdown-section{padding:8px 12px;border-right:1px solid #F2F4F6}
        .vela-dropdown-section:last-of-type{border-right:none}
        .vela-dropdown-label{display:block;font-size:11px;font-weight:700;color:#9EA6B3;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;padding:0 4px}
        .vela-dropdown-item{display:block;font-size:13px;color:#333D4B;text-decoration:none;padding:6px 4px;border-radius:8px;transition:background .12s,color .12s;white-space:nowrap}
        .vela-dropdown-item:hover{background:#F2F4F6;color:#191F28}
        .vela-dropdown-footer{grid-column:1/-1;border-top:1px solid #F2F4F6;padding:10px 12px 4px;margin-top:4px}
        .vela-dropdown-all{font-size:13px;font-weight:600;color:#3182F6;text-decoration:none}
        .vela-dropdown-all:hover{text-decoration:underline}
        .vela-nav-actions{display:flex;align-items:center;gap:12px}
        .vela-btn-login{font-size:15px;font-weight:600;color:#6B7684;text-decoration:none;transition:color .15s}
        .vela-btn-login:hover{color:#191F28}
        .vela-btn-start{background:#3182F6;color:#fff;padding:9px 20px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;transition:background .15s}
        .vela-btn-start:hover{background:#1B64DA}
        .vela-btn-logout{background:none;border:1px solid #E5E8EB;color:#6B7684;padding:8px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
        .vela-btn-logout:hover{border-color:#333D4B;color:#191F28}
        .vela-user-name{font-size:14px;font-weight:600;color:#333D4B}
        .vela-hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:none}
        .vela-hamburger span{display:block;width:22px;height:2px;background:#333D4B;border-radius:2px;transition:all .2s}
        .vela-mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;background:#fff;border-bottom:1px solid #E5E8EB;padding:16px 24px;flex-direction:column;gap:4px;z-index:99}
        .vela-mobile-menu.open{display:flex}
        .vela-mobile-link{font-size:15px;font-weight:500;color:#333D4B;text-decoration:none;padding:12px 0;border-bottom:1px solid #F2F4F6}
        @media(max-width:768px){
          .vela-nav-links,.vela-nav-actions{display:none}
          .vela-hamburger{display:flex}
        }
      `}</style>

      <nav className="vela-nav">
        <div className="vela-nav-inner">
          <Link href="/" className="vela-nav-logo">VELA<span>.</span></Link>

          <div className="vela-nav-links">
            <a href="/#features">서비스</a>
            <Link href="/pricing">요금제</Link>
            <div className="vela-dropdown">
              <button className="vela-dropdown-btn">도구 모음 ▾</button>
              <div className="vela-dropdown-menu">
                <div className="vela-dropdown-section">
                  <span className="vela-dropdown-label">💰 재무·수익</span>
                  <Link href="/tools/menu-cost" className="vela-dropdown-item">🧮 메뉴별 원가 계산기</Link>
                  <Link href="/tools/labor" className="vela-dropdown-item">👥 인건비 스케줄러</Link>
                  <Link href="/tools/tax" className="vela-dropdown-item">🧾 세금 계산기</Link>
                  <Link href="/tools/pl-report" className="vela-dropdown-item">📄 손익계산서 PDF</Link>
                </div>
                <div className="vela-dropdown-section">
                  <span className="vela-dropdown-label">🚀 창업·운영</span>
                  <Link href="/tools/startup-checklist" className="vela-dropdown-item">✅ 창업 체크리스트</Link>
                  <Link href="/tools/area-analysis" className="vela-dropdown-item">🗺️ 상권 분석 도우미</Link>
                  <Link href="/dashboard" className="vela-dropdown-item">📊 월별 매출 현황</Link>
                  <Link href="/monthly-input" className="vela-dropdown-item">📝 이번 달 입력</Link>
                </div>
                <div className="vela-dropdown-section">
                  <span className="vela-dropdown-label">📣 AI 마케팅</span>
                  <Link href="/tools/sns-content" className="vela-dropdown-item">📱 SNS 콘텐츠 생성기</Link>
                  <Link href="/tools/review-reply" className="vela-dropdown-item">💬 리뷰 답변 생성기</Link>
                </div>
                <div className="vela-dropdown-footer">
                  <Link href="/tools" className="vela-dropdown-all">전체 도구 보기 →</Link>
                </div>
              </div>
            </div>
            <a href="/#contact">문의</a>
          </div>

          <div className="vela-nav-actions">
            {user ? (
              <>
                <span className="vela-user-name">{user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "내 계정"}</span>
                <Link href="/profile" className="vela-btn-login">히스토리</Link>
                <Link href="/simulator" className="vela-btn-start">시뮬레이터 →</Link>
                <button className="vela-btn-logout" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/login" className="vela-btn-login">로그인</Link>
                <Link href="/signup" className="vela-btn-start">무료 시작</Link>
              </>
            )}
          </div>

          <button className="vela-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <div className={`vela-mobile-menu${menuOpen ? " open" : ""}`}>
        <a href="/#features" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>서비스</a>
        <Link href="/pricing" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>요금제</Link>
        <Link href="/tools" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>🛠️ 도구 모음</Link>
        <Link href="/tools/menu-cost" className="vela-mobile-link" style={{ paddingLeft: 20, fontSize: 14, color: "#6B7684" }} onClick={() => setMenuOpen(false)}>🧮 원가 계산기</Link>
        <Link href="/tools/tax" className="vela-mobile-link" style={{ paddingLeft: 20, fontSize: 14, color: "#6B7684" }} onClick={() => setMenuOpen(false)}>🧾 세금 계산기</Link>
        <Link href="/tools/sns-content" className="vela-mobile-link" style={{ paddingLeft: 20, fontSize: 14, color: "#6B7684" }} onClick={() => setMenuOpen(false)}>📱 SNS 생성기</Link>
        <a href="/#contact" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>문의</a>
        {user ? (
          <>
            <Link href="/simulator" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>시뮬레이터</Link>
            <Link href="/profile" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>내 히스토리</Link>
            <button className="vela-mobile-link" style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }} onClick={() => { handleLogout(); setMenuOpen(false); }}>로그아웃</button>
          </>
        ) : (
          <>
            <Link href="/login" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>로그인</Link>
            <Link href="/signup" className="vela-mobile-link" onClick={() => setMenuOpen(false)}>무료 시작</Link>
          </>
        )}
      </div>
    </>
  );
}
