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
          <span style={{ background: "#3182F6", color: "#fff", fontSize: 13, fontWeight: 700, padding: "4px 14px", borderRadius: 100, marginLeft: 8 }}>AI</span>
        </div>

        <p style={{ fontSize: 48, fontWeight: 800, color: "#191F28", margin: 0, letterSpacing: "-0.02em" }}>AI가 찾아주는</p>
        <p style={{ fontSize: 48, fontWeight: 800, color: "#3182F6", margin: "8px 0 0", letterSpacing: "-0.02em" }}>경영 인사이트</p>

        <p style={{ fontSize: 20, color: "#6B7684", marginTop: 20 }}>매장 데이터를 넣으면 AI가 진단하고 전략을 추천합니다</p>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>AI 브리핑</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>AI 전략 추천</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>리뷰 감정 분석</span>
          <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 16, fontWeight: 600, padding: "10px 20px", borderRadius: 12 }}>SNS 콘텐츠 AI</span>
        </div>

        <span style={{ fontSize: 16, color: "#94a3b8", marginTop: 40 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
