import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 로그인 필수 경로 (개인 데이터 관련만)
// 로그인 필수 (개인 데이터 관련)
const PROTECTED_PATHS = [
  "/profile",
  "/dashboard",
  "/monthly-input",
  "/my-store",
  "/payment",
  "/stores",
  "/team",
];

// 관리자만 접근 가능
const ADMIN_PATHS = ["/admin"];

const AUTH_PATHS = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAdminPath && !isAuthPage) return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if ((isProtected || isAdminPath) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath && user && process.env.ADMIN_EMAIL) {
    const allowed = process.env.ADMIN_EMAIL.split(",").map(e => e.trim().toLowerCase());
    if (!allowed.includes((user.email ?? "").toLowerCase())) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth|unauthorized).*)"],
};
