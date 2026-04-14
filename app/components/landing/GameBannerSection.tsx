import Link from "next/link";
import { FadeIn } from "./LandingUtils";

const GAME_TYPES = [
  {icon:"☕",label:"카페",sub:"객단가 7천원"},
  {icon:"🥩",label:"고깃집",sub:"객단가 4.5만원"},
  {icon:"🍽️",label:"음식점",sub:"객단가 2.2만원"},
  {icon:"✨",label:"파인다이닝",sub:"객단가 9만원"},
];

export function GameBannerSection() {
  return (
    <section style={{background:"linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", padding:"80px 24px"}}>
      <div className="section-inner" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}}>
        <FadeIn>
          <span className="section-tag" style={{background:"rgba(49,130,246,0.2)",color:"#60a5fa"}}>NEW</span>
          <h2 style={{fontSize:"clamp(28px,3.5vw,44px)",fontWeight:800,color:"#fff",letterSpacing:"-0.02em",margin:"12px 0 16px",lineHeight:1.2}}>
            경영 시뮬레이션 게임<br />
            <span style={{color:"#3182F6"}}>직접 운영해보세요</span>
          </h2>
          <p style={{fontSize:17,color:"#94a3b8",lineHeight:1.7,marginBottom:32}}>
            90일 동안 내 가게를 운영하며 날씨·이벤트·직원 관리까지 경험하세요.
            카페, 음식점, 고깃집 등 5가지 업종으로 진짜 사장님 감각을 키워보세요.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <Link href="/game" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#3182F6",color:"#fff",padding:"14px 28px",borderRadius:12,fontSize:16,fontWeight:700,textDecoration:"none"}}>
              🎮 게임 시작하기 →
            </Link>
            <Link href="/simulator" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.1)",color:"#fff",padding:"14px 28px",borderRadius:12,fontSize:16,fontWeight:600,textDecoration:"none",border:"1px solid rgba(255,255,255,0.2)"}}>
              📊 시뮬레이터
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:24,padding:28,border:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {GAME_TYPES.map(item=>(
                <div key={item.label} style={{background:"rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{item.icon}</div>
                  <p style={{fontSize:14,fontWeight:700,color:"#fff",margin:"0 0 2px"}}>{item.label}</p>
                  <p style={{fontSize:12,color:"#64748b",margin:0}}>{item.sub}</p>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(49,130,246,0.15)",borderRadius:12,padding:"12px 16px",border:"1px solid rgba(49,130,246,0.3)",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>🏆</span>
              <div>
                <p style={{fontSize:13,fontWeight:700,color:"#60a5fa",margin:0}}>글로벌 랭킹 시스템</p>
                <p style={{fontSize:12,color:"#475569",margin:0}}>90일 최고 순이익으로 전 세계 사장님들과 경쟁!</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
      <style>{`@media(max-width:768px){.game-banner-grid{grid-template-columns:1fr !important}}`}</style>
    </section>
  );
}
