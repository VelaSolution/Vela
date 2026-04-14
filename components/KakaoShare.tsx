"use client";

import { useEffect, useCallback } from "react";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

interface KakaoShareProps {
  title: string;
  description: string;
  buttonText?: string;
  className?: string;
}

export default function KakaoShare({ title, description, buttonText = "카카오톡 공유", className }: KakaoShareProps) {
  useEffect(() => {
    // 카카오 SDK 로드
    if (typeof window !== "undefined" && !window.Kakao) {
      const script = document.createElement("script");
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
      script.async = true;
      script.onload = () => {
        const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
        if (appKey && window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(appKey);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleShare = useCallback(() => {
    if (!window.Kakao?.isInitialized()) {
      // SDK 미초기화 시 폴백: 클립보드 복사
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("카카오 SDK가 설정되지 않아 링크를 복사했습니다."))
        .catch(() => alert("공유에 실패했습니다."));
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: `${window.location.origin}/opengraph-image`,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: "VELA에서 보기",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  }, [title, description]);

  return (
    <button
      onClick={handleShare}
      className={className ?? "rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-300"}
    >
      💬 {buttonText}
    </button>
  );
}
