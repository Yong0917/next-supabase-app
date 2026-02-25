# 모임 매니저 MVP 개발 로드맵

> 마지막 업데이트: 2026-02-25
> 버전: v1.1

## 프로젝트 개요

소규모 모임(5~20명)의 주최자가 이벤트 생성, 초대 코드 발급, 참여자 승인/거절, 공지 발송을 한 곳에서 처리할 수 있도록 운영 부담을 줄이는 MVP 서비스.
수영, 헬스, 친구 모임 등 다양한 소규모 모임을 대상으로 하며, 초대 코드 기반 참여 방식으로 외부 공개 없이 운영된다.
기존 구현된 인증 시스템(이메일/비밀번호 + Google OAuth) 위에 이벤트 관리 기능을 추가하는 단계이다.

---

## 성공 지표 (KPI)

- 이벤트 생성 후 초대 코드 공유까지의 소요 시간: 1분 이내
- 초대 코드 미리보기 → 참여 신청 전환율: 측정 기반 마련 (Phase 3 이후)
- 승인형 이벤트에서 주최자의 pending 처리 소요 시간: 참여자 관리 페이지 1회 방문으로 일괄 처리 가능
- 서버 액션 응답 시간: 2초 이내 (Vercel + Supabase 조합)
- TypeScript 컴파일 오류 0건, ESLint 오류 0건 상태로 각 Phase 완료

---

## 기술 스택

| 레이어      | 기술                                   | 선택 이유                                                                |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------ |
| 프레임워크  | Next.js 15 (App Router)                | 서버 컴포넌트 + 서버 액션으로 API 라우트 없이 데이터 처리 가능           |
| 언어        | TypeScript 5.6+                        | Supabase 자동 생성 타입과 연동하여 DB 스키마 변경 시 타입 오류 즉시 감지 |
| 스타일링    | Tailwind CSS v3 + shadcn/ui (new-york) | 이미 설치된 컴포넌트 재사용, 빠른 UI 구성                                |
| 폼 관리     | React Hook Form 7.x + Zod              | 서버 액션과의 연동, 클라이언트/서버 동일 스키마 검증                     |
| 백엔드      | Supabase (PostgreSQL + RLS + Auth)     | 역할 기반 접근 제어를 DB 레벨에서 처리하여 서버 코드 단순화              |
| 배포        | Vercel                                 | Next.js 15 최적화, 환경 변수 관리 편의성                                 |
| 패키지 관리 | npm                                    | 기존 프로젝트 설정 유지                                                  |

---

## 추가 설치 필요 패키지

```bash
# 폼 관리 및 스키마 검증
npm install react-hook-form zod @hookform/resolvers

# shadcn/ui 추가 컴포넌트 (Phase별로 필요 시 추가)
npx shadcn@latest add tabs       # 이벤트 목록 탭, 참여자 관리 탭
npx shadcn@latest add textarea   # 공지 내용, 댓글 입력
npx shadcn@latest add select     # 참여 방식 선택 (이벤트 폼)
npx shadcn@latest add radio-group  # 참여 방식 라디오 버튼
npx shadcn@latest add alert-dialog # 삭제/취소 확인 다이얼로그
npx shadcn@latest add separator  # 구분선
```

---

## 개발 로드맵

### Phase 0: 프로젝트 셋업 (1주) ✅ 완료

**목표**: 신규 기능 개발을 위한 의존성 설치, DB 마이그레이션 준비, 타입 체계 구축
**완료 기준**:

- `npm run validate` 통과 (타입 오류 0건, 린트 오류 0건)
- Supabase 대시보드에서 4개 테이블 및 RLS 정책 확인 가능
- `lib/types/index.ts`에서 신규 테이블 타입 임포트 가능

#### 태스크

- [x] react-hook-form, zod, @hookform/resolvers npm 설치 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [x] shadcn/ui 추가 컴포넌트 설치 (tabs, textarea, select, radio-group, alert-dialog, separator) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 높음
- [x] Supabase에서 enum 타입 3개 생성 (`event_status`, `join_policy`, `participant_status`) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 높음
- [x] `events` 테이블 생성 (host_id FK, invite_code unique, 전체 필드) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 높음
- [x] `event_participants` 테이블 생성 (event_id FK, user_id FK, status enum) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 높음
- [x] `announcements` 테이블 생성 (event_id FK, author_id FK) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 높음
- [x] `announcement_comments` 테이블 생성 (announcement_id FK, author_id FK) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 높음
- [x] 4개 테이블에 `updated_at` 자동 갱신 트리거 적용 | 담당: 백엔드 | 예상: 0.5d | 우선순위: 높음
- [x] `events` 및 `event_participants` RLS 정책 적용 (SELECT/INSERT/UPDATE/DELETE 전체) | 담당: 백엔드 | 예상: 1d | 우선순위: 높음
- [x] `announcements` 및 `announcement_comments` RLS 정책 적용 (approved 참여자 접근 제어 포함) | 담당: 백엔드 | 예상: 1d | 우선순위: 높음
- [x] `open` 정책 이벤트 참여 신청 시 자동 승인 트리거 구현 (`join_policy = 'open'` 이면 INSERT 후 status를 `approved`로 자동 변경) | 담당: 백엔드 | 예상: 1d | 우선순위: 높음
- [x] `npx supabase gen types typescript` 실행 후 `lib/types/database.ts` 업데이트 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [x] `lib/types/index.ts`에 신규 테이블 편의 타입 추가 (Event, EventInsert, EventParticipant, Announcement, AnnouncementComment 등) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [x] `npm run validate` 실행하여 타입/린트 오류 없음 확인 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음

---

### Phase 1: 이벤트 CRUD (1.5주)

**목표**: 주최자가 이벤트를 생성하고, 목록 조회 및 상세 확인, 수정/취소까지 가능한 핵심 CRUD 구현
**완료 기준**:

- 이벤트 생성 → 이벤트 상세 페이지 이동 및 초대 코드 확인 가능
- 이벤트 목록에서 주최한 이벤트 / 참여한 이벤트 탭 구분 표시
- 이벤트 수정 후 상세 페이지에 변경 내용 반영
- 이벤트 취소 후 상태가 `cancelled`로 표시
- 비주최자가 수정/수정 페이지 접근 시 403 처리

#### 태스크

**서버 액션 (app/protected/events/actions.ts)**

- [ ] `createEvent` Server Action 구현 (Zod 검증, 8자리 고유 invite_code 생성, Supabase INSERT) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] `updateEvent` Server Action 구현 (host_id 검증, Supabase UPDATE) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `cancelEvent` Server Action 구현 (status를 `cancelled`로 변경) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `getMyHostedEvents` 쿼리 함수 구현 (host_id = 본인, 상태 포함) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `getMyParticipatingEvents` 쿼리 함수 구현 (event_participants join events, 본인 참여 이벤트) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `getEventById` 쿼리 함수 구현 (이벤트 상세 + 현재 사용자 역할/참여 상태 포함) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음

**공통 컴포넌트**

- [ ] `components/events/event-form.tsx` 구현 (React Hook Form + Zod, 생성/수정 공용, 제목/설명/날짜/시간/장소/최대인원/참여방식 필드) | 담당: 프론트엔드 | 예상: 2d | 우선순위: 높음
- [ ] `components/events/event-card.tsx` 구현 (제목, 날짜, 장소, 승인인원/최대인원, 상태 배지) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 높음
- [ ] `components/events/invite-code-display.tsx` 구현 (초대 코드 복사 버튼, 클립보드 API 활용) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 중간

**페이지**

- [ ] `app/protected/events/page.tsx` 구현 (내 이벤트 목록, 주최/참여 탭, 새 이벤트 만들기 버튼) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] `app/protected/events/new/page.tsx` 구현 (이벤트 생성 폼 페이지, createEvent 액션 연결) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `app/protected/events/[id]/page.tsx` 구현 (이벤트 상세, 역할 기반 조건부 UI: 주최자/승인참여자/대기참여자) | 담당: 풀스택 | 예상: 2d | 우선순위: 높음
- [ ] `app/protected/events/[id]/edit/page.tsx` 구현 (기존 데이터 prefill, 비주최자 403 처리) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] `app/protected/layout.tsx` 네비게이션 업데이트 (내 이벤트 목록 링크, 새 이벤트 만들기 링크 추가) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 중간

---

### Phase 2: 초대 코드 + 참여 시스템 (1주)

**목표**: 비로그인 사용자도 초대 링크로 이벤트 미리보기 가능, 로그인 후 참여 신청/취소 처리
**완료 기준**:

- `/invite/[code]` 페이지가 미들웨어 인증 예외 처리되어 비로그인 접근 가능
- 비로그인 상태에서 "참여 신청" 클릭 시 로그인 후 원래 초대 링크로 복귀
- `open` 이벤트: 참여 신청 즉시 `approved` 처리 후 이벤트 상세 이동
- `approval` 이벤트: 참여 신청 후 `pending` 상태로 이벤트 상세 이동
- 이미 신청/승인된 상태이면 버튼 비활성화 및 상태 표시
- 최대 인원 초과 시 "정원 마감" 표시

#### 태스크

**미들웨어 수정**

- [ ] `lib/supabase/proxy.ts` 수정: `/invite` 경로를 인증 예외 처리 (미들웨어 matcher에서 `/invite/*` 제외 또는 별도 분기 처리) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음

**서버 액션 (app/protected/events/actions.ts에 추가)**

- [ ] `joinEvent` Server Action 구현 (invite_code로 event_id 조회, 중복 신청 방지, join_policy 분기 처리) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] `cancelParticipation` Server Action 구현 (본인 row의 status를 `cancelled`로 변경) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `getEventByInviteCode` 쿼리 함수 구현 (초대 코드로 이벤트 기본 정보 + 현재 승인 인원 조회) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음

**컴포넌트**

- [ ] `components/events/join-button.tsx` 구현 (비로그인 분기: 로그인 페이지 리다이렉트 + `next` 파라미터, 로그인: joinEvent 액션 호출, 상태별 UI: 신청 가능/대기중/승인됨/정원마감) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음

**페이지**

- [ ] `app/invite/[code]/page.tsx` 구현 (공개 미리보기, 이벤트 기본 정보 표시, 유효하지 않은 코드 404 처리, JoinButton 연결) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] 이벤트 상세 페이지(`[id]/page.tsx`)에 참여 취소 버튼 연결 (cancelParticipation 액션, 확인 다이얼로그) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `app/auth/login/page.tsx` 기존 로그인 플로우에 `next` 파라미터 복귀 처리 확인 및 필요 시 보완 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 중간

---

### Phase 3: 공지 + 댓글 (1.5주)

**목표**: 주최자가 이벤트 공지를 작성/수정/삭제하고, 승인된 참여자와 주최자가 공지를 열람 및 댓글로 소통
**완료 기준**:

- 비승인 참여자가 공지 탭 접근 시 "승인된 멤버만 열람 가능" 안내 표시
- 주최자가 공지 작성 후 목록에 즉시 반영
- 공지 삭제 시 확인 다이얼로그 후 처리
- 댓글 작성 후 즉시 목록에 표시
- 본인 댓글에만 삭제 버튼 노출

#### 태스크

**서버 액션 (app/protected/events/[id]/announcements/actions.ts)**

- [ ] `createAnnouncement` Server Action 구현 (host_id 검증, Supabase INSERT) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `updateAnnouncement` Server Action 구현 (author_id 검증, Supabase UPDATE) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `deleteAnnouncement` Server Action 구현 (author_id 검증, Supabase DELETE, cascade로 댓글도 삭제) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `createComment` Server Action 구현 (approved 참여자 또는 주최자 검증, Supabase INSERT) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `deleteComment` Server Action 구현 (author_id 검증, Supabase DELETE) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `getAnnouncements` 쿼리 함수 구현 (event_id로 목록, 댓글 수 포함) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `getAnnouncementById` 쿼리 함수 구현 (공지 상세 + 댓글 목록 + 작성자 프로필 join) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음

**컴포넌트**

- [ ] `components/events/announcements/announcement-card.tsx` 구현 (제목, 작성일, 댓글 수 표시) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 높음
- [ ] `components/events/announcements/announcement-form.tsx` 구현 (제목/내용 입력, 작성/수정 공용, React Hook Form + Zod) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 높음
- [ ] `components/events/announcements/comment-list.tsx` 구현 (댓글 목록, 작성자/내용/작성일, 본인 댓글 삭제 버튼) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 높음
- [ ] `components/events/announcements/comment-form.tsx` 구현 (댓글 입력 폼, createComment 액션 연결) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 높음

**페이지**

- [ ] `app/protected/events/[id]/announcements/page.tsx` 구현 (공지 목록, 비승인 참여자 접근 제어, 주최자 전용 공지 작성 버튼) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] `app/protected/events/[id]/announcements/new/page.tsx` 구현 (공지 작성, 비주최자 403 처리) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `app/protected/events/[id]/announcements/[announcementId]/page.tsx` 구현 (공지 상세, 댓글 목록/작성, 주최자 수정/삭제 버튼, 삭제 확인 다이얼로그) | 담당: 풀스택 | 예상: 1.5d | 우선순위: 높음
- [ ] `app/protected/events/[id]/announcements/[announcementId]/edit/page.tsx` 구현 (공지 수정, 기존 데이터 prefill, 비주최자 403 처리) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] 이벤트 상세 페이지에 공지 탭 링크 연결 (주최자 + 승인된 참여자만 노출) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 높음

---

### Phase 4: 참여자 관리 UI (1주)

**목표**: 주최자가 pending 신청자를 상태별로 확인하고 승인/거절 처리 가능
**완료 기준**:

- 참여자 관리 페이지에서 pending/approved/rejected 탭 전환 정상 동작
- 승인/거절 처리 후 동일 페이지에서 상태 갱신 확인
- 상단에 승인 인원 / 최대 인원 현황 표시
- 비주최자 접근 시 403 처리

#### 태스크

**서버 액션 (app/protected/events/actions.ts에 추가)**

- [ ] `approveParticipant` Server Action 구현 (host_id 검증, 최대 인원 초과 여부 체크, status를 `approved`로 변경) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] `rejectParticipant` Server Action 구현 (host_id 검증, status를 `rejected`로 변경) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] `getParticipantsByEvent` 쿼리 함수 구현 (event_id로 전체 참여자 목록, 상태별 필터, 사용자 프로필 join) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음

**컴포넌트**

- [ ] `components/events/participant-status-badge.tsx` 구현 (pending/approved/rejected/cancelled 상태별 배지 색상) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 중간
- [ ] `components/events/participant-list.tsx` 구현 (참여자 목록, 이름/신청일시, pending 상태에 승인/거절 버튼) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 높음

**페이지**

- [ ] `app/protected/events/[id]/manage/page.tsx` 구현 (상태별 탭, 승인인원/최대인원 현황, 비주최자 403 처리, ParticipantList 연결) | 담당: 풀스택 | 예상: 1.5d | 우선순위: 높음

---

### Phase 5: 마무리 및 배포 (0.5주)

**목표**: 전체 사용자 여정 검증, 엣지 케이스 처리, Vercel 배포
**완료 기준**:

- PRD에 명시된 7가지 사용자 여정 전체 동작 확인
- `npm run validate` 통과
- Vercel 프로덕션 배포 완료 및 환경 변수 설정 완료

#### 태스크

- [ ] 전체 사용자 여정 엔드-투-엔드 수동 테스트 (PRD 7개 시나리오 기준) | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] 엣지 케이스 처리: 존재하지 않는 이벤트 ID 접근 시 404, 권한 없는 페이지 접근 시 403, 취소된 이벤트 참여 신청 방지 | 담당: 풀스택 | 예상: 1d | 우선순위: 높음
- [ ] 빈 상태 UI 구현: 이벤트 목록 없음, 공지 없음, 참여자 없음 상태 안내 메시지 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 중간
- [ ] `npm run validate` 최종 실행 및 오류 수정 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 높음
- [ ] Vercel 환경 변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | 담당: DevOps | 예상: 0.5d | 우선순위: 높음
- [ ] Vercel 프로덕션 배포 및 도메인 확인 | 담당: DevOps | 예상: 0.5d | 우선순위: 높음

---

## 전체 일정 요약

| Phase   | 내용                                      | 기간  | 누적  |
| ------- | ----------------------------------------- | ----- | ----- |
| Phase 0 | 프로젝트 셋업 (DB 스키마 + 타입 + 패키지) | 1주   | 1주   |
| Phase 1 | 이벤트 CRUD                               | 1.5주 | 2.5주 |
| Phase 2 | 초대 코드 + 참여 시스템                   | 1주   | 3.5주 |
| Phase 3 | 공지 + 댓글                               | 1.5주 | 5주   |
| Phase 4 | 참여자 관리 UI                            | 1주   | 6주   |
| Phase 5 | 마무리 및 배포                            | 0.5주 | 6.5주 |

> 1인 풀스택 개발 기준 약 6~7주 산정. 팀 규모에 따라 Phase 1~3 병렬 진행 시 단축 가능.

---

## 리스크 및 완화 전략

| 리스크                                                      | 영향도 | 발생 가능성 | 완화 전략                                                                                                |
| ----------------------------------------------------------- | ------ | ----------- | -------------------------------------------------------------------------------------------------------- |
| RLS 정책 복잡도 (announcements의 approved 참여자 체크)      | 높음   | 높음        | Phase 0에서 RLS만 집중하여 먼저 검증. Supabase SQL Editor에서 직접 쿼리 테스트 후 적용                   |
| `open` 이벤트 자동 승인 트리거 vs 서버 액션 처리 불일치     | 높음   | 중간        | 트리거 방식 대신 서버 액션에서 join_policy 분기 처리를 우선 구현하여 예측 가능성 확보                    |
| 미들웨어 인증 예외 처리 시 `/invite` 경로 보안 누락         | 높음   | 낮음        | proxy.ts 수정 시 기존 인증 보호 경로(`/protected/*`)가 영향받지 않는지 반드시 확인                       |
| 서버 액션에서 주최자 검증 누락으로 인한 권한 오용           | 높음   | 중간        | 모든 mutating 서버 액션 상단에 `getClaims()` + host_id 검증 코드를 표준 패턴으로 적용                    |
| Supabase 타입 재생성 타이밍 불일치 (DB 변경 후 타입 미갱신) | 중간   | 높음        | Phase 0 완료 후 타입 재생성, 이후 DB 구조 변경 시마다 즉시 재생성하는 규칙 팀 내 공유                    |
| React Hook Form + 서버 액션 연동 방식 (Next.js 15 기준)     | 중간   | 중간        | `useActionState` 또는 `startTransition`과 RHF의 `handleSubmit` 조합 패턴을 Phase 1 시작 전 스파이크(1일) |
| 초대 코드 URL에서 로그인 후 복귀 흐름 구현 복잡성           | 중간   | 중간        | 기존 `app/auth/callback/route.ts`의 `next` 파라미터 처리 로직 활용, `oauthCallbackRoute.ts` 참고         |

---

## 기술적 의존성

```
Phase 0 (DB 스키마 + 타입)
    |
    +-- Phase 1 (이벤트 CRUD)
    |       |
    |       +-- Phase 2 (초대 코드 + 참여)
    |       |       |
    |       |       +-- Phase 3 (공지 + 댓글)
    |       |
    |       +-- Phase 4 (참여자 관리)  ← Phase 2와 독립적으로 병렬 가능
    |
    +-- Phase 5 (마무리 + 배포)  ← 모든 Phase 완료 후
```

**핵심 의존 관계**

- `events` 테이블 없이 이벤트 CRUD 불가 (Phase 0 → Phase 1)
- `event_participants` 테이블 없이 참여 시스템 불가 (Phase 0 → Phase 2)
- `announcements` 테이블 없이 공지 기능 불가 (Phase 0 → Phase 3)
- 이벤트 상세 페이지(`[id]/page.tsx`) 없이 공지 탭 연결 불가 (Phase 1 → Phase 3)
- 참여자 관리는 이벤트 상세 페이지만 있으면 독립 구현 가능 (Phase 1 → Phase 4)
- `lib/supabase/proxy.ts` 미들웨어 수정이 Phase 2 시작 조건

---

## 파일 구조 (최종 목표)

```
app/
  protected/
    layout.tsx                              # 네비게이션 업데이트 (Phase 1)
    events/
      actions.ts                            # 이벤트/참여 Server Actions (Phase 1, 2, 4)
      page.tsx                              # 내 이벤트 목록 (Phase 1)
      new/
        page.tsx                            # 이벤트 생성 (Phase 1)
      [id]/
        page.tsx                            # 이벤트 상세 (Phase 1, 2)
        edit/
          page.tsx                          # 이벤트 수정 (Phase 1)
        manage/
          page.tsx                          # 참여자 관리 (Phase 4)
        announcements/
          actions.ts                        # 공지/댓글 Server Actions (Phase 3)
          page.tsx                          # 공지 목록 (Phase 3)
          new/
            page.tsx                        # 공지 작성 (Phase 3)
          [announcementId]/
            page.tsx                        # 공지 상세 + 댓글 (Phase 3)
            edit/
              page.tsx                      # 공지 수정 (Phase 3)
  invite/
    [code]/
      page.tsx                              # 초대 코드 미리보기 (Phase 2)

components/
  events/
    event-card.tsx                          # 이벤트 카드 (Phase 1)
    event-form.tsx                          # 이벤트 생성/수정 폼 (Phase 1)
    invite-code-display.tsx                 # 초대 코드 복사 UI (Phase 1)
    join-button.tsx                         # 참여 신청 버튼 (Phase 2)
    participant-list.tsx                    # 참여자 목록 (Phase 4)
    participant-status-badge.tsx            # 참여 상태 배지 (Phase 4)
    announcements/
      announcement-card.tsx                 # 공지 카드 (Phase 3)
      announcement-form.tsx                 # 공지 작성/수정 폼 (Phase 3)
      comment-list.tsx                      # 댓글 목록 (Phase 3)
      comment-form.tsx                      # 댓글 입력 폼 (Phase 3)

lib/
  types/
    database.ts                             # Supabase CLI 자동 생성 (Phase 0 갱신)
    index.ts                                # 편의 타입 추가 (Phase 0 갱신)
```

---

## 보류 사항 및 미결 질문

### 결정 필요 사항

1. **자동 승인 트리거 구현 위치**: `open` 이벤트의 즉시 승인을 DB 트리거로 구현할지, 서버 액션에서 직접 처리할지 결정 필요. DB 트리거는 코드 복잡도를 줄이지만 디버깅이 어려움. 서버 액션 처리가 더 명시적이므로 권장.

2. **댓글 작성자 이름 표시**: `announcement_comments.author_id`를 통해 `profiles.full_name` 또는 `profiles.username` 중 어느 것을 표시할지 결정 필요. PRD에는 "작성자 이름"으로만 명시됨.

3. **이벤트 완료 상태 처리**: `event_status`에 `completed` 값이 있으나 PRD에 완료 처리 기능이 명시되지 않음. MVP에서는 `active`/`cancelled` 만 사용하고 `completed`는 추후 구현으로 보류 권장.

4. **최대 인원 초과 시 승인 요청 처리**: `approveParticipant`에서 최대 인원 도달 시 에러 처리 방식 결정 필요 (에러 메시지 표시 or 승인 버튼 비활성화).

5. **참여 취소(cancelled) 후 재신청 허용 여부**: 취소한 사용자가 동일 이벤트에 재신청 가능한지 PRD에 명시 없음. 동일 이벤트에 대한 중복 row 처리 방식 결정 필요 (UPSERT vs INSERT 중복 에러).

6. **공지 댓글의 cascade 삭제**: 공지 삭제 시 하위 댓글도 자동 삭제되어야 하나 PRD에 명시 없음. DB 스키마에서 `ON DELETE CASCADE` 설정 여부 결정 필요.

### 범위 외 기능 (MVP 이후)

- 카풀 매칭, 정산/결제, 실시간 알림, 프로필 상세 관리, 고급 검색, 이벤트 공개 목록
- 이벤트 `completed` 상태 전환 기능
- 이메일/푸시 알림 (신규 공지, 승인/거절 알림)

---

## 변경 이력

| 버전 | 날짜       | 변경 내용                                                |
| ---- | ---------- | -------------------------------------------------------- |
| v1.1 | 2026-02-25 | Phase 0 완료 처리 (패키지 설치, DB 셋업, 타입 체계 구축) |
| v1.0 | 2026-02-25 | 최초 작성 (PRD v1 기반)                                  |
