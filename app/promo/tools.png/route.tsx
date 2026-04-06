import { ImageResponse } from "next/og";
import { loadFont } from "../font";

export const runtime = "edge";

export async function GET() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>

        <p style={{ fontSize: 44, fontWeight: 800, color: "#191F28", margin: 0, letterSpacing: "-0.02em" }}>사장님에게 필요한</p>
        <p style={{ fontSize: 44, fontWeight: 800, color: "#3182F6", margin: "8px 0 0", letterSpacing: "-0.02em" }}>모든 도구</p>

        <p style={{ fontSize: 18, color: "#6B7684", marginTop: 20 }}>원가 계산부터 AI 마케팅까지, 20개 이상의 경영 도구를 무료로</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32, maxWidth: 900, justifyContent: "center" }}>
          {["원가 계산기", "AI 가격 추천", "인건비 (법정)", "배달 매출 분석", "리뷰 감정 분석", "카드매출 연동", "일일 매출 기록", "SNS 콘텐츠 AI", "리뷰 답변 AI", "상권 분석 AI", "세금 계산기", "손익계산서 PDF"].map((t) => (
            <span key={t} style={{ background: "#F8FAFC", border: "1px solid #E5E8EB", color: "#333D4B", fontSize: 15, fontWeight: 600, padding: "10px 18px", borderRadius: 12 }}>{t}</span>
          ))}
        </div>

        <span style={{ fontSize: 16, color: "#94a3b8", marginTop: 36 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
