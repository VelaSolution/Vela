import type { MenuItem, IndustryKey } from "./types";
import { uid } from "./types";

export const INDUSTRY_PRESETS: Record<IndustryKey, MenuItem[]> = {
  cafe: [
    {
      id: uid(), name: "아메리카노", price: "4500", category: "음료",
      ingredients: [
        { id: uid(), name: "에스프레소 원두", cost: "350" },
        { id: uid(), name: "물·컵·뚜껑·빨대", cost: "120" },
      ],
    },
    {
      id: uid(), name: "카페라떼", price: "5500", category: "음료",
      ingredients: [
        { id: uid(), name: "에스프레소 원두", cost: "350" },
        { id: uid(), name: "우유 200ml", cost: "380" },
        { id: uid(), name: "컵·뚜껑", cost: "120" },
      ],
    },
    {
      id: uid(), name: "크로플", price: "6000", category: "디저트",
      ingredients: [
        { id: uid(), name: "냉동 크로아상 도우", cost: "800" },
        { id: uid(), name: "휘핑크림·시럽", cost: "400" },
        { id: uid(), name: "포장 용기", cost: "120" },
      ],
    },
    {
      id: uid(), name: "티라미수", price: "7500", category: "디저트",
      ingredients: [
        { id: uid(), name: "마스카포네 치즈", cost: "900" },
        { id: uid(), name: "레이디핑거·에스프레소", cost: "500" },
        { id: uid(), name: "용기·코코아파우더", cost: "200" },
      ],
    },
  ],
  restaurant: [
    {
      id: uid(), name: "된장찌개", price: "9000", category: "푸드",
      ingredients: [
        { id: uid(), name: "된장·두부·호박", cost: "1200" },
        { id: uid(), name: "밥·반찬", cost: "800" },
        { id: uid(), name: "가스비·포장", cost: "200" },
      ],
    },
    {
      id: uid(), name: "제육볶음", price: "11000", category: "푸드",
      ingredients: [
        { id: uid(), name: "돼지고기 200g", cost: "2200" },
        { id: uid(), name: "양념·채소", cost: "600" },
        { id: uid(), name: "밥·반찬", cost: "800" },
      ],
    },
    {
      id: uid(), name: "순두부찌개", price: "9000", category: "푸드",
      ingredients: [
        { id: uid(), name: "순두부·해물", cost: "1400" },
        { id: uid(), name: "밥·반찬", cost: "800" },
        { id: uid(), name: "가스비·기타", cost: "200" },
      ],
    },
    {
      id: uid(), name: "냉면", price: "12000", category: "푸드",
      ingredients: [
        { id: uid(), name: "냉면 면·육수", cost: "1800" },
        { id: uid(), name: "고명(달걀·오이·고기)", cost: "900" },
        { id: uid(), name: "그릇·기타", cost: "150" },
      ],
    },
  ],
  bar: [
    {
      id: uid(), name: "생맥주 500cc", price: "5000", category: "주류",
      ingredients: [
        { id: uid(), name: "생맥주 원가", cost: "900" },
        { id: uid(), name: "컵·세제", cost: "80" },
      ],
    },
    {
      id: uid(), name: "소주 1병", price: "5000", category: "주류",
      ingredients: [
        { id: uid(), name: "소주 원가", cost: "1100" },
        { id: uid(), name: "컵", cost: "50" },
      ],
    },
    {
      id: uid(), name: "안주 모둠", price: "18000", category: "푸드",
      ingredients: [
        { id: uid(), name: "육류·해산물", cost: "5500" },
        { id: uid(), name: "야채·소스", cost: "800" },
        { id: uid(), name: "그릇·기타", cost: "200" },
      ],
    },
    {
      id: uid(), name: "하이볼", price: "8000", category: "주류",
      ingredients: [
        { id: uid(), name: "위스키 30ml", cost: "1200" },
        { id: uid(), name: "탄산수·얼음", cost: "300" },
        { id: uid(), name: "글라스·가니쉬", cost: "200" },
      ],
    },
  ],
  finedining: [
    {
      id: uid(), name: "전채 (아뮤즈부쉬)", price: "15000", category: "푸드",
      ingredients: [
        { id: uid(), name: "식재료 (계절재료)", cost: "3500" },
        { id: uid(), name: "플레이팅 소스·허브", cost: "800" },
        { id: uid(), name: "식기 소모품", cost: "300" },
      ],
    },
    {
      id: uid(), name: "파스타 메인", price: "32000", category: "푸드",
      ingredients: [
        { id: uid(), name: "생면·트러플오일", cost: "4500" },
        { id: uid(), name: "관자·버섯", cost: "5000" },
        { id: uid(), name: "파르미지아노·허브", cost: "1200" },
      ],
    },
    {
      id: uid(), name: "와인 글라스", price: "18000", category: "주류",
      ingredients: [
        { id: uid(), name: "와인 원가 (1잔)", cost: "5500" },
        { id: uid(), name: "글라스 감가", cost: "300" },
      ],
    },
    {
      id: uid(), name: "디저트 플레이트", price: "16000", category: "디저트",
      ingredients: [
        { id: uid(), name: "디저트 재료", cost: "3200" },
        { id: uid(), name: "소스·장식", cost: "800" },
        { id: uid(), name: "식기 소모품", cost: "200" },
      ],
    },
  ],
  gogi: [
    {
      id: uid(), name: "삼겹살 200g", price: "16000", category: "푸드",
      ingredients: [
        { id: uid(), name: "삼겹살 원육 200g", cost: "4200" },
        { id: uid(), name: "쌈채소·쌈장", cost: "600" },
        { id: uid(), name: "가스비·집게·호일", cost: "300" },
      ],
    },
    {
      id: uid(), name: "목살 200g", price: "15000", category: "푸드",
      ingredients: [
        { id: uid(), name: "목살 원육 200g", cost: "3800" },
        { id: uid(), name: "쌈채소·쌈장", cost: "600" },
        { id: uid(), name: "가스비·소모품", cost: "300" },
      ],
    },
    {
      id: uid(), name: "항정살 150g", price: "18000", category: "푸드",
      ingredients: [
        { id: uid(), name: "항정살 원육 150g", cost: "5500" },
        { id: uid(), name: "쌈채소·소스", cost: "600" },
        { id: uid(), name: "가스비·소모품", cost: "300" },
      ],
    },
    {
      id: uid(), name: "냉면", price: "8000", category: "푸드",
      ingredients: [
        { id: uid(), name: "냉면 면·육수", cost: "1500" },
        { id: uid(), name: "고명·겨자·식초", cost: "400" },
        { id: uid(), name: "그릇·기타", cost: "100" },
      ],
    },
    {
      id: uid(), name: "된장찌개", price: "3000", category: "푸드",
      ingredients: [
        { id: uid(), name: "된장·두부·호박", cost: "700" },
        { id: uid(), name: "뚝배기 가스비", cost: "150" },
      ],
    },
    {
      id: uid(), name: "소주 1병", price: "5000", category: "주류",
      ingredients: [
        { id: uid(), name: "소주 원가", cost: "1100" },
        { id: uid(), name: "컵", cost: "50" },
      ],
    },
  ],
};
