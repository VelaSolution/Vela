import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, storeName } = await req.json();
    if (!email) return NextResponse.json({ error: "이메일 필요" }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: true });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VELA <contact@velaanalytics.com>",
        to: [email],
        subject: `[VELA] ${storeName} 팀에 초대되었습니다`,
        html: `
          <div style="max-width:480px;margin:0 auto;font-family:'Apple SD Gothic Neo',sans-serif;padding:32px 24px">
            <h1 style="font-size:24px;font-weight:800;color:#191F28;margin-bottom:16px">팀 초대</h1>
            <p style="font-size:15px;color:#6B7684;line-height:1.7;margin-bottom:24px">
              <b>${storeName}</b> 팀에 초대되었습니다.<br/>
              아래 버튼을 클릭해 VELA에 로그인하면 팀에 합류할 수 있습니다.
            </p>
            <a href="https://velaanalytics.com/login" style="display:inline-block;background:#3182F6;color:#fff;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none">
              VELA 로그인하기
            </a>
            <p style="margin-top:32px;font-size:12px;color:#9EA6B3">
              이 메일은 VELA(velaanalytics.com)에서 발송되었습니다.
            </p>
          </div>
        `,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "이메일 발송 실패" }, { status: 500 });
  }
}
