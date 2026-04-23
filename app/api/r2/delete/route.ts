import { NextRequest } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { apiError, apiSuccess } from "@/lib/api-error";
import { r2, R2_BUCKET } from "@/lib/r2";

async function getUser(req: NextRequest) {
  const authCookie = req.cookies.getAll().find(c => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
  const token = authCookie?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { user } } = await sb.auth.getUser(token);
  return user;
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return apiError("인증 필요", 401);

    const { key, fileId } = await req.json();

    // R2 파일 삭제
    if (key) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
      } catch {}
    }

    // DB 레코드 삭제 (admin 권한으로 RLS 우회)
    if (fileId) {
      const admin = getAdmin();
      if (admin) {
        await admin.from("hq_file_versions").delete().eq("file_id", fileId);
        await admin.from("hq_file_stars").delete().eq("file_id", fileId);
        await admin.from("hq_file_tags").delete().eq("file_id", fileId);
        await admin.from("hq_file_shares").delete().eq("file_id", fileId);
        const { error } = await admin.from("hq_files").delete().eq("id", fileId);
        if (error) {
          console.error("DB delete error:", error);
          return apiError("DB 삭제 실패: " + error.message, 500);
        }
      }
    }

    return apiSuccess({ ok: true });
  } catch (e) {
    console.error("R2 delete error:", e);
    return apiError("삭제 실패", 500);
  }
}
