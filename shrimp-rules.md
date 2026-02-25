# 개발 가이드라인

## 프로젝트 개요

- **서비스명**: 모임 매니저 (MVP)
- **목적**: 소규모 모임(5~20명) 주최자가 이벤트 생성, 초대 코드 발급, 참여자 승인/거절, 공지 발송을 한 곳에서 처리
- **스택**: Next.js 15 (App Router) + TypeScript + Supabase (Auth + PostgreSQL + RLS) + Tailwind CSS v3 + shadcn/ui (new-york)
- **패키지 매니저**: npm
- **현재 상태**: 인증 시스템 완료 → 이벤트 관리 기능 구현 단계 (ROADMAP Phase 0~5)
- **참고 문서**: `docs/PRD.md`, `docs/ROADMAP_v1.md`

---

## 프로젝트 아키텍처

### 디렉토리 구조

```
app/
  auth/                         # 인증 페이지 (미들웨어 예외)
  protected/                    # 인증 필수 페이지 (미들웨어 자동 보호)
    events/
      actions.ts                # 이벤트/참여 Server Actions
      page.tsx                  # 내 이벤트 목록
      new/page.tsx              # 이벤트 생성
      [id]/
        page.tsx                # 이벤트 상세
        edit/page.tsx           # 이벤트 수정
        manage/page.tsx         # 참여자 관리
        announcements/
          actions.ts            # 공지/댓글 Server Actions
          page.tsx              # 공지 목록
          new/page.tsx          # 공지 작성
          [announcementId]/
            page.tsx            # 공지 상세 + 댓글
            edit/page.tsx       # 공지 수정
  invite/
    [code]/page.tsx             # 초대 코드 미리보기 (공개 접근)

components/
  ui/                           # shadcn/ui 자동 생성 (직접 수정 가능하나 shadcn 업데이트 시 덮어씌워짐)
  events/                       # 이벤트 관련 컴포넌트
    announcements/              # 공지/댓글 관련 컴포넌트

lib/
  supabase/
    client.ts                   # 클라이언트 컴포넌트용
    server.ts                   # 서버 컴포넌트/액션/Route Handler용
    proxy.ts                    # 미들웨어 전용
  types/
    database.ts                 # Supabase CLI 자동 생성 - 직접 수정 금지
    index.ts                    # 편의 타입 re-export

proxy.ts                        # Next.js 미들웨어 진입점
```

### 라우트 구조 규칙

- **인증 필요 페이지**: `app/protected/*` 하위에 배치 — 미들웨어가 자동으로 보호
- **공개 페이지**: `app/invite/*` 하위 — 반드시 `proxy.ts` 미들웨어 matcher에서 예외 처리
- **인증 페이지**: `app/auth/*` — 이미 미들웨어 예외 처리됨
- **새 보호 경로 추가 시**: `proxy.ts`의 matcher 확인 필수

---

## Supabase 클라이언트 패턴

### 사용 위치별 클라이언트 선택

| 환경                                        | import 경로              | 특이사항                                    |
| ------------------------------------------- | ------------------------ | ------------------------------------------- |
| 클라이언트 컴포넌트 (`"use client"`)        | `lib/supabase/client.ts` | 싱글톤 가능                                 |
| 서버 컴포넌트, Server Action, Route Handler | `lib/supabase/server.ts` | 반드시 함수 내부에서 `await createClient()` |
| 미들웨어 (`proxy.ts`)                       | `lib/supabase/proxy.ts`  | `updateSession()`만 사용                    |

### 서버 클라이언트 표준 패턴

```typescript
// 올바른 패턴 (함수 내부에서 생성)
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
}

// 금지 패턴 (모듈 레벨 전역 변수)
const supabase = await createClient(); // FORBIDDEN
```

---

## 인증/권한 검증 패턴

### 서버 컴포넌트 인증 확인

```typescript
const supabase = await createClient();
const { data, error } = await supabase.auth.getClaims();
if (error || !data?.claims) {
  redirect("/auth/login");
}
const userId = data.claims.sub;
```

### Server Action 인증 표준 순서

1. `const supabase = await createClient()` — 서버 클라이언트 생성
2. `await supabase.auth.getClaims()` — 인증 확인 및 userId 추출
3. 권한 검증 — `host_id === userId` 또는 `author_id === userId` 확인
4. Zod 스키마 검증 — 입력 데이터 검증
5. DB 작업 — Supabase INSERT/UPDATE/DELETE

### 역할별 접근 제어

| 역할                                  | 접근 가능 기능                                          |
| ------------------------------------- | ------------------------------------------------------- |
| 주최자 (`host_id = 본인`)             | 이벤트 수정/취소, 참여자 승인/거절, 공지 작성/수정/삭제 |
| 승인된 참여자 (`status = 'approved'`) | 공지 열람, 댓글 작성/삭제                               |
| 대기 참여자 (`status = 'pending'`)    | 이벤트 기본 정보만 열람                                 |
| 비로그인                              | 초대 코드 미리보기만 열람                               |

---

## Server Action 구현 규칙

### 파일 위치

- 이벤트/참여 액션: `app/protected/events/actions.ts`
- 공지/댓글 액션: `app/protected/events/[id]/announcements/actions.ts`
- 참여자 관리 액션: `app/protected/events/actions.ts` (이벤트 액션 파일에 추가)

### 필수 구현 항목

- 모든 mutating 액션 최상단에 `getClaims()` 호출
- 주최자 전용 액션: `host_id` 검증 후 에러 반환 또는 redirect
- 폼 액션: React Hook Form + Zod 조합 (클라이언트 검증 + 서버 검증 동일 스키마)
- `open` 이벤트 참여 신청: 서버 액션에서 `join_policy` 분기 처리 (DB 트리거 미사용)

### 403 처리 패턴

```typescript
if (event.host_id !== userId) {
  return { error: "권한이 없습니다." }; // 또는 redirect('/auth/error')
}
```

---

## 타입 시스템 규칙

### database.ts 관리

- `lib/types/database.ts`: **직접 수정 금지** — Supabase CLI 자동 생성 파일
- DB 스키마 변경 후 반드시 재생성:
  ```bash
  npx supabase gen types typescript --project-id <project-id> > lib/types/database.ts
  ```
- `.prettierignore`에 이미 제외됨 — Prettier 적용 금지

### index.ts 편의 타입 추가 패턴

```typescript
// lib/types/index.ts
import type { Database } from "./database";

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventParticipant =
  Database["public"]["Tables"]["event_participants"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type AnnouncementComment =
  Database["public"]["Tables"]["announcement_comments"]["Row"];
```

### DB 스키마 (핵심 테이블)

| 테이블                  | 주요 필드                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ----------- | -------------------------- |
| `events`                | `id`, `host_id`, `title`, `description`, `event_date`, `location`, `max_capacity`, `join_policy('open' | 'approval')`, `invite_code(8자리)`, `status('active' | 'cancelled' | 'completed')`              |
| `event_participants`    | `id`, `event_id`, `user_id`, `status('pending'                                                         | 'approved'                                           | 'rejected'  | 'cancelled')`, `joined_at` |
| `announcements`         | `id`, `event_id`, `author_id`, `title`, `content`                                                      |
| `announcement_comments` | `id`, `announcement_id`, `author_id`, `content`                                                        |

---

## 컴포넌트 구현 규칙

### Server vs Client 컴포넌트 판단

- **Server 컴포넌트 사용**: 데이터 페칭, 인증 확인, 정적 렌더링
- **Client 컴포넌트 (`"use client"`) 사용**: `useState`, `useEffect`, 이벤트 핸들러, 브라우저 API, React Hook Form

### shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add <component-name>
# 결과: components/ui/<component>.tsx 에 생성
```

현재 설치된 컴포넌트: `button`, `card`, `input`, `label`, `checkbox`, `badge`, `dropdown-menu`

추가 예정 (ROADMAP 기준): `tabs`, `textarea`, `select`, `radio-group`, `alert-dialog`, `separator`

### 아이콘

- `lucide-react` 사용 — 다른 아이콘 라이브러리 추가 금지

---

## 미들웨어/라우팅 규칙

### proxy.ts 수정 시 주의사항

- `/invite/*` 경로를 공개 접근 허용 시: 기존 `/protected/*` 보호가 유지되는지 반드시 확인
- 미들웨어에서 `getClaims()` 호출과 응답 반환 사이에 임의 코드 삽입 금지 (세션 끊김 위험)
- matcher 변경 후 `/protected/*` 경로 인증 보호 동작 테스트 필수

### 로그인 후 복귀 플로우

- 비로그인 사용자가 `/invite/[code]`에서 "참여 신청" 클릭 시
- 로그인 페이지로 `?next=/invite/[code]` 파라미터 포함 리다이렉트
- 기존 `app/auth/callback/route.ts`의 `next` 파라미터 처리 로직 활용
- `next` 파라미터는 `/`로 시작하는지 반드시 검증 (오픈 리다이렉트 방지)

---

## 데이터 페칭 패턴

### 서버 컴포넌트에서 직접 페칭 (권장)

```typescript
export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();
}
```

### 쿼리 함수 분리 (재사용 시)

- 쿼리 함수는 Server Action 파일(`actions.ts`)에 함께 배치
- 또는 별도 `queries.ts` 파일로 분리 가능

---

## 코드 품질 규칙

### 커밋 전 필수 실행

```bash
npm run validate  # type-check + lint + format:check 통합 실행
```

### 자동화 흐름

- `git commit` → Husky pre-commit → lint-staged → staged 파일에 ESLint + Prettier 자동 실행
- 오류 시 커밋 차단

### ESLint 예외

- `components/ui/**/*.tsx`: `no-explicit-any`, `display-name` 규칙 완화 (shadcn/ui 자동 생성)
- `*.config.ts/mjs/js`: `require()` 허용

---

## 금지 사항

- **서버 클라이언트 전역 저장 금지**: `lib/supabase/server.ts`의 `createClient()`를 모듈 레벨 변수에 할당하는 행위
- **database.ts 직접 수정 금지**: `lib/types/database.ts`는 Supabase CLI 자동 생성 파일
- **인증 없는 DB 조작 금지**: Server Action에서 `getClaims()` 없이 Supabase mutating 쿼리 실행
- **미들웨어 우회 금지**: `/protected/*` 경로를 미들웨어 matcher에서 제외하는 행위
- **타 아이콘 라이브러리 추가 금지**: `lucide-react` 이외 아이콘 라이브러리 설치
- **DB 트리거로 비즈니스 로직 처리 금지**: `open` 이벤트 자동 승인 등 로직은 서버 액션에서 명시적으로 처리
- **prettier 직접 database.ts 적용 금지**: `.prettierignore`에서 제외됨

---

## AI 의사결정 기준

### 새 페이지 추가 시

1. 인증 필요 → `app/protected/` 하위 배치
2. 공개 접근 필요 → `app/invite/` 또는 `app/` 직접 배치 + `proxy.ts` matcher 예외 확인
3. 인증 관련 → `app/auth/` 하위 배치

### 새 Server Action 추가 시

1. 이벤트/참여 관련 → `app/protected/events/actions.ts`
2. 공지/댓글 관련 → `app/protected/events/[id]/announcements/actions.ts`
3. 반드시 `getClaims()` → 권한 검증 → Zod 검증 → DB 작업 순서 준수

### DB 스키마 변경 시

1. Supabase SQL Editor 또는 Migration으로 변경
2. `npx supabase gen types typescript` 실행
3. `lib/types/index.ts`에 신규 편의 타입 추가
4. `npm run validate` 실행하여 타입 오류 확인

### 컴포넌트 분류 판단 순서

1. 데이터 페칭만 하는가? → Server Component
2. 사용자 인터랙션(폼, 버튼 클릭, 상태 관리)이 있는가? → Client Component (`"use client"`)
3. shadcn/ui 폼 컴포넌트 사용 → 대부분 Client Component 필요
