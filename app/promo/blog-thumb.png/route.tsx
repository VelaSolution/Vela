import { ImageResponse } from "next/og";
import { loadFont } from "../font";
export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 800, height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>
        <p style={{ fontSize: 32, fontWeight: 800, color: "#191F28", margin: 0 }}>외식업 수익 시뮬레이터</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: "#3182F6", margin: "4px 0 0" }}>AI 경영 분석 플랫폼</p>
        <p style={{ fontSize: 16, color: "#6B7684", marginTop: 16 }}>매출 · 원가 · 인건비 시뮬레이션 + AI 전략 추천</p>
        <span style={{ fontSize: 14, color: "#94a3b8", marginTop: 24 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 800, height: 400, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
