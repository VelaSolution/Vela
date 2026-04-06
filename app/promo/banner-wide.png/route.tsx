import { ImageResponse } from "next/og";
import { loadFont } from "../font";
export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 728, height: 90, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F9FAFB", fontFamily: "Pretendard", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#191F28", margin: 0 }}>외식업 수익 시뮬레이터 + AI 경영 분석</p>
        <span style={{ background: "#3182F6", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 8 }}>무료 시작</span>
      </div>
    ),
    { width: 728, height: 90, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
