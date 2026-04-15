/**
 * 구독 관련 이메일 (Resend)
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM = "VELA <noreply@velaanalytics.com>";
const BLUE = "#3182F6";

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn("RESEND_API_KEY not set, skipping email"); return; }
  await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  }).catch(e => console.error("Email send error:", e));
}

function wrap(body: string) {
  return `<div style="max-width:480px;margin:0 auto;font-family:'Pretendard',system-ui,sans-serif;color:#191F28;padding:32px 20px">
    <div style="text-align:center;margin-bottom:24px"><span style="font-size:20px;font-weight:800">VELA<span style="color:${BLUE}">.</span></span></div>
    ${body}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E8EB;text-align:center;font-size:12px;color:#9EA6B3">
      벨라솔루션 | mnhyuk@velaanalytics.com
    </div>
  </div>`;
}

/** 구독 시작 환영 */
export async function sendWelcome(to: string, plan: string, amount: number, nextDate: string) {
  await send(to, "VELA 프로 구독을 시작했습니다", wrap(`
    <h2 style="font-size:18px;margin:0 0 8px">구독이 시작되었습니다 🎉</h2>
    <p style="font-size:14px;color:#6B7684;margin:0 0 20px">모든 도구를 무제한으로 이용할 수 있습니다.</p>
    <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:16px">
      <p style="font-size:13px;margin:0 0 6px"><b>플랜:</b> ${plan}</p>
      <p style="font-size:13px;margin:0 0 6px"><b>결제 금액:</b> ${amount.toLocaleString()}원</p>
      <p style="font-size:13px;margin:0"><b>다음 결제일:</b> ${nextDate}</p>
    </div>
    <a href="https://velaanalytics.com/profile" style="display:block;text-align:center;background:${BLUE};color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">구독 관리 →</a>
  `));
}

/** 결제 예정 안내 (3일 전) */
export async function sendRenewalReminder(to: string, amount: number, date: string, cardLast4: string) {
  await send(to, `VELA 구독이 ${date}에 자동 갱신됩니다`, wrap(`
    <h2 style="font-size:18px;margin:0 0 8px">자동 결제 안내</h2>
    <p style="font-size:14px;color:#6B7684;margin:0 0 20px">${date}에 자동 결제가 진행됩니다.</p>
    <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:16px">
      <p style="font-size:13px;margin:0 0 6px"><b>결제 금액:</b> ${amount.toLocaleString()}원</p>
      <p style="font-size:13px;margin:0 0 6px"><b>결제 카드:</b> **** ${cardLast4}</p>
      <p style="font-size:13px;margin:0"><b>결제일:</b> ${date}</p>
    </div>
    <a href="https://velaanalytics.com/profile" style="display:block;text-align:center;background:${BLUE};color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">구독 관리 →</a>
  `));
}

/** 결제 실패 안내 */
export async function sendPaymentFailed(to: string, retryCount: number) {
  const remaining = 3 - retryCount;
  await send(to, "VELA 구독 결제에 실패했습니다", wrap(`
    <h2 style="font-size:18px;margin:0 0 8px">결제 실패 안내</h2>
    <p style="font-size:14px;color:#6B7684;margin:0 0 20px">등록된 카드로 결제가 되지 않았습니다.</p>
    <div style="background:#FEF2F2;border-radius:12px;padding:16px;margin-bottom:16px">
      <p style="font-size:13px;color:#DC2626;margin:0 0 6px"><b>남은 재시도:</b> ${remaining}회</p>
      <p style="font-size:13px;color:#DC2626;margin:0">${remaining > 0 ? "내일 다시 시도합니다. 카드 잔액을 확인해주세요." : "재시도 횟수가 모두 소진되어 무료 플랜으로 전환됩니다."}</p>
    </div>
    <a href="https://velaanalytics.com/profile" style="display:block;text-align:center;background:${BLUE};color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">카드 변경하기 →</a>
  `));
}

/** 구독 만료 안내 */
export async function sendExpired(to: string) {
  await send(to, "VELA 프로 구독이 만료되었습니다", wrap(`
    <h2 style="font-size:18px;margin:0 0 8px">구독이 만료되었습니다</h2>
    <p style="font-size:14px;color:#6B7684;margin:0 0 20px">무료 플랜으로 전환되었습니다. 프로 기능을 계속 이용하려면 다시 구독해주세요.</p>
    <a href="https://velaanalytics.com/pricing" style="display:block;text-align:center;background:${BLUE};color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">다시 구독하기 →</a>
  `));
}
