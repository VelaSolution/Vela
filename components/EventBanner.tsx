"use client";

import Link from "next/link";

export default function EventBanner() {
  return (
    <>
      <style>{`
        .event-banner{width:100%;margin:0 0 16px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:20px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;position:relative;overflow:hidden}
        .event-banner::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:rgba(49,130,246,0.15);border-radius:50%}
        .event-banner-text{z-index:1}
        .event-banner-tag{display:inline-block;background:rgba(49,130,246,0.2);color:#93C5FD;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;margin-bottom:8px}
        .event-banner-title{font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:4px}
        .event-banner-desc{font-size:13px;color:#94a3b8;line-height:1.5}
        .event-banner-btn{z-index:1;padding:12px 24px;background:#3182F6;color:#fff;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap;transition:background .15s;flex-shrink:0}
        .event-banner-btn:hover{background:#2563EB}
        @media(max-width:640px){
          .event-banner{flex-direction:column;text-align:center;padding:24px 20px}
          .event-banner-btn{width:100%;text-align:center}
        }
      `}</style>
      <div className="event-banner">
        <div className="event-banner-text">
          <span className="event-banner-tag">EVENT</span>
          <div className="event-banner-title">피드백 남기고 스탠다드 1개월 무료 체험!</div>
          <div className="event-banner-desc">추첨 10명에게 스타벅스 기프티콘도 드려요</div>
        </div>
        <Link href="/event/feedback" className="event-banner-btn">
          참여하기
        </Link>
      </div>
    </>
  );
}
