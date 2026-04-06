import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VELA - 외식업 AI 경영 분석 플랫폼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* 로고 */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.04em" }}>
            VELA
          </span>
          <span style={{ fontSize: 80, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>

        {/* 태그라인 */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          외식업 사장님을 위한 숫자 경영 파트너
        </div>

        {/* 서브 */}
        <div
          style={{
            fontSize: 20,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          손익 시뮬레이터 | 메뉴 원가 계산 | AI 전략 추천
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#64748b",
            letterSpacing: "0.05em",
          }}
        >
          velaanalytics.com
        </div>
      </div>
    ),
    { ...size }
  );
}
