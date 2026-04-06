import { ImageResponse } from "next/og";
import { loadFont } from "../font";
export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 900, height: 1200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>

        <p style={{ fontSize: 52, fontWeight: 800, color: "#191F28", margin: 0 }}>외식업 사장님을 위한</p>
        <p style={{ fontSize: 52, fontWeight: 800, color: "#3182F6", margin: "12px 0 0" }}>숫자 경영 파트너</p>

        <p style={{ fontSize: 20, color: "#6B7684", marginTop: 28 }}>매출 · 원가 · 인건비 시뮬레이션 + AI 전략 추천</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 48, width: 700 }}>
          {["수익 시뮬레이터 무제한", "AI 브리핑 & 전략 추천", "배달앱 매출 분석", "카드매출 자동 수집", "인건비 계산기 (법정)", "리뷰 감정 분석 AI", "일일 매출 기록 + 패턴 분석"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #E5E8EB", borderRadius: 14, padding: "14px 24px" }}>
              <span style={{ color: "#059669", fontSize: 16, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: "#333D4B" }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 48, background: "#F1F5F9", borderRadius: 20, padding: "16px 36px" }}>
          <span style={{ fontSize: 20, color: "#94a3b8", textDecoration: "line-through" }}>월 9,900원</span>
          <span style={{ fontSize: 36, fontWeight: 800, color: "#191F28" }}>0원</span>
          <span style={{ background: "#EF4444", color: "#fff", fontSize: 14, fontWeight: 700, padding: "6px 14px", borderRadius: 100 }}>1개월 무료</span>
        </div>

        <span style={{ fontSize: 20, color: "#94a3b8", marginTop: 40 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 900, height: 1200, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
