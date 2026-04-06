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

        <p style={{ fontSize: 48, fontWeight: 800, color: "#191F28", margin: 0, letterSpacing: "-0.02em" }}>스탠다드 플랜</p>
        <p style={{ fontSize: 56, fontWeight: 900, color: "#3182F6", margin: "8px 0 0", letterSpacing: "-0.02em" }}>1개월 무료</p>

        <p style={{ fontSize: 20, color: "#6B7684", marginTop: 20 }}>회원가입만 하면 자동 적용 · 카드 등록 없음</p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 32, background: "#F1F5F9", borderRadius: 16, padding: "14px 32px" }}>
          <span style={{ fontSize: 18, color: "#94a3b8", textDecoration: "line-through" }}>월 9,900원</span>
          <span style={{ fontSize: 32, fontWeight: 800, color: "#191F28" }}>0원</span>
          <span style={{ background: "#EF4444", color: "#fff", fontSize: 14, fontWeight: 700, padding: "6px 14px", borderRadius: 100 }}>FREE</span>
        </div>

        <span style={{ fontSize: 16, color: "#94a3b8", marginTop: 40 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
