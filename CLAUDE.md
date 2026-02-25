# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 규칙

- 응답 및 코드 주석: 한국어
- 변수명/함수명: 영어 (코드 표준 준수)
- 커밋 메시지: 한국어

## 개발 명령어

```bash
npm run dev           # 개발 서버 실행 (localhost:3000)
npm run build         # 프로덕션 빌드
npm run type-check    # TypeScript 타입 오류 검사
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 전체 포맷 적용
npm run format:check  # Prettier 포맷 검사 (변경 없음)
npm run validate      # type-check + lint + format:check 통합 실행
```

## 환경 변수

`.env.local` 파일에 다음 변수 필요:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## 코드 품질 도구

### 자동화 흐름 (git commit 시)

`git commit` → Husky → lint-staged → staged 파일에 ESLint + Prettier 자동 실행. 오류 시 커밋 차단.

### ESLint (`eslint.config.mjs`)

- ESLint 9 flat config 형식
- `next/core-web-vitals` + `next/typescript` 기본 규칙
- `components/ui/**/*.tsx` (shadcn/ui 자동 생성): `no-explicit-any`, `display-name` 규칙 완화
- `*.config.ts/mjs/js`: `require()` 허용
- `eslint-config-prettier`를 **배열 마지막**에 배치 (Prettier 충돌 방지)

### Prettier (`.prettierrc`)

- `prettier-plugin-tailwindcss` 적용 (Tailwind 클래스 자동 정렬)
- `lib/types/database.ts`는 `.prettierignore`로 제외 (Supabase CLI 자동 생성 파일)

### VS Code

`.vscode/settings.json`에 저장 시 자동 포맷 설정 포함. 권장 확장은 `.vscode/extensions.json` 참고.

## 아키텍처 개요

**스택**: Next.js 15 (App Router) + Supabase + Tailwind CSS v3 + shadcn/ui (new-york 스타일)

### Supabase 클라이언트 패턴

세 가지 클라이언트를 구분하여 사용:

- `lib/supabase/client.ts` — 클라이언트 컴포넌트용 (`"use client"` 환경)
- `lib/supabase/server.ts` — 서버 컴포넌트 및 Route Handler용 (매 함수 호출마다 새 인스턴스 생성 필수)
- `lib/supabase/proxy.ts` — 미들웨어에서 세션 갱신 전용

**중요**: Fluid compute 환경에서 서버 클라이언트를 전역 변수에 저장하면 안 됨. 항상 함수 내부에서 새로 생성.

### 미들웨어 (`proxy.ts`)

`proxy.ts`가 Next.js 미들웨어 진입점. `lib/supabase/proxy.ts`의 `updateSession`을 호출하여 세션 쿠키를 갱신하고 미인증 사용자를 `/auth/login`으로 리다이렉트.

미들웨어에서 `getClaims()` 호출과 응답 반환 사이에 코드를 추가하면 세션이 끊길 수 있으므로 주의.

### 인증 흐름

- 이메일/비밀번호 로그인: 클라이언트에서 `supabase.auth.signInWithPassword()` 호출
- 이메일 OTP 확인: `app/auth/confirm/route.ts`에서 `verifyOtp()` 처리 후 리다이렉트
- 세션 인증 확인: 서버 컴포넌트에서 `supabase.auth.getClaims()` 사용

### 데이터베이스 타입

Supabase CLI로 생성된 타입은 `lib/types/database.ts`에 위치. 편의 타입(`Profile`, `ProfileInsert`, `ProfileUpdate`)은 `lib/types/index.ts`에서 re-export.

타입 재생성 명령어:

```bash
npx supabase gen types typescript --project-id <project-id> > lib/types/database.ts
```

### shadcn/ui 컴포넌트

```bash
npx shadcn@latest add <component-name>
```

컴포넌트는 `components/ui/`에 생성됨. 아이콘 라이브러리는 `lucide-react`.

### 라우트 구조

- `/` — 홈 (공개)
- `/auth/*` — 인증 관련 페이지 (공개)
- `/protected` — 인증 필요 페이지 (미들웨어가 보호)

새로운 보호 페이지는 `/protected` 하위에 추가하거나, 미들웨어 로직에서 패스를 추가.

### 테마

`next-themes`의 `ThemeProvider`로 다크/라이트 모드 지원. CSS 변수 기반 (`app/globals.css`).
