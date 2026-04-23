"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { HQRole, Folder, FileItem } from "@/app/hq/types";
import { sb, B2 } from "@/app/hq/utils";
import { FileRow } from "./files";
import { FileCard } from "./files";
import FilePreview from "./files/FilePreview";
import UploadArea from "./files/UploadArea";
import {
  SecurityLevel, SECURITY_LEVELS,
  fileIcon, fileCategory, formatSize, parseBytes,
  canAccessSecurity, getSecurityStyle, getPermissions, getPreviewType,
  IconFolder, IconFolderOpen, IconGrid, IconList,
  IconChevronRight, IconUpload, IconPlus, IconCheck, IconX,
  LargeFileIcon, LargeFolderIcon, CtxMenuItem,
} from "./files/FileHelpers";

/* ================================================================
   Constants
   ================================================================ */
const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB
const TAG_COLORS = [
  { key: "red", label: "빨강", color: "bg-red-500", dot: "bg-red-400" },
  { key: "orange", label: "주황", color: "bg-orange-500", dot: "bg-orange-400" },
  { key: "yellow", label: "노랑", color: "bg-yellow-500", dot: "bg-yellow-400" },
  { key: "green", label: "초록", color: "bg-green-500", dot: "bg-green-400" },
  { key: "blue", label: "파랑", color: "bg-blue-500", dot: "bg-blue-400" },
  { key: "purple", label: "보라", color: "bg-purple-500", dot: "bg-purple-400" },
] as const;

type TagColor = typeof TAG_COLORS[number]["key"];

/* ================================================================
   Props
   ================================================================ */
interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

/* ================================================================
   File Version type
   ================================================================ */
type FileVersion = {
  id: string;
  file_id: string;
  version_number: number;
  url: string;
  size: number;
  uploaded_by: string;
  created_at: string;
};

/* ================================================================
   Recent file type (localStorage)
   ================================================================ */
type RecentFileEntry = {
  id: string;
  name: string;
  time: string;
  url: string;
  type: string;
  size: string;
};

/* ================================================================
   Context Menu component
   ================================================================ */
function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: CtxMenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let nx = x, ny = y;
    if (rect.right > window.innerWidth - 8) nx = window.innerWidth - rect.width - 8;
    if (rect.bottom > window.innerHeight - 8) ny = window.innerHeight - rect.height - 8;
    if (nx !== x || ny !== y) setPos({ x: nx, y: ny });
  }, [x, y]);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("click", handler);
    window.addEventListener("contextmenu", handler);
    window.addEventListener("scroll", handler, true);
    return () => { window.removeEventListener("click", handler); window.removeEventListener("contextmenu", handler); window.removeEventListener("scroll", handler, true); };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[180px] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/80 py-1.5 animate-in fade-in duration-100"
      style={{ left: pos.x, top: pos.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => item.divider ? (
        <div key={i} className="h-px bg-slate-100 my-1" />
      ) : (
        <button
          key={i}
          disabled={item.disabled}
          className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2.5 transition-colors
            ${item.disabled ? "text-slate-300 cursor-not-allowed" : item.danger ? "text-red-500 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
          onClick={() => { item.onClick(); onClose(); }}
        >
          <span className="w-4 text-center text-sm">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function FilesTab({ userId, userName, myRole, flash }: Props) {
  /* -- state -- */
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const [breadcrumb, setBreadcrumb] = useState<{ id?: string; name: string }[]>([{ name: "루트" }]);
  const [newFolder, setNewFolder] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [movingFile, setMovingFile] = useState<string | null>(null);
  const [preview, setPreview] = useState<FileItem | null>(null);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ type: "file" | "folder"; id: string; name: string } | null>(null);
  const [uploadSecurity, setUploadSecurity] = useState<SecurityLevel>("내부용");
  const [securityFilter, setSecurityFilter] = useState<SecurityLevel | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [groupByType, setGroupByType] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: CtxMenuItem[] } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [bulkSecurityOpen, setBulkSecurityOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // 버전 관리 state
  const [versionHistoryFileId, setVersionHistoryFileId] = useState<string | null>(null);
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([]);
  const [versionCounts, setVersionCounts] = useState<Record<string, number>>({});
  const [loadingVersions, setLoadingVersions] = useState(false);

  // ★ Feature 2: 공유 링크 state
  const [shareModal, setShareModal] = useState<{ file: FileItem } | null>(null);
  const [shareExpiry, setShareExpiry] = useState<"1" | "7" | "30" | "unlimited">("7");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareGenerating, setShareGenerating] = useState(false);

  // ★ Feature 3: 즐겨찾기 state
  const [starredFileIds, setStarredFileIds] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [allStarredFiles, setAllStarredFiles] = useState<FileItem[]>([]);

  // ★ Feature 4: 최근 파일 state
  const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  // ★ Feature 5: 태그/라벨 state
  const [fileTags, setFileTags] = useState<Record<string, TagColor>>({});
  const [tagModal, setTagModal] = useState<{ file: FileItem } | null>(null);
  const [tagFilter, setTagFilter] = useState<TagColor | "all">("all");

  // ★ Feature 7: 파일 검색 state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(FileItem & { folderPath?: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ★ Feature 9: 파일 정보 패널 state
  const [infoPanel, setInfoPanel] = useState<FileItem | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const newFolderRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const isAdmin = myRole === "대표" || myRole === "이사";
  const canCreateFolder = myRole !== "팀원";

  /* -- data loading -- */
  const load = useCallback(async (folderId?: string) => {
    const s = sb();
    if (!s) return setLoading(false);

    const [fRes, fileRes, allF] = await Promise.all([
      folderId
        ? s.from("hq_folders").select("*").eq("parent_id", folderId)
        : s.from("hq_folders").select("*").is("parent_id", null),
      folderId
        ? s.from("hq_files").select("*").eq("folder_id", folderId)
        : s.from("hq_files").select("*").is("folder_id", null),
      s.from("hq_folders").select("*").order("name"),
    ]);

    if (fRes.data)
      setFolders(fRes.data.map((r: Record<string, unknown>) => ({ id: r.id as string, name: r.name as string, parentId: r.parent_id as string | undefined })));
    if (fileRes.data)
      setFiles(fileRes.data.map((r: Record<string, unknown>) => ({
        id: r.id as string, name: r.name as string, size: formatSize((r.size as number) || 0),
        type: (r.type as string) || "", url: (r.url as string) || "", uploadedAt: r.created_at as string,
        uploadedBy: (r.uploaded_by as string) || "", folderId: r.folder_id as string | undefined,
        security: (r.security as string) || "내부용",
      })));
    if (allF.data)
      setAllFolders(allF.data.map((r: Record<string, unknown>) => ({ id: r.id as string, name: r.name as string, parentId: r.parent_id as string | undefined })));

    // 버전 카운트 로드
    try {
      const fileIds = fileRes.data?.map((r: any) => r.id as string) || [];
      if (fileIds.length > 0) {
        const { data: vData } = await s.from("hq_file_versions").select("file_id").in("file_id", fileIds);
        if (vData) {
          const counts: Record<string, number> = {};
          for (const v of vData) {
            counts[v.file_id] = (counts[v.file_id] || 0) + 1;
          }
          setVersionCounts(counts);
        }
      } else {
        setVersionCounts({});
      }
    } catch {
      setVersionCounts({});
    }

    // ★ Feature 3: 즐겨찾기 로드
    try {
      const { data: starData } = await s.from("hq_file_stars").select("file_id").eq("user_id", userId);
      if (starData) {
        setStarredFileIds(new Set(starData.map((r: any) => r.file_id as string)));
      }
    } catch {
      // table may not exist yet
    }

    // ★ Feature 5: 태그 로드
    try {
      const fileIds = fileRes.data?.map((r: any) => r.id as string) || [];
      if (fileIds.length > 0) {
        const { data: tagData } = await s.from("hq_file_tags").select("file_id, color").in("file_id", fileIds);
        if (tagData) {
          const tags: Record<string, TagColor> = {};
          for (const t of tagData) {
            tags[t.file_id] = t.color as TagColor;
          }
          setFileTags(tags);
        }
      }
    } catch {
      // table may not exist yet
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => { load(currentFolder); }, [currentFolder, load]);

  // ★ Feature 4: 최근 파일 로드 (localStorage)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hq_recent_files");
      if (stored) {
        setRecentFiles(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const addToRecent = useCallback((f: FileItem) => {
    setRecentFiles(prev => {
      const entry: RecentFileEntry = { id: f.id, name: f.name, time: new Date().toISOString(), url: f.url, type: f.type, size: f.size };
      const filtered = prev.filter(r => r.id !== f.id);
      const next = [entry, ...filtered].slice(0, 20);
      try { localStorage.setItem("hq_recent_files", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  /* -- version management -- */
  const loadVersionHistory = useCallback(async (fileId: string) => {
    setLoadingVersions(true);
    setVersionHistoryFileId(fileId);
    const s = sb();
    if (!s) { setLoadingVersions(false); return; }
    try {
      const { data } = await s.from("hq_file_versions").select("*").eq("file_id", fileId).order("version_number", { ascending: false });
      if (data) {
        setFileVersions(data as FileVersion[]);
      } else {
        setFileVersions([]);
      }
    } catch {
      setFileVersions([]);
    }
    setLoadingVersions(false);
  }, []);

  const restoreVersion = useCallback(async (version: FileVersion) => {
    const s = sb();
    if (!s) return;
    const file = files.find(f => f.id === version.file_id);
    if (!file) return;

    const currentVersionNumber = (versionCounts[version.file_id] || 0) + 1;
    try {
      await s.from("hq_file_versions").insert({
        file_id: version.file_id,
        version_number: currentVersionNumber,
        url: file.url,
        size: parseBytes(file.size),
        uploaded_by: file.uploadedBy,
        created_at: file.uploadedAt || new Date().toISOString(),
      });
    } catch {}

    const { error } = await s.from("hq_files").update({
      url: version.url,
      size: version.size,
    }).eq("id", version.file_id);
    if (error) { flash("복원 실패: " + error.message); return; }
    flash(`v${version.version_number} 버전으로 복원되었습니다`);
    loadVersionHistory(version.file_id);
    load(currentFolder);
  }, [files, versionCounts, flash, load, currentFolder, loadVersionHistory]);

  /* -- navigation -- */
  const openFolder = useCallback((f: Folder) => {
    setCurrentFolder(f.id);
    setBreadcrumb((prev) => [...prev, { id: f.id, name: f.name }]);
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
    setShowFavorites(false);
    setShowRecent(false);
    setShowSearch(false);
    setSearchQuery("");
  }, []);

  const goTo = useCallback((idx: number) => {
    const target = breadcrumb[idx];
    setCurrentFolder(target.id);
    setBreadcrumb((prev) => prev.slice(0, idx + 1));
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
    setShowFavorites(false);
    setShowRecent(false);
    setShowSearch(false);
    setSearchQuery("");
  }, [breadcrumb]);

  // ★ Feature 3: 즐겨찾기 보기
  const openFavorites = useCallback(async () => {
    setShowFavorites(true);
    setShowRecent(false);
    setShowSearch(false);
    setSearchQuery("");
    setLoading(true);
    const s = sb();
    if (!s) { setLoading(false); return; }
    try {
      const { data: starData } = await s.from("hq_file_stars").select("file_id").eq("user_id", userId);
      if (starData && starData.length > 0) {
        const fileIds = starData.map((r: any) => r.file_id);
        const { data: fileData } = await s.from("hq_files").select("*").in("id", fileIds);
        if (fileData) {
          setAllStarredFiles(fileData.map((r: Record<string, unknown>) => ({
            id: r.id as string, name: r.name as string, size: formatSize((r.size as number) || 0),
            type: (r.type as string) || "", url: (r.url as string) || "", uploadedAt: r.created_at as string,
            uploadedBy: (r.uploaded_by as string) || "", folderId: r.folder_id as string | undefined,
            security: (r.security as string) || "내부용",
          })));
        }
      } else {
        setAllStarredFiles([]);
      }
    } catch {
      setAllStarredFiles([]);
    }
    setLoading(false);
  }, [userId]);

  // ★ Feature 3: 별표 토글
  const toggleStar = useCallback(async (fileId: string) => {
    const s = sb();
    if (!s) return;
    const isStarred = starredFileIds.has(fileId);
    if (isStarred) {
      await s.from("hq_file_stars").delete().eq("file_id", fileId).eq("user_id", userId);
      setStarredFileIds(prev => { const next = new Set(prev); next.delete(fileId); return next; });
      if (showFavorites) {
        setAllStarredFiles(prev => prev.filter(f => f.id !== fileId));
      }
    } else {
      await s.from("hq_file_stars").insert({ file_id: fileId, user_id: userId });
      setStarredFileIds(prev => { const next = new Set(prev); next.add(fileId); return next; });
    }
  }, [starredFileIds, userId, showFavorites]);

  // ★ Feature 5: 태그 설정
  const setFileTag = useCallback(async (fileId: string, color: TagColor | null) => {
    const s = sb();
    if (!s) return;
    try {
      if (color === null) {
        await s.from("hq_file_tags").delete().eq("file_id", fileId);
        setFileTags(prev => { const next = { ...prev }; delete next[fileId]; return next; });
      } else {
        // upsert
        await s.from("hq_file_tags").upsert({ file_id: fileId, color }, { onConflict: "file_id" });
        setFileTags(prev => ({ ...prev, [fileId]: color }));
      }
    } catch {
      // fallback: try delete then insert
      try {
        await s.from("hq_file_tags").delete().eq("file_id", fileId);
        if (color !== null) {
          await s.from("hq_file_tags").insert({ file_id: fileId, color });
          setFileTags(prev => ({ ...prev, [fileId]: color }));
        } else {
          setFileTags(prev => { const next = { ...prev }; delete next[fileId]; return next; });
        }
      } catch {}
    }
    setTagModal(null);
    flash(color ? `태그가 설정되었습니다` : `태그가 제거되었습니다`);
  }, [flash]);

  // ★ Feature 2: 공유 링크 생성
  const generateShareLink = useCallback(async (file: FileItem) => {
    setShareGenerating(true);
    const s = sb();
    if (!s) { setShareGenerating(false); return; }
    const token = crypto.randomUUID();
    const expiresAt = shareExpiry === "unlimited"
      ? null
      : new Date(Date.now() + parseInt(shareExpiry) * 86400000).toISOString();
    try {
      await s.from("hq_file_shares").insert({
        file_id: file.id,
        share_token: token,
        expires_at: expiresAt,
        created_by: userName,
      });
    } catch {}
    // Use the file's existing R2 URL as the shareable URL
    const url = file.url;
    setShareUrl(url);
    setShareGenerating(false);
  }, [shareExpiry, userName]);

  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      flash("링크가 복사되었습니다");
    }).catch(() => {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      flash("링크가 복사되었습니다");
    });
  }, [shareUrl, flash]);

  // ★ Feature 7: 검색 (디바운스)
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const s = sb();
    if (!s) { setIsSearching(false); return; }
    try {
      const { data } = await s.from("hq_files").select("*").ilike("name", `%${query.trim()}%`).limit(50);
      if (data) {
        const results: (FileItem & { folderPath?: string })[] = [];
        for (const r of data) {
          const file: FileItem & { folderPath?: string } = {
            id: r.id as string, name: r.name as string, size: formatSize((r.size as number) || 0),
            type: (r.type as string) || "", url: (r.url as string) || "", uploadedAt: r.created_at as string,
            uploadedBy: (r.uploaded_by as string) || "", folderId: r.folder_id as string | undefined,
            security: (r.security as string) || "내부용",
          };
          // resolve folder path
          if (r.folder_id) {
            const folder = allFolders.find(f => f.id === r.folder_id);
            file.folderPath = folder ? folder.name : "폴더";
          } else {
            file.folderPath = "루트";
          }
          results.push(file);
        }
        setSearchResults(results);
      }
    } catch {}
    setIsSearching(false);
  }, [allFolders]);

  useEffect(() => {
    if (!showSearch) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery, showSearch, performSearch]);

  // ★ Feature 8: 일괄 다운로드
  const bulkDownload = useCallback(() => {
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    if (selectedFileItems.length === 0) return;
    for (const f of selectedFileItems) {
      const link = document.createElement("a");
      link.href = f.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = f.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    flash(`${selectedFileItems.length}개 파일 다운로드 시작`);
  }, [files, selectedFiles, flash]);

  /* -- CRUD operations -- */
  const createFolder = useCallback(async () => {
    if (!newFolder.trim()) return;
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_folders").insert({
      name: newFolder.trim(),
      parent_id: currentFolder || null,
      created_at: new Date().toISOString(),
    });
    if (error) return flash("폴더 생성 실패");
    flash("폴더가 생성되었습니다");
    setNewFolder("");
    setShowNewFolder(false);
    load(currentFolder);
  }, [newFolder, currentFolder, flash, load]);

  const deleteFolder = useCallback(async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_files").delete().eq("folder_id", id);
    await s.from("hq_folders").delete().eq("parent_id", id);
    await s.from("hq_folders").delete().eq("id", id);
    flash("폴더가 삭제되었습니다");
    setConfirmDelete(null);
    load(currentFolder);
  }, [currentFolder, flash, load]);

  const deleteFileSilent = useCallback(async (f: FileItem) => {
    const s = sb();
    if (!s) return false;

    // R2 파일이면 서버 API로 삭제 (DB도 admin 권한으로 함께 삭제)
    if (f.url.includes("r2.dev")) {
      const key = f.url.split(".r2.dev/")[1];
      const res = await fetch("/api/r2/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key ? decodeURIComponent(key) : null, fileId: f.id }),
      });
      if (!res.ok) { console.error("파일 삭제 API 실패"); return false; }
      return true;
    }

    // Supabase Storage 파일
    if (f.url.includes("supabase")) {
      try { const path = f.url.split("/hq-files/")[1]; if (path) await s.storage.from("hq-files").remove([decodeURIComponent(path)]); } catch {}
    }

    // DB 삭제 시도 (클라이언트) — 실패 시 서버 API로 폴백
    try { await s.from("hq_file_versions").delete().eq("file_id", f.id); } catch {}
    try { await s.from("hq_file_stars").delete().eq("file_id", f.id); } catch {}
    try { await s.from("hq_file_tags").delete().eq("file_id", f.id); } catch {}
    try { await s.from("hq_file_shares").delete().eq("file_id", f.id); } catch {}
    const { error } = await s.from("hq_files").delete().eq("id", f.id);
    if (error) {
      // RLS 실패 시 서버 API로 재시도
      const res = await fetch("/api/r2/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: f.id }),
      });
      if (!res.ok) { console.error("파일 삭제 실패:", error); return false; }
    }
    return true;
  }, []);

  const deleteFile = useCallback(async (f: FileItem) => {
    const ok = await deleteFileSilent(f);
    if (ok === false) {
      flash("삭제 실패 — 권한을 확인해주세요");
    } else {
      flash("파일이 삭제되었습니다");
    }
    setConfirmDelete(null);
    load(currentFolder);
  }, [deleteFileSilent, flash, load, currentFolder]);

  const renameFile = useCallback(async (fileId: string) => {
    if (!renameValue.trim()) return;
    const s = sb();
    if (!s) return;
    const dup = files.find(f => f.name === renameValue.trim() && f.id !== fileId);
    if (dup) return flash("같은 이름의 파일이 이미 있습니다");
    await s.from("hq_files").update({ name: renameValue.trim() }).eq("id", fileId);
    setRenamingFile(null);
    setRenameValue("");
    flash("이름이 변경되었습니다");
    load(currentFolder);
  }, [renameValue, files, flash, load, currentFolder]);

  const renameFolderFn = useCallback(async (folderId: string) => {
    if (!renameValue.trim()) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_folders").update({ name: renameValue.trim() }).eq("id", folderId);
    setRenamingFolder(null);
    setRenameValue("");
    flash("폴더 이름이 변경되었습니다");
    setBreadcrumb(prev => prev.map(b => b.id === folderId ? { ...b, name: renameValue.trim() } : b));
    load(currentFolder);
  }, [renameValue, flash, load, currentFolder]);

  const changeSecurity = useCallback(async (fileId: string, level: SecurityLevel) => {
    const s = sb();
    if (!s) { flash("DB 연결 실패"); return; }
    const { error } = await s.from("hq_files").update({ security: level }).eq("id", fileId);
    if (error) { flash("등급 변경 실패: " + error.message); console.error("changeSecurity error:", error); return; }
    flash(`보안등급: ${level}`);
    load(currentFolder);
  }, [flash, load, currentFolder]);

  const moveFile = useCallback(async (fileId: string, targetFolderId: string | null) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_files").update({ folder_id: targetFolderId }).eq("id", fileId);
    setMovingFile(null);
    flash("파일이 이동되었습니다");
    load(currentFolder);
  }, [flash, load, currentFolder]);

  /* -- bulk operations -- */
  const bulkDelete = useCallback(async () => {
    const toDelete = files.filter(f => selectedFiles.has(f.id));
    if (toDelete.length === 0) return;
    for (const f of toDelete) await deleteFileSilent(f);
    const s = sb();
    if (s) {
      for (const fid of selectedFolders) {
        await s.from("hq_files").delete().eq("folder_id", fid);
        await s.from("hq_folders").delete().eq("parent_id", fid);
        await s.from("hq_folders").delete().eq("id", fid);
      }
    }
    flash(`${toDelete.length + selectedFolders.size}개 항목이 삭제되었습니다`);
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
    setConfirmDelete(null);
    load(currentFolder);
  }, [files, selectedFiles, selectedFolders, deleteFileSilent, flash, load, currentFolder]);

  const bulkMove = useCallback(async (targetFolderId: string | null) => {
    const s = sb();
    if (!s) return;
    for (const fid of selectedFiles) {
      await s.from("hq_files").update({ folder_id: targetFolderId }).eq("id", fid);
    }
    flash(`${selectedFiles.size}개 파일이 이동되었습니다`);
    setSelectedFiles(new Set());
    setBulkMoveOpen(false);
    load(currentFolder);
  }, [selectedFiles, flash, load, currentFolder]);

  const bulkChangeSecurity = useCallback(async (level: SecurityLevel) => {
    const s = sb();
    if (!s) return;
    for (const fid of selectedFiles) {
      await s.from("hq_files").update({ security: level }).eq("id", fid);
    }
    flash(`${selectedFiles.size}개 파일의 보안등급이 변경되었습니다`);
    setSelectedFiles(new Set());
    setBulkSecurityOpen(false);
    load(currentFolder);
  }, [selectedFiles, flash, load, currentFolder]);

  /* -- drag & drop (file move between folders) -- */
  const handleDragStart = useCallback((e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData("text/plain", fileId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleFolderDrop = useCallback(async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    const fileId = e.dataTransfer.getData("text/plain");
    if (!fileId) return;
    if (selectedFiles.has(fileId) && selectedFiles.size > 1) {
      const s = sb();
      if (!s) return;
      for (const fid of selectedFiles) {
        await s.from("hq_files").update({ folder_id: targetFolderId }).eq("id", fid);
      }
      flash(`${selectedFiles.size}개 파일이 이동되었습니다`);
      setSelectedFiles(new Set());
    } else {
      await moveFile(fileId, targetFolderId);
    }
    load(currentFolder);
  }, [selectedFiles, moveFile, flash, load, currentFolder]);

  /* -- ★ Feature 1: 드래그앤드롭 업로드 (from desktop) -- */
  const handleExternalFileDrop = useCallback((droppedFiles: FileList) => {
    if (droppedFiles.length > 0) {
      const dt = new DataTransfer();
      for (let i = 0; i < droppedFiles.length; i++) {
        dt.items.add(droppedFiles[i]);
      }
      if (fileRef.current) {
        fileRef.current.files = dt.files;
        fileRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }, []);

  const handleRootDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverRoot(false);
    setIsDraggingOver(false);
    dragCounterRef.current = 0;
    const fileId = e.dataTransfer.getData("text/plain");
    if (fileId) {
      if (selectedFiles.has(fileId) && selectedFiles.size > 1) {
        const s = sb();
        if (!s) return;
        for (const fid of selectedFiles) {
          await s.from("hq_files").update({ folder_id: null }).eq("id", fid);
        }
        flash(`${selectedFiles.size}개 파일이 루트로 이동되었습니다`);
        setSelectedFiles(new Set());
      } else {
        await moveFile(fileId, null);
      }
      load(currentFolder);
      return;
    }
    // ★ Feature 1: external file drop
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleExternalFileDrop(droppedFiles);
    }
  }, [selectedFiles, moveFile, flash, load, currentFolder, handleExternalFileDrop]);

  // ★ Feature 1: Full-page drag enter/leave tracking
  const handleContainerDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
    }
    if (!dragOverFolder) setDragOverRoot(true);
  }, [dragOverFolder]);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
      setDragOverRoot(false);
    }
  }, []);

  /* -- preview wrapper that also logs to recent -- */
  const handlePreview = useCallback((f: FileItem) => {
    setPreview(f);
    addToRecent(f);
  }, [addToRecent]);

  /* -- context menu builders -- */
  const buildFileCtx = useCallback((f: FileItem, x: number, y: number) => {
    const perm = getPermissions(myRole, f.uploadedBy, userName);
    const vCount = versionCounts[f.id] || 0;
    const isStarred = starredFileIds.has(f.id);
    const items: CtxMenuItem[] = [
      { label: "열기", icon: "👁", onClick: () => handlePreview(f) },
      { label: "다운로드", icon: "⬇", onClick: () => { window.open(f.url, "_blank"); addToRecent(f); } },
      { label: "", icon: "", divider: true, onClick: () => {} },
      { label: isStarred ? "즐겨찾기 해제" : "즐겨찾기", icon: isStarred ? "⭐" : "☆", onClick: () => toggleStar(f.id) },
      { label: "🔗 공유 링크 생성", icon: "", onClick: () => { setShareModal({ file: f }); setShareUrl(""); setShareExpiry("7"); } },
      { label: "🏷️ 태그 설정", icon: "", onClick: () => setTagModal({ file: f }) },
      { label: "ℹ️ 파일 정보", icon: "", onClick: () => setInfoPanel(f) },
      { label: "", icon: "", divider: true, onClick: () => {} },
      { label: `버전 이력${vCount > 0 ? ` (${vCount + 1}개)` : ""}`, icon: "🔄", onClick: () => loadVersionHistory(f.id) },
      { label: "", icon: "", divider: true, onClick: () => {} },
      { label: "이름 변경", icon: "✏", disabled: !perm.canRename, onClick: () => { setRenamingFile(f.id); setRenameValue(f.name); } },
      { label: "이동", icon: "📂", disabled: !perm.canMove, onClick: () => setMovingFile(movingFile === f.id ? null : f.id) },
      { label: "보안등급 변경", icon: "🔒", disabled: !isAdmin, onClick: () => {
        const next = SECURITY_LEVELS[(SECURITY_LEVELS.findIndex(s => s.value === (f.security as SecurityLevel || "내부용")) + 1) % SECURITY_LEVELS.length];
        changeSecurity(f.id, next.value);
      }},
      { label: "", icon: "", divider: true, onClick: () => {} },
      { label: "삭제", icon: "🗑", danger: true, disabled: !perm.canDelete, onClick: () => setConfirmDelete({ type: "file", id: f.id, name: f.name }) },
    ];
    setCtxMenu({ x, y, items });
  }, [myRole, userName, isAdmin, movingFile, changeSecurity, versionCounts, loadVersionHistory, starredFileIds, toggleStar, handlePreview, addToRecent]);

  const buildFolderCtx = useCallback((f: Folder, x: number, y: number) => {
    const items: CtxMenuItem[] = [
      { label: "열기", icon: "📂", onClick: () => openFolder(f) },
      { label: "이름 변경", icon: "✏", disabled: !canCreateFolder, onClick: () => { setRenamingFolder(f.id); setRenameValue(f.name); } },
      { label: "", icon: "", divider: true, onClick: () => {} },
      { label: "삭제", icon: "🗑", danger: true, disabled: !isAdmin, onClick: () => setConfirmDelete({ type: "folder", id: f.id, name: f.name }) },
    ];
    setCtxMenu({ x, y, items });
  }, [openFolder, canCreateFolder, isAdmin]);

  /* -- selection helpers -- */
  const toggleFileSelect = useCallback((id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleFolderSelect = useCallback((id: string) => {
    setSelectedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  /* -- computed: filtered & sorted files -- */
  const accessibleFiles = useMemo(() =>
    files.filter(f => canAccessSecurity(myRole, (f.security as SecurityLevel) || "내부용")),
    [files, myRole]
  );

  const filteredFiles = useMemo(() => {
    let filtered = securityFilter === "all" ? accessibleFiles : accessibleFiles.filter(f => (f.security || "내부용") === securityFilter);
    // ★ Feature 5: tag filter
    if (tagFilter !== "all") {
      filtered = filtered.filter(f => fileTags[f.id] === tagFilter);
    }
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name, "ko");
      else if (sortBy === "date") cmp = (a.uploadedAt || "").localeCompare(b.uploadedAt || "");
      else if (sortBy === "size") cmp = parseBytes(a.size) - parseBytes(b.size);
      else if (sortBy === "type") cmp = (a.type || "").localeCompare(b.type || "");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [accessibleFiles, securityFilter, sortBy, sortDir, tagFilter, fileTags]);

  // ★ Feature 6: 용량 계산
  const totalSizeBytes = useMemo(() => {
    return filteredFiles.reduce((acc, f) => acc + parseBytes(f.size), 0);
  }, [filteredFiles]);

  const totalSize = useMemo(() => formatSize(totalSizeBytes), [totalSizeBytes]);

  const storagePercent = useMemo(() => {
    return Math.min((totalSizeBytes / STORAGE_LIMIT_BYTES) * 100, 100);
  }, [totalSizeBytes]);

  const groupedFiles = useMemo(() => {
    if (!groupByType) return null;
    const groups: Record<string, FileItem[]> = {};
    for (const f of filteredFiles) {
      const cat = fileCategory(f.type, f.name);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    }
    return groups;
  }, [groupByType, filteredFiles]);

  // determine which file list to display
  const displayFiles = showFavorites ? allStarredFiles : filteredFiles;
  const displayFolders = (showFavorites || showRecent || showSearch) ? [] : folders;

  const isAllSelected = displayFiles.length > 0 && selectedFiles.size === displayFiles.length && selectedFolders.size === displayFolders.length;
  const hasSelection = selectedFiles.size > 0 || selectedFolders.size > 0;

  /* -- auto-focus refs -- */
  useEffect(() => {
    if (showNewFolder && newFolderRef.current) newFolderRef.current.focus();
  }, [showNewFolder]);
  useEffect(() => {
    if ((renamingFile || renamingFolder) && renameRef.current) renameRef.current.focus();
  }, [renamingFile, renamingFolder]);

  /* -- render helpers -- */
  const renderSortButton = (key: "name" | "date" | "size" | "type", label: string) => (
    <button
      key={key}
      onClick={() => { if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(key); setSortDir(key === "name" ? "asc" : "desc"); } }}
      className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${sortBy === key ? "bg-[#3182F6]/10 text-[#3182F6]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
    >
      {label}{sortBy === key && (sortDir === "asc" ? " ↑" : " ↓")}
    </button>
  );

  /* -- ★ render tag dot -- */
  const renderTagDot = (fileId: string) => {
    const tag = fileTags[fileId];
    if (!tag) return null;
    const tagDef = TAG_COLORS.find(t => t.key === tag);
    if (!tagDef) return null;
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${tagDef.dot} flex-shrink-0`} title={tagDef.label} />;
  };

  /* -- ★ render star button -- */
  const renderStarButton = (fileId: string, size: "sm" | "lg" = "sm") => {
    const isStarred = starredFileIds.has(fileId);
    return (
      <button
        onClick={(e) => { e.stopPropagation(); toggleStar(fileId); }}
        className={`flex-shrink-0 transition-all hover:scale-110 ${size === "lg" ? "text-lg" : "text-sm"} ${isStarred ? "text-yellow-400" : "text-slate-200 hover:text-yellow-300"}`}
        title={isStarred ? "즐겨찾기 해제" : "즐겨찾기"}
      >
        {isStarred ? "⭐" : "☆"}
      </button>
    );
  };

  /* -- render folder (shared) -- */
  const renderFolder = (f: Folder, isGrid: boolean) => {
    const isFolderSelected = selectedFolders.has(f.id);
    const isDragTarget = dragOverFolder === f.id;
    const isRenaming = renamingFolder === f.id;

    const inner = isGrid ? (
      <div className="flex flex-col items-center">
        <LargeFolderIcon highlight={isDragTarget} />
        {isRenaming ? (
          <div className="mt-3 w-full" onClick={(e) => e.stopPropagation()}>
            <input
              ref={renameRef}
              className="text-xs font-semibold text-slate-800 border border-[#3182F6] rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100 w-full text-center"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") renameFolderFn(f.id); if (e.key === "Escape") { setRenamingFolder(null); setRenameValue(""); } }}
            />
          </div>
        ) : (
          <p className="text-xs font-medium text-slate-700 mt-3 text-center truncate w-full px-1">{f.name}</p>
        )}
      </div>
    ) : (
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
          ${isFolderSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-slate-200 group-hover:border-slate-300"}`}
          onClick={(e) => { e.stopPropagation(); toggleFolderSelect(f.id); }}
        >
          {isFolderSelected && <IconCheck />}
        </div>
        <IconFolder className={`w-5 h-5 flex-shrink-0 ${isDragTarget ? "text-[#3182F6]" : "text-amber-400"}`} />
        {isRenaming ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              ref={renameRef}
              className="text-sm font-semibold text-slate-800 border border-[#3182F6] rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-blue-100 w-48"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") renameFolderFn(f.id); if (e.key === "Escape") { setRenamingFolder(null); setRenameValue(""); } }}
            />
            <button onClick={() => renameFolderFn(f.id)} className="text-xs text-[#3182F6] font-semibold hover:underline">확인</button>
            <button onClick={() => { setRenamingFolder(null); setRenameValue(""); }} className="text-xs text-slate-400">취소</button>
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-700 truncate">{f.name}</span>
        )}
      </div>
    );

    return (
      <div
        key={f.id}
        className={`group relative rounded-2xl transition-all cursor-pointer border
          ${isGrid ? "flex flex-col items-center p-4" : "flex items-center px-3 py-2.5"}
          ${isFolderSelected ? "bg-[#3182F6]/5 border-[#3182F6]/20" : isDragTarget ? "bg-blue-50 border-[#3182F6]/30 shadow-md" : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"}`}
        onDoubleClick={() => openFolder(f)}
        onClick={() => { if (!isRenaming) openFolder(f); }}
        onContextMenu={(e) => { e.preventDefault(); buildFolderCtx(f, e.clientX, e.clientY); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolder(f.id); }}
        onDragLeave={() => setDragOverFolder(null)}
        onDrop={(e) => handleFolderDrop(e, f.id)}
      >
        {isGrid && (
          <div
            className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
              ${isFolderSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-transparent group-hover:border-slate-200"}`}
            onClick={(e) => { e.stopPropagation(); toggleFolderSelect(f.id); }}
          >
            {isFolderSelected && <IconCheck />}
          </div>
        )}
        {inner}
        {isAdmin && !isGrid && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: "folder", id: f.id, name: f.name }); }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  /* -- render file items using extracted components -- */
  const renderFileRow = (f: FileItem) => (
    <div key={f.id} className="relative">
      <div className="flex items-center">
        {/* ★ Star + Tag dot overlaid on the row */}
        <div className="flex items-center gap-1 mr-1 flex-shrink-0">
          {renderStarButton(f.id)}
          {renderTagDot(f.id)}
        </div>
        <div className="flex-1 min-w-0">
          <FileRow
            file={f}
            myRole={myRole}
            userName={userName}
            isSelected={selectedFiles.has(f.id)}
            isRenaming={renamingFile === f.id}
            isMoving={movingFile === f.id}
            renameValue={renameValue}
            movingFile={movingFile}
            currentFolder={currentFolder}
            allFolders={allFolders}
            isAdmin={isAdmin}
            onPreview={handlePreview}
            onToggleSelect={toggleFileSelect}
            onDragStart={handleDragStart}
            onContextMenu={buildFileCtx}
            onRenameChange={setRenameValue}
            onRenameConfirm={renameFile}
            onRenameCancel={() => { setRenamingFile(null); setRenameValue(""); }}
            onChangeSecurity={changeSecurity}
            onMoveFile={moveFile}
            onSetMovingFile={setMovingFile}
            onSetConfirmDelete={setConfirmDelete}
            renameRef={renameRef}
          />
        </div>
      </div>
      {/* 버전 배지 */}
      {(versionCounts[f.id] || 0) > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); loadVersionHistory(f.id); }}
          className="absolute top-1/2 -translate-y-1/2 right-24 z-10 text-[10px] font-bold bg-[#3182F6]/10 text-[#3182F6] px-1.5 py-0.5 rounded-md hover:bg-[#3182F6]/20 transition-all"
          title="버전 이력 보기"
        >
          v{(versionCounts[f.id] || 0) + 1}
        </button>
      )}
    </div>
  );

  const renderFileCard = (f: FileItem) => (
    <div key={f.id} className="relative">
      <FileCard
        file={f}
        myRole={myRole}
        userName={userName}
        isSelected={selectedFiles.has(f.id)}
        isRenaming={renamingFile === f.id}
        renameValue={renameValue}
        onPreview={handlePreview}
        onToggleSelect={toggleFileSelect}
        onDragStart={handleDragStart}
        onContextMenu={buildFileCtx}
        onRenameChange={setRenameValue}
        onRenameConfirm={renameFile}
        onRenameCancel={() => { setRenamingFile(null); setRenameValue(""); }}
        renameRef={renameRef}
      />
      {/* ★ Star + Tag dot (grid) */}
      <div className="absolute top-2.5 left-8 flex items-center gap-1 z-10">
        {renderStarButton(f.id)}
        {renderTagDot(f.id)}
      </div>
      {/* 버전 배지 (그리드) */}
      {(versionCounts[f.id] || 0) > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); loadVersionHistory(f.id); }}
          className="absolute top-2 right-2 z-10 text-[10px] font-bold bg-[#3182F6]/10 text-[#3182F6] px-1.5 py-0.5 rounded-md hover:bg-[#3182F6]/20 transition-all"
          title="버전 이력 보기"
        >
          v{(versionCounts[f.id] || 0) + 1}
        </button>
      )}
    </div>
  );

  /* -- render search result row -- */
  const renderSearchResultRow = (f: FileItem & { folderPath?: string }) => (
    <div key={f.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer hover:bg-slate-50"
      onClick={() => handlePreview(f)}
      onContextMenu={(e) => { e.preventDefault(); buildFileCtx(f, e.clientX, e.clientY); }}
    >
      <span className="text-lg flex-shrink-0">{fileIcon(f.type)}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
          <span className="text-[#3182F6]/70">📁 {f.folderPath}</span>
          <span>·</span>
          <span>{f.uploadedBy}</span>
          <span>·</span>
          <span>{f.size}</span>
        </p>
      </div>
      {renderStarButton(f.id)}
      {renderTagDot(f.id)}
    </div>
  );

  /* -- main render -- */
  return (
    <div className="space-y-0">
      {/* context menu */}
      {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} onClose={() => setCtxMenu(null)} />}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">삭제 확인</h3>
              <p className="text-sm text-slate-500">
                {hasSelection && confirmDelete.name === "__bulk__" ? (
                  <><span className="font-semibold text-slate-700">{selectedFiles.size + selectedFolders.size}개 항목</span>이 영구 삭제됩니다.</>
                ) : (
                  <><span className="font-semibold text-slate-700">&ldquo;{confirmDelete.name}&rdquo;</span>
                  {confirmDelete.type === "folder" ? " 폴더와 내부 파일이" : " 파일이"} 영구 삭제됩니다.</>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className={`${B2} flex-1`}>취소</button>
              <button
                onClick={() => {
                  if (confirmDelete.name === "__bulk__") { bulkDelete(); return; }
                  if (confirmDelete.type === "folder") deleteFolder(confirmDelete.id);
                  else { const f = files.find(x => x.id === confirmDelete.id); if (f) deleteFile(f); }
                }}
                className="flex-1 rounded-xl bg-red-500 text-white font-semibold px-4 py-2.5 text-sm hover:bg-red-600 active:scale-[0.98] transition-all"
              >삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && <FilePreview file={preview} onClose={() => setPreview(null)} />}

      {/* ★ Feature 2: Share link modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShareModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">🔗 공유 링크</h3>
              <button onClick={() => setShareModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><IconX /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4 truncate">{shareModal.file.name}</p>

            {/* Expiry selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 mb-2 block">만료 기간</label>
              <div className="flex gap-2">
                {([
                  { value: "1" as const, label: "1일" },
                  { value: "7" as const, label: "7일" },
                  { value: "30" as const, label: "30일" },
                  { value: "unlimited" as const, label: "무제한" },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setShareExpiry(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${shareExpiry === opt.value ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            {!shareUrl && (
              <button
                onClick={() => generateShareLink(shareModal.file)}
                disabled={shareGenerating}
                className="w-full rounded-xl bg-[#3182F6] text-white font-semibold px-4 py-2.5 text-sm hover:bg-[#2672DE] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {shareGenerating ? "생성 중..." : "링크 생성"}
              </button>
            )}

            {/* URL display + copy */}
            {shareUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-600 outline-none select-all"
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    onClick={copyShareUrl}
                    className="flex-shrink-0 rounded-lg bg-[#3182F6] text-white font-semibold px-4 py-2 text-sm hover:bg-[#2672DE] active:scale-[0.98] transition-all"
                  >
                    복사
                  </button>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  {shareExpiry === "unlimited" ? "이 링크는 만료되지 않습니다" : `이 링크는 ${shareExpiry}일 후 만료됩니다`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ★ Feature 5: Tag modal */}
      {tagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setTagModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">🏷️ 태그 설정</h3>
              <button onClick={() => setTagModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><IconX /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4 truncate">{tagModal.file.name}</p>
            <div className="grid grid-cols-3 gap-2">
              {TAG_COLORS.map(tag => {
                const isActive = fileTags[tagModal.file.id] === tag.key;
                return (
                  <button
                    key={tag.key}
                    onClick={() => setFileTag(tagModal.file.id, isActive ? null : tag.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border ${isActive ? "border-[#3182F6] bg-[#3182F6]/5 text-[#3182F6]" : "border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${tag.color}`} />
                    {tag.label}
                  </button>
                );
              })}
            </div>
            {fileTags[tagModal.file.id] && (
              <button
                onClick={() => setFileTag(tagModal.file.id, null)}
                className="w-full mt-3 text-xs text-red-400 hover:text-red-600 py-2 transition-colors"
              >
                태그 제거
              </button>
            )}
          </div>
        </div>
      )}

      {/* ★ Feature 9: File info panel (modal) */}
      {infoPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm" onClick={() => setInfoPanel(null)}>
          <div className="bg-white shadow-2xl w-full max-w-sm h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
              <h3 className="text-base font-bold text-slate-900">파일 정보</h3>
              <button onClick={() => setInfoPanel(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><IconX /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* File icon + name */}
              <div className="flex flex-col items-center text-center">
                <LargeFileIcon type={infoPanel.type} name={infoPanel.name} />
                <p className="text-base font-semibold text-slate-800 mt-3 break-all">{infoPanel.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  {renderStarButton(infoPanel.id, "lg")}
                  {renderTagDot(infoPanel.id)}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">기본 정보</p>
                <div className="space-y-2.5">
                  {[
                    { label: "크기", value: infoPanel.size },
                    { label: "유형", value: infoPanel.type || "알 수 없음" },
                    { label: "업로더", value: infoPanel.uploadedBy || "-" },
                    { label: "업로드 날짜", value: infoPanel.uploadedAt ? new Date(infoPanel.uploadedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-slate-700 font-medium truncate max-w-[200px]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">보안</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">보안등급</span>
                  {(() => {
                    const secStyle = getSecurityStyle((infoPanel.security as SecurityLevel) || "내부용");
                    return <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold ${secStyle.color}`}>{secStyle.icon} {infoPanel.security || "내부용"}</span>;
                  })()}
                </div>
              </div>

              {/* Version */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">버전</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">버전 수</span>
                  <span className="text-slate-700 font-medium">{(versionCounts[infoPanel.id] || 0) + 1}개</span>
                </div>
                {(versionCounts[infoPanel.id] || 0) > 0 && (
                  <button
                    onClick={() => { loadVersionHistory(infoPanel.id); setInfoPanel(null); }}
                    className="text-xs text-[#3182F6] font-semibold hover:underline"
                  >
                    버전 이력 보기
                  </button>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">태그</p>
                {fileTags[infoPanel.id] ? (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const tagDef = TAG_COLORS.find(t => t.key === fileTags[infoPanel.id]);
                      return tagDef ? (
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <span className={`w-3 h-3 rounded-full ${tagDef.color}`} />
                          {tagDef.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <span className="text-xs text-slate-300">없음</span>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => { window.open(infoPanel.url, "_blank"); addToRecent(infoPanel); }}
                  className="w-full rounded-xl bg-[#3182F6] text-white font-semibold px-4 py-2.5 text-sm hover:bg-[#2672DE] active:scale-[0.98] transition-all"
                >
                  다운로드
                </button>
                <button
                  onClick={() => { setShareModal({ file: infoPanel }); setShareUrl(""); setShareExpiry("7"); setInfoPanel(null); }}
                  className="w-full rounded-xl bg-slate-100 text-slate-700 font-semibold px-4 py-2.5 text-sm hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  공유 링크 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version history modal */}
      {versionHistoryFileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setVersionHistoryFileId(null); setFileVersions([]); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">버전 이력</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {files.find(f => f.id === versionHistoryFileId)?.name}
                </p>
              </div>
              <button
                onClick={() => { setVersionHistoryFileId(null); setFileVersions([]); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <IconX />
              </button>
            </div>

            {loadingVersions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : fileVersions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">이전 버전이 없습니다</p>
                <p className="text-xs text-slate-400 mt-1">같은 이름의 파일을 업로드하면 자동으로 버전이 생성됩니다</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {/* 현재 버전 */}
                {(() => {
                  const currentFile = files.find(f => f.id === versionHistoryFileId);
                  if (!currentFile) return null;
                  return (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#3182F6]/5 border border-[#3182F6]/20">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#3182F6] text-white text-xs font-bold">
                          v{(versionCounts[versionHistoryFileId] || 0) + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 truncate">{currentFile.name}</span>
                          <span className="text-[10px] font-semibold text-[#3182F6] bg-[#3182F6]/10 px-1.5 py-0.5 rounded">현재</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                          <span>{currentFile.uploadedBy}</span>
                          <span>{currentFile.size}</span>
                          <span>{currentFile.uploadedAt ? new Date(currentFile.uploadedAt).toLocaleDateString("ko-KR") : "-"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {/* 이전 버전들 */}
                {fileVersions.map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                        v{v.version_number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-medium">{v.uploaded_by}</span>
                        <span>{formatSize(v.size)}</span>
                        <span>{new Date(v.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => window.open(v.url, "_blank")}
                        className="text-xs text-slate-400 hover:text-[#3182F6] font-medium px-2 py-1 rounded-lg hover:bg-[#3182F6]/5 transition-all"
                      >
                        다운로드
                      </button>
                      <button
                        onClick={() => restoreVersion(v)}
                        className="text-xs text-[#3182F6] font-semibold px-2.5 py-1 rounded-lg bg-[#3182F6]/5 hover:bg-[#3182F6]/10 transition-all"
                      >
                        복원
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk move modal */}
      {bulkMoveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBulkMoveOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-3">{selectedFiles.size}개 파일 이동</h3>
            <div className="space-y-1 max-h-60 overflow-auto">
              {currentFolder && (
                <button onClick={() => bulkMove(null)} className="w-full text-left text-sm px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 flex items-center gap-2.5">
                  <IconFolderOpen className="w-4 h-4 text-amber-400" /> 루트
                </button>
              )}
              {allFolders.filter(af => af.id !== currentFolder).map(af => (
                <button key={af.id} onClick={() => bulkMove(af.id)} className="w-full text-left text-sm px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 flex items-center gap-2.5">
                  <IconFolder className="w-4 h-4 text-amber-400" /> {af.name}
                </button>
              ))}
            </div>
            <button onClick={() => setBulkMoveOpen(false)} className={`${B2} w-full mt-3`}>취소</button>
          </div>
        </div>
      )}

      {/* Bulk security modal */}
      {bulkSecurityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBulkSecurityOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full mx-4 p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-3">{selectedFiles.size}개 파일 보안등급 변경</h3>
            <div className="space-y-1">
              {SECURITY_LEVELS.map(s => (
                <button key={s.value} onClick={() => bulkChangeSecurity(s.value)}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-xl hover:opacity-80 flex items-center gap-2.5 ${s.color}`}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            <button onClick={() => setBulkSecurityOpen(false)} className={`${B2} w-full mt-3`}>취소</button>
          </div>
        </div>
      )}

      {/* FILE MANAGER CHROME */}
      <div
        className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden relative"
        onDragEnter={handleContainerDragEnter}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
        onDrop={handleRootDrop}
      >

        {/* ★ Feature 1: Full-page drag overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-40 bg-[#3182F6]/5 border-2 border-dashed border-[#3182F6] rounded-2xl flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-16 h-16 bg-[#3182F6]/10 rounded-3xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#3182F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-lg font-bold text-[#3182F6]">여기에 파일을 놓으세요</p>
              <p className="text-sm text-[#3182F6]/70">파일을 드롭하면 바로 업로드됩니다</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* left: navigation + breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                disabled={breadcrumb.length <= 1 && !showFavorites && !showRecent && !showSearch}
                onClick={() => {
                  if (showFavorites || showRecent || showSearch) {
                    setShowFavorites(false);
                    setShowRecent(false);
                    setShowSearch(false);
                    setSearchQuery("");
                  } else {
                    goTo(breadcrumb.length - 2);
                  }
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${(breadcrumb.length > 1 || showFavorites || showRecent || showSearch) ? "hover:bg-slate-100 text-slate-500" : "text-slate-200 cursor-not-allowed"}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="w-px h-5 bg-slate-100" />

              {/* ★ Feature 3/4: virtual folder buttons */}
              <button
                onClick={openFavorites}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${showFavorites ? "bg-yellow-50 text-yellow-600" : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"}`}
                title="즐겨찾기"
              >
                ⭐
              </button>
              <button
                onClick={() => { setShowRecent(true); setShowFavorites(false); setShowSearch(false); setSearchQuery(""); }}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${showRecent ? "bg-blue-50 text-[#3182F6]" : "text-slate-400 hover:text-[#3182F6] hover:bg-blue-50"}`}
                title="최근 파일"
              >
                🕐
              </button>

              <div className="w-px h-5 bg-slate-100" />

              <div className="flex items-center gap-0.5 text-sm min-w-0 overflow-hidden">
                {showFavorites ? (
                  <span className="px-1.5 py-0.5 font-semibold text-slate-800 flex items-center gap-1">⭐ 즐겨찾기</span>
                ) : showRecent ? (
                  <span className="px-1.5 py-0.5 font-semibold text-slate-800 flex items-center gap-1">🕐 최근 파일</span>
                ) : showSearch ? (
                  <span className="px-1.5 py-0.5 font-semibold text-slate-800 flex items-center gap-1">🔍 검색 결과</span>
                ) : (
                  breadcrumb.map((b, i) => (
                    <span key={i} className="flex items-center gap-0.5 flex-shrink-0">
                      {i > 0 && <IconChevronRight />}
                      <button
                        onClick={() => goTo(i)}
                        className={`px-1.5 py-0.5 rounded-md transition-colors truncate max-w-[120px] ${
                          i === breadcrumb.length - 1
                            ? "font-semibold text-slate-800"
                            : "text-slate-400 hover:text-[#3182F6] hover:bg-[#3182F6]/5"
                        }`}
                      >
                        {i === 0 ? (
                          <svg className="w-4 h-4 inline -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        ) : b.name}
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* right: actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* ★ Feature 7: Search toggle */}
              <button
                onClick={() => { setShowSearch(!showSearch); setShowFavorites(false); setShowRecent(false); if (!showSearch) setSearchQuery(""); }}
                className={`p-1.5 rounded-lg transition-all ${showSearch ? "bg-[#3182F6]/10 text-[#3182F6]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                title="검색"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              <div className="flex items-center bg-slate-50 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#3182F6] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="리스트 보기"
                >
                  <IconList />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#3182F6] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="그리드 보기"
                >
                  <IconGrid />
                </button>
              </div>

              <div className="w-px h-5 bg-slate-100" />

              <button
                onClick={() => setGroupByType(!groupByType)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${groupByType ? "bg-[#3182F6]/10 text-[#3182F6]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                title="유형별 그룹"
              >
                유형별
              </button>

              <div className="w-px h-5 bg-slate-100" />

              {canCreateFolder && (
                <button
                  onClick={() => { setShowNewFolder(!showNewFolder); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                  title="새 폴더"
                >
                  <IconPlus />
                </button>
              )}

              {/* upload */}
              <UploadArea
                userName={userName}
                currentFolder={currentFolder}
                uploadSecurity={uploadSecurity}
                files={files}
                flash={flash}
                onUploadComplete={() => load(currentFolder)}
                fileRef={fileRef}
                uploading={uploading}
                setUploading={setUploading}
                deleteFileSilent={deleteFileSilent}
              />

              {/* upload security */}
              <select
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 outline-none focus:border-[#3182F6]"
                value={uploadSecurity}
                onChange={e => setUploadSecurity(e.target.value as SecurityLevel)}
              >
                {SECURITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </div>
          </div>

          {/* ★ Feature 7: Search input row */}
          {showSearch && (
            <div className="mt-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#3182F6] focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="파일 이름으로 검색 (모든 폴더)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="text-xs text-slate-400 hover:text-slate-600 px-2">초기화</button>
              )}
            </div>
          )}

          {/* new folder input row */}
          {showNewFolder && (
            <div className="mt-3 flex items-center gap-2">
              <IconFolder className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                ref={newFolderRef}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#3182F6] focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="새 폴더 이름을 입력하세요"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") { setShowNewFolder(false); setNewFolder(""); } }}
              />
              <button onClick={createFolder} className="text-xs text-[#3182F6] font-semibold hover:underline px-2">생성</button>
              <button onClick={() => { setShowNewFolder(false); setNewFolder(""); }} className="text-xs text-slate-400 hover:text-slate-600 px-2">취소</button>
            </div>
          )}
        </div>

        {/* Filter bar + info bar */}
        <div className="border-b border-slate-50 px-4 py-2 flex items-center justify-between gap-3 bg-slate-50/50 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setSecurityFilter("all")}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${securityFilter === "all" ? "bg-[#3182F6] text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}>
              전체
            </button>
            {SECURITY_LEVELS.map(s => (
              <button key={s.value} onClick={() => setSecurityFilter(s.value)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${securityFilter === s.value ? "bg-[#3182F6] text-white shadow-sm" : `bg-white border border-slate-200 hover:bg-slate-100 text-slate-500`}`}>
                {s.icon} {s.label}
              </button>
            ))}

            {/* ★ Feature 5: Tag filter */}
            <div className="w-px h-4 bg-slate-200 mx-1" />
            {TAG_COLORS.map(tag => (
              <button
                key={tag.key}
                onClick={() => setTagFilter(tagFilter === tag.key ? "all" : tag.key)}
                className={`rounded-full w-5 h-5 flex items-center justify-center transition-all ${tagFilter === tag.key ? "ring-2 ring-[#3182F6] ring-offset-1" : "hover:ring-1 hover:ring-slate-300 hover:ring-offset-1"}`}
                title={tag.label}
              >
                <span className={`w-3 h-3 rounded-full ${tag.color}`} />
              </button>
            ))}
            {tagFilter !== "all" && (
              <button onClick={() => setTagFilter("all")} className="text-[10px] text-slate-400 hover:text-slate-600 ml-1">초기화</button>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{displayFolders.length}개 폴더, {displayFiles.length}개 파일</span>
            <span className="text-slate-300">|</span>
            <span>{totalSize}</span>
          </div>
        </div>

        {/* Sort bar */}
        <div className="border-b border-slate-50 px-4 py-1.5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-1">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer mr-2 transition-all
                ${isAllSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-slate-200 hover:border-slate-300"}`}
              onClick={() => {
                if (isAllSelected) { setSelectedFiles(new Set()); setSelectedFolders(new Set()); }
                else { setSelectedFiles(new Set(displayFiles.map(f => f.id))); setSelectedFolders(new Set(displayFolders.map(f => f.id))); }
              }}
            >
              {isAllSelected && <IconCheck />}
            </div>

            {hasSelection ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-[#3182F6] font-semibold">{selectedFiles.size + selectedFolders.size}개 선택</span>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                {selectedFiles.size > 0 && isAdmin && (
                  <>
                    <button onClick={() => setBulkMoveOpen(true)} className="text-xs text-slate-500 hover:text-[#3182F6] font-medium px-3 py-2 rounded-lg hover:bg-[#3182F6]/5 transition-all">이동</button>
                    <button onClick={() => setBulkSecurityOpen(true)} className="text-xs text-slate-500 hover:text-[#3182F6] font-medium px-3 py-2 rounded-lg hover:bg-[#3182F6]/5 transition-all">보안등급</button>
                  </>
                )}
                {/* ★ Feature 8: 일괄 다운로드 */}
                {selectedFiles.size > 0 && (
                  <button onClick={bulkDownload} className="text-xs text-slate-500 hover:text-[#3182F6] font-medium px-3 py-2 rounded-lg hover:bg-[#3182F6]/5 transition-all flex items-center gap-1">
                    📥 다운로드
                  </button>
                )}
                <button onClick={() => setConfirmDelete({ type: "file", id: "__bulk__", name: "__bulk__" })}
                  className="text-xs text-slate-500 hover:text-red-500 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all">삭제</button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button onClick={() => { setSelectedFiles(new Set()); setSelectedFolders(new Set()); }} className="text-xs text-slate-400 hover:text-slate-600">선택 해제</button>
              </div>
            ) : (
              <div className="flex items-center gap-0.5">
                {renderSortButton("name", "이름")}
                {renderSortButton("date", "날짜")}
                {renderSortButton("size", "크기")}
                {renderSortButton("type", "유형")}
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div
          className={`px-4 py-3 min-h-[300px] transition-colors ${isDraggingOver ? "bg-[#3182F6]/[0.03]" : ""}`}
        >
          {/* ★ Feature 7: Search results view */}
          {showSearch ? (
            <div>
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-slate-400">검색 중...</span>
                </div>
              ) : searchQuery.trim() === "" ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="w-12 h-12 text-slate-200 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="text-sm text-slate-400">파일 이름을 입력하여 검색하세요</p>
                  <p className="text-xs text-slate-300 mt-1">모든 폴더에서 검색됩니다</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-sm text-slate-400">검색 결과가 없습니다</p>
                  <p className="text-xs text-slate-300 mt-1">&ldquo;{searchQuery}&rdquo;에 해당하는 파일을 찾을 수 없습니다</p>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{searchResults.length}개 결과</p>
                  <div className="space-y-0.5">
                    {searchResults.map(f => renderSearchResultRow(f))}
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">불러오는 중...</span>
              </div>
            </div>
          ) : showRecent ? (
            /* ★ Feature 4: Recent files view */
            <div>
              {recentFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                    <span className="text-3xl">🕐</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">최근 파일이 없습니다</p>
                  <p className="text-xs text-slate-400">파일을 열거나 다운로드하면 여기에 표시됩니다</p>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">최근 열어본 파일</p>
                  <div className="space-y-0.5">
                    {recentFiles.map(rf => (
                      <div
                        key={rf.id + rf.time}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer hover:bg-slate-50"
                        onClick={() => {
                          const full = files.find(f => f.id === rf.id);
                          if (full) handlePreview(full);
                          else window.open(rf.url, "_blank");
                        }}
                      >
                        <span className="text-lg flex-shrink-0">{fileIcon(rf.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">{rf.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(rf.time).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            <span className="mx-1.5">·</span>
                            {rf.size}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : showFavorites ? (
            /* ★ Feature 3: Favorites view */
            <div>
              {allStarredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-yellow-50 rounded-3xl flex items-center justify-center mb-4">
                    <span className="text-3xl">⭐</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">즐겨찾기가 없습니다</p>
                  <p className="text-xs text-slate-400">파일의 별표 아이콘을 클릭하여 즐겨찾기에 추가하세요</p>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">즐겨찾기 ({allStarredFiles.length})</p>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {allStarredFiles.map(f => renderFileCard(f))}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {allStarredFiles.map(f => renderFileRow(f))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : displayFolders.length === 0 && displayFiles.length === 0 ? (
            /* ★ Feature 10: Enhanced empty state */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
                <svg className="w-12 h-12 text-[#3182F6]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                  <polyline points="16 13 12 9 8 13" />
                  <line x1="12" y1="9" x2="12" y2="17" />
                </svg>
              </div>
              <p className="text-base font-bold text-slate-700 mb-2">파일을 끌어다 놓거나 업로드하세요</p>
              <p className="text-sm text-slate-400 mb-6 text-center max-w-xs">
                데스크톱에서 파일을 드래그하여 바로 업로드하거나,<br />아래 버튼을 눌러 파일을 선택하세요
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl bg-[#3182F6] text-white font-semibold px-5 py-2.5 text-sm hover:bg-[#2672DE] active:scale-[0.98] transition-all shadow-sm"
                >
                  <IconUpload />
                  파일 업로드
                </button>
                {canCreateFolder && (
                  <button
                    onClick={() => setShowNewFolder(true)}
                    className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold px-5 py-2.5 text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
                  >
                    <IconPlus />
                    새 폴더
                  </button>
                )}
              </div>
              <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-300 border border-dashed border-slate-200 rounded-xl px-6 py-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>드래그 앤 드롭으로 업로드</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ★ Feature 4: Recent files section on root */}
              {!currentFolder && !showFavorites && !showRecent && recentFiles.length > 0 && breadcrumb.length === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">🕐 최근 파일</p>
                    <button onClick={() => { setShowRecent(true); setShowFavorites(false); }} className="text-[11px] text-[#3182F6] hover:underline font-medium">전체 보기</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {recentFiles.slice(0, 5).map(rf => (
                      <div
                        key={rf.id + rf.time}
                        className="flex-shrink-0 w-32 group bg-white border border-slate-100 rounded-xl p-3 cursor-pointer hover:border-slate-200 hover:shadow-sm transition-all"
                        onClick={() => {
                          const full = files.find(f => f.id === rf.id);
                          if (full) handlePreview(full);
                          else window.open(rf.url, "_blank");
                        }}
                      >
                        <span className="text-xl block mb-1">{fileIcon(rf.type)}</span>
                        <p className="text-xs font-medium text-slate-700 truncate">{rf.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{rf.size}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folders section */}
              {displayFolders.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">폴더</p>
                  <div className={viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
                    : "space-y-1"
                  }>
                    {displayFolders.map(f => renderFolder(f, viewMode === "grid"))}
                  </div>
                </div>
              )}

              {/* Files section */}
              {displayFiles.length > 0 && (
                <div>
                  {displayFolders.length > 0 && <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">파일</p>}

                  {groupedFiles && !showFavorites ? (
                    <div className="space-y-4">
                      {Object.entries(groupedFiles).map(([cat, groupFiles]) => (
                        <div key={cat}>
                          <p className="text-xs font-semibold text-slate-500 mb-2 px-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3182F6]" />
                            {cat}
                            <span className="text-slate-300 font-normal">({groupFiles.length})</span>
                          </p>
                          {viewMode === "grid" ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                              {groupFiles.map(f => renderFileCard(f))}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              {groupFiles.map(f => renderFileRow(f))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {displayFiles.map(f => renderFileCard(f))}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {displayFiles.map(f => renderFileRow(f))}
                    </div>
                  )}
                </div>
              )}

              {displayFiles.length === 0 && displayFolders.length === 0 && securityFilter !== "all" && (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400">해당 보안등급의 파일이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ★ Feature 6: Storage usage bar + Status bar */}
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/30">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>{displayFolders.length}개 폴더, {displayFiles.length}개 파일 {securityFilter !== "all" && `(${securityFilter} 필터 적용)`}</span>
            <span>사용량: {totalSize} / {formatSize(STORAGE_LIMIT_BYTES)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${storagePercent > 90 ? "bg-red-400" : storagePercent > 70 ? "bg-amber-400" : "bg-[#3182F6]"}`}
              style={{ width: `${Math.max(storagePercent, 0.5)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
