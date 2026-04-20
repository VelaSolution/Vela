"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const FilesTab = dynamic(() => import("./FilesTab"));
const WikiTab = dynamic(() => import("./WikiTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "files", label: "파일" },
  { key: "wiki", label: "위키" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function DocsHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("files");

  return (
    <div>
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setSub(t.key)}
            className={`px-4 py-2.5 text-[14px] font-semibold rounded-xl transition-all ${
              sub === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {sub === "files" && <FilesTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "wiki" && <WikiTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}
