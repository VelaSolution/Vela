import { NextRequest } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { apiError, apiSuccess } from "@/lib/api-error";
import { r2, R2_BUCKET } from "@/lib/r2";

async function getUser(req: NextRequest) {
  const token = req.cookies.get("sb-mkhnkgjpjsjadxuxtiya-auth-token")?.value
    || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { user } } = await sb.auth.getUser(token);
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return apiError("인증 필요", 401);

    const { key } = await req.json();
    if (!key) return apiError("키 없음", 400);

    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );

    return apiSuccess({ ok: true });
  } catch (e) {
    console.error("R2 delete error:", e);
    return apiError("삭제 실패", 500);
  }
}
