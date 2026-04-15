import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VELA API v1 Documentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Pretendard', -apple-system, system-ui, sans-serif; background: #F9FAFB; color: #191F28; line-height: 1.7; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    h2 { font-size: 22px; font-weight: 700; margin: 40px 0 16px; padding-top: 24px; border-top: 1px solid #E5E8EB; }
    h3 { font-size: 16px; font-weight: 700; margin: 24px 0 8px; }
    p { margin-bottom: 12px; color: #4E5968; }
    code { background: #F2F4F6; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: 'SF Mono', monospace; }
    pre { background: #1E293B; color: #E2E8F0; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 12px 0 20px; font-size: 13px; line-height: 1.6; }
    .badge { display: inline-block; background: #3182F6; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px; margin-right: 8px; }
    .badge-green { background: #059669; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #E5E8EB; font-size: 14px; }
    th { background: #F8FAFC; font-weight: 600; color: #6B7684; }
    .subtitle { color: #6B7684; font-size: 16px; margin-bottom: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>VELA API v1</h1>
    <p class="subtitle">외식업 경영 분석 엔진 — POS 시스템 연동용</p>

    <h2>인증</h2>
    <p>모든 요청에 <code>Authorization: Bearer YOUR_API_KEY</code> 헤더를 포함하세요.</p>
    <pre>Authorization: Bearer vela_sk_xxxxxxxxxxxx</pre>

    <h2>POST /api/v1/analyze</h2>
    <p>매출 데이터를 전송하면 경영 분석 결과를 JSON으로 반환합니다.</p>

    <h3>Request Body</h3>
    <table>
      <tr><th>필드</th><th>타입</th><th>필수</th><th>설명</th></tr>
      <tr><td><code>industry</code></td><td>string</td><td>O</td><td>업종: cafe, restaurant, bar, gogi</td></tr>
      <tr><td><code>seats</code></td><td>number</td><td>O</td><td>좌석 수</td></tr>
      <tr><td><code>avgSpend</code></td><td>number</td><td>O</td><td>객단가 (원)</td></tr>
      <tr><td><code>turnover</code></td><td>number</td><td>O</td><td>일 회전율</td></tr>
      <tr><td><code>cogsRate</code></td><td>number</td><td>O</td><td>원가율 (%)</td></tr>
      <tr><td><code>rent</code></td><td>number</td><td>O</td><td>월 임대료 (원)</td></tr>
      <tr><td><code>weekdayDays</code></td><td>number</td><td></td><td>평일 영업일 (기본 22)</td></tr>
      <tr><td><code>weekendDays</code></td><td>number</td><td></td><td>주말 영업일 (기본 8)</td></tr>
      <tr><td><code>utilities</code></td><td>number</td><td></td><td>공과금 (원)</td></tr>
      <tr><td><code>laborCount</code></td><td>number</td><td></td><td>직원 수</td></tr>
      <tr><td><code>laborCost</code></td><td>number</td><td></td><td>총 인건비 (원)</td></tr>
      <tr><td><code>deliveryEnabled</code></td><td>boolean</td><td></td><td>배달 여부</td></tr>
      <tr><td><code>deliverySales</code></td><td>number</td><td></td><td>월 배달 매출 (원)</td></tr>
    </table>

    <h3>요청 예시</h3>
    <pre>{
  "industry": "cafe",
  "seats": 20,
  "avgSpend": 7000,
  "turnover": 1.5,
  "cogsRate": 32,
  "rent": 2000000,
  "utilities": 500000,
  "laborCost": 3000000
}</pre>

    <h3>응답 예시</h3>
    <pre>{
  "industry": { "key": "cafe", "label": "카페" },
  "summary": {
    "totalSales": 18200000,
    "profit": 2840000,
    "netProfit": 2180000,
    "netMargin": 12.0,
    "isProfit": true
  },
  "costs": {
    "cogs": 5824000,
    "cogsRatio": 32.0,
    "laborCost": 3000000,
    "laborRatio": 16.5,
    "rent": 2000000,
    "rentRatio": 11.0
  },
  "breakeven": {
    "bep": 14800000,
    "achieved": true
  },
  "benchmark": {
    "comparison": {
      "cogsRate": { "mine": 32.0, "average": 35.0, "diff": -3.0 },
      "netMargin": { "mine": 12.0, "average": 10.0, "diff": 2.0 }
    }
  },
  "strategies": [
    { "title": "객단가 10% 인상", "impact": "high", "difficulty": "medium" }
  ],
  "analysis": { "score": 78, "grade": "B+" }
}</pre>

    <h2>Rate Limit</h2>
    <p>기본: 100 요청/분. 별도 협의 가능.</p>

    <h2>에러 코드</h2>
    <table>
      <tr><th>코드</th><th>설명</th></tr>
      <tr><td>401</td><td>인증 실패 (API 키 확인)</td></tr>
      <tr><td>400</td><td>잘못된 요청 (필수 파라미터 누락)</td></tr>
      <tr><td>500</td><td>서버 오류</td></tr>
    </table>

    <h2>문의</h2>
    <p>API 키 발급 및 기술 문의: <a href="mailto:mnhyuk@velaanalytics.com">mnhyuk@velaanalytics.com</a></p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
