import { ImageResponse } from "next/og";
import { loadFont } from "../font";

export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>

        <p style={{ fontSize: 48, fontWeight: 800, color: "#191F28", margin: 0, letterSpacing: "-0.02em" }}>외식업 사장님을 위한</p>
        <p style={{ fontSize: 48, fontWeight: 800, color: "#3182F6", margin: "8px 0 0", letterSpacing: "-0.02em" }}>숫자 경영 파트너</p>

        <p style={{ fontSize: 20, color: "#6B7684", marginTop: 20 }}>매출 · 원가 · 인건비를 한 번에 시뮬레이션하고 AI가 맞춤 전략을 추천합니다</p>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>수익 시뮬레이터</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>AI 전략 추천</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>20+ 경영 도구</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>카드매출 연동</span>
        </div>

        <span style={{ fontSize: 16, color: "#94a3b8", marginTop: 40 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
