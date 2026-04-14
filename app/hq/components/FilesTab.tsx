"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { HQRole, Folder, FileItem } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

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
   Constants & helpers (unchanged logic)
   ================================================================ */
const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", spreadsheet: "📊", document: "📝", default: "📎",
};

function fileIcon(type: string) {
  if (type.includes("pdf")) return FILE_ICONS.pdf;
  if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) return FILE_ICONS.image;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv") || type.includes("xlsx")) return FILE_ICONS.spreadsheet;
  if (type.includes("doc") || type.includes("word")) return FILE_ICONS.document;
  return FILE_ICONS.default;
}

function fileCategory(type: string, name: string): string {
  const t = type.toLowerCase();
  const n = name.toLowerCase();
  if (t.includes("image") || ["png","jpg","jpeg","gif","webp","svg"].some(e => t.includes(e) || n.endsWith("." + e))) return "이미지";
  if (t.includes("pdf") || n.endsWith(".pdf")) return "PDF";
  if (t.includes("video") || ["mp4","webm","mov"].some(e => n.endsWith("." + e))) return "동영상";
  if (t.includes("audio") || ["mp3","wav","ogg"].some(e => n.endsWith("." + e))) return "오디오";
  if (t.includes("sheet") || t.includes("excel") || t.includes("csv") || t.includes("xlsx") || n.endsWith(".csv") || n.endsWith(".xlsx") || n.endsWith(".xls")) return "스프레드시트";
  if (t.includes("doc") || t.includes("word") || n.endsWith(".docx") || n.endsWith(".doc")) return "문서";
  if (t.includes("text") || t.includes("json") || t.includes("xml") || ["txt","md","json","log","xml","html","css","js","ts","tsx"].some(e => n.endsWith("." + e))) return "텍스트";
  return "기타";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function parseBytes(s: string): number {
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  if (s.includes("GB")) return n * 1024 * 1024 * 1024;
  if (s.includes("MB")) return n * 1024 * 1024;
  if (s.includes("KB")) return n * 1024;
  return n;
}

function getPreviewType(type: string, name: string) {
  const t = type.toLowerCase();
  const n = name.toLowerCase();
  if (t.includes("image") || ["png","jpg","jpeg","gif","webp","svg"].some(e => t.includes(e) || n.endsWith("." + e))) return "image";
  if (t.includes("pdf") || n.endsWith(".pdf")) return "pdf";
  if (t.includes("video") || ["mp4","webm","mov"].some(e => n.endsWith("." + e))) return "video";
  if (t.includes("audio") || ["mp3","wav","ogg"].some(e => n.endsWith("." + e))) return "audio";
  if (t.includes("text") || t.includes("json") || t.includes("csv") || t.includes("xml") || ["txt","md","json","csv","log","xml","html","css","js","ts","tsx"].some(e => n.endsWith("." + e))) return "text";
  return null;
}

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

// Security
type SecurityLevel = "공개" | "내부용" | "대외비" | "기밀";
const SECURITY_LEVELS: { value: SecurityLevel; label: string; color: string; icon: string }[] = [
  { value: "공개", label: "공개", color: "bg-emerald-50 text-emerald-700", icon: "🟢" },
  { value: "내부용", label: "내부용", color: "bg-blue-50 text-blue-700", icon: "🔵" },
  { value: "대외비", label: "대외비", color: "bg-amber-50 text-amber-700", icon: "🟡" },
  { value: "기밀", label: "기밀", color: "bg-red-50 text-red-700", icon: "🔴" },
];
const SECURITY_ACCESS: Record<SecurityLevel, HQRole[]> = {
  "공개": ["대표", "이사", "팀장", "팀원"],
  "내부용": ["대표", "이사", "팀장", "팀원"],
  "대외비": ["대표", "이사", "팀장"],
  "기밀": ["대표", "이사"],
};
function canAccessSecurity(role: HQRole, level: SecurityLevel) {
  return SECURITY_ACCESS[level]?.includes(role) ?? false;
}
function getSecurityStyle(level: SecurityLevel) {
  return SECURITY_LEVELS.find(s => s.value === level) ?? SECURITY_LEVELS[1];
}

function getPermissions(myRole: HQRole, uploaderName: string, userName: string) {
  if (myRole === "대표" || myRole === "이사") return { canUpload: true, canDelete: true, canMove: true, canRename: true, canCreateFolder: true, canDeleteFolder: true };
  if (myRole === "팀장") return { canUpload: true, canDelete: uploaderName === userName, canMove: uploaderName === userName, canRename: uploaderName === userName, canCreateFolder: true, canDeleteFolder: false };
  return { canUpload: true, canDelete: uploaderName === userName, canMove: false, canRename: false, canCreateFolder: false, canDeleteFolder: false };
}

/* ================================================================
   SVG Icons (inline, no deps)
   ================================================================ */
const IconFolder = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" fill="currentColor" opacity={0.15} />
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);
const IconFolderOpen = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19h14a2 2 0 001.84-2.77L18 9H6l-2.84 7.23A2 2 0 005 19z" fill="currentColor" opacity={0.15} />
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);
const IconGrid = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconList = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconChevronRight = () => (
  <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconUpload = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* large icon for grid view */
function LargeFileIcon({ type, name }: { type: string; name: string }) {
  const cat = fileCategory(type, name);
  const colors: Record<string, string> = {
    "이미지": "from-pink-400 to-rose-500",
    "PDF": "from-red-400 to-red-600",
    "동영상": "from-violet-400 to-purple-600",
    "오디오": "from-green-400 to-emerald-600",
    "스프레드시트": "from-emerald-400 to-green-600",
    "문서": "from-blue-400 to-indigo-600",
    "텍스트": "from-slate-400 to-slate-600",
    "기타": "from-gray-400 to-gray-600",
  };
  const icons: Record<string, string> = {
    "이미지": "🖼️", "PDF": "📄", "동영상": "🎬", "오디오": "🎵",
    "스프레드시트": "📊", "문서": "📝", "텍스트": "📃", "기타": "📎",
  };
  const ext = name.includes(".") ? name.split(".").pop()?.toUpperCase() || "" : "";
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[cat] || colors["기타"]} flex items-center justify-center shadow-sm relative`}>
      <span className="text-2xl">{icons[cat] || "📎"}</span>
      {ext && <span className="absolute -bottom-1 -right-1 bg-white text-[8px] font-bold text-slate-500 px-1 rounded shadow-sm border border-slate-100 leading-tight">{ext.slice(0, 4)}</span>}
    </div>
  );
}

function LargeFolderIcon({ highlight }: { highlight?: boolean }) {
  return (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${highlight ? "bg-blue-100" : "bg-amber-50"}`}>
      <IconFolder className={`w-8 h-8 ${highlight ? "text-[#3182F6]" : "text-amber-400"}`} />
    </div>
  );
}

/* ================================================================
   Context Menu component
   ================================================================ */
interface CtxMenuItem { label: string; icon: string; danger?: boolean; disabled?: boolean; divider?: boolean; onClick: () => void; }

function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: CtxMenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    // adjust if off-screen
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
  /* ── state ── */
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

  const fileRef = useRef<HTMLInputElement>(null);
  const newFolderRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const isAdmin = myRole === "대표" || myRole === "이사";
  const canCreateFolder = myRole !== "팀원";

  /* ── data loading (unchanged logic) ── */
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
      setFolders(fRes.data.map((r: any) => ({ id: r.id, name: r.name, parentId: r.parent_id })));
    if (fileRes.data)
      setFiles(fileRes.data.map((r: any) => ({
        id: r.id, name: r.name, size: formatSize(r.size || 0),
        type: r.type || "", url: r.url || "", uploadedAt: r.created_at,
        uploadedBy: r.uploaded_by || "", folderId: r.folder_id,
        security: r.security || "내부용",
      })));
    if (allF.data)
      setAllFolders(allF.data.map((r: any) => ({ id: r.id, name: r.name, parentId: r.parent_id })));

    setLoading(false);
  }, []);

  useEffect(() => { load(currentFolder); }, [currentFolder, load]);

  /* ── navigation ── */
  const openFolder = useCallback((f: Folder) => {
    setCurrentFolder(f.id);
    setBreadcrumb((prev) => [...prev, { id: f.id, name: f.name }]);
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
  }, []);

  const goTo = useCallback((idx: number) => {
    const target = breadcrumb[idx];
    setCurrentFolder(target.id);
    setBreadcrumb((prev) => prev.slice(0, idx + 1));
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
  }, [breadcrumb]);

  /* ── CRUD operations (unchanged logic) ── */
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

  const uploadFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const s = sb();
    if (!s) return;
    setUploading(true);

    const duplicate = files.find(ef => ef.name === file.name);
    if (duplicate) {
      const ok = confirm(`"${file.name}" 파일이 이미 존재합니다. 덮어쓰시겠습니까?`);
      if (!ok) { setUploading(false); if (fileRef.current) fileRef.current.value = ""; return; }
      await deleteFileSilent(duplicate);
    }

    let uploaded = false;
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) formData.append("folder", currentFolder);
      const res = await fetch("/api/r2/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        await s.from("hq_files").insert({
          name: data.name, size: data.size, type: data.type, url: data.url,
          folder_id: currentFolder || null, uploaded_by: userName, security: uploadSecurity,
        });
        uploaded = true;
        flash("파일 업로드 완료");
      }
    } catch {}

    if (!uploaded) {
      try {
        const path = `${Date.now()}_${file.name}`;
        const { error: uploadErr } = await s.storage.from("hq-files").upload(path, file);
        if (uploadErr) { flash("업로드 실패: " + uploadErr.message); setUploading(false); if (fileRef.current) fileRef.current.value = ""; return; }
        const { data: { publicUrl } } = s.storage.from("hq-files").getPublicUrl(path);
        await s.from("hq_files").insert({
          name: file.name, size: file.size, type: file.type, url: publicUrl,
          folder_id: currentFolder || null, uploaded_by: userName, security: uploadSecurity,
        });
        uploaded = true;
        flash("파일 업로드 완료");
      } catch { flash("업로드 실패"); }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load(currentFolder);
  }, [files, currentFolder, userName, uploadSecurity, flash, load]);

  const deleteFileSilent = useCallback(async (f: FileItem) => {
    const s = sb();
    if (!s) return;
    if (f.url.includes("r2.dev")) {
      try { const key = f.url.split(".r2.dev/")[1]; if (key) await fetch("/api/r2/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: decodeURIComponent(key) }) }); } catch {}
    } else if (f.url.includes("supabase")) {
      try { const path = f.url.split("/hq-files/")[1]; if (path) await s.storage.from("hq-files").remove([decodeURIComponent(path)]); } catch {}
    }
    await s.from("hq_files").delete().eq("id", f.id);
  }, []);

  const deleteFile = useCallback(async (f: FileItem) => {
    await deleteFileSilent(f);
    flash("파일이 삭제되었습니다");
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
    // also update breadcrumb if renaming current
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

  /* ── bulk operations ── */
  const bulkDelete = useCallback(async () => {
    const toDelete = files.filter(f => selectedFiles.has(f.id));
    if (toDelete.length === 0) return;
    for (const f of toDelete) await deleteFileSilent(f);
    // delete selected folders
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

  /* ── drag & drop for file moving ── */
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
    // if multiple selected, move all
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

  const handleRootDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverRoot(false);
    setIsDraggingOver(false);
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
    // file upload via drag
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      // trigger upload for first file
      const dt = new DataTransfer();
      dt.items.add(droppedFiles[0]);
      if (fileRef.current) {
        fileRef.current.files = dt.files;
        fileRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }, [selectedFiles, moveFile, flash, load, currentFolder]);

  /* ── context menu builders ── */
  const buildFileCtx = useCallback((f: FileItem, x: number, y: number) => {
    const perm = getPermissions(myRole, f.uploadedBy, userName);
    const items: CtxMenuItem[] = [
      { label: "열기", icon: "👁", onClick: () => setPreview(f) },
      { label: "다운로드", icon: "⬇", onClick: () => window.open(f.url, "_blank") },
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
  }, [myRole, userName, isAdmin, movingFile, changeSecurity]);

  const buildFolderCtx = useCallback((f: Folder, x: number, y: number) => {
    const items: CtxMenuItem[] = [
      { label: "열기", icon: "📂", onClick: () => openFolder(f) },
      { label: "이름 변경", icon: "✏", disabled: !canCreateFolder, onClick: () => { setRenamingFolder(f.id); setRenameValue(f.name); } },
      { label: "", icon: "", divider: true, onClick: () => {} },
      { label: "삭제", icon: "🗑", danger: true, disabled: !isAdmin, onClick: () => setConfirmDelete({ type: "folder", id: f.id, name: f.name }) },
    ];
    setCtxMenu({ x, y, items });
  }, [openFolder, canCreateFolder, isAdmin]);

  /* ── selection helpers ── */
  const toggleFileSelect = useCallback((id: string, e?: React.MouseEvent) => {
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

  const selectAll = useCallback(() => {
    if (selectedFiles.size === filteredFiles.length && selectedFolders.size === folders.length) {
      setSelectedFiles(new Set());
      setSelectedFolders(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
      setSelectedFolders(new Set(folders.map(f => f.id)));
    }
  }, []);

  /* ── formatting ── */
  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" }); } catch { return d; }
  };
  const formatDateShort = (d: string) => {
    try { return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }); } catch { return d; }
  };

  /* ── computed: filtered & sorted files ── */
  const accessibleFiles = useMemo(() =>
    files.filter(f => canAccessSecurity(myRole, (f.security as SecurityLevel) || "내부용")),
    [files, myRole]
  );

  const filteredFiles = useMemo(() => {
    const filtered = securityFilter === "all" ? accessibleFiles : accessibleFiles.filter(f => (f.security || "내부용") === securityFilter);
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name, "ko");
      else if (sortBy === "date") cmp = (a.uploadedAt || "").localeCompare(b.uploadedAt || "");
      else if (sortBy === "size") cmp = parseBytes(a.size) - parseBytes(b.size);
      else if (sortBy === "type") cmp = (a.type || "").localeCompare(b.type || "");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [accessibleFiles, securityFilter, sortBy, sortDir]);

  const totalSize = useMemo(() => {
    const bytes = filteredFiles.reduce((acc, f) => acc + parseBytes(f.size), 0);
    return formatSize(bytes);
  }, [filteredFiles]);

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

  // update selectAll to use computed filteredFiles
  const isAllSelected = filteredFiles.length > 0 && selectedFiles.size === filteredFiles.length && selectedFolders.size === folders.length;
  const hasSelection = selectedFiles.size > 0 || selectedFolders.size > 0;

  /* ── auto-focus refs ── */
  useEffect(() => {
    if (showNewFolder && newFolderRef.current) newFolderRef.current.focus();
  }, [showNewFolder]);
  useEffect(() => {
    if ((renamingFile || renamingFolder) && renameRef.current) renameRef.current.focus();
  }, [renamingFile, renamingFolder]);

  /* ── render helpers ── */
  const renderSortButton = (key: "name" | "date" | "size" | "type", label: string) => (
    <button
      key={key}
      onClick={() => { if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(key); setSortDir(key === "name" ? "asc" : "desc"); } }}
      className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${sortBy === key ? "bg-[#3182F6]/10 text-[#3182F6]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
    >
      {label}{sortBy === key && (sortDir === "asc" ? " ↑" : " ↓")}
    </button>
  );

  /* ── render file row (list view) ── */
  const renderFileRow = (f: FileItem) => {
    const perm = getPermissions(myRole, f.uploadedBy, userName);
    const secStyle = getSecurityStyle((f.security as SecurityLevel) || "내부용");
    const isSelected = selectedFiles.has(f.id);
    const isRenaming = renamingFile === f.id;
    const isMoving = movingFile === f.id;

    return (
      <div
        key={f.id}
        draggable={perm.canMove}
        onDragStart={(e) => handleDragStart(e, f.id)}
        onContextMenu={(e) => { e.preventDefault(); buildFileCtx(f, e.clientX, e.clientY); }}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
          ${isSelected ? "bg-[#3182F6]/5 ring-1 ring-[#3182F6]/20" : "hover:bg-slate-50"}
          ${perm.canMove ? "cursor-grab active:cursor-grabbing" : ""}`}
        onClick={() => setPreview(f)}
      >
        {/* checkbox */}
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
            ${isSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-slate-200 group-hover:border-slate-300"}`}
          onClick={(e) => { e.stopPropagation(); toggleFileSelect(f.id); }}
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
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") renameFile(f.id); if (e.key === "Escape") { setRenamingFile(null); setRenameValue(""); } }}
              />
              <button onClick={() => renameFile(f.id)} className="text-xs text-[#3182F6] font-semibold hover:underline">확인</button>
              <button onClick={() => { setRenamingFile(null); setRenameValue(""); }} className="text-xs text-slate-400 hover:text-slate-600">취소</button>
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
              onChange={(e) => changeSecurity(f.id, e.target.value as SecurityLevel)}
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
            <button onClick={() => setConfirmDelete({ type: "file", id: f.id, name: f.name })}
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
              <button onClick={() => moveFile(f.id, null)} className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2">
                <IconFolderOpen className="w-4 h-4 text-amber-400" /> 루트
              </button>
            )}
            {allFolders.filter(af => af.id !== currentFolder).map(af => (
              <button key={af.id} onClick={() => moveFile(f.id, af.id)} className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2">
                <IconFolder className="w-4 h-4 text-amber-400" /> {af.name}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-1" />
            <button onClick={() => setMovingFile(null)} className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-red-50 text-slate-400">취소</button>
          </div>
        )}
      </div>
    );
  };

  /* ── render file card (grid view) ── */
  const renderFileCard = (f: FileItem) => {
    const perm = getPermissions(myRole, f.uploadedBy, userName);
    const secStyle = getSecurityStyle((f.security as SecurityLevel) || "내부용");
    const isSelected = selectedFiles.has(f.id);
    const isRenaming = renamingFile === f.id;

    return (
      <div
        key={f.id}
        draggable={perm.canMove}
        onDragStart={(e) => handleDragStart(e, f.id)}
        onContextMenu={(e) => { e.preventDefault(); buildFileCtx(f, e.clientX, e.clientY); }}
        className={`group relative flex flex-col items-center p-4 rounded-2xl transition-all cursor-pointer border
          ${isSelected ? "bg-[#3182F6]/5 border-[#3182F6]/20 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"}
          ${perm.canMove ? "cursor-grab active:cursor-grabbing" : ""}`}
        onClick={() => setPreview(f)}
        onDoubleClick={() => setPreview(f)}
      >
        {/* checkbox */}
        <div
          className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
            ${isSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-transparent group-hover:border-slate-200"}`}
          onClick={(e) => { e.stopPropagation(); toggleFileSelect(f.id); }}
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
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") renameFile(f.id); if (e.key === "Escape") { setRenamingFile(null); setRenameValue(""); } }}
            />
          </div>
        ) : (
          <p className="text-xs font-medium text-slate-700 mt-3 text-center truncate w-full px-1" title={f.name}>{f.name}</p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">{f.size}</p>
      </div>
    );
  };

  /* ── render folder (shared) ── */
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

  /* ── main render ── */
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
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{fileIcon(preview.type)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{preview.name}</p>
                  <p className="text-xs text-slate-400">{preview.size} · {preview.uploadedBy} · {formatDate(preview.uploadedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={preview.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-[#3182F6] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#2672DE] transition">다운로드</a>
                <button onClick={() => setPreview(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                  <IconX />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5 flex items-center justify-center bg-slate-50/50 min-h-[300px]">
              <PreviewContent file={preview} />
            </div>
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

      {/* ════════════════════════════════════════════
          FILE MANAGER CHROME
         ════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* left: navigation + breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
              {/* back */}
              <button
                disabled={breadcrumb.length <= 1}
                onClick={() => goTo(breadcrumb.length - 2)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${breadcrumb.length > 1 ? "hover:bg-slate-100 text-slate-500" : "text-slate-200 cursor-not-allowed"}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              {/* forward placeholder */}
              <div className="w-px h-5 bg-slate-100" />

              {/* breadcrumb */}
              <div className="flex items-center gap-0.5 text-sm min-w-0 overflow-hidden">
                {breadcrumb.map((b, i) => (
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
                ))}
              </div>
            </div>

            {/* right: actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* view toggle */}
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

              {/* group by type */}
              <button
                onClick={() => setGroupByType(!groupByType)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${groupByType ? "bg-[#3182F6]/10 text-[#3182F6]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                title="유형별 그룹"
              >
                유형별
              </button>

              <div className="w-px h-5 bg-slate-100" />

              {/* new folder */}
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
              <input ref={fileRef} type="file" className="hidden" onChange={uploadFile} />
              <button
                className="flex items-center gap-1.5 rounded-lg bg-[#3182F6] text-white font-semibold px-3.5 py-1.5 text-sm hover:bg-[#2672DE] active:scale-[0.98] transition-all"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <IconUpload />
                {uploading ? "업로드 중..." : "업로드"}
              </button>

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

        {/* ── Filter bar + info bar ── */}
        <div className="border-b border-slate-50 px-4 py-2 flex items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5">
            {/* security filter chips */}
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
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{folders.length}개 폴더, {filteredFiles.length}개 파일</span>
            <span className="text-slate-300">|</span>
            <span>{totalSize}</span>
          </div>
        </div>

        {/* ── Sort bar ── */}
        <div className="border-b border-slate-50 px-4 py-1.5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-1">
            {/* select all checkbox */}
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer mr-2 transition-all
                ${isAllSelected ? "bg-[#3182F6] border-[#3182F6] text-white" : "border-slate-200 hover:border-slate-300"}`}
              onClick={() => {
                if (isAllSelected) { setSelectedFiles(new Set()); setSelectedFolders(new Set()); }
                else { setSelectedFiles(new Set(filteredFiles.map(f => f.id))); setSelectedFolders(new Set(folders.map(f => f.id))); }
              }}
            >
              {isAllSelected && <IconCheck />}
            </div>

            {hasSelection ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#3182F6] font-semibold">{selectedFiles.size + selectedFolders.size}개 선택</span>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                {selectedFiles.size > 0 && isAdmin && (
                  <>
                    <button onClick={() => setBulkMoveOpen(true)} className="text-xs text-slate-500 hover:text-[#3182F6] font-medium px-2 py-1 rounded-lg hover:bg-[#3182F6]/5 transition-all">이동</button>
                    <button onClick={() => setBulkSecurityOpen(true)} className="text-xs text-slate-500 hover:text-[#3182F6] font-medium px-2 py-1 rounded-lg hover:bg-[#3182F6]/5 transition-all">보안등급</button>
                  </>
                )}
                <button onClick={() => setConfirmDelete({ type: "file", id: "__bulk__", name: "__bulk__" })}
                  className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all">삭제</button>
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

        {/* ── Content area ── */}
        <div
          className={`px-4 py-3 min-h-[300px] transition-colors ${isDraggingOver ? "bg-[#3182F6]/[0.03]" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); if (!dragOverFolder) setDragOverRoot(true); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) { setIsDraggingOver(false); setDragOverRoot(false); } }}
          onDrop={handleRootDrop}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">불러오는 중...</span>
              </div>
            </div>
          ) : folders.length === 0 && filteredFiles.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">이 폴더는 비어있습니다</p>
              <p className="text-xs text-slate-400 mb-4">파일을 드래그하여 업로드하거나, 위의 업로드 버튼을 사용하세요</p>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 border border-dashed border-slate-200 rounded-xl px-4 py-3">
                  <IconUpload />
                  <span>파일을 여기에 드래그</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ── Folders section ── */}
              {folders.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">폴더</p>
                  <div className={viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
                    : "space-y-1"
                  }>
                    {folders.map(f => renderFolder(f, viewMode === "grid"))}
                  </div>
                </div>
              )}

              {/* ── Files section ── */}
              {filteredFiles.length > 0 && (
                <div>
                  {folders.length > 0 && <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">파일</p>}

                  {groupedFiles ? (
                    /* grouped by type */
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
                      {filteredFiles.map(f => renderFileCard(f))}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {filteredFiles.map(f => renderFileRow(f))}
                    </div>
                  )}
                </div>
              )}

              {/* filtered empty state */}
              {filteredFiles.length === 0 && folders.length === 0 && securityFilter !== "all" && (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400">해당 보안등급의 파일이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Status bar ── */}
        <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/30">
          <span>{folders.length}개 폴더, {filteredFiles.length}개 파일 {securityFilter !== "all" && `(${securityFilter} 필터 적용)`}</span>
          <span>총 {totalSize}</span>
        </div>
      </div>
    </div>
  );
}
