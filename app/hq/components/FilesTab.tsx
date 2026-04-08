"use client";

import { useState, useEffect, useRef } from "react";
import { HQRole, Folder, FileItem } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  image: "🖼️",
  spreadsheet: "📊",
  document: "📝",
  default: "📎",
};

function fileIcon(type: string) {
  if (type.includes("pdf")) return FILE_ICONS.pdf;
  if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg"))
    return FILE_ICONS.image;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv") || type.includes("xlsx"))
    return FILE_ICONS.spreadsheet;
  if (type.includes("doc") || type.includes("word")) return FILE_ICONS.document;
  return FILE_ICONS.default;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function FilesTab({ userId, userName, myRole, flash }: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const [breadcrumb, setBreadcrumb] = useState<{ id?: string; name: string }[]>([
    { name: "루트" },
  ]);
  const [newFolder, setNewFolder] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async (folderId?: string) => {
    const s = sb();
    if (!s) return setLoading(false);

    const fq = s.from("hq_folders").select("*");
    const fRes = folderId
      ? await fq.eq("parent_id", folderId)
      : await fq.is("parent_id", null);

    const fileQ = s.from("hq_files").select("*");
    const fileRes = folderId
      ? await fileQ.eq("folder_id", folderId)
      : await fileQ.is("folder_id", null);

    if (fRes.data)
      setFolders(
        fRes.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          parentId: r.parent_id,
        }))
      );

    if (fileRes.data)
      setFiles(
        fileRes.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          size: formatSize(r.size || 0),
          type: r.type || "",
          url: r.url || "",
          uploadedAt: r.created_at,
          uploadedBy: r.uploaded_by || "",
          folderId: r.folder_id,
        }))
      );

    setLoading(false);
  };

  useEffect(() => {
    load(currentFolder);
  }, [currentFolder]);

  const depth = breadcrumb.length - 1;

  const openFolder = (f: Folder) => {
    setCurrentFolder(f.id);
    setBreadcrumb((prev) => [...prev, { id: f.id, name: f.name }]);
  };

  const goTo = (idx: number) => {
    const target = breadcrumb[idx];
    setCurrentFolder(target.id);
    setBreadcrumb((prev) => prev.slice(0, idx + 1));
  };

  const createFolder = async () => {
    if (!newFolder.trim()) return;
    if (depth >= 2) return flash("폴더는 최대 2단계까지 생성 가능합니다");
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
    load(currentFolder);
  };

  const deleteFolder = async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_folders").delete().eq("id", id);
    flash("폴더가 삭제되었습니다");
    load(currentFolder);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const s = sb();
    if (!s) return;
    setUploading(true);

    try {
      // R2에 업로드
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) formData.append("folder", currentFolder);

      const res = await fetch("/api/r2/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        flash("업로드 실패: " + (data.error || "알 수 없는 오류"));
        setUploading(false);
        return;
      }

      // DB에 메타데이터 저장
      await s.from("hq_files").insert({
        name: data.name,
        size: data.size,
        type: data.type,
        url: data.url,
        r2_key: data.key,
        folder_id: currentFolder || null,
        uploaded_by: userName,
        created_at: new Date().toISOString(),
      });

      flash("파일이 업로드되었습니다 (R2)");
    } catch (err) {
      flash("업로드 실패");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load(currentFolder);
  };

  const deleteFile = async (f: FileItem) => {
    const s = sb();
    if (!s) return;

    // R2에서 삭제 (r2_key가 있으면)
    try {
      const { data: fileData } = await s.from("hq_files").select("r2_key").eq("id", f.id).single();
      if (fileData?.r2_key) {
        await fetch("/api/r2/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: fileData.r2_key }),
        });
      }
    } catch {}

    // DB에서 삭제
    await s.from("hq_files").delete().eq("id", f.id);
    flash("파일이 삭제되었습니다");
    load(currentFolder);
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className={C}>
        <div className="flex items-center gap-1 text-sm mb-4">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300">/</span>}
              <button
                onClick={() => goTo(i)}
                className={`px-1.5 py-0.5 rounded-lg transition-colors ${
                  i === breadcrumb.length - 1
                    ? "font-semibold text-slate-800"
                    : "text-slate-400 hover:text-[#3182F6]"
                }`}
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              className={`${I} !w-48`}
              placeholder="새 폴더 이름"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
            />
            <button className={B2} onClick={createFolder}>
              폴더 생성
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={uploadFile}
            />
            <button
              className={B}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "업로드 중..." : "파일 업로드"}
            </button>
          </div>
        </div>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {folders.map((f) => (
            <div
              key={f.id}
              className="group bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
            >
              <div onClick={() => openFolder(f)} className="flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <span className="text-sm font-semibold text-slate-700 truncate">
                  {f.name}
                </span>
              </div>
              <button
                onClick={() => deleteFolder(f.id)}
                className="absolute top-2 right-2 text-xs text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      <div className={C}>
        <h3 className="text-sm font-bold text-slate-700 mb-3">
          파일{" "}
          <span className="font-normal text-slate-400">({files.length})</span>
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">
            불러오는 중...
          </p>
        ) : files.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">
            파일이 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">{fileIcon(f.type)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {f.size} · {f.uploadedBy} · {formatDate(f.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#3182F6] hover:underline px-2 py-1"
                  >
                    다운로드
                  </a>
                  <button
                    onClick={() => deleteFile(f)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
