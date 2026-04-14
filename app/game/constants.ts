import type { Industry, Weather, Staff, Ev, S } from "./types";

// Colors
export const B="#3182F6", BL="#EBF3FF";
export const G50="#F9FAFB", G100="#F2F4F6", G200="#E5E8EB", G400="#9EA6B3", G600="#6B7684", G800="#333D4B", G900="#191F28";
export const GN="#10b981", GNL="#ECFDF5";
export const RD="#EF4444", RDL="#FEF2F2";

export const IND: Record<Industry, {
  label:string; icon:string; color:string; desc:string;
  base:number; spend:number; cogs:number; rent:number; util:number;
  emojis:string[]; staff:Staff[];
}> = {
  cafe: {
    label:"카페", icon:"☕", color:B, desc:"회전율 높고 안정적인 매출",
    base:80, spend:7000, cogs:28, rent:1500000, util:400000,
    emojis:["👩‍💻","👨‍🎓","👩","👨","🧕","🧔"],
    staff:[
      {id:"s1",name:"김바리",role:"바리스타",emoji:"👩‍🍳",wage:80000,mood:75,skill:70,absent:false},
      {id:"s2",name:"이루미",role:"서버",emoji:"🧑‍🦰",wage:65000,mood:80,skill:60,absent:false},
    ],
  },
  restaurant: {
    label:"음식점", icon:"🍽️", color:"#EF4444", desc:"점심·저녁 피크타임 운영",
    base:60, spend:22000, cogs:33, rent:3000000, util:800000,
    emojis:["👨‍👩‍👧","👫","👨","👩","🧑","👴"],
    staff:[
      {id:"s1",name:"박셰프",role:"주방장",emoji:"👨‍🍳",wage:150000,mood:70,skill:85,absent:false},
      {id:"s2",name:"최서버",role:"홀서버",emoji:"🧑‍🦱",wage:70000,mood:75,skill:65,absent:false},
      {id:"s3",name:"강알바",role:"알바",emoji:"🧒",wage:55000,mood:65,skill:40,absent:false},
    ],
  },
  bar: {
    label:"술집/바", icon:"🍺", color:"#F59E0B", desc:"주말·야간 특수, 높은 마진",
    base:45, spend:35000, cogs:22, rent:2500000, util:600000,
    emojis:["🧔","👱","🧑‍🦲","👩‍🦱","🧑‍🤝‍🧑","🥳"],
    staff:[
      {id:"s1",name:"윤텐더",role:"바텐더",emoji:"🧑‍🍳",wage:100000,mood:80,skill:80,absent:false},
      {id:"s2",name:"정서버",role:"서버",emoji:"👩‍🦰",wage:70000,mood:70,skill:60,absent:false},
    ],
  },
  finedining: {
    label:"파인다이닝", icon:"✨", color:"#6366F1", desc:"고객 수 적지만 최고 단가",
    base:20, spend:90000, cogs:34, rent:5000000, util:1200000,
    emojis:["🤵","👗","🧣","💼","👔","💍"],
    staff:[
      {id:"s1",name:"오헤드",role:"헤드셰프",emoji:"👨‍🍳",wage:250000,mood:75,skill:95,absent:false},
      {id:"s2",name:"류소믈",role:"소믈리에",emoji:"🥂",wage:120000,mood:80,skill:85,absent:false},
    ],
  },
  gogi: {
    label:"고깃집", icon:"🥩", color:"#DC2626", desc:"테이블 단가 높고 주류 매출 큼",
    base:50, spend:45000, cogs:38, rent:3500000, util:900000,
    emojis:["👨‍👩‍👧‍👦","👫","👴","👵","🧑‍🤝‍🧑","👨‍👦"],
    staff:[
      {id:"s1",name:"김그릴",role:"주방장",emoji:"👨‍🍳",wage:160000,mood:72,skill:80,absent:false},
      {id:"s2",name:"박서버",role:"홀서버",emoji:"🧑‍🦱",wage:75000,mood:70,skill:65,absent:false},
    ],
  },
};

export const WX: Record<Weather, {icon:string; label:string; mod:number}> = {
  sunny:{icon:"☀️",label:"맑음",mod:1.1},
  cloudy:{icon:"🌥️",label:"흐림",mod:1.0},
  rainy:{icon:"🌧️",label:"비",mod:0.75},
  hot:{icon:"🥵",label:"폭염",mod:0.85},
  snow:{icon:"❄️",label:"눈",mod:0.65},
};

export const EVENTS: Ev[] = [
  // ── 기회 이벤트 ──────────────────────────────────────────
  {id:"influencer",type:"opportunity",icon:"📱",char:"🤳",charName:"인플루언서",
   title:"인플루언서 방문!",desc:"팔로워 10만 맛집 계정이 방문했어요! 포스팅을 부탁해볼까요?",
   choices:[
     {label:"서비스+포스팅 요청",desc:"비용 10만원, 손님 +30% 14일",cost:100000,apply:s=>({rep:Math.min(s.rep+15,100),efx:[{type:"customers",value:0.3,duration:14,label:"인플루언서 효과"}]})},
     {label:"일반 손님처럼 대응",desc:"자연스러운 리뷰 기대",apply:s=>({rep:Math.min(s.rep+8,100),efx:[{type:"customers",value:0.15,duration:7,label:"자연 홍보"}]})},
   ]},
  {id:"group",type:"opportunity",icon:"👥",char:"🤵",charName:"예약 담당자",
   title:"단체 예약 요청!",desc:"회사 회식으로 30명 예약 문의가 왔어요!",
   choices:[
     {label:"전석 수락",desc:"오늘 손님 +50%",apply:(_s:S)=>({efx:[{type:"customers",value:0.5,duration:1,label:"단체 예약"}]})},
     {label:"절반 수락",desc:"오늘 손님 +25%",apply:(_s:S)=>({efx:[{type:"customers",value:0.25,duration:1,label:"단체 부분"}]})},
     {label:"거절",desc:"변화 없음",apply:(_s:S)=>({})},
   ]},
  {id:"tv",type:"opportunity",icon:"📺",char:"🎬",charName:"TV 작가",
   title:"TV 맛집 섭외!",desc:"지역 TV 맛집 프로그램에서 출연 제의가 왔어요!",
   choices:[
     {label:"출연 수락!",desc:"평판 +20, 손님 +50% 한달",apply:s=>({rep:Math.min(s.rep+20,100),efx:[{type:"customers",value:0.5,duration:30,label:"TV 방영 효과"}]})},
     {label:"거절",desc:"변화 없음",apply:(_s:S)=>({})},
   ]},
  {id:"festival",type:"opportunity",icon:"🎪",char:"🎉",charName:"축제 안내원",
   title:"근처 지역 축제!",desc:"매장 근처에서 축제가 열려요. 유동인구 폭발!",
   choices:[
     {label:"야외 테이블 설치",desc:"비용 20만원, 손님 +50% 3일",cost:200000,apply:(_s:S)=>({efx:[{type:"customers",value:0.5,duration:3,label:"축제 특수"}]})},
     {label:"가격 소폭 인상",desc:"객단가 +10%, 손님 +20%",apply:s=>({spend:Math.round(s.spend*1.1),efx:[{type:"customers",value:0.2,duration:3,label:"축제 유동인구"}]})},
   ]},
  {id:"vip",type:"opportunity",icon:"👑",char:"🤵",charName:"VIP 고객",
   title:"단골 VIP 등장!",desc:"매달 100만원 이상 쓰는 VIP 고객이 나타났어요.",
   choices:[
     {label:"VIP 카드 발급",desc:"평판 +8, 안정 매출",apply:s=>({rep:Math.min(s.rep+8,100),efx:[{type:"customers",value:0.05,duration:90,label:"VIP 단골"}]})},
     {label:"특별 서비스 제공",desc:"평판 +5",apply:s=>({rep:Math.min(s.rep+5,100)})},
   ]},
  {id:"delivery_boom",type:"opportunity",icon:"🛵",char:"📦",charName:"배달 플랫폼",
   title:"배달 주문 폭발!",desc:"주변 경쟁업체가 문을 닫아 배달 주문이 몰려들고 있어요!",
   choices:[
     {label:"배달 인력 추가",desc:"비용 5만원, 손님 +40% 7일",cost:50000,apply:(_s:S)=>({efx:[{type:"customers",value:0.4,duration:7,label:"배달 특수"}]})},
     {label:"현재 인력으로",desc:"손님 +20% 7일",apply:(_s:S)=>({efx:[{type:"customers",value:0.2,duration:7,label:"배달 증가"}]})},
   ]},
  {id:"sns_viral",type:"opportunity",icon:"🔥",char:"😲",charName:"SNS 유저",
   title:"SNS 바이럴!",desc:"메뉴 사진이 SNS에서 엄청난 반응을 얻고 있어요!",
   choices:[
     {label:"메뉴 집중 홍보",desc:"비용 5만원, 손님 +35% 10일",cost:50000,apply:s=>({rep:Math.min(s.rep+10,100),efx:[{type:"customers",value:0.35,duration:10,label:"SNS 바이럴"}]})},
     {label:"자연스럽게 두기",desc:"손님 +20% 7일",apply:(_s:S)=>({efx:[{type:"customers",value:0.2,duration:7,label:"SNS 효과"}]})},
   ]},
  {id:"celeb_visit",type:"opportunity",icon:"⭐",char:"🕶️",charName:"연예인",
   title:"연예인이 왔다!",desc:"팔로워 100만 연예인이 방문해 스토리에 올렸어요!",
   choices:[
     {label:"사진 촬영 협조",desc:"평판 +25, 손님 +60% 3주",apply:s=>({rep:Math.min(s.rep+25,100),efx:[{type:"customers",value:0.6,duration:21,label:"연예인 방문 효과"}]})},
     {label:"조용히 대접",desc:"평판 +15, 손님 +30% 2주",apply:s=>({rep:Math.min(s.rep+15,100),efx:[{type:"customers",value:0.3,duration:14,label:"입소문"}]})},
   ]},
  {id:"supplier_discount",type:"opportunity",icon:"📦",char:"🚚",charName:"공급업체",
   title:"재료 대량 할인 제안!",desc:"공급업체에서 선결제 시 10% 할인을 제안합니다.",
   choices:[
     {label:"선결제 계약",desc:"비용 200만원, 원가율 -3%p 3달",cost:2000000,apply:s=>({cogs:Math.max(s.cogs-3,10)})},
     {label:"거절",desc:"변화 없음",apply:(_s:S)=>({})},
   ]},
  {id:"menu_hit",type:"opportunity",icon:"🍜",char:"😋",charName:"손님",
   title:"신메뉴 대박!",desc:"최근 출시한 메뉴가 입소문을 타고 있어요!",
   choices:[
     {label:"메뉴 적극 홍보",desc:"비용 3만원, 손님 +25% 2주",cost:30000,apply:(_s:S)=>({efx:[{type:"customers",value:0.25,duration:14,label:"신메뉴 인기"}]})},
     {label:"자연스럽게 두기",desc:"손님 +15% 1주",apply:(_s:S)=>({efx:[{type:"customers",value:0.15,duration:7,label:"메뉴 입소문"}]})},
   ]},
  {id:"holiday_special",type:"opportunity",icon:"🎊",char:"🎁",charName:"연휴 손님",
   title:"연휴 특수!",desc:"명절 연휴가 시작됩니다. 외식 수요가 폭발할 예정이에요!",
   choices:[
     {label:"특별 메뉴 준비",desc:"비용 10만원, 손님 +50% 5일",cost:100000,apply:(_s:S)=>({efx:[{type:"customers",value:0.5,duration:5,label:"연휴 특수"}]})},
     {label:"평소처럼 운영",desc:"손님 +30% 5일",apply:(_s:S)=>({efx:[{type:"customers",value:0.3,duration:5,label:"연휴 자연 증가"}]})},
   ]},
  // ── 위기 이벤트 ──────────────────────────────────────────
  {id:"food_poison",type:"crisis",icon:"🤢",char:"😱",charName:"단골손님",
   title:"식중독 신고!",desc:"단골손님이 식중독 증세를 호소하며 SNS에 올렸습니다.",
   choices:[
     {label:"즉각 사과+보상",desc:"비용 50만원, 평판 -10",cost:500000,apply:s=>({rep:Math.max(s.rep-10,0),efx:[{type:"customers",value:-0.1,duration:3,label:"식중독 여파"}]})},
     {label:"조용히 합의",desc:"비용 150만원, 평판 유지",cost:1500000,apply:(_s:S)=>({})},
     {label:"사실 부인",desc:"평판 -35 폭락",apply:s=>({rep:Math.max(s.rep-35,0),efx:[{type:"customers",value:-0.35,duration:10,label:"신뢰 추락"}]})},
   ]},
  {id:"health",type:"crisis",icon:"🧹",char:"👮",charName:"보건소 직원",
   title:"위생 점검 나왔다!",desc:"보건소 직원이 갑자기 위생 점검을 나왔어요!",
   choices:[
     {label:"당당하게 통과",desc:"청결하면 OK, 아니면 벌금",apply:s=>s.flags.clean?{rep:Math.min(s.rep+5,100)}:{cash:s.cash-300000,rep:Math.max(s.rep-15,0)}},
     {label:"사전 청소 (반나절)",desc:"통과 100%, 매출 -40%",apply:(_s:S)=>({flags:{clean:true},efx:[{type:"customers",value:-0.4,duration:1,label:"청소 반나절"}]})},
   ]},
  {id:"blackout",type:"crisis",icon:"🔌",char:"😰",charName:"사장님",
   title:"정전 발생!",desc:"갑작스런 정전으로 모든 기기가 멈췄어요!",
   choices:[
     {label:"발전기 대여 (30만원)",desc:"정상 영업",cost:300000,apply:(_s:S)=>({})},
     {label:"임시 휴업",desc:"매출 0원",apply:(_s:S)=>({efx:[{type:"customers",value:-1.0,duration:1,label:"임시 휴업"}]})},
   ]},
  {id:"review",type:"crisis",icon:"⭐",char:"😤",charName:"악성 리뷰어",
   title:"악성 리뷰 등록!",desc:"1점짜리 악성 리뷰가 달렸어요!",
   choices:[
     {label:"정중한 답변",desc:"평판 -5",apply:s=>({rep:Math.max(s.rep-5,0)})},
     {label:"사과+보상",desc:"비용 10만원, 평판 +3",cost:100000,apply:s=>({rep:Math.min(s.rep+3,100)})},
     {label:"무시",desc:"평판 -15, 손님 감소",apply:s=>({rep:Math.max(s.rep-15,0),efx:[{type:"customers",value:-0.1,duration:5,label:"악성 리뷰 여파"}]})},
   ]},
  {id:"rent",type:"crisis",icon:"🏠",char:"😤",charName:"건물주",
   title:"임대료 인상 통보!",desc:"건물주에게서 임대료 20% 인상 통보가 왔어요!",
   choices:[
     {label:"협상 시도",desc:"50% 확률로 10%만 인상",apply:s=>({rent:s.rent*(Math.random()>0.5?1.1:1.2)})},
     {label:"그냥 수용",desc:"임대료 +20%",apply:s=>({rent:s.rent*1.2})},
     {label:"이전 준비",desc:"비용 200만원, 이후 임대료 -15%",cost:2000000,apply:s=>({rent:s.rent*0.85})},
   ]},
  {id:"staff_quit",type:"crisis",icon:"😢",char:"😭",charName:"직원",
   title:"직원이 그만두겠대요!",desc:"핵심 직원이 갑자기 그만두겠다고 합니다.",
   choices:[
     {label:"연봉 인상으로 붙잡기",desc:"일당 +20%, 직원 유지",apply:s=>({staff:s.staff.map((st,i)=>i===0?{...st,wage:Math.round(st.wage*1.2),mood:90}:st)})},
     {label:"새로 채용",desc:"2일간 서비스 저하",apply:(_s:S)=>({efx:[{type:"customers",value:-0.15,duration:2,label:"인수인계"}]})},
     {label:"사정해서 달램",desc:"성공 50%",apply:s=>Math.random()>0.5?{staff:s.staff.map((st,i)=>i===0?{...st,mood:85}:st)}:{efx:[{type:"customers",value:-0.15,duration:3,label:"직원 공백"}]}},
   ]},
  {id:"ingredient_up",type:"crisis",icon:"📈",char:"😱",charName:"공급업체",
   title:"재료값 폭등!",desc:"기상이변으로 식재료 가격이 급등했습니다.",
   choices:[
     {label:"다른 공급처 수배",desc:"비용 20만원, 원가율 +2%p",cost:200000,apply:s=>({cogs:Math.min(s.cogs+2,70)})},
     {label:"현재 유지",desc:"원가율 +6%p",apply:s=>({cogs:Math.min(s.cogs+6,70)})},
     {label:"메뉴 가격 인상",desc:"객단가 +8%, 손님 -10%",apply:s=>({spend:Math.round(s.spend*1.08),efx:[{type:"customers",value:-0.1,duration:7,label:"가격인상 여파"}]})},
   ]},
  {id:"competitor",type:"crisis",icon:"🏪",char:"😠",charName:"경쟁자",
   title:"경쟁업체 오픈!",desc:"바로 옆에 비슷한 콘셉트 가게가 생겼어요!",
   choices:[
     {label:"차별화 메뉴 개발",desc:"원가율 +2%p, 손님 +5%",apply:s=>({cogs:Math.min(s.cogs+2,70),efx:[{type:"customers",value:0.05,duration:30,label:"차별화 효과"}]})},
     {label:"가격 인하 경쟁",desc:"객단가 -8%",apply:s=>({spend:Math.round(s.spend*0.92)})},
     {label:"서비스 강화",desc:"손님 -5% 2주 후 회복",apply:(_s:S)=>({efx:[{type:"customers",value:-0.05,duration:14,label:"경쟁 초기"}]})},
   ]},
  {id:"fire_alarm",type:"crisis",icon:"🚒",char:"👨‍🚒",charName:"소방관",
   title:"화재 경보 오작동!",desc:"주방 화재 경보기가 오작동해 손님들이 대피했어요.",
   choices:[
     {label:"즉시 상황 설명+보상",desc:"비용 5만원, 평판 유지",cost:50000,apply:s=>({rep:Math.max(s.rep-5,0),efx:[{type:"customers",value:-0.3,duration:1,label:"화재 경보 여파"}]})},
     {label:"그냥 재개",desc:"평판 -10",apply:s=>({rep:Math.max(s.rep-10,0),efx:[{type:"customers",value:-0.5,duration:1,label:"화재 소동"}]})},
   ]},
  {id:"water_leak",type:"crisis",icon:"💧",char:"🔧",charName:"배관공",
   title:"수도관 누수!",desc:"천장에서 물이 새기 시작했어요!",
   choices:[
     {label:"즉시 수리 (40만원)",desc:"정상 영업 유지",cost:400000,apply:(_s:S)=>({})},
     {label:"임시 조치 후 영업",desc:"손님 -20%",apply:(_s:S)=>({efx:[{type:"customers",value:-0.2,duration:1,label:"누수 임시조치"}]})},
   ]},
  {id:"pos_broken",type:"crisis",icon:"💳",char:"😰",charName:"사장님",
   title:"POS 시스템 고장!",desc:"결제 단말기가 갑자기 먹통이에요!",
   choices:[
     {label:"즉시 수리 (15만원)",desc:"정상 영업",cost:150000,apply:(_s:S)=>({})},
     {label:"현금만 받기",desc:"손님 -30%",apply:(_s:S)=>({efx:[{type:"customers",value:-0.3,duration:1,label:"현금 영업"}]})},
   ]},
  {id:"bad_weather_streak",type:"crisis",icon:"⛈️",char:"🌩️",charName:"기상청",
   title:"악천후 일주일!",desc:"태풍 예보로 이번 주 내내 비바람이 몰아칩니다.",
   choices:[
     {label:"배달 프로모션 강화",desc:"비용 5만원, 피해 최소화",cost:50000,apply:(_s:S)=>({efx:[{type:"customers",value:-0.2,duration:7,label:"악천후"}]})},
     {label:"그냥 버팀",desc:"손님 -35% 7일",apply:(_s:S)=>({efx:[{type:"customers",value:-0.35,duration:7,label:"악천후 직격"}]})},
   ]},
  {id:"staff_conflict",type:"crisis",icon:"😤",char:"😡",charName:"직원들",
   title:"직원 간 갈등 발생!",desc:"홀 직원과 주방 직원 사이에 심한 말다툼이 있었어요.",
   choices:[
     {label:"면담으로 중재",desc:"직원 사기 +15",apply:s=>({staff:s.staff.map(st=>({...st,mood:Math.min(st.mood+15,100)}))})},
     {label:"문제 직원 경고",desc:"직원 사기 -10",apply:s=>({staff:s.staff.map(st=>({...st,mood:Math.max(st.mood-10,0)}))})},
     {label:"모른 척",desc:"손님 -10% 5일",apply:(_s:S)=>({efx:[{type:"customers",value:-0.1,duration:5,label:"직원 갈등"}]})},
   ]},
  {id:"delivery_fee_up",type:"crisis",icon:"🛵",char:"📱",charName:"배달앱",
   title:"배달앱 수수료 인상!",desc:"배달앱에서 수수료를 3%p 올리겠다고 통보했어요.",
   choices:[
     {label:"수수료 수용",desc:"원가율 +2%p",apply:s=>({cogs:Math.min(s.cogs+2,70)})},
     {label:"배달 중단",desc:"손님 -10% 지속",apply:(_s:S)=>({efx:[{type:"customers",value:-0.1,duration:30,label:"배달 중단"}]})},
     {label:"자체 배달 시작",desc:"비용 50만원, 손님 +5%",cost:500000,apply:(_s:S)=>({efx:[{type:"customers",value:0.05,duration:90,label:"자체 배달"}]})},
   ]},
  // ── 랜덤 이벤트 ──────────────────────────────────────────
  {id:"staff_birthday",type:"random",icon:"🎂",char:"🥳",charName:"직원",
   title:"직원 생일!",desc:"오늘은 직원 생일이에요. 작은 파티를 열어줄까요?",
   choices:[
     {label:"파티 열어주기",desc:"비용 3만원, 사기 +30",cost:30000,apply:s=>({staff:s.staff.map(st=>({...st,mood:Math.min(st.mood+30,100)}))})},
     {label:"그냥 넘어가기",desc:"사기 -5",apply:s=>({staff:s.staff.map(st=>({...st,mood:Math.max(st.mood-5,0)}))})},
   ]},
  {id:"ingredient_windfall",type:"random",icon:"🎁",char:"🚚",charName:"공급업체",
   title:"식재료 특가!",desc:"공급업체에서 반짝 할인 행사를 진행합니다.",
   choices:[
     {label:"대량 구매",desc:"비용 50만원, 원가율 -2%p 한달",cost:500000,apply:s=>({cogs:Math.max(s.cogs-2,10)})},
     {label:"패스",desc:"변화 없음",apply:(_s:S)=>({})},
   ]},
  {id:"health_inspection_good",type:"random",icon:"🏅",char:"👮",charName:"보건소",
   title:"위생 우수업소 선정!",desc:"보건소에서 위생 우수업소로 선정했다는 통보가 왔어요!",
   choices:[
     {label:"현판 달고 홍보",desc:"평판 +15, 손님 +10% 한달",apply:s=>({rep:Math.min(s.rep+15,100),efx:[{type:"customers",value:0.1,duration:30,label:"위생 우수업소"}]})},
   ]},
  {id:"night_market",type:"random",icon:"🌙",char:"🏮",charName:"구청",
   title:"야시장 개최!",desc:"근처에 야시장이 열려요. 저녁 유동인구가 늘어납니다.",
   choices:[
     {label:"야간 영업 연장",desc:"비용 3만원, 손님 +30%",cost:30000,apply:(_s:S)=>({efx:[{type:"customers",value:0.3,duration:5,label:"야시장 특수"}]})},
     {label:"평소처럼 운영",desc:"자연 증가만",apply:(_s:S)=>({efx:[{type:"customers",value:0.15,duration:5,label:"야시장 유동인구"}]})},
   ]},
];
