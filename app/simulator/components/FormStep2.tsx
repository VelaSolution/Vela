"use client";

import React from "react";
import {
  INDUSTRY_CONFIG,
  fmt,
  type FullForm,
} from "@/lib/vela";
import { InputCard, SliderCard, Toggle } from "./FormControls";

export function FormStep2({
  form,
  update,
  errors,
}: {
  form: FullForm;
  update: (k: keyof FullForm, v: unknown) => void;
  errors: Partial<Record<keyof FullForm, string>>;
}) {
  const config = INDUSTRY_CONFIG[form.industry];

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">인건비</h2>
          <p className="mt-1 text-sm text-slate-500">
            직접 입력하거나 인원·시급으로 계산할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["direct", "calculate"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("laborType", type)}
              className={`rounded-3xl border p-4 text-center text-sm font-semibold transition ${
                form.laborType === type
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {type === "direct" ? "💰 직접 입력" : "🧮 인원·시급 계산"}
            </button>
          ))}
        </div>

        {form.laborType === "direct" ? (
          <InputCard
            label="월 인건비 합계"
            hint="직원 급여 총합"
            value={form.labor}
            onChange={(v) => update("labor", v)}
            money
            error={errors.labor}
          />
        ) : (
          <div className="space-y-4">
            <InputCard
              label="직원 수"
              hint="파트타임 포함 전체 인원"
              value={form.staffCount}
              onChange={(v) => update("staffCount", v)}
              suffix="명"
              error={errors.staffCount}
            />
            <InputCard
              label="시간당 임금"
              hint="평균 시급"
              value={form.hourlyWage}
              onChange={(v) => update("hourlyWage", v)}
              money
              error={errors.hourlyWage}
            />
            <InputCard
              label="1인 하루 근무시간"
              hint="평균 일 근무시간"
              value={form.workHoursPerDay}
              onChange={(v) => update("workHoursPerDay", v)}
              suffix="시간"
              error={errors.workHoursPerDay}
            />
            <InputCard
              label="월 근무일"
              hint="1인 기준 월 근무일수"
              value={form.workDaysPerMonth}
              onChange={(v) => update("workDaysPerMonth", v)}
              suffix="일"
              error={errors.workDaysPerMonth}
            />

            <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
              예상 인건비:{" "}
              <span className="font-bold text-slate-900">
                {fmt(
                  form.staffCount *
                    form.hourlyWage *
                    form.workHoursPerDay *
                    form.workDaysPerMonth
                )}
                원
              </span>
            </div>
          </div>
        )}

        <SliderCard
          label="4대보험 사업자 부담률"
          hint="인건비 대비 사업자 추가 부담 (약 9%)"
          value={form.insuranceRate}
          onChange={(v) => update("insuranceRate", v)}
          min={0}
          max={20}
          step={0.5}
          suffix="%"
        />
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">임대 & 시설비</h2>
        </div>

        <InputCard
          label="월 임대료"
          hint="월세 (관리비 포함 가능)"
          value={form.rent}
          onChange={(v) => update("rent", v)}
          money
          error={errors.rent}
        />
        <InputCard
          label="공과금"
          hint="전기·가스·수도"
          value={form.utilities}
          onChange={(v) => update("utilities", v)}
          money
          error={errors.utilities}
        />
        <InputCard
          label="통신비"
          hint="인터넷·전화·POS 시스템"
          value={form.telecom}
          onChange={(v) => update("telecom", v)}
          money
          error={errors.telecom}
        />
        <InputCard
          label="시설 유지보수비"
          hint="청소·수선·설비 관리"
          value={form.maintenance}
          onChange={(v) => update("maintenance", v)}
          money
          error={errors.maintenance}
        />
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">원가 & 수수료</h2>
        </div>

        {form.industry === "cafe" ? (
          <SliderCard
            label="식자재 원가율"
            hint={`원두·우유·시럽·베이커리 등 재료 원가 (${config.label} 기준 ${config.cogsWarnRate}% 이하)`}
            value={form.cogsRate}
            onChange={(v) => update("cogsRate", v)}
            min={1}
            max={80}
            step={1}
            suffix="%"
            error={errors.cogsRate}
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-1 text-sm font-semibold text-slate-900">원가율 구성</p>
            <p className="mb-4 text-xs text-slate-400">
              식자재와 주류를 분리해 더 정확한 원가를 계산합니다.
            </p>

            <div className="space-y-4">
              <SliderCard
                label="식자재 원가율"
                hint="음식 재료 원가"
                value={form.cogsRate}
                onChange={(v) => update("cogsRate", v)}
                min={1}
                max={80}
                step={1}
                suffix="%"
                error={errors.cogsRate}
              />
              <SliderCard
                label="주류 원가율"
                hint="술·음료 원가"
                value={form.alcoholCogsRate}
                onChange={(v) => update("alcoholCogsRate", v)}
                min={0}
                max={70}
                step={1}
                suffix="%"
              />
              <SliderCard
                label="주류 매출 비중"
                hint="전체 매출 중 주류·음료 매출 비중"
                value={form.alcoholSalesRatio}
                onChange={(v) => update("alcoholSalesRatio", v)}
                min={0}
                max={100}
                step={5}
                suffix="%"
              />

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <div className="mb-1 flex justify-between">
                  <span>
                    식사 매출({100 - form.alcoholSalesRatio}%) × 식자재 원가율({form.cogsRate}%)
                  </span>
                  <span className="font-semibold">
                    {(((100 - form.alcoholSalesRatio) / 100) * form.cogsRate).toFixed(1)}%
                  </span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>
                    주류 매출({form.alcoholSalesRatio}%) × 주류 원가율({form.alcoholCogsRate}%)
                  </span>
                  <span className="font-semibold">
                    {((form.alcoholSalesRatio / 100) * form.alcoholCogsRate).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                  <span>통합 원가율</span>
                  <span>
                    {(
                      ((100 - form.alcoholSalesRatio) / 100) * form.cogsRate +
                      (form.alcoholSalesRatio / 100) * form.alcoholCogsRate
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <SliderCard
          label="식자재 폐기율"
          hint="구매 식자재 중 폐기되는 비율 — 실질 원가율에 합산"
          value={form.wasteRate ?? 0}
          onChange={(v) => update("wasteRate", v)}
          min={0} max={20} step={0.5}
          suffix="%"
        />
        {(form.wasteRate ?? 0) > 0 && (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
            실질 원가율: <span className="font-semibold">{(form.cogsRate + (form.wasteRate ?? 0)).toFixed(1)}%</span>
            &nbsp;(구매원가 {form.cogsRate}% + 폐기율 {form.wasteRate}%)
          </div>
        )}

        <SliderCard
          label="카드 수수료율"
          hint="매출 대비 카드 수수료"
          value={form.cardFeeRate}
          onChange={(v) => update("cardFeeRate", v)}
          min={0}
          max={5}
          step={0.1}
          suffix="%"
        />

        {form.deliveryEnabled && (
          <SliderCard
            label="배달앱 수수료율"
            hint="배달 매출 대비 평균 수수료"
            value={form.deliveryFeeRate}
            onChange={(v) => update("deliveryFeeRate", v)}
            min={0}
            max={35}
            step={0.5}
            suffix="%"
          />
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">마케팅 & 기타</h2>
        </div>

        <InputCard
          label="광고/마케팅비"
          hint="SNS 광고·전단지·이벤트 비용"
          value={form.marketing}
          onChange={(v) => update("marketing", v)}
          money
        />
        <InputCard
          label="소모품비"
          hint="포장재·청소용품·일회용품"
          value={form.supplies}
          onChange={(v) => update("supplies", v)}
          money
        />
        <InputCard
          label="기타 운영비"
          hint="예비비·잡비"
          value={form.etc}
          onChange={(v) => update("etc", v)}
          money
        />
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">세금</h2>
          <p className="mt-1 text-sm text-slate-500">실수령액 계산을 위한 세율을 입력하세요.</p>
        </div>

        <SliderCard
          label="종합소득세율"
          hint="예상 소득세율"
          value={form.incomeTaxRate}
          onChange={(v) => update("incomeTaxRate", v)}
          min={0} max={45} step={1}
          suffix="%"
        />

        {/* 사업자 종류 */}
        <div className="rounded-2xl bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">사업자 종류</p>
          <div className="grid grid-cols-2 gap-2">
            {([["individual", "개인사업자", "종합소득세 적용"], ["corporation", "법인", "법인세 적용"]] as const).map(([val, label, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() => update("ownerType", val)}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  (form.ownerType ?? "individual") === val
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className={`text-sm font-semibold ${(form.ownerType ?? "individual") === val ? "text-blue-700" : "text-slate-700"}`}>{label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Toggle
          label="부가세 과세 사업자"
          hint="일반 과세자인 경우 ON"
          value={form.vatEnabled}
          onChange={(v) => update("vatEnabled", v)}
        />
      </section>

      {/* 프랜차이즈 섹션 */}
      <section className="space-y-3 rounded-2xl bg-slate-100 p-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-slate-900">프랜차이즈</h2>
          <p className="mt-1 text-sm text-slate-500">프랜차이즈 가맹점인 경우 입력하세요.</p>
        </div>
        <Toggle
          label="프랜차이즈 가맹점"
          hint="프랜차이즈 로열티가 발생하는 경우"
          value={form.franchiseEnabled ?? false}
          onChange={(v) => update("franchiseEnabled", v)}
        />
        {form.franchiseEnabled && (
          <SliderCard
            label="로열티율"
            hint="매출 대비 본사 로열티 비율"
            value={form.franchiseRoyaltyRate ?? 0}
            onChange={(v) => update("franchiseRoyaltyRate", v)}
            min={0} max={15} step={0.5}
            suffix="%"
          />
        )}
      </section>
    </div>
  );
}
