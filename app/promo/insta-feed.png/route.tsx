import { ImageResponse } from "next/og";
import { loadFont } from "../font";
export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1080, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>
        <p style={{ fontSize: 52, fontWeight: 800, color: "#191F28", margin: 0 }}>외식업 사장님을 위한</p>
        <p style={{ fontSize: 52, fontWeight: 800, color: "#3182F6", margin: "12px 0 0" }}>숫자 경영 파트너</p>
        <p style={{ fontSize: 22, color: "#6B7684", marginTop: 28 }}>매출 · 원가 · 인건비를 한 번에 시뮬레이션</p>
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 18, fontWeight: 600, padding: "12px 24px", borderRadius: 14 }}>수익 시뮬레이터</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 18, fontWeight: 600, padding: "12px 24px", borderRadius: 14 }}>AI 전략 추천</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 18, fontWeight: 600, padding: "12px 24px", borderRadius: 14 }}>20+ 경영 도구</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 18, fontWeight: 600, padding: "12px 24px", borderRadius: 14 }}>카드매출 연동</span>
        </div>
        <span style={{ fontSize: 18, color: "#94a3b8", marginTop: 48 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 1080, height: 1080, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
