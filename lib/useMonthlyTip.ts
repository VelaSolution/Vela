"use client";

import { useState, useEffect, useCallback } from "react";
import { useSimulatorData } from "@/lib/useSimulatorData";

/**
 * 월간 AI 시즌 팁 훅
 *
 * - 시뮬레이터 데이터 + 현재 월 기반으로 AI 1회 호출
 * - 결과를 localStorage에 캐싱 (1달간 유지)
 * - 같은 달에는 캐시된 팁을 반환 (API 재호출 없음)
 * - 월이 바뀌면 자동으로 새 팁 생성
 */

const CACHE_KEY = "vela-monthly-tip";

interface MonthlyTip {
  month: string; // "2026-04"
  industry: string;
  tips: string; // AI 생성 마크다운
  generatedAt: string;
}

const SEASON_CONTEXT: Record<number, string> = {
  1: "신년, 겨울 시즌. 연말 회식 마무리, 신년회 수요. 한파로 배달 수요 증가. 설 연휴 대비 필요.",
  2: "설 연휴, 겨울 막바지. 발렌타인데이 이벤트. 봄 메뉴 준비 시기.",
  3: "봄 시즌 시작, 개학/개강. 화이트데이, 졸업 시즌. 야외 테라스 오픈 준비.",
  4: "벚꽃 시즌, 나들이 증가. 봄꽃 축제 특수. 어린이날 연휴 대비.",
  5: "어린이날, 어버이날, 스승의날. 가정의 달 외식 수요 폭발. 여름 메뉴 준비.",
  6: "장마 시작, 실내 활동 증가. 여름 신메뉴 출시 적기. 배달 수요 상승.",
  7: "여름 본격화, 휴가 시즌 시작. 냉메뉴/음료 수요 급증. 에어컨 비용 증가.",
  8: "여름 피크, 휴가 시즌. 폭염으로 야외 매장 타격. 빙수/냉면 특수.",
  9: "가을 시작, 추석 연휴. 개학 시즌. 가을 메뉴 전환기.",
  10: "가을 본격화, 단풍 시즌. 핼러윈 이벤트. 야외 활동 증가로 유동인구 상승.",
  11: "수능, 블랙프라이데이. 연말 준비 시작. 김장 시즌으로 식재료 가격 변동.",
  12: "연말, 크리스마스, 송년회. 외식 수요 연중 최고치. 신년 메뉴/가격 조정 준비.",
};

const INDUSTRY_LABEL: Record<string, string> = {
  cafe: "카페", restaurant: "음식점", bar: "술집/바", finedining: "파인다이닝", gogi: "고깃집",
};

export function useMonthlyTip() {
  const simData = useSimulatorData();
  const [tip, setTip] = useState<MonthlyTip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-04"
  const monthNum = new Date().getMonth() + 1;

  // 캐시 로드
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: MonthlyTip = JSON.parse(cached);
        if (parsed.month === currentMonth) {
          setTip(parsed);
        }
      }
    } catch { /* noop */ }
  }, [currentMonth]);

  const generate = useCallback(async () => {
    if (!simData) return;
    if (tip?.month === currentMonth) return; // 이미 이번 달 팁 있음

    setLoading(true);
    setError(null);

    const industryLabel = INDUSTRY_LABEL[simData.industry] ?? simData.industry;
    const season = SEASON_CONTEXT[monthNum] ?? "";

    const prompt = `
당신은 외식업 경영 전문 컨설턴트입니다. 아래 매장 데이터와 시즌 정보를 바탕으로 이번 달 실행 가능한 경영 팁 5가지를 제시하세요.

【매장 정보】
- 업종: ${industryLabel}
- 월 매출: ${Math.round(simData.totalSales).toLocaleString()}원
- 순이익률: ${simData.netMargin}%
- 원가율: ${simData.cogsRatio}%
- 인건비 비율: ${simData.laborRatio}%
- 좌석 수: ${simData.seats}석
- 객단가: ${simData.avgSpend.toLocaleString()}원
- 월 임대료: ${simData.rent.toLocaleString()}원
- 배달 운영: ${simData.deliveryEnabled ? "O" : "X"}

【${monthNum}월 시즌 정보】
${season}

【요청 형식】
각 팁을 아래 형식으로 작성:
1. **[팁 제목]** — 구체적 실행 방법 (2~3줄). 예상 효과도 포함.

실현 가능하고 바로 실행할 수 있는 것 위주로. 업종과 현재 수치에 맞게 개인화하세요.
`.trim();

    try {
      const res = await fetch("/api/tools/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemPrompt: "외식업 전문 경영 컨설턴트로서 데이터 기반의 실용적인 월간 경영 팁을 제공합니다. 한국어로 답변하세요.",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "팁 생성에 실패했습니다.");
      }

      const data = await res.json();
      const content = data.content || data.text || "";

      const newTip: MonthlyTip = {
        month: currentMonth,
        industry: simData.industry,
        tips: content,
        generatedAt: new Date().toISOString(),
      };

      setTip(newTip);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newTip));
    } catch (e) {
      setError(e instanceof Error ? e.message : "팁 생성 실패");
    } finally {
      setLoading(false);
    }
  }, [simData, tip, currentMonth, monthNum]);

  return {
    tip,
    loading,
    error,
    generate,
    hasSimData: !!simData,
    hasCachedTip: tip?.month === currentMonth,
    currentMonth,
    monthNum,
  };
}
