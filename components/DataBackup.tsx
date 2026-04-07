"use client";
import { useState } from "react";

const VELA_KEYS_PREFIX = "vela-";

export default function DataBackup() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExport = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(VELA_KEYS_PREFIX)) {
        data[key] = localStorage.getItem(key) || "";
      }
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vela-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setResult(`${Object.keys(data).length}개 항목 내보내기 완료`);
    setTimeout(() => setResult(null), 3000);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          if (typeof key === "string" && key.startsWith(VELA_KEYS_PREFIX)) {
            localStorage.setItem(key, value as string);
            count++;
          }
        }
        setResult(`${count}개 항목 복원 완료. 새로고침하면 적용됩니다.`);
      } catch {
        setResult("파일을 읽을 수 없습니다. 올바른 백업 파일인지 확인해주세요.");
      }
      setImporting(false);
      setTimeout(() => setResult(null), 5000);
    };
    input.click();
  };

  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-1">💾 데이터 백업</h3>
      <p className="text-xs text-slate-500 mb-3">모든 도구 데이터를 JSON 파일로 내보내거나 복원할 수 있습니다.</p>
      <div className="flex gap-2">
        <button onClick={handleExport}
          className="flex-1 rounded-xl bg-slate-900 text-white font-semibold py-2 text-xs hover:bg-slate-800 transition">
          📥 내보내기
        </button>
        <button onClick={handleImport} disabled={importing}
          className="flex-1 rounded-xl bg-white ring-1 ring-slate-200 text-slate-700 font-semibold py-2 text-xs hover:bg-slate-50 transition disabled:opacity-50">
          {importing ? "복원 중..." : "📤 가져오기"}
        </button>
      </div>
      {result && <p className="text-xs text-blue-600 mt-2">{result}</p>}
    </div>
  );
}
