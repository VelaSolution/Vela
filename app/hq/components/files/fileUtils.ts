import { HQRole } from "@/app/hq/types";

/* ================================================================
   Constants
   ================================================================ */
export const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", spreadsheet: "📊", document: "📝", default: "📎",
};

export type SecurityLevel = "공개" | "내부용" | "대외비" | "기밀";

export const SECURITY_LEVELS: { value: SecurityLevel; label: string; color: string; icon: string }[] = [
  { value: "공개", label: "공개", color: "bg-emerald-50 text-emerald-700", icon: "🟢" },
  { value: "내부용", label: "내부용", color: "bg-blue-50 text-blue-700", icon: "🔵" },
  { value: "대외비", label: "대외비", color: "bg-amber-50 text-amber-700", icon: "🟡" },
  { value: "기밀", label: "기밀", color: "bg-red-50 text-red-700", icon: "🔴" },
];

export const SECURITY_ACCESS: Record<SecurityLevel, HQRole[]> = {
  "공개": ["대표", "이사", "팀장", "팀원"],
  "내부용": ["대표", "이사", "팀장", "팀원"],
  "대외비": ["대표", "이사", "팀장"],
  "기밀": ["대표", "이사"],
};

/* ================================================================
   Utility functions
   ================================================================ */
export function fileIcon(type: string) {
  if (type.includes("pdf")) return FILE_ICONS.pdf;
  if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) return FILE_ICONS.image;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv") || type.includes("xlsx")) return FILE_ICONS.spreadsheet;
  if (type.includes("doc") || type.includes("word")) return FILE_ICONS.document;
  return FILE_ICONS.default;
}

export function fileCategory(type: string, name: string): string {
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

export function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export function parseBytes(s: string): number {
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  if (s.includes("GB")) return n * 1024 * 1024 * 1024;
  if (s.includes("MB")) return n * 1024 * 1024;
  if (s.includes("KB")) return n * 1024;
  return n;
}

export function getPreviewType(type: string, name: string) {
  const t = type.toLowerCase();
  const n = name.toLowerCase();
  if (t.includes("image") || ["png","jpg","jpeg","gif","webp","svg"].some(e => t.includes(e) || n.endsWith("." + e))) return "image";
  if (t.includes("pdf") || n.endsWith(".pdf")) return "pdf";
  if (t.includes("video") || ["mp4","webm","mov"].some(e => n.endsWith("." + e))) return "video";
  if (t.includes("audio") || ["mp3","wav","ogg"].some(e => n.endsWith("." + e))) return "audio";
  if (t.includes("text") || t.includes("json") || t.includes("csv") || t.includes("xml") || ["txt","md","json","csv","log","xml","html","css","js","ts","tsx"].some(e => n.endsWith("." + e))) return "text";
  return null;
}

export function canAccessSecurity(role: HQRole, level: SecurityLevel) {
  return SECURITY_ACCESS[level]?.includes(role) ?? false;
}

export function getSecurityStyle(level: SecurityLevel) {
  return SECURITY_LEVELS.find(s => s.value === level) ?? SECURITY_LEVELS[1];
}

export function getPermissions(myRole: HQRole, uploaderName: string, userName: string) {
  if (myRole === "대표" || myRole === "이사") return { canUpload: true, canDelete: true, canMove: true, canRename: true, canCreateFolder: true, canDeleteFolder: true };
  if (myRole === "팀장") return { canUpload: true, canDelete: uploaderName === userName, canMove: uploaderName === userName, canRename: uploaderName === userName, canCreateFolder: true, canDeleteFolder: false };
  return { canUpload: true, canDelete: uploaderName === userName, canMove: false, canRename: false, canCreateFolder: false, canDeleteFolder: false };
}

export function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" }); } catch { return d; }
}

export function formatDateShort(d: string) {
  try { return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }); } catch { return d; }
}

/* ================================================================
   Context Menu types
   ================================================================ */
export interface CtxMenuItem {
  label: string;
  icon: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick: () => void;
}
