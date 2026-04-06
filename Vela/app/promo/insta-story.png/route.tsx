import { ImageResponse } from "next/og";
import { loadFont } from "../font";
export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>

        <p style={{ fontSize: 56, fontWeight: 800, color: "#191F28", margin: 0 }}>스탠다드 플랜</p>
        <p style={{ fontSize: 72, fontWeight: 900, color: "#3182F6", margin: "12px 0 0" }}>1개월 무료</p>
        <p style={{ fontSize: 24, color: "#6B7684", marginTop: 24 }}>회원가입만 하면 자동 적용</p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 48, background: "#F1F5F9", borderRadius: 20, padding: "18px 40px" }}>
          <span style={{ fontSize: 22, color: "#94a3b8", textDecoration: "line-through" }}>월 9,900원</span>
          <span style={{ fontSize: 40, fontWeight: 800, color: "#191F28" }}>0원</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 56, width: 800 }}>
          {["수익 시뮬레이터 무제한", "AI 브리핑 & 전략 추천", "배달앱 매출 분석", "카드매출 자동 수집", "20+ 경영 도구"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #E5E8EB", borderRadius: 16, padding: "16px 24px" }}>
              <span style={{ color: "#059669", fontSize: 18, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "#333D4B" }}>{t}</span>
            </div>
          ))}
        </div>

        <span style={{ fontSize: 20, color: "#94a3b8", marginTop: 56 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 1080, height: 1920, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
