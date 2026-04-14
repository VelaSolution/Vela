"use client";

import React, { useRef, useCallback } from "react";
import { FileItem } from "@/app/hq/types";
import { sb } from "@/app/hq/utils";
import { SecurityLevel, formatSize, IconUpload } from "./FileHelpers";

interface UploadAreaProps {
  userName: string;
  currentFolder: string | undefined;
  uploadSecurity: SecurityLevel;
  files: FileItem[];
  flash: (m: string) => void;
  onUploadComplete: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  deleteFileSilent: (f: FileItem) => Promise<void>;
}

export default function UploadArea({
  userName, currentFolder, uploadSecurity, files, flash,
  onUploadComplete, fileRef, uploading, setUploading, deleteFileSilent,
}: UploadAreaProps) {

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
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("R2 upload failed:", err);
        flash("R2 업로드 실패: " + (err.error || res.status));
      }
    } catch (e) { console.error("R2 fetch error:", e); }

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
    onUploadComplete();
  }, [files, currentFolder, userName, uploadSecurity, flash, onUploadComplete, fileRef, setUploading, deleteFileSilent]);

  return (
    <>
      <input ref={fileRef} type="file" className="hidden" onChange={uploadFile} />
      <button
        className="flex items-center gap-1.5 rounded-lg bg-[#3182F6] text-white font-semibold px-3.5 py-1.5 text-sm hover:bg-[#2672DE] active:scale-[0.98] transition-all"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        <IconUpload />
        {uploading ? "업로드 중..." : "업로드"}
      </button>
    </>
  );
}
