import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// OAuth 인가 코드를 세션으로 교환하는 Route Handler
// Google OAuth 등 소셜 로그인 후 리다이렉트 되는 엔드포인트
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 로그인 성공 후 이동할 경로 (기본값: /protected)
  const next = searchParams.get("next") ?? "/protected";
  // 오픈 리다이렉트 방지: /로 시작하는 경로만 허용
  const safePath = next.startsWith("/") ? next : "/protected";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 개발/프로덕션 환경 분기 처리
      // 프록시(로드밸런서) 뒤에 있을 경우 x-forwarded-host 헤더로 실제 호스트 확인
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // 개발 환경: origin 그대로 사용
        return NextResponse.redirect(`${origin}${safePath}`);
      } else if (forwardedHost) {
        // 프로덕션 + 프록시 환경: forwardedHost 사용
        return NextResponse.redirect(`https://${forwardedHost}${safePath}`);
      } else {
        // 프로덕션 환경: origin 그대로 사용
        return NextResponse.redirect(`${origin}${safePath}`);
      }
    }
  }

  // 코드가 없거나 교환 실패 시 에러 페이지로 리다이렉트
  return NextResponse.redirect(
    `${origin}/auth/error?error=OAuth 코드 교환에 실패했습니다`,
  );
}
