"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

interface ConsentData {
  terms_agreed_at: string | null;
  terms_version: string | null;
  privacy_agreed_at: string | null;
  privacy_version: string | null;
  marketing_agreed: boolean;
  marketing_agreed_at: string | null;
}

export default function ConsentManager({ userId }: { userId: string | null }) {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      try {
        const sb = createSupabaseBrowserClient();
        if (!sb) return;
        const { data } = await sb.from("profiles")
          .select("terms_agreed_at, terms_version, privacy_agreed_at, privacy_version, marketing_agreed, marketing_agreed_at")
          .eq("id", userId).single();
        if (data) setConsent(data as ConsentData);
      } catch { /* noop */ }
      setLoading(false);
    })();
  }, [userId]);

  const toggleMarketing = async () => {
    if (!userId || !consent) return;
    setSaving(true);
    const next = !consent.marketing_agreed;
    try {
      const sb = createSupabaseBrowserClient();
      if (!sb) return;
      await sb.from("profiles").update({
        marketing_agreed: next,
        marketing_agreed_at: next ? new Date().toISOString() : null,
      }).eq("id", userId);
      setConsent({ ...consent, marketing_agreed: next, marketing_agreed_at: next ? new Date().toISOString() : null });
    } catch { /* noop */ }
    setSaving(false);
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "—";

  if (loading) return null;

  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">📋 약관 및 동의 관리</h3>
        <p className="text-xs text-slate-400 mt-0.5">약관 동의 현황을 확인하고 마케팅 수신을 관리할 수 있습니다.</p>
      </div>

      {/* 이용약관 */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-700">이용약관 동의</p>
          <p className="text-[11px] text-slate-400">{consent?.terms_agreed_at ? `${fmtDate(consent.terms_agreed_at)} 동의 (v${consent.terms_version})` : "미동의"}</p>
        </div>
        <Link href="/terms" target="_blank" className="text-[11px] text-blue-600 font-semibold">약관 보기 →</Link>
      </div>

      {/* 개인정보 */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-700">개인정보 수집·이용 동의</p>
          <p className="text-[11px] text-slate-400">{consent?.privacy_agreed_at ? `${fmtDate(consent.privacy_agreed_at)} 동의 (v${consent.privacy_version})` : "미동의"}</p>
        </div>
        <Link href="/privacy" target="_blank" className="text-[11px] text-blue-600 font-semibold">방침 보기 →</Link>
      </div>

      {/* 마케팅 */}
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-xs font-semibold text-slate-700">마케팅 정보 수신 동의 <span className="text-slate-400 font-normal">(선택)</span></p>
          <p className="text-[11px] text-slate-400">
            {consent?.marketing_agreed
              ? `${fmtDate(consent.marketing_agreed_at)} 동의`
              : "미동의 — 이벤트·할인 소식을 받지 않습니다"}
          </p>
        </div>
        <button
          onClick={toggleMarketing}
          disabled={saving}
          className={`relative w-12 h-6 rounded-full transition-colors ${consent?.marketing_agreed ? "bg-blue-600" : "bg-slate-200"} disabled:opacity-50`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${consent?.marketing_agreed ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  );
}
