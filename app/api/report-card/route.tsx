import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

async function loadFont(): Promise<ArrayBuffer> {
  const res = await fetch("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/public/static/Pretendard-Bold.otf");
  return res.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const storeName = p.get("store") || "내 매장";
  const industry = p.get("industry") || "음식점";
  const sales = Number(p.get("sales") || 0);
  const profit = Number(p.get("profit") || 0);
  const margin = Number(p.get("margin") || 0);
  const rank = Number(p.get("rank") || 50);

  const fmt = (n: number) => Math.abs(n).toLocaleString("ko-KR");
  const isProfit = profit >= 0;
  const grade = rank <= 10 ? "S" : rank <= 20 ? "A+" : rank <= 30 ? "A" : rank <= 50 ? "B+" : rank <= 70 ? "B" : "C";
  const gradeColor = rank <= 20 ? "#3182F6" : rank <= 50 ? "#059669" : "#F59E0B";

  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1080, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F9FAFB", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#191F28" }}>VELA</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>

        <p style={{ fontSize: 20, color: "#94a3b8", margin: 0 }}>{industry}</p>
        <p style={{ fontSize: 40, fontWeight: 800, color: "#191F28", margin: "8px 0 0" }}>{storeName}</p>
        <p style={{ fontSize: 18, color: "#94a3b8", margin: "4px 0 32px" }}>경영 성적표</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 160, height: 160, borderRadius: "50%", background: "#fff", border: `6px solid ${gradeColor}`, marginBottom: 32 }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: gradeColor }}>{grade}</span>
        </div>

        <p style={{ fontSize: 18, color: "#6B7684", margin: "0 0 32px" }}>상위 {rank}% 매장</p>

        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 32px", border: "1px solid #E5E8EB", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>월 매출</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#191F28", marginTop: 4 }}>{fmt(sales)}원</span>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 32px", border: "1px solid #E5E8EB", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>순이익</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: isProfit ? "#059669" : "#EF4444", marginTop: 4 }}>{isProfit ? "+" : "-"}{fmt(profit)}원</span>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 32px", border: "1px solid #E5E8EB", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>순이익률</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: isProfit ? "#059669" : "#EF4444", marginTop: 4 }}>{margin.toFixed(1)}%</span>
          </div>
        </div>

        <span style={{ fontSize: 16, color: "#94a3b8", marginTop: 48 }}>velaanalytics.com</span>
      </div>
    ),
    { width: 1080, height: 1080, fonts: [{ name: "Pretendard", data: fontData, style: "normal", weight: 700 }] }
  );
}
