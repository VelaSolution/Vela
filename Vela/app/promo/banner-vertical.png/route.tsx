import { ImageResponse } from "next/og";
import { loadFont } from "../font";
export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 160, height: 600, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#191F28", margin: 0 }}>외식업</p>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#3182F6", margin: "4px 0 0" }}>수익</p>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#3182F6", margin: "0" }}>시뮬레이터</p>
        <p style={{ fontSize: 10, color: "#6B7684", marginTop: 12 }}>AI 경영 분석</p>
        <span style={{ background: "#3182F6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "6px 14px", borderRadius: 6, marginTop: 20 }}>무료 시작</span>
      </div>
    ),
    { width: 160, height: 600, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
