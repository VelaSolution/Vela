// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "모든 항목을 입력해 주세요." }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력해 주세요." }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    // Resend API 키가 없으면 콘솔에만 기록 (개발/테스트 모드)
    if (!resendApiKey) {
      console.log("[문의 접수 - API 키 없음]", { name, email, message });
      return NextResponse.json({ ok: true, mode: "dev" });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "VELA 문의 <onboarding@resend.dev>", // Resend 기본 도메인 (인증 전 사용 가능)
        to: ["hello@vela.kr"],
        reply_to: email,
        subject: `[VELA 문의] ${name}님의 문의`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #3182F6; margin-bottom: 24px;">새 문의가 도착했습니다</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; width: 80px;">이름</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">이메일</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px 12px 0; color: #666; vertical-align: top;">문의</td>
                <td style="padding: 12px 0; white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
            <p style="margin-top: 24px; color: #999; font-size: 13px;">
              이 메일은 VELA 문의 폼을 통해 자동 발송되었습니다.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Resend error:", err);
      // Resend 실패해도 접수는 됐다고 처리 (로그만 남김)
      console.log("[문의 접수 - 이메일 발송 실패]", { name, email, message });
      return NextResponse.json({ ok: true, warning: "이메일 발송에 문제가 있었지만 문의가 접수되었습니다." });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
