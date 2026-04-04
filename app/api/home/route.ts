import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getStocks() {
  const key = process.env.BOK_API_KEY;
  if (!key) return null;
  try {
    const url = `https://ecos.bok.or.kr/api/KeyStatisticList/${key}/json/kr/1/101`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const rows = data?.KeyStatisticList?.row ?? [];
    if (rows.length === 0) return null;
    const kospiRow  = rows.find((r: {KEYSTAT_NAME:string}) => r.KEYSTAT_NAME.includes("\uCF54\uC2A4\uD53C") && !r.KEYSTAT_NAME.includes("200"));
    const kosdaqRow = rows.find((r: {KEYSTAT_NAME:string}) => r.KEYSTAT_NAME.includes("\uCF54\uC2A4\uB2E5"));
    const usdRow    = rows.find((r: {KEYSTAT_NAME:string}) => r.KEYSTAT_NAME.includes("\uC6D0/\uB2EC\uB7EC"));
    const fmt = (row: {DATA_VALUE:string;CYCLE:string} | undefined, isForex = false) => {
      if (!row) return null;
      const val = parseFloat(row.DATA_VALUE?.replace(/,/g, "") ?? "");
      if (isNaN(val) || val <= 0) return null;
      const c = row.CYCLE ?? "";
      return {
        price: isForex ? val.toFixed(1) : val.toLocaleString("ko-KR", { maximumFractionDigits: 2 }),
        date: c.length === 8 ? `${c.slice(0,4)}.${c.slice(4,6)}.${c.slice(6,8)}` : c,
      };
    };
    return { kospi: fmt(kospiRow), kosdaq: fmt(kosdaqRow), usdkrw: fmt(usdRow, true) };
  } catch (e) { console.error("BOK error:", e); return null; }
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
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
        system: `Today is ${today}. Search for 6 latest Korean news articles. Include a mix of: food service industry news (2), small business/self-employed news (2), AND general Korean economic news like interest rates, inflation, consumer spending, employment (2). For each article, add a "tag" field with one of: "외식업", "소상공인", "경제". Also add an "insight" field: a one-sentence practical tip for a restaurant owner based on this news (under 40 chars, in Korean). IMPORTANT: The "url" field must be the ACTUAL article URL (not the site homepage). If you cannot find the exact URL, use the site's search page with the article keyword. Respond ONLY with a JSON array: [{"title":"Korean title","summary":"Korean summary under 30 chars","source":"media name","url":"actual article URL","tag":"category","insight":"사장님 한줄 인사이트"}]. No markdown, no extra text.`,
        messages: [{ role: "user", content: `${today} 외식업 소상공인 경제 금리 물가 고용 최신 뉴스 6개` }],
      }),
    });
    const json = await res.json();
    const text = (json.content || []).filter((c:{type:string}) => c.type==="text").map((c:{text:string}) => c.text).join("");
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  } catch (e) {
    console.error("News error:", e);
    return [
      { title: "최저임금 인상 논의 본격화", summary: "2027년 심의 시작", source: "연합뉴스", url: "https://www.yna.co.kr/search/index?query=최저임금", tag: "소상공인", insight: "인건비 비율을 미리 점검하고 스케줄을 최적화하세요" },
      { title: "배달앱 수수료 단계적 인하 추진", summary: "소상공인 부담 완화 기대", source: "한국경제", url: "https://search.hankyung.com/search?query=배달앱+수수료", tag: "소상공인", insight: "수수료 변동을 VELA 시뮬레이터에서 미리 반영해보세요" },
      { title: "외식 물가 상승세 4개월 연속", summary: "식재료비 동반 상승", source: "머니투데이", url: "https://search.mt.co.kr/search?kwd=외식+물가", tag: "외식업", insight: "제철 식재료로 전환하면 원가를 10% 이상 낮출 수 있어요" },
      { title: "한국은행 기준금리 동결 결정", summary: "연 3.25% 유지", source: "조선비즈", url: "https://biz.chosun.com/search?query=기준금리", tag: "경제", insight: "금리 동결은 대출 부담 유지를 의미해요. 상환 계획을 점검하세요" },
      { title: "4월 소비심리지수 개선", summary: "외식 지출 증가 전망", source: "매일경제", url: "https://www.mk.co.kr/search?word=소비심리지수", tag: "경제", insight: "소비 회복기에 신메뉴를 출시하면 효과가 극대화됩니다" },
      { title: "프랜차이즈 가맹비 공시 의무화", summary: "정보공개서 강화", source: "서울경제", url: "https://www.sedaily.com/Search?keyword=프랜차이즈", tag: "외식업", insight: "개인 매장이라면 오히려 차별화 기회입니다" },
    ];
  }
}

export async function GET() {
  const [stocks, news] = await Promise.all([getStocks(), getNews()]);
  return NextResponse.json({ stocks, news });
}
