"use client";

import React, { useRef, useCallback } from "react";
import { FileItem } from "@/app/hq/types";
import { sb } from "@/app/hq/utils";
import { SecurityLevel, formatSize, parseBytes, IconUpload } from "./FileHelpers";

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
      // 같은 이름의 파일이 있으면 버전으로 저장
      let savedVersion = 1;
      try {
        // 기존 파일의 현재 버전을 hq_file_versions에 저장
        // 먼저 기존 버전 수 확인
        let nextVersion = 1;
        try {
          const { data: existingVersions } = await s.from("hq_file_versions")
            .select("version_number")
            .eq("file_id", duplicate.id)
            .order("version_number", { ascending: false })
            .limit(1);
          if (existingVersions && existingVersions.length > 0) {
            nextVersion = existingVersions[0].version_number + 1;
          }
        } catch {}

        savedVersion = nextVersion;

        // 현재 파일을 버전 이력에 추가
        await s.from("hq_file_versions").insert({
          file_id: duplicate.id,
          version_number: nextVersion,
          url: duplicate.url,
          size: parseBytes(duplicate.size),
          uploaded_by: duplicate.uploadedBy,
          created_at: duplicate.uploadedAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error("버전 이력 저장 실패 (테이블 미생성?):", err);
      }

      // 새 파일 업로드 후 기존 레코드 업데이트 (replace 방식)
      let uploaded = false;
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolder) formData.append("folder", currentFolder);
        const res = await fetch("/api/r2/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          await s.from("hq_files").update({
            size: data.size, type: data.type, url: data.url,
            uploaded_by: userName,
          }).eq("id", duplicate.id);
          uploaded = true;
          flash(`파일 업로드 완료 (새 버전 v${savedVersion + 1})`);
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
          await s.from("hq_files").update({
            size: file.size, type: file.type, url: publicUrl,
            uploaded_by: userName,
          }).eq("id", duplicate.id);
          uploaded = true;
          flash(`파일 업로드 완료 (새 버전 v${savedVersion + 1})`);
        } catch { flash("업로드 실패"); }
      }

      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      onUploadComplete();
      return;
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
