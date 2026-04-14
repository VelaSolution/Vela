import { ImageResponse } from "next/og";
import { loadFont } from "../font";
export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 300, height: 250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#191F28", margin: 0 }}>외식업 수익</p>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#3182F6", margin: "2px 0 0" }}>시뮬레이터</p>
        <p style={{ fontSize: 11, color: "#6B7684", marginTop: 10 }}>AI 경영 분석 플랫폼</p>
        <span style={{ background: "#3182F6", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 20px", borderRadius: 8, marginTop: 16 }}>무료 시작</span>
      </div>
    ),
    { width: 300, height: 250, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
