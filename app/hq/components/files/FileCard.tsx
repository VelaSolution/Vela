"use client";

import React from "react";
import { HQRole, FileItem } from "@/app/hq/types";
import {
  SecurityLevel,
  getPermissions, getSecurityStyle,
  IconCheck, LargeFileIcon,
} from "./FileHelpers";

interface FileCardProps {
  file: FileItem;
  myRole: HQRole;
  userName: string;
  isSelected: boolean;
  isRenaming: boolean;
  renameValue: string;
  onPreview: (f: FileItem) => void;
  onToggleSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, fileId: string) => void;
  onContextMenu: (f: FileItem, x: number, y: number) => void;
  onRenameChange: (v: string) => void;
  onRenameConfirm: (id: string) => void;
  onRenameCancel: () => void;
  renameRef: React.RefObject<HTMLInputElement | null>;
}

export default function FileCard({
  file: f, myRole, userName, isSelected, isRenaming,
  renameValue,
  onPreview, onToggleSelect, onDragStart, onContextMenu,
  onRenameChange, onRenameConfirm, onRenameCancel, renameRef,
}: FileCardProps) {
  const perm = getPermissions(myRole, f.uploadedBy, userName);
  const secStyle = getSecurityStyle((f.security as SecurityLevel) || "내부용");

  return (
    <div
      key={f.id}
      draggable={perm.canMove}
      onDragStart={(e) => onDragStart(e, f.id)}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(f, e.clientX, e.clientY); }}
      className={`group relative flex flex-col items-center p-4 rounded-2xl transition-all cursor-pointer border
        ${isSelected ? "bg-[#3182F6]/5 border-[#3182F6]/20 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"}
        ${perm.canMove ? "cursor-grab active:cursor-grabbing" : ""}`}
      onClick={() => onPreview(f)}
      onDoubleClick={() => onPreview(f)}
    >
      {/* checkbox */}
      <div
        className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
          ${isSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-transparent group-hover:border-slate-200"}`}
        onClick={(e) => { e.stopPropagation(); onToggleSelect(f.id); }}
      >
        {isSelected && <IconCheck />}
      </div>

      {/* security badge */}
      <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold rounded-md px-1.5 py-0.5 ${secStyle.color}`}>
        {secStyle.icon}
      </span>

      <LargeFileIcon type={f.type} name={f.name} />

      {isRenaming ? (
        <div className="mt-3 w-full" onClick={(e) => e.stopPropagation()}>
          <input
            ref={renameRef}
            className="text-xs font-semibold text-slate-800 border border-[#3182F6] rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100 w-full text-center"
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onRenameConfirm(f.id); if (e.key === "Escape") onRenameCancel(); }}
          />
        </div>
      ) : (
        <p className="text-xs font-medium text-slate-700 mt-3 text-center truncate w-full px-1" title={f.name}>{f.name}</p>
      )}
      <p className="text-[10px] text-slate-400 mt-1">{f.size}</p>
    </div>
  );
}
