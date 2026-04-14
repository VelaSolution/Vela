"use client";
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // PC에서는 숨기기 — 모바일만 표시
    if (window.innerWidth > 768) return;
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("vela-install-dismissed")) return;
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("vela-install-dismissed", "1");
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl ring-1 ring-white/10">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div className="flex-1">
          <p className="text-sm font-bold">VELA 앱 설치하기</p>
          <p className="text-xs text-slate-400 mt-0.5">홈 화면에 추가하면 더 빠르게 사용할 수 있어요</p>
        </div>
        <button onClick={handleDismiss} className="text-slate-500 hover:text-white text-sm">✕</button>
      </div>
      <button onClick={handleInstall}
        className="mt-3 w-full rounded-xl bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition">
        설치하기
      </button>
    </div>
  );
}
