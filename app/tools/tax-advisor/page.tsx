"use client";
import { useState } from "react";
import Link from "next/link";
import ToolNav from "@/components/ToolNav";

const EXPERTS = [
  { id: 1, type: "세무사", name: "김세무", firm: "세무법인 가나", specialty: "외식업 전문", experience: "15년", rating: 4.9, reviews: 128, price: "월 15만원~", badge: "추천", desc: "외식업 세무 경력 15년. 절세 전략과 세무조사 대응에 강합니다." },
  { id: 2, type: "세무사", name: "이택스", firm: "이택스 세무회계", specialty: "소상공인 전문", experience: "10년", rating: 4.8, reviews: 95, price: "월 10만원~", badge: null, desc: "소상공인 기장 전문. 합리적인 비용으로 세무 관리가 가능합니다." },
  { id: 3, type: "법무사", name: "박법무", firm: "법무사 사무소 다라", specialty: "법인 설립", experience: "12년", rating: 4.7, reviews: 67, price: "건당 30만원~", badge: null, desc: "법인 설립, 상호 변경, 사업자 변경 등 각종 등기 업무 전문." },
  { id: 4, type: "노무사", name: "정노무", firm: "노무법인 마바", specialty: "외식업 노무", experience: "8년", rating: 4.8, reviews: 54, price: "월 8만원~", badge: "추천", desc: "근로계약, 4대보험, 해고 상담 등 외식업 인사노무 전문." },
  { id: 5, type: "세무사", name: "최절세", firm: "절세 세무회계", specialty: "프랜차이즈", experience: "20년", rating: 4.9, reviews: 201, price: "월 20만원~", badge: "TOP", desc: "프랜차이즈 본사/가맹점 세무 전문. 다점포 운영 세무 관리에 강합니다." },
];

type FilterType = "전체" | "세무사" | "법무사" | "노무사";

const FILTERS: FilterType[] = ["전체", "세무사", "법무사", "노무사"];

const TYPE_EMOJI: Record<string, string> = {
  "세무사": "🧾",
  "법무사": "📜",
  "노무사": "👷",
};

export default function TaxAdvisorPage() {
  const [filter, setFilter] = useState<FilterType>("전체");
  const [showModal, setShowModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);

  const filtered = filter === "전체" ? EXPERTS : EXPERTS.filter(e => e.type === filter);

  const handleConsult = (name: string) => {
    setSelectedExpert(name);
    setShowModal(true);
  };

  return (
    <>
      <ToolNav />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 md:pb-8">
        <main className="mx-auto max-w-3xl px-4 py-8 md:pl-64 md:px-8">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/tools" className="text-xs text-slate-400 hover:text-slate-600 transition">도구</Link>
              <span className="text-xs text-slate-300">/</span>
              <span className="text-xs text-slate-600 font-semibold">전문가 매칭</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">전문가 매칭</h1>
            <p className="text-sm text-slate-500 mt-1">
              외식업 전문 세무사, 법무사, 노무사를 매칭해드립니다.
              VELA 데이터 기반으로 정확한 상담이 가능합니다.
            </p>
          </div>

          {/* 필터 탭 */}
          <div className="flex gap-2 mb-6">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === f
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 전문가 카드 목록 */}
          <div className="space-y-4">
            {filtered.map(expert => (
              <div key={expert.id} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  {/* 아바타 */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                    {TYPE_EMOJI[expert.type] ?? "👤"}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{expert.name}</h3>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{expert.type}</span>
                      {expert.badge === "추천" && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">첫 상담 무료</span>
                      )}
                      {expert.badge === "TOP" && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">TOP</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{expert.firm}</p>
                    <p className="text-xs text-slate-400 mt-1">{expert.desc}</p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-xs text-slate-600">
                        <span className="font-semibold">{expert.specialty}</span> · {expert.experience}
                      </span>
                      <span className="text-xs text-amber-500 font-semibold">
                        {"★".repeat(Math.floor(expert.rating))} {expert.rating}
                      </span>
                      <span className="text-xs text-slate-400">리뷰 {expert.reviews}개</span>
                    </div>
                  </div>

                  {/* 가격 + 버튼 */}
                  <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-slate-900">{expert.price}</p>
                    <button
                      onClick={() => handleConsult(expert.name)}
                      className="rounded-xl bg-blue-600 text-white text-xs font-semibold px-4 py-2 hover:bg-blue-700 transition whitespace-nowrap"
                    >
                      상담 신청
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 안내 */}
          <div className="mt-8 rounded-2xl bg-slate-100 p-5 text-center">
            <p className="text-sm text-slate-500">
              전문가 매칭 서비스는 제휴를 통해 제공됩니다.
              상담 내용은 VELA와 무관하게 전문가와 직접 진행됩니다.
            </p>
          </div>
        </main>
      </div>

      {/* 상담 신청 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center space-y-4">
            <p className="text-4xl">🚧</p>
            <h2 className="text-lg font-bold text-slate-900">Coming Soon</h2>
            <p className="text-sm text-slate-500">
              <span className="font-semibold">{selectedExpert}</span> 전문가 상담 신청 기능은
              현재 준비 중입니다. 곧 서비스가 오픈됩니다!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="rounded-xl bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 hover:bg-slate-800 transition"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
