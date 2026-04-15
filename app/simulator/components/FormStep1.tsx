"use client";

import React from "react";
import {
  INDUSTRY_CONFIG,
  VALID_INDUSTRIES,
  type FullForm,
} from "@/lib/vela";
import { InputCard, SliderCard, Toggle } from "./FormControls";
import { PosUploader } from "./PosUploader";

export function FormStep1({
  form,
  update,
  errors,
  loadIndustryDefaults,
  applyPosResult,
}: {
  form: FullForm;
  update: (k: keyof FullForm, v: unknown) => void;
  errors: Partial<Record<keyof FullForm, string>>;
  loadIndustryDefaults: () => void;
  applyPosResult: (data: Partial<Record<string, unknown>>) => void;
}) {
  const config = INDUSTRY_CONFIG[form.industry];
  const ratioSum = form.lunchRatio + form.dinnerRatio + form.nightRatio;

  return (
    <div className="space-y-6">
      {/* POS 파일 업로드 */}
      <PosUploader industry={form.industry} onApply={applyPosResult} />

      <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-1 text-xl font-bold text-slate-900">업종 선택</h2>
        <p className="mb-4 text-sm text-slate-500">
          업종별 벤치마크 기준과 기본값이 자동 적용됩니다.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {VALID_INDUSTRIES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => update("industry", key)}
              className={`flex flex-col items-center gap-2 rounded-3xl border p-4 text-center transition ${
                form.industry === key
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">{INDUSTRY_CONFIG[key].icon}</span>
              <span className="text-sm font-semibold">{INDUSTRY_CONFIG[key].label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
          <span className="font-semibold text-slate-700">{config.label} 기준</span>
          &nbsp;— 원가율 {config.cogsWarnRate}% · 인건비 {config.laborWarnRate}% · 최대
          회전율 {config.maxTurnover}회 · 순이익률 {config.netMarginWarn}% 이상
        </div>

        <button
          type="button"
          onClick={loadIndustryDefaults}
          className="mt-3 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
        >
          {config.label} 샘플 기본값 불러오기 →
        </button>
      </section>

      <section className="space-y-4 rounded-[28px] bg-slate-100 p-4">
        <div className="px-1">
          <h2 className="text-xl font-bold text-slate-900">홀 매출</h2>
          <p className="mt-1 text-sm text-slate-500">매장 내 홀 영업 수치를 입력하세요.</p>
        </div>

        <InputCard
          label="좌석 수"
          hint="매장 총 좌석 수"
          value={form.seats}
          onChange={(v) => update("seats", v)}
          suffix="석"
          error={errors.seats}
        />
        <InputCard
          label="객단가"
          hint="고객 1명 평균 결제 금액"
          value={form.avgSpend}
          onChange={(v) => update("avgSpend", v)}
          suffix="원"
          money
          error={errors.avgSpend}
        />
        <SliderCard
          label="회전율"
          hint={`하루 평균 테이블 회전 횟수 (${config.label} 최대 ${config.maxTurnover}회)`}
          value={form.turnover}
          onChange={(v) => update("turnover", v)}
          min={0.1}
          max={config.maxTurnover}
          step={0.1}
          suffix="회"
          error={errors.turnover}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputCard
            label="평일 영업일"
            hint="월 기준 평일 영업 일수"
            value={form.weekdayDays}
            onChange={(v) => update("weekdayDays", v)}
            suffix="일"
            error={errors.weekdayDays}
          />
          <InputCard
            label="주말 영업일"
            hint="월 기준 주말 영업 일수 (최대 8일)"
            value={form.weekendDays}
            onChange={(v) => update("weekendDays", v)}
            suffix="일"
            error={errors.weekendDays}
          />
        </div>

        <SliderCard
          label="주말 매출 배율"
          hint="평일 대비 주말 매출 비율"
          value={form.weekendMultiplier}
          onChange={(v) => update("weekendMultiplier", v)}
          min={0.5}
          max={3}
          step={0.1}
          suffix="x"
        />

        <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-500">
          총 영업일 <span className="font-semibold text-slate-900">{form.weekdayDays + form.weekendDays}일</span>
          &nbsp;·&nbsp; 유효 영업일 환산{" "}
          <span className="font-semibold text-slate-900">
            {(form.weekdayDays + form.weekendDays * form.weekendMultiplier).toFixed(1)}일
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SliderCard
            label="포장/테이크아웃 비율"
            hint="홀 매출 중 포장 비중"
            value={form.takeoutRatio ?? 0}
            onChange={(v) => update("takeoutRatio", v)}
            min={0} max={80} step={5}
            suffix="%"
          />
          <SliderCard
            label="현금 결제 비율"
            hint="나머지는 카드 수수료 적용"
            value={form.cashPaymentRate ?? 10}
            onChange={(v) => update("cashPaymentRate", v)}
            min={0} max={60} step={5}
            suffix="%"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] bg-slate-100 p-4">
        <div className="px-1">
          <h2 className="text-xl font-bold text-slate-900">시간대별 매출 비중</h2>
          <p className="mt-1 text-sm text-slate-500">합계가 100%가 되도록 입력하세요.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SliderCard
            label="점심"
            hint="런치 타임 매출 비중"
            value={form.lunchRatio}
            onChange={(v) => update("lunchRatio", v)}
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
          <SliderCard
            label="저녁"
            hint="디너 타임 매출 비중"
            value={form.dinnerRatio}
            onChange={(v) => update("dinnerRatio", v)}
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
          <SliderCard
            label="심야"
            hint="심야 시간대 매출 비중"
            value={form.nightRatio}
            onChange={(v) => update("nightRatio", v)}
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-xs ${
            ratioSum === 100 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          합계: {ratioSum}%
          {ratioSum !== 100 && " · 합계가 100%가 되어야 합니다"}
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] bg-slate-100 p-4">
        <div className="px-1">
          <h2 className="text-xl font-bold text-slate-900">배달 매출</h2>
          <p className="mt-1 text-sm text-slate-500">배달 채널이 있는 경우 입력하세요.</p>
        </div>

        <Toggle
          label="배달 운영 여부"
          hint="배달앱 또는 직접 배달 운영 중인 경우 ON"
          value={form.deliveryEnabled}
          onChange={(v) => update("deliveryEnabled", v)}
        />

        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-900">배달 운영 의향</p>
            <p className="mt-1 text-xs text-slate-400">AI가 배달 전략을 추천할지 여부</p>
          </div>
          <div className="flex gap-2">
            {(["possible", "impossible"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => update("deliveryPreference", v)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  form.deliveryPreference === v
                    ? v === "possible"
                      ? "bg-emerald-600 text-white"
                      : "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {v === "possible" ? "추천 허용" : "추천 금지"}
              </button>
            ))}
          </div>
        </div>

        {form.deliveryEnabled && (
          <>
            <InputCard
              label="월 배달 매출"
              hint="배달앱 + 직접 배달 합산 매출"
              value={form.deliverySales}
              onChange={(v) => update("deliverySales", v)}
              money
              error={errors.deliverySales}
            />
            <SliderCard
              label="직접 배달 비율"
              hint="전체 배달 중 직접 배달 비중 (배달앱 수수료 미부과)"
              value={form.deliveryDirectRate}
              onChange={(v) => update("deliveryDirectRate", v)}
              min={0}
              max={100}
              step={5}
              suffix="%"
            />
            <SliderCard
              label="배달앱 수수료율"
              hint="배달의민족·쿠팡이츠 등 평균 수수료"
              value={form.deliveryAppRate}
              onChange={(v) => update("deliveryAppRate", v)}
              min={0}
              max={35}
              step={0.5}
              suffix="%"
            />
          </>
        )}
      </section>
    </div>
  );
}
