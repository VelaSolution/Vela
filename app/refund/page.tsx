import Link from "next/link";

export default function RefundPage() {
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .terms-wrap{max-width:760px;margin:0 auto;padding:120px 24px 80px}
        .terms-back{display:inline-flex;align-items:center;gap:8px;color:#6B7684;font-size:14px;text-decoration:none;margin-bottom:40px;transition:color .15s}
        .terms-back:hover{color:#191F28}
        .terms-tag{display:inline-block;background:#EBF3FF;color:#3182F6;font-size:13px;font-weight:600;padding:5px 14px;border-radius:100px;margin-bottom:16px}
        .terms-title{font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.02em;color:#191F28;margin-bottom:8px}
        .terms-date{font-size:14px;color:#9EA6B3;margin-bottom:48px}
        .terms-section{margin-bottom:40px}
        .terms-h2{font-size:20px;font-weight:700;color:#191F28;margin-bottom:12px;padding-bottom:12px;border-bottom:2px solid #E5E8EB}
        .terms-p{font-size:15px;color:#333D4B;line-height:1.8;margin-bottom:12px}
        .terms-list{padding-left:20px;margin-bottom:12px}
        .terms-list li{font-size:15px;color:#333D4B;line-height:1.8;margin-bottom:6px}
        .terms-highlight{background:#EBF3FF;border-left:3px solid #3182F6;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:16px;font-size:14px;color:#333D4B;line-height:1.8}
      `}</style>

      <div className="terms-wrap">
        <Link href="/" className="terms-back">&larr; 홈으로</Link>

        <span className="terms-tag">정책 안내</span>
        <h1 className="terms-title">환불 및 취소 정책</h1>
        <div className="terms-date">시행일: 2026년 1월 1일 &middot; 최종 수정: 2026년 4월 6일</div>

        <div className="terms-highlight">
          VELA 서비스의 환불 및 취소 정책을 안내드립니다. 유료 플랜 이용 시 아래 내용을 반드시 확인해주세요.
        </div>

        <div className="terms-section">
          <h2 className="terms-h2">제1조 (무료 플랜)</h2>
          <p className="terms-p">무료 플랜은 별도의 결제가 발생하지 않으므로 환불 사항이 없습니다.</p>
        </div>

        <div className="terms-section">
          <h2 className="terms-h2">제2조 (유료 플랜 &mdash; 스탠다드)</h2>
          <p className="terms-p">유료 플랜(스탠다드)의 환불 기준은 다음과 같습니다.</p>
          <ul className="terms-list">
            <li><strong>결제 후 7일 이내:</strong> 전액 환불 가능</li>
            <li><strong>결제 후 7일~30일:</strong> 잔여 기간 비례 환불</li>
            <li><strong>결제 후 30일 이후:</strong> 환불 불가</li>
          </ul>
          <div className="terms-highlight">
            환불 금액은 실제 이용 일수를 제외한 잔여 기간을 기준으로 일할 계산됩니다.
          </div>
        </div>

        <div className="terms-section">
          <h2 className="terms-h2">제3조 (환불 절차)</h2>
          <p className="terms-p">환불을 원하시는 경우 아래 방법으로 신청하실 수 있습니다.</p>
          <ul className="terms-list">
            <li><strong>프로필 &gt; 구독 관리</strong>에서 해지 신청</li>
            <li>이메일 문의: <a href="mailto:support@velaanalytics.com" style={{ color: "#3182F6" }}>support@velaanalytics.com</a></li>
          </ul>
          <p className="terms-p">환불 신청 후 영업일 기준 3~5일 이내에 처리됩니다.</p>
        </div>

        <div className="terms-section">
          <h2 className="terms-h2">제4조 (자동 갱신)</h2>
          <p className="terms-p">유료 플랜은 매월 자동으로 갱신됩니다.</p>
          <ul className="terms-list">
            <li>갱신일 3일 전에 이메일로 안내를 드립니다.</li>
            <li>자동 갱신을 원하지 않으시는 경우, 갱신일 전에 구독을 해지해주세요.</li>
            <li>해지 시 현재 결제 주기 종료일까지 서비스를 이용하실 수 있습니다.</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2 className="terms-h2">제5조 (서비스 중단 시)</h2>
          <p className="terms-p">회사의 사정으로 서비스가 영구 중단되는 경우, 유료 회원에게 잔여 기간에 대한 전액 환불을 진행합니다.</p>
          <div className="terms-highlight">
            서비스 중단이 결정될 경우, 최소 30일 전에 이메일 및 서비스 내 공지를 통해 안내드립니다.
          </div>
        </div>

        <div className="terms-section">
          <h2 className="terms-h2">문의처</h2>
          <p className="terms-p">환불 및 취소 정책에 관한 문의사항이 있으시면 아래로 연락해 주세요.</p>
          <ul className="terms-list">
            <li>이메일: <a href="mailto:support@velaanalytics.com" style={{ color: "#3182F6" }}>support@velaanalytics.com</a></li>
            <li>운영 시간: 평일 10:00 - 18:00</li>
          </ul>
        </div>
      </div>
    </>
  );
}
