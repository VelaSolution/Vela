"use client";

import React, { useCallback, useRef, useState } from "react";
import Script from "next/script";
import { fmt } from "@/lib/vela";

export type PosResult = {
  avgSpend: number | null;
  weekdayDays: number | null;
  weekendDays: number | null;
  deliverySales: number | null;
  peakHour: string | null;
  topMenus: string[] | null;
  totalSales: number | null;
  dailyAvgSales: number | null;
  totalTransactions: number | null;
  dataStartDate: string | null;
  dataEndDate: string | null;
  analysisNote: string;
  _truncated?: boolean;
};

export function PosUploader({
  industry,
  onApply,
}: {
  industry: string;
  onApply: (data: Partial<Record<string, unknown>>) => void;
}) {
  const [status, setStatus] = useState<"idle" | "parsing" | "analyzing" | "done" | "error">("idle");
  const [result, setResult] = useState<PosResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseAndAnalyze = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus("parsing");
    setResult(null);
    setErrorMsg("");

    try {
      // SheetJS로 Excel → CSV 변환
      const buffer = await file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const XLSX = (window as any).XLSX;
      if (!XLSX) throw new Error("XLSX 라이브러리 로딩 중입니다. 잠시 후 다시 시도해주세요.");

      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const csvText: string = XLSX.utils.sheet_to_csv(ws);

      setStatus("analyzing");

      const res = await fetch("/api/parse-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, fileName: file.name, industry }),
      });

      if (!res.ok) throw new Error("AI 분석 요청 실패");
      const data: PosResult = await res.json();
      if ("error" in data) throw new Error((data as { error: string }).error);

      setResult(data);
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "알 수 없는 오류");
      setStatus("error");
    }
  }, [industry]);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      setErrorMsg("xlsx, xls, csv 파일만 지원합니다.");
      setStatus("error");
      return;
    }
    parseAndAnalyze(file);
  }, [parseAndAnalyze]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const applyToForm = () => {
    if (!result) return;
    const updates: Partial<Record<string, unknown>> = {};
    if (result.avgSpend) updates.avgSpend = result.avgSpend;
    if (result.weekdayDays) updates.weekdayDays = result.weekdayDays;
    if (result.weekendDays) updates.weekendDays = result.weekendDays;
    if (result.deliverySales && result.deliverySales > 0) {
      updates.deliverySales = result.deliverySales;
      updates.deliveryEnabled = true;
    }
    onApply(updates);
  };

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
      {/* SheetJS CDN */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" strategy="lazyOnload" />

      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">POS</span>
          <p className="text-sm font-semibold text-slate-900">매출 파일 불러오기</p>
        </div>
        <p className="text-xs text-slate-400">Excel 파일을 업로드하면 AI가 자동 분석합니다.</p>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* 드래그 드롭 영역 */}
        <div
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition cursor-pointer ${
            dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
          } ${status === "parsing" || status === "analyzing" ? "pointer-events-none opacity-60" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {status === "idle" || status === "error" ? (
            <>
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-sm font-semibold text-slate-700">파일을 여기에 드래그하거나 클릭해서 선택</p>
                <p className="text-xs text-slate-400 mt-1">.xlsx · .xls · .csv 지원</p>
              </div>
            </>
          ) : status === "parsing" ? (
            <>
              <div className="text-2xl animate-bounce">📂</div>
              <p className="text-sm font-medium text-slate-600">파일 읽는 중...</p>
            </>
          ) : status === "analyzing" ? (
            <>
              <div className="text-2xl animate-pulse">🤖</div>
              <p className="text-sm font-medium text-slate-600">AI 분석 중...</p>
              <p className="text-xs text-slate-400">{fileName}</p>
            </>
          ) : (
            <>
              <div className="text-2xl">✅</div>
              <p className="text-sm font-medium text-emerald-700">분석 완료</p>
              <p className="text-xs text-slate-400">{fileName}</p>
            </>
          )}
        </div>

        {/* 에러 */}
        {status === "error" && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</div>
        )}

        {/* 분석 결과 */}
        {status === "done" && result && (
          <div className="space-y-4">
            {result._truncated && (
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
                ⚠️ 데이터가 많아 일부만 분석되었습니다. 결과가 부분적일 수 있습니다.
              </div>
            )}

            {/* 기간 */}
            {(result.dataStartDate || result.dataEndDate) && (
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400 mb-1">분석 기간</p>
                <p className="text-sm font-semibold text-slate-800">
                  {result.dataStartDate ?? "??"} ~ {result.dataEndDate ?? "??"}
                </p>
              </div>
            )}

            {/* 주요 수치 그리드 */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: "객단가", value: result.avgSpend ? `${fmt(result.avgSpend)}원` : null, highlight: true },
                { label: "일 평균 매출", value: result.dailyAvgSales ? `${fmt(result.dailyAvgSales)}원` : null },
                { label: "총 매출", value: result.totalSales ? `${fmt(result.totalSales)}원` : null },
                { label: "평일 영업일", value: result.weekdayDays ? `${result.weekdayDays}일` : null, highlight: true },
                { label: "주말 영업일", value: result.weekendDays ? `${result.weekendDays}일` : null, highlight: true },
                { label: "배달 매출", value: result.deliverySales ? `${fmt(result.deliverySales)}원` : null, highlight: !!result.deliverySales },
              ].map((item) =>
                item.value ? (
                  <div key={item.label} className={`rounded-2xl p-3 ${item.highlight ? "bg-blue-50" : "bg-slate-50"}`}>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className={`mt-1 text-sm font-bold ${item.highlight ? "text-blue-700" : "text-slate-800"}`}>{item.value}</p>
                  </div>
                ) : null
              )}
            </div>

            {/* 피크 시간 & 인기 메뉴 */}
            <div className="grid gap-2 sm:grid-cols-2">
              {result.peakHour && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400">피크 시간대</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">⏰ {result.peakHour}</p>
                </div>
              )}
              {result.topMenus && result.topMenus.length > 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400">인기 메뉴 TOP {result.topMenus.length}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {result.topMenus.map((m, i) => (
                      <span key={i} className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                        {i + 1}. {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI 노트 */}
            {result.analysisNote && (
              <div className="rounded-2xl bg-slate-900 px-4 py-4">
                <p className="text-xs font-semibold text-slate-400 mb-2">🤖 AI 분석 노트</p>
                <p className="text-sm text-slate-200 leading-relaxed">{result.analysisNote}</p>
              </div>
            )}

            {/* 적용 버튼 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyToForm}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
              >
                분석 결과를 폼에 적용 →
              </button>
              <button
                type="button"
                onClick={() => { setStatus("idle"); setResult(null); setFileName(""); }}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                다시 올리기
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              객단가 · 영업일 · 배달매출만 자동 적용됩니다. 나머지는 직접 확인 후 수정해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
