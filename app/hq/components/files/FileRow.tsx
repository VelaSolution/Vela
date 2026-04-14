"use client";

import React, { useRef } from "react";
import { HQRole, FileItem, Folder } from "@/app/hq/types";
import {
  SecurityLevel, SECURITY_LEVELS,
  fileIcon, getPreviewType, getPermissions, getSecurityStyle,
  formatDateShort, IconCheck, IconFolder, IconFolderOpen,
  CtxMenuItem,
} from "./FileHelpers";

/* ================================================================
   FileRow — single file in list view
   ================================================================ */
interface FileRowProps {
  file: FileItem;
  myRole: HQRole;
  userName: string;
  isSelected: boolean;
  isRenaming: boolean;
  isMoving: boolean;
  renameValue: string;
  movingFile: string | null;
  currentFolder: string | undefined;
  allFolders: Folder[];
  isAdmin: boolean;
  onPreview: (f: FileItem) => void;
  onToggleSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, fileId: string) => void;
  onContextMenu: (f: FileItem, x: number, y: number) => void;
  onRenameChange: (v: string) => void;
  onRenameConfirm: (id: string) => void;
  onRenameCancel: () => void;
  onChangeSecurity: (id: string, level: SecurityLevel) => void;
  onMoveFile: (fileId: string, targetFolderId: string | null) => void;
  onSetMovingFile: (id: string | null) => void;
  onSetConfirmDelete: (v: { type: "file" | "folder"; id: string; name: string } | null) => void;
  renameRef: React.RefObject<HTMLInputElement | null>;
}

export default function FileRow({
  file: f, myRole, userName, isSelected, isRenaming, isMoving,
  renameValue, currentFolder, allFolders, isAdmin,
  onPreview, onToggleSelect, onDragStart, onContextMenu,
  onRenameChange, onRenameConfirm, onRenameCancel,
  onChangeSecurity, onMoveFile, onSetMovingFile, onSetConfirmDelete, renameRef,
}: FileRowProps) {
  const perm = getPermissions(myRole, f.uploadedBy, userName);
  const secStyle = getSecurityStyle((f.security as SecurityLevel) || "내부용");

  return (
    <div
      key={f.id}
      draggable={perm.canMove}
      onDragStart={(e) => onDragStart(e, f.id)}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(f, e.clientX, e.clientY); }}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
        ${isSelected ? "bg-[#3182F6]/5 ring-1 ring-[#3182F6]/20" : "hover:bg-slate-50"}
        ${perm.canMove ? "cursor-grab active:cursor-grabbing" : ""}`}
      onClick={() => onPreview(f)}
    >
      {/* checkbox */}
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
          ${isSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-slate-200 group-hover:border-slate-300"}`}
        onClick={(e) => { e.stopPropagation(); onToggleSelect(f.id); }}
      >
        {isSelected && <IconCheck />}
      </div>

      {/* icon */}
      <span className="text-lg flex-shrink-0">{fileIcon(f.type)}</span>

      {/* name & info */}
      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              ref={renameRef}
              className="text-sm font-semibold text-slate-800 border border-[#3182F6] rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-blue-100 w-56"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onRenameConfirm(f.id); if (e.key === "Escape") onRenameCancel(); }}
            />
            <button onClick={() => onRenameConfirm(f.id)} className="text-xs text-[#3182F6] font-semibold hover:underline">확인</button>
            <button onClick={onRenameCancel} className="text-xs text-slate-400 hover:text-slate-600">취소</button>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-800 truncate">
            {f.name}
            {getPreviewType(f.type, f.name) && <span className="ml-1.5 text-[10px] text-[#3182F6]/70 font-normal">미리보기</span>}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-0.5">
          {f.uploadedBy} · {formatDateShort(f.uploadedAt)}
        </p>
      </div>

      {/* security badge */}
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {isAdmin ? (
          <select
            className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border-0 cursor-pointer appearance-none ${secStyle.color}`}
            value={f.security || "내부용"}
            onChange={(e) => onChangeSecurity(f.id, e.target.value as SecurityLevel)}
          >
            {SECURITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
          </select>
        ) : (
          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold ${secStyle.color}`}>
            {secStyle.icon} {f.security || "내부용"}
          </span>
        )}
      </div>

      {/* size */}
      <span className="text-xs text-slate-400 w-16 text-right flex-shrink-0 hidden sm:block">{f.size}</span>

      {/* actions on hover */}
      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <a href={f.url} target="_blank" rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#3182F6] hover:bg-[#3182F6]/5 transition-all" title="다운로드">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </a>
        {perm.canDelete && (
          <button onClick={() => onSetConfirmDelete({ type: "file", id: f.id, name: f.name })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="삭제">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
      </div>

      {/* move dropdown */}
      {isMoving && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl p-2 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
          <p className="text-[10px] text-slate-400 font-semibold px-2.5 mb-1 uppercase tracking-wider">이동할 폴더 선택</p>
          {currentFolder && (
            <button onClick={() => onMoveFile(f.id, null)} className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2">
              <IconFolderOpen className="w-4 h-4 text-amber-400" /> 루트
            </button>
          )}
          {allFolders.filter(af => af.id !== currentFolder).map(af => (
            <button key={af.id} onClick={() => onMoveFile(f.id, af.id)} className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2">
              <IconFolder className="w-4 h-4 text-amber-400" /> {af.name}
            </button>
          ))}
          <div className="h-px bg-slate-100 my-1" />
          <button onClick={() => onSetMovingFile(null)} className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-red-50 text-slate-400">취소</button>
        </div>
      )}
    </div>
  );
}
