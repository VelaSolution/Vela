"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type Tab = "email" | "phone";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";

  const [tab, setTab] = useState<Tab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSocialLogin(provider: "kakao" | "naver") {
    const supabase = createSupabaseBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) setError(error.message);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.refresh();
    router.push(nextPath);
    setLoading(false);
  }

  async function handleSendOtp() {
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const formatted = phone.startsWith("0") ? "+82" + phone.slice(1) : phone;
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) { setError(error.message); setLoading(false); return; }
    setOtpSent(true);
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const formatted = phone.startsWith("0") ? "+82" + phone.slice(1) : phone;
    const { error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: "sms" });
    if (error) { setError(error.message); setLoading(false); return; }
    router.refresh();
    router.push(nextPath);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-bold text-slate-900">VELA</span>
            <span className="font-serif text-3xl font-bold text-blue-500">.</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">계속하려면 로그인하세요</p>
          {nextPath !== "/" && (
            <p className="mt-1 text-xs text-blue-500 bg-blue-50 rounded-full px-3 py-1 inline-block">
              로그인 후 {nextPath} 으로 이동합니다
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-8">

          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin("kakao")}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#FEE500] px-4 py-3 text-sm font-semibold text-[#191919] transition hover:brightness-95"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.12 1.29 3.98 3.24 5.1l-.83 3.07c-.07.27.22.49.46.34L8.1 13.9c.29.04.59.06.9.06 4.14 0 7.5-2.69 7.5-6S13.14 1.5 9 1.5z" fill="#191919" />
              </svg>
              카카오로 시작하기
            </button>
            <button
              onClick={() => handleSocialLogin("naver")}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#03C75A] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <span className="text-base font-black leading-none">N</span>
              네이버로 시작하기
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400">또는</span>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 mb-6">
            {(["email", "phone"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setOtpSent(false); }}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                  tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {t === "email" ? "이메일" : "전화번호"}
              </button>
            ))}
          </div>

          {tab === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">이메일</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">비밀번호</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
          )}

          {tab === "phone" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">전화번호</label>
                <div className="flex gap-2">
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000" disabled={otpSent}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white transition disabled:opacity-60"
                  />
                  <button
                    type="button" onClick={handleSendOtp}
                    disabled={loading || otpSent || !phone}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 whitespace-nowrap"
                  >
                    {otpSent ? "전송됨" : "인증번호"}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">인증번호 6자리</label>
                  <input
                    type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000" maxLength={6} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white transition tracking-widest text-center text-lg"
                  />
                </div>
              )}
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
              {otpSent && (
                <button
                  type="submit" disabled={loading || otp.length < 6}
                  className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {loading ? "확인 중..." : "인증 완료"}
                </button>
              )}
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" className="font-semibold text-slate-700 underline underline-offset-2">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
