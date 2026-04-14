export type Industry = "cafe" | "restaurant" | "bar" | "finedining" | "gogi";
export type Weather  = "sunny" | "rainy" | "cloudy" | "hot" | "snow";
export type Phase    = "menu" | "setup" | "playing" | "gameover";
export type Day      = "morning" | "event" | "result";
export type GameMode = "free" | "target" | "survive" | "growth";

export interface Staff   { id:string; name:string; role:string; emoji:string; wage:number; mood:number; skill:number; absent:boolean }
export interface Eff     { type:string; value:number; duration:number; label:string }
export interface Log     { day:number; wx:Weather; customers:number; revenue:number; profit:number; event?:string }
export interface Float   { id:number; text:string; x:number; color:string }
export interface Ev {
  id:string; title:string; desc:string; icon:string; char:string; charName:string;
  type:"crisis"|"opportunity"|"random";
  choices:{ label:string; desc:string; cost?:number; apply:(s:S)=>Partial<S>&{efx?:Eff[]} }[];
}
export interface S {
  day:number; maxDays:number; cash:number; rep:number; phase:Day;
  ind:Industry; name:string; base:number; spend:number; cogs:number; rent:number; util:number;
  staff:Staff[]; ev:Ev|null; efx:Eff[];
  totalRev:number; totalProfit:number; logs:Log[];
  wx:Weather; cust:number; rev:number; cost:number; todayProfit:number;
  flags:Record<string, boolean|number>; exp:number; streak:number; best:number;
  savedAt?:string;
  mode:GameMode; monthlyProfit:number; negStreak:number;
  targetRevenue?:number; targetProfit?:number; growthTarget?:number; firstMonthRev?:number;
}
