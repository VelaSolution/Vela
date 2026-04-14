"use client";
import React, { useState, useCallback, useRef } from "react";
import type { S, Float } from "../types";
import { IND, WX, EVENTS, B, BL, G50, G100, G200, G400, G600, G800, G900, GN, GNL, RD, RDL } from "../constants";
import { fmt, fmtN, getLv, getWx, calcDay, saveGame } from "../lib/game-logic";

export default function Play({s, setS, onOver}:{s:S; setS:React.Dispatch<React.SetStateAction<S|null>>; onOver:()=>void}) {
  const [floats, setFloats] = useState<Float[]>([]);
  const fid = useRef(0);
  const cfg = IND[s.ind];
  const isWk = ((s.day-1)%7)>=5;

  const addFloat = (text:string, color:string) => {
    const id = ++fid.current;
    setFloats(p=>[...p,{id,text,x:15+Math.random()*60,color}]);
    setTimeout(()=>setFloats(p=>p.filter(f=>f.id!==id)),1600);
  };

  const openDay = useCallback(() => {
    const ev = Math.random()<0.40 ? EVENTS[Math.floor(Math.random()*EVENTS.length)] : null;
    if (ev) { setS(p=>p?{...p,ev,phase:"event"}:p); return; }
    const r = calcDay(s);
    const ne = s.efx.map(e=>({...e,duration:e.duration>0?e.duration-1:e.duration})).filter(e=>e.duration!==0);
    const ns: S = {...s, cash:s.cash+r.profit, totalRev:s.totalRev+r.rev, totalProfit:s.totalProfit+r.profit,
      cust:r.cust, rev:r.rev, cost:r.cost, todayProfit:r.profit,
      logs:[...s.logs,{day:s.day,wx:s.wx,customers:r.cust,revenue:r.rev,profit:r.profit}],
      phase:"result", efx:ne, exp:s.exp+(r.profit>500000?30:r.profit>0?15:5),
      streak:r.profit>0?s.streak+1:0, best:Math.max(s.best,r.profit)};
    setS(ns); saveGame(ns);
    addFloat(r.profit>=0?("+"+fmt(r.profit)+" 💰"):(fmt(r.profit)+" 😢"), r.profit>=0?GN:RD);
  }, [s]);

  const choose = useCallback((idx:number) => {
    if (!s.ev) return;
    const ch = s.ev.choices[idx];
    if (ch.cost && s.cash<ch.cost) { alert("현금 부족! (필요: "+fmtN(ch.cost)+"원)"); return; }
    const res = ch.apply(s);
    const newEfx = res.efx ?? [];
    const tmp: S = {...s, ...res, cash:s.cash-(ch.cost||0), efx:[...s.efx,...newEfx], ev:null};
    const r = calcDay(tmp);
    const ne = tmp.efx.map(e=>({...e,duration:e.duration>0?e.duration-1:e.duration})).filter(e=>e.duration!==0);
    const ns: S = {...tmp, cash:tmp.cash+r.profit, totalRev:tmp.totalRev+r.rev, totalProfit:tmp.totalProfit+r.profit,
      cust:r.cust, rev:r.rev, cost:r.cost, todayProfit:r.profit,
      logs:[...s.logs,{day:s.day,wx:s.wx,customers:r.cust,revenue:r.rev,profit:r.profit,event:s.ev.title}],
      phase:"result", efx:ne, exp:tmp.exp+(r.profit>500000?30:r.profit>0?15:5),
      streak:r.profit>0?tmp.streak+1:0, best:Math.max(tmp.best,r.profit),
      negStreak:r.profit<0?tmp.negStreak+1:0,
      monthlyProfit:tmp.monthlyProfit+r.profit};
    setS(ns); saveGame(ns);
    addFloat(r.profit>=0?("+"+fmt(r.profit)+" 💰"):(fmt(r.profit)+" 😢"), r.profit>=0?GN:RD);
  }, [s]);

  const nextDay = useCallback(() => {
    if (s.day >= s.maxDays) { onOver(); return; }

    // 모드별 패배 조건
    if (s.mode === "survive") {
      // 생존 모드: 3일 연속 적자면 게임오버
      if (s.negStreak >= 3) { onOver(); return; }
    } else {
      // 기타 모드: 현금흐름이 -500만 이하면 위기
      if (s.cash < -5000000) { onOver(); return; }
    }

    // 목표 달성 모드: 달성 시 즉시 승리
    if (s.mode === "target") {
      const monthDone = s.day % 30 === 0;
      if (monthDone) {
        const monthRev = s.logs.slice(-30).reduce((a, l) => a + l.revenue, 0);
        const monthPro = s.logs.slice(-30).reduce((a, l) => a + l.profit, 0);
        const revOk = s.targetRevenue ? monthRev >= s.targetRevenue : true;
        const proOk = s.targetProfit  ? monthPro >= s.targetProfit  : true;
        if (revOk && proOk) { onOver(); return; }
      }
    }

    // 성장 모드: 첫 달 이후 배수 달성 시 승리
    if (s.mode === "growth" && s.day >= 30 && s.firstMonthRev) {
      const recentMonthRev = s.logs.slice(-30).reduce((a, l) => a + l.revenue, 0);
      if (recentMonthRev >= s.firstMonthRev * (s.growthTarget || 2)) { onOver(); return; }
    }

    const nd = s.day + 1;
    // 30일마다 firstMonthRev 기록
    const newFirstMonth = (s.mode === "growth" && s.day === 30 && !s.firstMonthRev)
      ? s.logs.slice(-30).reduce((a, l) => a + l.revenue, 0)
      : s.firstMonthRev;

    setS(p => p ? {
      ...p, day:nd, phase:"morning", wx:getWx(nd), ev:null,
      firstMonthRev: newFirstMonth,
      staff: p.staff.map(st => ({...st, mood:Math.min(Math.max(st.mood+(Math.random()>0.7?3:-1),0),100), absent:Math.random()<0.025}))
    } : p);
  }, [s, onOver]);

  const ec = s.ev?.type==="crisis"
    ? {bg:RDL,bd:"#FECACA",tx:RD,lb:"#FEE2E2",lbl:"⚠️ 위기!"}
    : s.ev?.type==="opportunity"
    ? {bg:GNL,bd:"#A7F3D0",tx:GN,lb:"#D1FAE5",lbl:"✨ 기회!"}
    : {bg:G50,bd:G200,tx:G800,lb:G100,lbl:"📢 이벤트"};

  const busy = Math.min(s.cust/(s.base*1.5),1);
  const showCust = s.phase==="result" ? Math.round(busy*5) : 0;

  return (
    <div style={{minHeight:"100vh",background:G50,fontFamily:"'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif"}}>
      <style>{`
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes fup{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-70px)}}
        @keyframes pin{0%{opacity:0;transform:scale(0.93)}100%{opacity:1;transform:scale(1)}}
        @keyframes rain{0%{opacity:0;transform:translateY(-10px)}80%{opacity:.5}100%{transform:translateY(185px);opacity:0}}
        @keyframes snow{0%{opacity:0;transform:translateY(-10px)rotate(0)}100%{opacity:0;transform:translateY(185px)rotate(360deg)}}
      `}</style>

      <div style={{maxWidth:500,margin:"0 auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>

        {/* HUD */}
        <div style={{background:"#fff",border:"1px solid "+cfg.color+"44",borderRadius:20,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{background:cfg.color,borderRadius:8,padding:"4px 10px",fontSize:13,fontWeight:800,color:"#fff"}}>LV.{getLv(s.exp)}</div>
              <div>
                <p style={{fontSize:17,fontWeight:800,color:G900,margin:0}}>{s.day}일차 {isWk?"🎉":""}</p>
                <p style={{fontSize:13,color:G400,margin:0}}>{WX[s.wx].icon} {WX[s.wx].label} · {s.maxDays-s.day}일 남음
                  {s.mode==="survive" && s.negStreak>0 && <span style={{color:RD,fontWeight:700,marginLeft:8}}>⚠️ 적자 {s.negStreak}일 연속!</span>}
                  {s.mode==="target" && <span style={{color:"#00B386",fontWeight:600,marginLeft:8}}>📈 목표달성모드</span>}
                  {s.mode==="growth" && <span style={{color:"#8B5CF6",fontWeight:600,marginLeft:8}}>🚀 성장모드</span>}
                </p>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:12,color:G400,margin:0}}>잔고</p>
              <p style={{fontSize:17,fontWeight:800,color:s.cash>=0?G900:RD,margin:0}}>{fmtN(s.cash)}원</p>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
            {[{l:"💰 누적",v:fmt(s.totalProfit),c:s.totalProfit>=0?GN:RD},{l:"⭐ 평판",v:s.rep+"점",c:"#F59E0B"},{l:"🔥 연속",v:s.streak+"일",c:s.streak>=3?B:G600}].map(item=>(
              <div key={item.l} style={{background:G50,borderRadius:10,padding:"9px 10px"}}>
                <p style={{fontSize:12,color:G400,margin:"0 0 2px"}}>{item.l}</p>
                <p style={{fontSize:15,fontWeight:700,color:item.c,margin:0}}>{item.v}</p>
              </div>
            ))}
          </div>
          <div style={{background:G100,borderRadius:4,height:5,overflow:"hidden",marginBottom:8}}>
            <div style={{height:"100%",width:((s.day/s.maxDays)*100)+"%",background:cfg.color,borderRadius:4,transition:"width 0.5s"}} />
          </div>
          {s.efx.length>0 && (
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {s.efx.slice(0,4).map((e,i)=>(
                <span key={i} style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:e.value>0?GNL:RDL,color:e.value>0?GN:RD}}>
                  {e.value>0?"▲":"▼"} {e.label} {e.duration>0?e.duration+"일":"∞"}
                </span>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{saveGame(s);alert("저장됐어요 💾");}} style={{fontSize:13,color:G400,background:"none",border:"1px solid "+G200,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>💾 저장</button>
            <button onClick={()=>{if(confirm("종료할까요?"))onOver();}} style={{fontSize:13,color:G400,background:"none",border:"1px solid "+G200,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>🚪 나가기</button>
          </div>
        </div>

        {/* 매장 씬 */}
        <div style={{position:"relative",borderRadius:20,overflow:"hidden",height:185,background:s.wx==="sunny"?"#FFF9E6":s.wx==="rainy"?"#EFF6FF":s.wx==="snow"?"#F0F9FF":s.wx==="hot"?"#FFF7ED":"#F8FAFC",border:"1px solid "+cfg.color+"33"}}>
          {s.wx==="rainy"&&[0,1,2,3,4,5].map(i=><div key={i} style={{position:"absolute",top:0,left:(8+i*15)+"%",width:1.5,height:12,background:"#93C5FD",animation:"rain "+(0.7+i*0.08)+"s linear infinite",animationDelay:(i*0.12)+"s"}} />)}
          {s.wx==="snow"&&[0,1,2,3,4].map(i=><div key={i} style={{position:"absolute",top:0,left:(5+i*18)+"%",fontSize:12,animation:"snow "+(1.8+i*0.2)+"s linear infinite",animationDelay:(i*0.3)+"s"}}>❄️</div>)}
          {s.wx==="sunny"&&<div style={{position:"absolute",top:10,right:14,fontSize:26,opacity:0.6}}>☀️</div>}
          <div style={{position:"absolute",top:10,left:0,right:0,textAlign:"center"}}>
            <span style={{background:cfg.color,color:"#fff",borderRadius:20,padding:"4px 16px",fontSize:14,fontWeight:800}}>{s.name}</span>
          </div>
          <div style={{position:"absolute",bottom:40,left:14,display:"flex",gap:7,alignItems:"flex-end"}}>
            <div style={{fontSize:30}}>{cfg.icon}</div>
            {s.staff.filter(x=>!x.absent).map((st,i)=>(
              <div key={st.id} style={{textAlign:"center"}}>
                <div style={{fontSize:24,animation:"bob "+(1+i*0.3)+"s ease-in-out infinite",animationDelay:(i*0.2)+"s"}}>{st.emoji}</div>
                <div style={{fontSize:9,color:cfg.color,fontWeight:700,background:cfg.color+"20",borderRadius:4,padding:"1px 4px"}}>{st.name}</div>
              </div>
            ))}
          </div>
          <div style={{position:"absolute",bottom:40,right:14,display:"flex",gap:5,alignItems:"flex-end"}}>
            {[...Array(Math.min(showCust,5))].map((_,i)=>(
              <div key={i} style={{textAlign:"center",animation:"bob "+(1.2+i*0.2)+"s ease-in-out infinite",animationDelay:(i*0.15)+"s"}}>
                <div style={{fontSize:18}}>{cfg.emojis[i%cfg.emojis.length]}</div>
                <div style={{fontSize:12}}>🪑</div>
              </div>
            ))}
            {showCust>5&&<div style={{fontSize:12,color:cfg.color,fontWeight:700,alignSelf:"center"}}>+{showCust-5}</div>}
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:36,background:cfg.color+"18",borderTop:"1px solid "+cfg.color+"33",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px"}}>
            <span style={{fontSize:14,color:cfg.color,fontWeight:700}}>{WX[s.wx].icon} {WX[s.wx].label}</span>
            <span style={{fontSize:13,color:G600}}>손님 {s.cust}명</span>
            <span style={{fontSize:14,color:s.todayProfit>=0?GN:RD,fontWeight:700}}>{s.todayProfit>=0?"+":""}{fmt(s.todayProfit)}</span>
          </div>
          {floats.map(f=><div key={f.id} style={{position:"absolute",top:"22%",left:f.x+"%",fontSize:15,fontWeight:800,color:f.color,pointerEvents:"none",animation:"fup 1.6s ease-out forwards",whiteSpace:"nowrap",zIndex:10}}>{f.text}</div>)}
        </div>

        {/* 아침 */}
        {s.phase==="morning" && (
          <div style={{background:"#fff",border:"1px solid "+G200,borderRadius:20,padding:18,animation:"pin 0.3s ease-out"}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:36,background:G50,borderRadius:50,width:54,height:54,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>🌅</div>
              <div>
                <p style={{fontSize:17,fontWeight:800,color:G900,margin:0}}>좋은 아침이에요!</p>
                <p style={{fontSize:14,color:G600,margin:"3px 0 0"}}>{WX[s.wx].icon} {WX[s.wx].label} — 손님 {WX[s.wx].mod>=1?"많을":"적을"} 것 같아요</p>
              </div>
            </div>
            {s.staff.some(x=>x.absent) && (
              <div style={{background:RDL,border:"1px solid #FECACA",borderRadius:12,padding:"9px 13px",marginBottom:10}}>
                <p style={{fontSize:14,color:RD,margin:0,fontWeight:600}}>😷 {s.staff.filter(x=>x.absent).map(x=>x.name).join(", ")} 결근!</p>
              </div>
            )}
            {s.day%30===0 && (
              <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:12,padding:"9px 13px",marginBottom:10}}>
                <p style={{fontSize:14,color:"#92400E",margin:0,fontWeight:600}}>📅 월세 납부일! -{fmt(s.rent+s.util)}</p>
              </div>
            )}
            {s.streak>=3 && (
              <div style={{background:BL,border:"1px solid #BFDBFE",borderRadius:12,padding:"9px 13px",marginBottom:10}}>
                <p style={{fontSize:14,color:"#1B64DA",margin:0,fontWeight:600}}>🔥 {s.streak}일 연속 흑자 중!</p>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(s.staff.length,3)+",1fr)",gap:7,marginBottom:14}}>
              {s.staff.map(st=>(
                <div key={st.id} style={{background:G50,borderRadius:14,padding:"9px 7px",textAlign:"center",opacity:st.absent?0.3:1,border:"1px solid "+G200}}>
                  <div style={{fontSize:28,marginBottom:4}}>{st.emoji}</div>
                  <p style={{fontSize:14,color:G900,margin:"0 0 1px",fontWeight:600}}>{st.name}</p>
                  <p style={{fontSize:12,color:G400,margin:"0 0 5px"}}>{st.role}</p>
                  <div style={{background:G200,borderRadius:3,height:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:st.mood+"%",background:st.mood>=70?GN:st.mood>=40?"#F59E0B":RD,borderRadius:3}} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={openDay} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:cfg.color,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              🚪 영업 시작! {isWk?"🎉 주말 특수!":""}
            </button>
          </div>
        )}

        {/* 이벤트 */}
        {s.phase==="event" && s.ev && (
          <div style={{background:ec.bg,border:"1px solid "+ec.bd,borderRadius:20,padding:18,animation:"pin 0.3s ease-out"}}>
            <div style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
              <div style={{flexShrink:0,textAlign:"center"}}>
                <div style={{fontSize:40,background:"#fff",borderRadius:50,width:62,height:62,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid "+ec.bd}}>{s.ev.char}</div>
                <p style={{fontSize:11,color:ec.tx,margin:"4px 0 0",fontWeight:700}}>{s.ev.charName}</p>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                  <span style={{background:ec.lb,color:ec.tx,fontSize:12,fontWeight:700,padding:"2px 9px",borderRadius:6}}>{ec.lbl}</span>
                  <span style={{fontSize:15}}>{s.ev.icon}</span>
                </div>
                <p style={{fontSize:17,fontWeight:800,color:G900,margin:"0 0 7px"}}>{s.ev.title}</p>
                <div style={{background:"#fff",borderRadius:"0 14px 14px 14px",padding:"11px 13px",border:"1px solid "+ec.bd}}>
                  <p style={{fontSize:14,color:G800,lineHeight:1.6,margin:0}}>{s.ev.desc}</p>
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {s.ev.choices.map((c,i)=>(
                <button key={i} onClick={()=>choose(i)} disabled={!!(c.cost&&s.cash<c.cost)}
                  style={{padding:"12px 15px",borderRadius:12,border:"1px solid "+ec.bd,background:"#fff",cursor:c.cost&&s.cash<c.cost?"not-allowed":"pointer",textAlign:"left",opacity:c.cost&&s.cash<c.cost?0.4:1,fontFamily:"inherit"}}>
                  <p style={{fontSize:15,fontWeight:700,color:G900,margin:"0 0 3px"}}>{c.label}</p>
                  <p style={{fontSize:13,color:G600,margin:0}}>{c.desc}{c.cost?" · 💸 "+fmtN(c.cost)+"원":""}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 결과 */}
        {s.phase==="result" && (
          <div style={{background:"#fff",border:"1px solid "+(s.todayProfit>=0?"#A7F3D0":"#FECACA"),borderRadius:20,padding:18,animation:"pin 0.3s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:44,marginBottom:7}}>{s.todayProfit>1000000?"🤑":s.todayProfit>0?"😊":s.todayProfit>-500000?"😬":"😭"}</div>
              <p style={{fontSize:15,color:s.todayProfit>=0?GN:RD,fontWeight:700,margin:"0 0 5px"}}>{s.day}일차 마감</p>
              <p style={{fontSize:30,fontWeight:800,color:s.todayProfit>=0?GN:RD,margin:0}}>{s.todayProfit>=0?"+ ":"- "}{fmtN(Math.abs(s.todayProfit))}원</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[{l:"👥 방문 고객",v:s.cust+"명",c:B},{l:"💵 매출",v:fmtN(s.rev)+"원",c:GN},{l:"💸 비용",v:fmtN(s.cost)+"원",c:RD},{l:"🏦 잔고",v:fmtN(s.cash)+"원",c:s.cash>=0?G900:RD}].map(item=>(
                <div key={item.l} style={{background:G50,borderRadius:12,padding:"10px 12px"}}>
                  <p style={{fontSize:13,color:G400,margin:"0 0 3px"}}>{item.l}</p>
                  <p style={{fontSize:16,fontWeight:700,color:item.c,margin:0}}>{item.v}</p>
                </div>
              ))}
            </div>
            <div style={{background:G50,borderRadius:12,padding:"9px 12px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,color:G600,fontWeight:600}}>EXP +{s.todayProfit>500000?30:s.todayProfit>0?15:5}</span>
                <span style={{fontSize:13,color:cfg.color,fontWeight:700}}>LV.{getLv(s.exp)}</span>
              </div>
              <div style={{background:G200,borderRadius:3,height:5,overflow:"hidden"}}>
                <div style={{height:"100%",width:((s.exp%200)/2)+"%",background:cfg.color,borderRadius:3,transition:"width 0.5s"}} />
              </div>
            </div>
            <button onClick={nextDay} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:cfg.color,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {s.day>=s.maxDays?"🏆 최종 결산 보기":(s.day+1)+"일차로 →"}
            </button>
          </div>
        )}

        {/* 로그 */}
        {s.logs.length>0 && s.phase==="morning" && (
          <div style={{background:"#fff",border:"1px solid "+G200,borderRadius:16,padding:"12px 15px"}}>
            <p style={{fontSize:14,color:G400,margin:"0 0 8px",fontWeight:600}}>📋 최근 기록</p>
            {s.logs.slice(-4).reverse().map(l=>(
              <div key={l.day} style={{display:"flex",justifyContent:"space-between",fontSize:14,padding:"5px 0",borderTop:"1px solid "+G100}}>
                <span style={{color:G400}}>{l.day}일 {WX[l.wx].icon}</span>
                <span style={{color:G600,flex:1,margin:"0 10px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.event??"평범한 하루"}</span>
                <span style={{color:l.profit>=0?GN:RD,fontWeight:700}}>{l.profit>=0?"+":"-"}{fmt(Math.abs(l.profit))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
