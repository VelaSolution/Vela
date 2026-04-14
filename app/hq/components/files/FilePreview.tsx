"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/app/hq/types";
import { fileIcon, getPreviewType, formatDate, IconX } from "./FileHelpers";

function PreviewContent({ file }: { file: FileItem }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const type = getPreviewType(file.type, file.name);

  useEffect(() => {
    if (type === "text") {
      setLoading(true);
      fetch(`/api/r2/proxy?url=${encodeURIComponent(file.url)}`)
        .then(r => r.ok ? r.text() : fetch(file.url).then(r2 => r2.text()))
        .then(t => { setText(t); setLoading(false); })
        .catch(() => {
          fetch(file.url).then(r => r.text()).then(t => { setText(t); setLoading(false); }).catch(() => setLoading(false));
        });
    }
    setImgError(false);
  }, [file.url, type]);

  if (type === "image") {
    if (imgError) return (
      <div className="text-center py-10">
        <span className="text-5xl block mb-4">🖼️</span>
        <p className="text-sm text-slate-500">이미지를 불러올 수 없습니다</p>
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3182F6] mt-2 inline-block">직접 열기 →</a>
      </div>
    );
    return <img src={file.url} alt={file.name} className="max-w-full max-h-[70vh] object-contain rounded-lg" onError={() => setImgError(true)} />;
  }
  if (type === "pdf") return (
    <div className="w-full h-[70vh] flex flex-col">
      <iframe src={file.url + "#toolbar=1"} className="w-full flex-1 rounded-lg border-0" />
      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3182F6] mt-2 text-center">PDF가 안 보이면 여기를 클릭하세요 →</a>
    </div>
  );
  if (type === "video") return <video src={file.url} controls className="max-w-full max-h-[70vh] rounded-lg" />;
  if (type === "audio") return <div className="text-center"><span className="text-5xl mb-4 block">🎵</span><p className="text-sm text-slate-500 mb-3">{file.name}</p><audio src={file.url} controls className="w-full max-w-md" /></div>;
  if (type === "text") {
    if (loading) return <div className="text-sm text-slate-400">불러오는 중...</div>;
    return (
      <pre className="w-full h-[70vh] overflow-auto bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 font-mono whitespace-pre-wrap break-words">
        {text ?? "내용을 불러올 수 없습니다"}
      </pre>
    );
  }
  return (
    <div className="text-center py-10">
      <span className="text-5xl block mb-4">{fileIcon(file.type)}</span>
      <p className="text-sm text-slate-500 mb-1">미리보기를 지원하지 않는 파일 형식입니다</p>
      <p className="text-xs text-slate-400 mb-3">{file.type || "알 수 없는 형식"}</p>
      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3182F6]">직접 열기 →</a>
    </div>
  );
}

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg">{fileIcon(file.type)}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{file.size} · {file.uploadedBy} · {formatDate(file.uploadedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-[#3182F6] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#2672DE] transition">다운로드</a>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
              <IconX />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 flex items-center justify-center bg-slate-50/50 min-h-[300px]">
          <PreviewContent file={file} />
        </div>
      </div>
    </div>
  );
}
