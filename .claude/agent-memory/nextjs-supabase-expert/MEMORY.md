# 프로젝트 메모리 (nextjs-supabase-expert)

## 인증 라우트 (구현 완료)

- `/auth/login` - 이메일/비밀번호 + Google OAuth 로그인
- `/auth/sign-up` - 이메일/비밀번호 + Google OAuth 회원가입
- `/auth/callback` - OAuth 인가 코드 교환 Route Handler (신규)
- `/auth/confirm` - 이메일 OTP 확인
- `/auth/forgot-password` - 비밀번호 찾기
- `/auth/update-password` - 비밀번호 변경
- `/auth/sign-up-success` - 회원가입 성공 페이지
- `/auth/error` - 인증 에러 페이지

## Google OAuth 구현 패턴

- `app/auth/callback/route.ts`: exchangeCodeForSession + NextResponse.redirect (쿠키 세팅 필요)
- 오픈 리다이렉트 방지: `next` 파라미터가 `/`로 시작하는지 검증
- 환경 분기: 개발(origin), 프로덕션+프록시(x-forwarded-host), 프로덕션(origin)
- 클라이언트에서 `signInWithOAuth({ provider: 'google', options: { redirectTo: .../auth/callback } })`
- OAuth 성공 시 isLoading을 false로 설정하지 않음 (리다이렉트로 페이지 이탈)

## 주요 컴포넌트

- `components/login-form.tsx` - handleGoogleLogin 포함
- `components/sign-up-form.tsx` - handleGoogleSignUp 포함
- Google SVG 아이콘 인라인으로 삽입 (lucide-react에 Google 아이콘 없음)

## 주의사항

- validate 실행 시 `.claude/agents/nextjs-supabase-expert.md` 포맷 경고 발생 (무시 가능, 구현 파일 아님)
