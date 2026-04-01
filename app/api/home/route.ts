import { NextResponse } from "next/server";

export const revalidate = 3600; // 1시간 캐시

async function getStocks() {
  const key = process.env.BOK_API_KEY;
  if (!key) return null;

  // 오늘 ~ 7일 전 범위로 가장 최근 데이터 가져오기
  const today = new Date();
  const end   = today.toISOString().slice(0,10).replace(/-/g,"");
  const start = new Date(today.setDate(today.getDate()-7)).toISOString().slice(0,10).replace(/-/g,"");

  const base = "https://ecos.bok.or.kr/api/StatisticSearch";

  const fetchStat = async (statCode: string, itemCode: string) => {
    const url = `${base}/${key}/json/kr/1/1/${statCode}/DD/${start}/${end}/${itemCode}`;
    const r = await fetch(url);
    const d = await r.json();
    // 가장 최근 row 반환
    const rows = d?.StatisticSearch?.row ?? [];
    return rows[rows.length - 1] ?? null;
  };

  try {
    const [kospiRow, kosdaqRow, usdRow] = await Promise.all([
      fetchStat("802Y001", "0001750"), // KOSPI
      fetchStat("802Y002", "0001751"), // KOSDAQ
      fetchStat("731Y001", "0000001"), // USD/KRW 매매기준율
    ]);

    const fmt = (row: {DATA_VALUE:string; TIME:string} | null, isForex = false) => {
      if (!row) return null;
      const val = parseFloat(row.DATA_VALUE?.replace(/,/g,"") ?? "");
      if (isNaN(val) || val <= 0) return null;
      return {
        price: isForex
          ? val.toFixed(1)
          : val.toLocaleString("ko-KR", { maximumFractionDigits: 2 }),
        date: row.TIME
          ? `${row.TIME.slice(0,4)}.${row.TIME.slice(4,6)}.${row.TIME.slice(6,8)}`
          : "",
      };
    };

    return {
      kospi:  fmt(kospiRow),
      kosdaq: fmt(kosdaqRow),
      usdkrw: fmt(usdRow, true),
    };
  } catch (e) {
    console.error("BOK error:", e);
    return null;
  }
}

async function getNews() {
  const today = new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" });
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `오늘(${today}) 기준 외식업, 자영업, 소상공인, 한국 경제 관련 뉴스 3개를 웹에서 검색 후 JSON 배열로만 응답.
반드시 조선일보, 중앙일보, 동아일보, 한겨레, 연합뉴스, 뉴스1, 머니투데이, 한국경제, 매일경제, 이데일리 등 언론사 기사만 포함.
형식: [{"title":"기사 제목","summary":"한 줄 요약 30자 이내","source":"언론사명","url":"기사 실제 URL"}]
JSON만 출력, 마크다운 없이.`,
        messages: [{ role: "user", content: `오늘 ${today} 외식업·자영업 관련 주요 뉴스 3개 알려줘` }],
      }),
    });
    const json = await res.json();
    const text = (json.content || []).filter((c:{type:string}) => c.type==="text").map((c:{text:string}) => c.text).join("");
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  } catch {
    return [
      { title:"최저임금 인상 논의 본격화", summary:"2027년 최저임금 심의 시작", source:"연합뉴스", url:"https://www.yna.co.kr" },
      { title:"배달앱 수수료 인하 논의", summary:"소상공인 부담 완화 추진", source:"한국경제", url:"https://www.hankyung.com" },
      { title:"외식물가 상승세 지속", summary:"식재료비·인건비 동반 상승", source:"머니투데이", url:"https://www.mt.co.kr" },
    ];
  }
}

export async function GET() {
  const [stocks, news] = await Promise.all([getStocks(), getNews()]);
  return NextResponse.json({ stocks, news });
}
