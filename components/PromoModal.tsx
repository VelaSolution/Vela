"use client";

import Link from "next/link";
import { useModalDismiss } from "@/lib/useModalDismiss";

export default function PromoModal() {
  const { show, dismiss, dismissToday } = useModalDismiss(
    "vela-promo-dismissed", "launch-2026-04", "vela-promo-today", 500
  );

  if (!show) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", padding: 16 }}
      onClick={dismissToday}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          border: "1px solid #E5E8EB",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: 420,
          animation: "promoIn 0.3s ease-out",
        }}
      >
        {/* 장식 */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: "radial-gradient(circle,rgba(49,130,246,0.08),transparent)", borderRadius: "0 0 0 120px" }} />

        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#191F28" }}>🎉 출시 기념 이벤트</span>
          </div>
          <button
            onClick={dismissToday}
            aria-label="닫기"
            style={{ fontSize: 11, color: "#9EA6B3", background: "#F2F4F6", padding: "3px 10px", borderRadius: 100, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            닫기
          </button>
        </div>

        {/* 타이틀 */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.4, margin: 0 }}>
            스탠다드 플랜<br />
            <span style={{ color: "#3182F6" }}>1개월 무료</span>
          </h2>
          <p style={{ fontSize: 13, color: "#6B7684", marginTop: 8 }}>회원가입만 하면 자동 적용</p>
        </div>

        {/* 혜택 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {[
            "수익 시뮬레이터 무제한",
            "AI 브리핑 & 전략 추천",
            "AI 도구 (SNS / 리뷰 / 상권)",
            "POS 분석 / 손익계산서 PDF",
            "대시보드 / 월별 매출 관리",
          ].map((text) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#059669", flexShrink: 0 }}>
                ✓
              </span>
              <span style={{ fontSize: 14, color: "#333D4B", fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* 가격 영역 */}
        <div style={{ background: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#9EA6B3", fontWeight: 600 }}>정상가</span>
            <span style={{ fontSize: 14, color: "#9EA6B3", textDecoration: "line-through" }}>월 9,900원</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9EA6B3", fontWeight: 600 }}>이벤트 가격</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#059669", letterSpacing: -1 }}>0원</span>
          </div>
          <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: "#E5E8EB", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "#059669", width: "100%", transition: "width 0.3s" }} />
          </div>
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>100% 할인</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/signup"
          onClick={dismiss}
          style={{ display: "block", width: "100%", textAlign: "center", background: "#3182F6", color: "#fff", padding: "13px 0", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
        >
          무료로 시작하기 →
        </Link>

        <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#9EA6B3" }}>
          카드 등록 없이 시작 ·{" "}
          <button onClick={dismissToday} style={{ background: "none", border: "none", color: "#9EA6B3", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
            오늘 하루 안 보기
          </button>
        </p>
      </div>

      <style>{`
        @keyframes promoIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
