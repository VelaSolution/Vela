"use client";

import React, { useMemo } from "react";
import {
  calcResult,
  calcReverse,
  fmt,
  type FullForm,
} from "@/lib/vela";
import { InputCard, SliderCard, Toggle } from "./FormControls";

export function FormStep3({
  form,
  update,
  errors,
}: {
  form: FullForm;
  update: (k: keyof FullForm, v: unknown) => void;
  errors: Partial<Record<keyof FullForm, string>>;
}) {
  const result = useMemo(() => calcResult(form), [form]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-0.5 text-base font-bold text-slate-900">사업 현황</h2>
        <p className="mb-3 text-xs text-slate-400">현재 상태를 선택해주세요.</p>

        <div className="grid grid-cols-2 gap-3">
          {(["new", "existing"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("businessType", type)}
              className={`rounded-3xl border p-4 text-center text-sm font-semibold transition ${
                form.businessType === type
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {type === "new" ? "🏗️ 창업 예정" : "🏪 이미 운영 중"}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">초기 투자비용</h2>
          <p className="mt-1 text-sm text-slate-500">
            창업 시 들어간 (또는 예정인) 비용을 입력하세요.
          </p>
        </div>

        <InputCard
          label="보증금"
          hint="임대 보증금 (퇴거 시 반환)"
          value={form.deposit}
          onChange={(v) => update("deposit", v)}
          money
          error={errors.deposit}
        />
        <InputCard
          label="권리금"
          hint="전 임차인에게 지불한 권리금"
          value={form.premiumKey}
          onChange={(v) => update("premiumKey", v)}
          money
          error={errors.premiumKey}
        />
        <InputCard
          label="인테리어 비용"
          hint="내부 공사·리모델링"
          value={form.interior}
          onChange={(v) => update("interior", v)}
          money
          error={errors.interior}
        />
        <InputCard
          label="주방기기 & 집기"
          hint="냉장고·조리기구·테이블·의자 등"
          value={form.equipment}
          onChange={(v) => update("equipment", v)}
          money
          error={errors.equipment}
        />
        <InputCard
          label="간판 & 홍보물"
          hint="간판 제작·현수막·메뉴판 등"
          value={form.signage}
          onChange={(v) => update("signage", v)}
          money
          error={errors.signage}
        />
        <InputCard
          label="가맹비"
          hint="프랜차이즈 가맹 계약금 (해당 시)"
          value={form.franchiseFee ?? 0}
          onChange={(v) => update("franchiseFee", v)}
          money
        />
        <InputCard
          label="교육비"
          hint="본사 교육·연수 비용 (해당 시)"
          value={form.trainingFee ?? 0}
          onChange={(v) => update("trainingFee", v)}
          money
        />
        <InputCard
          label="기타 초기비용"
          hint="인허가·사업자등록·예비비"
          value={form.otherSetup}
          onChange={(v) => update("otherSetup", v)}
          money
          error={errors.otherSetup}
        />

        <div className="rounded-2xl bg-white px-4 py-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">총 초기 투자비</span>
            <span className="font-bold text-slate-900">
              {fmt(
                form.deposit +
                  form.premiumKey +
                  form.interior +
                  form.equipment +
                  form.signage +
                  (form.franchiseFee ?? 0) +
                  (form.trainingFee ?? 0) +
                  form.otherSetup
              )}
              원
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>실질 투자금 (보증금 제외)</span>
            <span>
              {fmt(
                form.premiumKey +
                  form.interior +
                  form.equipment +
                  form.signage +
                  (form.franchiseFee ?? 0) +
                  (form.trainingFee ?? 0) +
                  form.otherSetup
              )}
              원
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">부채 & 대출</h2>
          <p className="mt-1 text-sm text-slate-500">사업 관련 대출이 있는 경우 입력하세요.</p>
        </div>

        <Toggle
          label="대출 여부"
          hint="창업자금 대출·운영자금 대출 등"
          value={form.loanEnabled}
          onChange={(v) => update("loanEnabled", v)}
        />

        {form.loanEnabled && (
          <>
            <InputCard
              label="대출 원금"
              hint="현재 남은 대출 잔액"
              value={form.loanAmount}
              onChange={(v) => update("loanAmount", v)}
              money
              error={errors.loanAmount}
            />
            <SliderCard
              label="연 이자율"
              hint="대출 이자율 (연 기준)"
              value={form.loanInterestRate}
              onChange={(v) => update("loanInterestRate", v)}
              min={0}
              max={20}
              step={0.1}
              suffix="%"
            />
            <InputCard
              label="상환 기간"
              hint="총 상환 기간"
              value={form.loanTermMonths}
              onChange={(v) => update("loanTermMonths", v)}
              suffix="개월"
              error={errors.loanTermMonths}
            />
            <div className="rounded-2xl bg-white px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">월 상환액 (원리금 균등)</span>
                <span className="font-bold text-slate-900">
                  {fmt(result.monthlyLoanPayment)}원
                </span>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">목표 설정</h2>
          <p className="mt-1 text-sm text-slate-500">
            투자금 회수 목표와 목표 순이익을 설정하세요.
          </p>
        </div>

        <SliderCard
          label="투자금 회수 목표"
          hint="초기 투자비를 몇 개월 안에 회수할지"
          value={form.recoveryMonths}
          onChange={(v) => update("recoveryMonths", v)}
          min={6}
          max={120}
          step={6}
          suffix="개월"
        />
        <InputCard
          label="목표 월 세후 순이익"
          hint="매달 가져가고 싶은 금액"
          value={form.targetMonthlyProfit}
          onChange={(v) => update("targetMonthlyProfit", v)}
          money
          error={errors.targetMonthlyProfit}
        />

        {form.targetMonthlyProfit > 0 && (() => {
          const rev = calcReverse(form, form.targetMonthlyProfit);

          return (
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">
                목표 달성을 위한 필요 수치
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">필요 객단가</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {fmt(rev.neededAvgSpend)}원
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    현재 대비 {fmt(rev.avgSpendDiff)}원
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">필요 회전율</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {rev.neededTurnover}회
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    현재 대비 {rev.turnoverDiff}회
                  </p>
                </div>
            <div className="rounded-2xl bg-slate-50 p-4 col-span-2 sm:col-span-1">
  <p className="text-xs text-slate-500">원가율 여유 진단</p>
  {rev.neededCogsRate === null ? (
    <>
      <p className="mt-2 text-sm font-bold text-slate-400">진단 불가</p>
      <p className="mt-1 text-xs text-slate-400">매출 또는 목표이익을 입력해 주세요</p>
    </>
  ) : (
    <>
      {/* 현재 vs 허용 원가율 수치 비교 */}
      <div className="mt-2 flex items-end gap-2">
        <span className="text-lg font-bold" style={{ color: (rev.cogsRateDiff ?? 0) >= 0 ? '#059669' : '#ef4444' }}>
          {(rev.cogsRateDiff ?? 0) >= 0 ? `+${rev.cogsRateDiff}%p` : `${rev.cogsRateDiff}%p`}
        </span>
        <span className="mb-0.5 text-xs text-slate-400">여유</span>
      </div>

      {/* 게이지 바 */}
      <div className="mt-2">
        <div className="relative h-2 rounded-full bg-slate-200 overflow-hidden">
          {/* 허용 원가율 위치 마커 */}
          <div
            className="absolute top-0 h-2 w-0.5 bg-slate-400 z-10"
            style={{ left: `${Math.min(rev.neededCogsRate, 100)}%` }}
          />
          {/* 현재 원가율 바 */}
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(form.cogsRate, 100)}%`,
              backgroundColor: (rev.cogsRateDiff ?? 0) >= 0 ? '#10b981' : '#ef4444',
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>현재 원가율 <b className="text-slate-600">{form.cogsRate}%</b></span>
          <span>허용 한도 <b className="text-slate-600">{rev.neededCogsRate}%</b></span>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {(rev.cogsRateDiff ?? 0) >= 0
          ? `원가율을 ${rev.cogsRateDiff}%p 더 올려도 목표 달성 가능합니다`
          : `목표 달성을 위해 원가율을 ${Math.abs(rev.cogsRateDiff ?? 0)}%p 낮춰야 합니다`}
      </p>
    </>
  )}
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}
