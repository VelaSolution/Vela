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
    <section style={{background:"linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", padding:"80px 24px", position:"relative", overflow:"hidden"}}>
      {/* Decorative orbs */}
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"400px",height:"400px",background:"radial-gradient(circle,rgba(49,130,246,0.12) 0%,transparent 60%)",borderRadius:"50%",pointerEvents:"none"}} />
      <div style={{position:"absolute",bottom:"-80px",left:"-80px",width:"300px",height:"300px",background:"radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 60%)",borderRadius:"50%",pointerEvents:"none"}} />

      <div className="section-inner" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center",position:"relative",zIndex:1}}>
        <FadeIn>
          <span className="section-tag" style={{background:"rgba(49,130,246,0.12)",color:"#60a5fa",border:"1px solid rgba(49,130,246,0.2)"}}>NEW</span>
          <h2 style={{fontSize:"clamp(28px,3.5vw,44px)",fontWeight:800,color:"#fff",letterSpacing:"-0.03em",margin:"12px 0 16px",lineHeight:1.2}}>
            경영 시뮬레이션 게임<br />
            <span style={{background:"linear-gradient(135deg,#3182F6,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>직접 운영해보세요</span>
          </h2>
          <p style={{fontSize:17,color:"#94a3b8",lineHeight:1.7,marginBottom:32}}>
            90일 동안 내 가게를 운영하며 날씨·이벤트·직원 관리까지 경험하세요.
            카페, 음식점, 고깃집 등 5가지 업종으로 진짜 사장님 감각을 키워보세요.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <Link href="/game" className="btn-primary" style={{fontSize:16,fontWeight:700}}>
              🎮 게임 시작하기 →
            </Link>
            <Link href="/simulator" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",color:"#fff",padding:"14px 28px",borderRadius:14,fontSize:16,fontWeight:600,textDecoration:"none",border:"1px solid rgba(255,255,255,0.12)",backdropFilter:"blur(8px)",transition:"all .3s cubic-bezier(.16,1,.3,1)"}}>
              📊 시뮬레이터
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:24,padding:28,border:"1px solid rgba(255,255,255,0.08)",backdropFilter:"blur(12px)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {GAME_TYPES.map(item=>(
                <div key={item.label} style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"14px 16px",border:"1px solid rgba(255,255,255,0.06)",transition:"all .3s cubic-bezier(.16,1,.3,1)",cursor:"default"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.08)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.05)";(e.currentTarget as HTMLDivElement).style.transform="none"}}
                >
                  <div style={{fontSize:24,marginBottom:6}}>{item.icon}</div>
                  <p style={{fontSize:14,fontWeight:700,color:"#fff",margin:"0 0 2px"}}>{item.label}</p>
                  <p style={{fontSize:12,color:"#64748b",margin:0}}>{item.sub}</p>
                </div>
              ))}
            </div>
            <div style={{background:"linear-gradient(135deg,rgba(49,130,246,0.12),rgba(124,58,237,0.08))",borderRadius:14,padding:"12px 16px",border:"1px solid rgba(49,130,246,0.2)",display:"flex",alignItems:"center",gap:10}}>
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
