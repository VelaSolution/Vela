import type { Weather, S } from "../types";
import { WX, B, GN, RD } from "../constants";
import { STORAGE_KEYS, getStorageItem, setStorageItem, removeStorageItem } from "@/lib/storage";

export const fmt = (n: number) => {
  const a = Math.abs(n);
  const v = a>=100000000?((a/100000000).toFixed(1)+"억") : a>=10000?(Math.round(a/10000)+"만") : Math.round(a).toLocaleString("ko-KR");
  return (n<0?"-":"") + v + "원";
};
export const fmtN = (n: number) => Math.round(n).toLocaleString("ko-KR");
export const getLv = (exp: number) => Math.floor(exp/200)+1;

export function getWx(day: number): Weather {
  const r = Math.random();
  const s = Math.floor(((day-1)%90)/22);
  if (s===1) { if(r<0.3) return "hot"; if(r<0.55) return "rainy"; return "sunny"; }
  if (s===3) { if(r<0.25) return "snow"; if(r<0.5) return "cloudy"; return "rainy"; }
  if(r<0.4) return "sunny"; if(r<0.65) return "cloudy"; return "rainy";
}

export function calcDay(s: S) {
  const wm = WX[s.wx].mod;
  const rm = 0.6+(s.rep/100)*0.8;
  const sk = s.staff.filter(x=>!x.absent).reduce((a,x)=>a+x.skill,0)/Math.max(s.staff.filter(x=>!x.absent).length,1);
  const stm = 0.65+(sk/100)*0.7;
  const wk = ((s.day-1)%7)>=5 ? 1.4 : 1.0;
  let cm=wm*rm*stm*wk, spm=1.0, cgm=0;
  for (const e of s.efx) {
    if(e.type==="customers") cm*=(1+e.value);
    if(e.type==="avgSpend") spm*=(1+e.value);
    if(e.type==="cogsRate") cgm+=e.value;
  }
  const cust = Math.max(0, Math.round(s.base*cm*(0.8+Math.random()*0.4)));
  const spend = s.spend*spm*(0.9+Math.random()*0.2);
  const rev = cust*spend;
  const cogs = rev*(Math.min(s.cogs+cgm,95)/100);
  const labor = s.staff.filter(x=>!x.absent).reduce((a,x)=>a+x.wage,0);
  const fixed = s.day%30===0 ? (s.rent+s.util) : 0;
  const cost = cogs+rev*0.015+labor+fixed;
  return {cust:Math.round(cust), rev:Math.round(rev), cost:Math.round(cost), profit:Math.round(rev-cost)};
}

export function saveGame(state: S) {
  setStorageItem(STORAGE_KEYS.GAME, {...state, savedAt:new Date().toISOString()});
}
export function loadGame(): S|null {
  return getStorageItem<S>(STORAGE_KEYS.GAME);
}
export function delSave() {
  removeStorageItem(STORAGE_KEYS.GAME);
}

export function calcScore(s: S) {
  return Math.max(0,Math.floor(s.totalProfit/10000))
    + Math.floor(s.rep*5)
    + s.streak*100
    + (getLv(s.exp)-1)*200
    + (s.day>=90?5000:Math.floor(s.day*30));
}
export function gradeOf(sc: number) {
  if(sc>=50000) return {g:"S",c:"#F59E0B",e:"🏆"};
  if(sc>=25000) return {g:"A",c:GN,e:"🥇"};
  if(sc>=10000) return {g:"B",c:B,e:"🥈"};
  if(sc>=3000)  return {g:"C",c:"#8B5CF6",e:"🥉"};
  return {g:"D",c:RD,e:"💸"};
}
