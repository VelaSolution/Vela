export interface SimInputs {
  cash: number;       // 보유 현금 (만원)
  initInvest: number; // 초기 투자금
  monthlyFixed: number;
  variableRate: number; // %
  firstRevenue: number;
  growthRate: number;   // %
  targetRevenue: number;
}

export interface MonthData {
  month: number;
  rev: number;
  fixed: number;
  variable: number;
  profit: number;
  balance: number;
}

export interface SimResult {
  months: MonthData[];
  bepRevenue: number;
  bepMonth: number | null;
  runwayMonth: number | null;
  totalRevenue: number;
  totalProfit: number;
  finalBalance: number;
  paybackMonth: number | null;
}

export function simulate(inputs: SimInputs, growthOverride?: number): SimResult {
  const { cash, initInvest, monthlyFixed, variableRate, firstRevenue } = inputs;
  const growth = growthOverride ?? inputs.growthRate;
  let balance = cash - initInvest;
  const months = Array.from({ length: 12 }, (_, i) => {
    const rev = Math.round(firstRevenue * Math.pow(1 + growth / 100, i));
    const variable = Math.round(rev * variableRate / 100);
    const profit = rev - monthlyFixed - variable;
    balance += profit;
    return { month: i + 1, rev, fixed: monthlyFixed, variable, profit, balance };
  });
  const bepRevenue = variableRate < 100 ? Math.round(monthlyFixed / (1 - variableRate / 100)) : 0;
  const bepMonth = months.find(m => m.rev >= bepRevenue)?.month ?? null;
  const runwayMonth = months.find(m => m.balance <= 0)?.month ?? null;
  const totalRevenue = months.reduce((s, m) => s + m.rev, 0);
  const totalProfit = months.reduce((s, m) => s + m.profit, 0);
  const paybackMonth = (() => {
    let cum = -(cash - (cash - initInvest)); // = initInvest
    for (const m of months) { cum -= m.profit; if (cum <= 0) return m.month; }
    return null;
  })();
  return { months, bepRevenue, bepMonth, runwayMonth, totalRevenue, totalProfit, finalBalance: months[11]?.balance ?? 0, paybackMonth };
}
