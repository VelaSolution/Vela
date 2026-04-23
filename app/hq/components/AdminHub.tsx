"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const RecruitTab = dynamic(() => import("./RecruitTab"));
const CrmTab = dynamic(() => import("./CrmTab"));
const EducationTab = dynamic(() => import("./EducationTab"));
const TimelineTab = dynamic(() => import("./TimelineTab"));
const AuditLog = dynamic(() => import("./AuditLog"));
const CertificateTab = dynamic(() => import("./CertificateTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "recruit", label: "채용" },
  { key: "crm", label: "CRM" },
  { key: "education", label: "교육" },
  { key: "certificate", label: "재직증명서" },
  { key: "activity", label: "활동로그" },
  { key: "audit", label: "관리자 로그" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function AdminHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("recruit");

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

      {sub === "recruit" && <RecruitTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "crm" && <CrmTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "education" && <EducationTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "certificate" && <CertificateTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "activity" && (
        <div className="space-y-0">
          <TimelineTab userId={userId} userName={userName} myRole={myRole} flash={flash} />
        </div>
      )}
      {sub === "audit" && <AuditLog userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}
