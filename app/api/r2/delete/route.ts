import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (!key) return NextResponse.json({ error: "키 없음" }, { status: 400 });

    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("R2 delete error:", e);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
