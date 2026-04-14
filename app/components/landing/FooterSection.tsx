import Link from "next/link";

export function FooterSection() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-logo">VELA<span>.</span></div>
            <p style={{fontSize:"13px",color:"var(--gray-400)",marginTop:"12px",lineHeight:"1.8"}}>
              상호명 : 벨라솔루션 | 대표자 : 김민혁<br />
              사업자등록번호 : 777-17-02386<br />
              사업장 주소 : 대전광역시 중구 당디로96번길 9, 204호(유천동)<br />
              이메일 : mnhyuk@velaanalytics.com<br />
              서비스 URL : https://www.velaanalytics.com
            </p>
          </div>
          <div className="footer-links">
            <a href="#features">도구</a>
            <Link href="/simulator">시뮬레이터</Link>
            <Link href="/community">커뮤니티</Link>
            <Link href="/game">게임</Link>
            <a href="#pricing">요금제</a>
            <a href="#contact">문의</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© {new Date().getFullYear()} VELA. All rights reserved.</div>
          <div className="footer-legal">
            <Link href="/terms">이용약관</Link>
            <Link href="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
