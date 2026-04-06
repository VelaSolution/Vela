import { ImageResponse } from "next/og";
import { loadFont } from "../font";

export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: "#F9FAFB", fontFamily: "Pretendard", padding: "50px 60px", gap: 40 }}>
        <div style={{ width: "45%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#191F28" }}>VELA</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#3182F6" }}>.</span>
          </div>
          <p style={{ fontSize: 38, fontWeight: 800, color: "#191F28", margin: 0 }}>3분이면 끝나는</p>
          <p style={{ fontSize: 38, fontWeight: 800, color: "#3182F6", margin: "6px 0 0" }}>수익 시뮬레이션</p>
          <p style={{ fontSize: 16, color: "#6B7684", marginTop: 16 }}>좌석 수, 객단가, 회전율만 입력하면 세후 실수령액까지 한눈에</p>
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 8 }}>20+ 지표</span>
            <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 8 }}>AI 전략</span>
            <span style={{ background: "#EFF6FF", color: "#3182F6", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 8 }}>PDF</span>
          </div>
          <span style={{ fontSize: 14, color: "#94a3b8", marginTop: 28 }}>velaanalytics.com</span>
        </div>

        <div style={{ width: "55%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #E5E8EB", width: "100%", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#191F28", marginBottom: 20 }}>실시간 미리보기</span>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>좌석 수</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#191F28" }}>20석</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>객단가</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#191F28" }}>12,000원</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>회전율</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#191F28" }}>2.0회</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px" }}>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>월 매출</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#191F28" }}>12,480,000원</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 0" }}>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>세후 실수령</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#059669" }}>+2,150,000원</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
