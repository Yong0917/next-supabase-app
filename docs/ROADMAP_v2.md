# 모임 매니저 v2 개발 로드맵

> 마지막 업데이트: 2026-02-26
> 버전: v2.0

## 프로젝트 개요

v1에서 MVP 핵심 기능(이벤트 CRUD, 초대 코드, 참여 시스템, 공지/댓글, 참여자 관리)을 완성한 이후,
v2에서는 세 가지 축을 중심으로 개선한다.

1. **버그 및 엣지케이스 수정**: 주최자 초대 링크 경험 누락, 상태 검증 미비, Race Condition 등
   실제 운영 시 발생할 문제들을 선제적으로 제거한다.
2. **UX 품질 통일**: alert()과 toast가 혼재하는 알림 체계를 통일하고, 역할 표시 및 에러 메시지를
   일관되게 개선하여 사용자가 서비스를 신뢰할 수 있도록 한다.
3. **기능 확장**: 이벤트 복제, 목록 필터/검색, 출석 체크, 거절 사유 등 실제 모임 운영에
   필요한 기능을 순차적으로 추가한다.

Phase 4(알림, 대기열, 평가 등 고급 기능)는 Phase 1~3 완료 이후에 착수하며,
배포는 사용자 판단에 따라 별도 진행한다.

---

## 성공 지표 (KPI)

- 주최자가 본인 초대 링크 접속 시 관리 기능에 3초 이내 진입 가능
- `alert()` 사용 건수 0건 (전량 toast로 대체)
- `approveParticipant` / `rejectParticipant` 이중 처리 에러 발생 0건
- 이벤트 복제 시 신규 이벤트 생성까지의 클릭 수 3회 이내
- `npm run validate` 통과 (타입 오류 0건, 린트 오류 0건) 상태로 각 Phase 완료

---

## 기술 스택 (v1 유지)

| 레이어      | 기술                                   |
| ----------- | -------------------------------------- |
| 프레임워크  | Next.js 15 (App Router)                |
| 언어        | TypeScript 5.6+                        |
| 스타일링    | Tailwind CSS v3 + shadcn/ui (new-york) |
| 폼 관리     | React Hook Form 7.x + Zod              |
| 백엔드      | Supabase (PostgreSQL + RLS + Auth)     |
| 패키지 관리 | npm                                    |

---

## 추가 설치 패키지

```bash
# toast 알림 시스템 (Phase 2)
npx shadcn@latest add sonner
```

---

## 개발 로드맵

### Phase 1: 버그 수정 및 엣지케이스 처리 (1주) — 최우선

**목표**: 실제 운영 시 발생하는 버그와 보안/정합성 문제를 선제적으로 제거한다.
가장 영향도가 높은 "invite 페이지 주최자 경험 누락"과 상태 검증 미비, 이미지 롤백 누락을
이 Phase에서 완전히 해결한다.

**완료 기준**:

- 주최자가 `/invite/[code]`로 진입 시 참여 신청 버튼 대신 관리 액션 패널이 표시됨
- `completed` 상태 이벤트에 `joinEvent` 호출 시 에러 반환
- `approveParticipant` 호출 시 이미 `approved`/`rejected` 상태이면 에러 반환
- 이벤트 저장 실패 시 업로드된 이미지가 Storage에서 자동 정리됨
- `npm run validate` 통과

#### 태스크

**1-1. invite 페이지 주최자 경험 개선**

- [ ] `app/(protected)/events/actions.ts` 수정: `getEventByInviteCode` SELECT 쿼리에 `host_id` 필드 추가, `InviteEventData` 반환 타입에 `host_id: string` 포함 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [ ] `app/(protected)/events/schemas.ts` 수정: `InviteEventData` 타입에 `host_id: string` 필드 추가 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음
- [ ] `app/invite/[code]/page.tsx` 수정: `authData.claims.sub`와 `result.host_id` 비교하여 `isHost` 도출, 하단 UI를 `isHost` 분기로 교체 (isHost이면 `HostActionPanel`, 아니면 기존 `JoinButton`) | 담당: 풀스택 | 예상: 1d | 우선순위: 🔴높음
- [ ] `components/events/host-action-panel.tsx` 신규 생성: 초대 페이지에서 주최자에게 표시하는 관리 액션 패널 (참여자 관리 Link, 이벤트 수정 Link, CancelEventButton 재사용) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음

**1-2. joinEvent 상태 검증 강화**

- [ ] `app/(protected)/events/actions.ts` 수정: `joinEvent` 함수 내 상태 체크를 `event.status !== 'active'`로 교체하여 cancelled/completed 이벤트 모두 참여 방지 (`"진행 중인 이벤트가 아닙니다."` 에러 반환) | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음

**1-3. approveParticipant 이중 처리 방지**

- [ ] `app/(protected)/events/actions.ts` 수정: `approveParticipant` 함수 내 정원 체크 이전에 현재 participant `status` 조회 추가, `pending`이 아니면 `"이미 처리된 신청입니다."` 에러 반환 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음
- [ ] `app/(protected)/events/actions.ts` 수정: `rejectParticipant` 함수에도 동일 패턴 적용 (`pending`이 아니면 에러 반환) | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음

**1-4. 이미지 업로드 실패 시 Storage 롤백**

- [ ] `lib/supabase/storage-server.ts` 신규 생성: 서버 액션에서 호출 가능한 이미지 삭제 헬퍼 함수 (`deleteEventImageServer`) - `createClient` 서버 버전으로 `storage.from().remove()` 호출 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [ ] `app/(protected)/events/actions.ts` 수정: `createEvent` 함수에서 이벤트 INSERT 실패 시 `cover_image_url`이 있으면 `deleteEventImageServer` 호출하여 고아 파일 정리 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음

**1-5. Phase 1 검증**

- [ ] `npm run validate` 실행 및 오류 수정 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음

---

### Phase 2: UX 품질 개선 (1주)

**목표**: 사용자 피드백(알림, 에러 메시지, 역할 표시)을 일관되게 정비하여 서비스 신뢰도를 높인다.
`alert()` 전량 제거, toast 시스템 도입, 이벤트 목록 역할 배지 추가.

**완료 기준**:

- 코드베이스 전체에서 `alert()`, `confirm()` 호출 0건
- 서버 액션 성공/실패 시 toast 알림 표시 (승인, 거절, 참여 취소, 이벤트 취소)
- 이벤트 목록 "전체 이벤트" 탭에서 본인 주최/참여 이벤트에 역할 배지 표시
- `approveParticipant` 실패 시 구체적 에러 메시지 (정원 초과, 이미 처리 등) 표시
- `npm run validate` 통과

#### 태스크

**2-1. Sonner(toast) 설치 및 설정**

- [ ] `npx shadcn@latest add sonner` 실행, `app/layout.tsx`에 `<Toaster />` 추가 | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🔴높음
- [ ] `lib/hooks/use-action-toast.ts` 신규 작성: 서버 액션 결과 `{ error: string } | { success: true }`를 받아 자동으로 toast 호출하는 유틸 훅 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음

**2-2. ParticipantList alert() → toast 전환**

- [ ] `components/events/participant-list.tsx` 수정: `handleApprove`, `handleReject` 내 `alert(result.error)` 제거, `toast.success` / `toast.error`로 교체 (승인 성공/실패, 거절 성공/실패 메시지 구체화) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음

**2-3. CancelEventButton, CancelParticipationButton toast 통일**

- [ ] `components/events/cancel-event-button.tsx` 수정: 이벤트 취소 성공/실패 toast 적용 (AlertDialog 유지) | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🟡중간
- [ ] `components/events/cancel-participation-button.tsx` 수정: 참여 취소 성공/실패 toast 적용 | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🟡중간

**2-4. 이벤트 목록 역할 배지 표시**

- [ ] `app/(protected)/events/actions.ts` 수정: `getAllEvents` 반환 타입에 `myRole?: 'host' | 'participant' | null` 추가, 현재 사용자의 host_id/참여 여부를 기준으로 필드 채움 | 담당: 풀스택 | 예상: 0.75d | 우선순위: 🟡중간
- [ ] `components/events/event-card.tsx` 수정: `myRole` prop 추가, `host`이면 "주최" 배지, `participant`이면 "참여 중" 배지를 카드 상단에 오버레이 표시 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [ ] `app/(protected)/events/page.tsx` 수정: 전체 이벤트 탭에서 `myRole` 전달 | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🟡중간

**2-5. 에러 메시지 구체화**

- [ ] `app/(protected)/events/actions.ts` 수정: `cancelParticipation`에서 이미 `cancelled` 상태 호출 시 `"이미 취소된 참여입니다."` 에러 추가 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🟡중간

**2-6. Phase 2 검증**

- [ ] 전체 코드베이스 `alert(` 문자열 grep 검색으로 잔존 여부 확인 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음
- [ ] `npm run validate` 실행 및 오류 수정 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음

---

### Phase 3: 신규 기능 추가 (2주)

**목표**: 실제 모임 운영에 필요한 4가지 신규 기능을 추가한다.
이벤트 복제로 반복 모임 생성 부담 감소, 필터/검색으로 이벤트 탐색 개선,
출석 체크와 거절 사유로 참여자 관리 깊이를 높인다.

**완료 기준**:

- 이벤트 상세 페이지 주최자 영역에 "이 이벤트 복제" 버튼 표시, 클릭 시 신규 이벤트 생성 폼 prefill
- 이벤트 목록 상단 필터 UI에서 검색어/상태 적용 후 결과 즉시 반영
- 참여자 관리 페이지 승인 목록에서 출석 체크 토글, DB 반영
- 거절 시 사유 입력 모달 표시, 거절 사유가 `event_participants.rejection_reason`에 저장됨
- `npm run validate` 통과

#### 태스크

**3-1. 이벤트 복제**

- [ ] `app/(protected)/events/actions.ts` 수정: `duplicateEvent` Server Action 구현 (source event_id로 기존 이벤트 조회, invite_code 신규 생성, status=`active`, 날짜/시간 초기화) | 담당: 풀스택 | 예상: 1d | 우선순위: 🔴높음
- [ ] `app/(protected)/events/[id]/page.tsx` 수정: 주최자 액션 영역에 "이 이벤트 복제" 버튼 추가, 클릭 시 `/events/new?from=[id]`로 이동 | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🔴높음
- [ ] `app/(protected)/events/new/page.tsx` 수정: `searchParams.from` 값이 있으면 `getEventById`로 원본 이벤트 조회 후 `EventForm` `defaultValues`로 전달 (단, `event_date`, `event_time`, `cover_image_url` 제외) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음

**3-2. 이벤트 목록 필터/검색**

- [ ] `app/(protected)/events/actions.ts` 수정: `getAllEvents` 함수에 `options?: { search?: string; status?: EventStatus }` 파라미터 추가, Supabase `.ilike`, `.eq` 체이닝으로 서버 사이드 필터 | 담당: 풀스택 | 예상: 1d | 우선순위: 🟡중간
- [ ] `components/events/event-filter.tsx` 신규 생성: 검색어 Input, 상태 Select로 구성된 클라이언트 컴포넌트, onChange 시 URL searchParams 업데이트 (`useRouter`) | 담당: 프론트엔드 | 예상: 1.5d | 우선순위: 🟡중간
- [ ] `app/(protected)/events/page.tsx` 수정: `searchParams` prop 추가, `EventFilter` 컴포넌트 삽입, 전체 이벤트 탭에 필터 파라미터 전달 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟡중간

**3-3. 출석 체크**

- [ ] Supabase migration: `event_participants` 테이블에 `attended boolean DEFAULT false` 컬럼 추가, RLS 정책 확인 (UPDATE는 host만 가능) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [ ] `lib/types/database.ts` 재생성: `npx supabase gen types typescript` 실행 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음
- [ ] `app/(protected)/events/actions.ts` 수정: `toggleAttendance(participantId, eventId, attended)` Server Action 추가 (host_id 검증 포함) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟡중간
- [ ] `app/(protected)/events/schemas.ts` 수정: `ParticipantWithProfile` 타입에 `attended: boolean` 필드 추가 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🟡중간
- [ ] `components/events/participant-list.tsx` 수정: `showAttendance?: boolean` prop 추가, approved 목록 각 행에 출석 Checkbox 표시 및 `toggleAttendance` 액션 연결 | 담당: 프론트엔드 | 예상: 0.75d | 우선순위: 🟡중간
- [ ] `app/(protected)/events/[id]/manage/page.tsx` 수정: approved 탭의 `ParticipantList`에 `showAttendance={true}` 전달 | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🟡중간

**3-4. 거절 사유 입력 및 표시**

- [ ] Supabase migration: `event_participants` 테이블에 `rejection_reason text DEFAULT NULL` 컬럼 추가 (3-3 migration과 함께 처리 권장) | 담당: 백엔드 | 예상: 0.25d | 우선순위: 🟡중간
- [ ] `lib/types/database.ts` 재생성 (3-3 처리 시 1회 통합 가능) | 담당: 풀스택 | 예상: 0d | 우선순위: 🔴높음
- [ ] `app/(protected)/events/actions.ts` 수정: `rejectParticipant` 시그니처에 `reason?: string` 파라미터 추가, UPDATE 시 `rejection_reason` 포함 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🟡중간
- [ ] `components/events/reject-dialog.tsx` 신규 생성: AlertDialog 기반, "거절 사유 (선택)" Textarea 포함, 확인 시 `rejectParticipant(id, eventId, reason)` 호출 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간
- [ ] `components/events/participant-list.tsx` 수정: 기존 "거절" 버튼을 `RejectDialog`로 교체, rejected 목록에서 `rejection_reason` 있으면 이름 아래 표시 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간

**3-5. Phase 3 검증**

- [ ] DB 컬럼 추가 후 타입 재생성 확인 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🔴높음
- [ ] `npm run validate` 실행 및 오류 수정 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음

---

### Phase 4: 고급 기능 (3~4주) — 선택적 구현

**목표**: 알림, 대기열 자동 승인, 이벤트 평가, QR 코드 체크인 등
운영 편의를 극대화하는 고급 기능을 단계적으로 추가한다.
Phase 1~3 완료 이후에 필요에 따라 선택적으로 구현한다.

**완료 기준 (하위 태스크별 독립 완료 가능)**:

- 알림: 참여 신청 시 주최자에게 인앱 알림 생성, 승인/거절 시 참여자 알림 생성
- 대기열: 정원 마감 이벤트에 "대기 등록" 기능, 승인 취소 시 대기자 자동 순번 알림
- 평가: completed 이벤트에 참여자 별점/코멘트 입력 가능
- QR 코드: 이벤트 초대 링크 기반 QR 코드 다운로드 버튼

#### 태스크

**4-1. 인앱 알림 시스템**

- [ ] Supabase migration: `notifications` 테이블 생성 (`id`, `user_id` FK, `event_id` FK, `type` text, `message` text, `is_read` boolean, `created_at`) | 담당: 백엔드 | 예상: 1d | 우선순위: 🟡중간
- [ ] RLS 정책: SELECT/UPDATE 본인 행만, INSERT는 서버 액션 전용 | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [ ] `app/(protected)/events/actions.ts` 수정: `joinEvent` 완료 후 주최자에게 알림 INSERT (`new_participant`), `approveParticipant`/`rejectParticipant` 완료 후 참여자에게 알림 INSERT | 담당: 풀스택 | 예상: 1d | 우선순위: 🟡중간
- [ ] `app/(protected)/layout.tsx` 수정: 네비게이션에 알림 벨 아이콘 추가, 미읽 알림 수 표시 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간
- [ ] `app/(protected)/notifications/page.tsx` 신규 생성: 알림 목록, 클릭 시 해당 이벤트로 이동 및 읽음 처리 | 담당: 풀스택 | 예상: 1.5d | 우선순위: 🟡중간

**4-2. 대기열 관리**

- [ ] Supabase migration: `event_participants` 테이블에 `queue_position integer DEFAULT NULL` 컬럼 추가 | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🟢낮음
- [ ] `app/(protected)/events/actions.ts` 수정: `joinEvent`에서 정원 초과 시 대기 등록 분기 추가 (queue_position 자동 부여, `approval` 이벤트에만 허용) | 담당: 풀스택 | 예상: 1.5d | 우선순위: 🟢낮음
- [ ] `app/(protected)/events/actions.ts` 수정: 참여 취소/거절 처리 시 대기열 1번 참여자에게 자동 알림 발송 | 담당: 풀스택 | 예상: 1d | 우선순위: 🟢낮음

**4-3. 이벤트 평가/리뷰**

- [ ] Supabase migration: `event_reviews` 테이블 생성 (`id`, `event_id` FK, `reviewer_id` FK, `rating` smallint, `comment` text, `created_at`) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🟢낮음
- [ ] `app/(protected)/events/actions.ts` 수정: `completeEvent` Server Action 추가 (주최자 전용, status → `completed`) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟢낮음
- [ ] 완료된 이벤트 상세 페이지에서 승인된 참여자에게 "평가 남기기" UI 추가 | 담당: 프론트엔드 | 예상: 1.5d | 우선순위: 🟢낮음

**4-4. QR 코드 체크인**

- [ ] `qrcode.react` npm 패키지 설치 | 담당: 풀스택 | 예상: 0.25d | 우선순위: 🟢낮음
- [ ] `components/events/invite-code-display.tsx` 수정: 초대 링크 URL 기반 QR 코드 생성 및 PNG 다운로드 버튼 추가 | 담당: 프론트엔드 | 예상: 0.75d | 우선순위: 🟢낮음

---

## 전체 일정 요약

| Phase   | 내용                                         | 기간  | 누적  | 우선순위 |
| ------- | -------------------------------------------- | ----- | ----- | -------- |
| Phase 1 | 버그 수정 및 엣지케이스 처리                 | 1주   | 1주   | 필수     |
| Phase 2 | UX 품질 개선 (toast, 역할 배지, 에러 메시지) | 1주   | 2주   | 필수     |
| Phase 3 | 신규 기능 (복제, 필터, 출석, 거절 사유)      | 2주   | 4주   | 권장     |
| Phase 4 | 고급 기능 (알림, 대기열, 평가, QR)           | 3~4주 | 7~8주 | 선택     |

> 1인 풀스택 개발 기준. Phase 3 하위 태스크는 독립적으로 병렬 진행 가능.

---

## 기술적 의존성

```
Phase 1 (버그 수정)
    |
    +-- Phase 2 (UX 개선)
            |
            +-- Phase 3 (신규 기능)
                    |
                    +-- 3-1 이벤트 복제       ← 독립
                    +-- 3-2 필터/검색         ← 독립
                    +-- 3-3 출석 체크         ← DB migration 선행 필요
                    +-- 3-4 거절 사유         ← DB migration 선행 필요 (3-3과 묶어서 처리 권장)
                            |
                            +-- Phase 4 (고급 기능)
```

**핵심 의존 관계**

- Phase 1 `host_id` 필드 추가 없이 invite 페이지 주최자 분기 불가
- Phase 3 출석 체크 / 거절 사유는 DB migration + 타입 재생성 선행 필수
- Phase 4 알림 시스템은 Phase 1의 서버 액션 구조 정비 이후 구현 권장
- Phase 4 대기열은 Phase 1 `joinEvent` 상태 검증 강화 이후 구현 필수

---

## 영향 받는 파일 요약

### Phase 1

| 파일                                      | 변경 유형 | 내용                                                                                                                                |
| ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `app/invite/[code]/page.tsx`              | 수정      | isHost 분기 추가, HostActionPanel 표시                                                                                              |
| `app/(protected)/events/schemas.ts`       | 수정      | InviteEventData에 host_id 추가                                                                                                      |
| `app/(protected)/events/actions.ts`       | 수정      | getEventByInviteCode host_id 포함, joinEvent 상태 검증, approveParticipant/rejectParticipant 이중처리 방지, createEvent 이미지 롤백 |
| `components/events/host-action-panel.tsx` | 신규      | invite 페이지 주최자용 관리 액션 패널                                                                                               |
| `lib/supabase/storage-server.ts`          | 신규      | 서버 액션용 이미지 삭제 헬퍼                                                                                                        |

### Phase 2

| 파일                                                | 변경 유형 | 내용                                                         |
| --------------------------------------------------- | --------- | ------------------------------------------------------------ |
| `app/layout.tsx`                                    | 수정      | Sonner Toaster 추가                                          |
| `lib/hooks/use-action-toast.ts`                     | 신규      | 서버 액션 결과 → toast 연결 유틸 훅                          |
| `components/events/participant-list.tsx`            | 수정      | alert() 제거, toast 전환                                     |
| `components/events/cancel-event-button.tsx`         | 수정      | toast 통일                                                   |
| `components/events/cancel-participation-button.tsx` | 수정      | toast 통일                                                   |
| `app/(protected)/events/actions.ts`                 | 수정      | getAllEvents myRole 반환, cancelParticipation 상태 검증 추가 |
| `components/events/event-card.tsx`                  | 수정      | myRole prop 추가, 역할 배지 표시                             |
| `app/(protected)/events/page.tsx`                   | 수정      | myRole 전달                                                  |

### Phase 3

| 파일                                          | 변경 유형 | 내용                                                                                        |
| --------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `app/(protected)/events/actions.ts`           | 수정      | duplicateEvent, toggleAttendance, rejectParticipant reason 추가, getAllEvents 필터 파라미터 |
| `app/(protected)/events/new/page.tsx`         | 수정      | ?from= 파라미터로 복제 prefill                                                              |
| `app/(protected)/events/[id]/page.tsx`        | 수정      | 복제 버튼 추가                                                                              |
| `app/(protected)/events/schemas.ts`           | 수정      | ParticipantWithProfile에 attended 필드 추가                                                 |
| `components/events/event-filter.tsx`          | 신규      | 필터/검색 UI 컴포넌트                                                                       |
| `components/events/reject-dialog.tsx`         | 신규      | 거절 사유 입력 AlertDialog                                                                  |
| `components/events/participant-list.tsx`      | 수정      | 출석 체크박스, RejectDialog 연결, rejection_reason 표시                                     |
| `app/(protected)/events/[id]/manage/page.tsx` | 수정      | showAttendance prop 전달                                                                    |
| `app/(protected)/events/page.tsx`             | 수정      | searchParams 기반 필터 전달                                                                 |
| `lib/types/database.ts`                       | 재생성    | attended, rejection_reason 컬럼 타입 갱신                                                   |

---

## 리스크 및 완화 전략

| 리스크                                                       | 영향도 | 발생 가능성 | 완화 전략                                                                                                     |
| ------------------------------------------------------------ | ------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `approveParticipant` Race Condition (동시 요청 시 정원 초과) | 높음   | 중간        | DB 레벨 `CHECK` 제약 또는 PostgreSQL function + `LOCK` 활용, Phase 1 구현 전 방식 결정 필수                   |
| 이미지 롤백 실패 (Storage 삭제 중 에러)                      | 중간   | 낮음        | 삭제 실패 시 로그만 기록하고 사용자에게는 이벤트 저장 성공으로 처리, 고아 파일은 정기 정리 스크립트 별도 운영 |
| Phase 3 DB migration 후 타입 미갱신                          | 중간   | 높음        | migration 이후 즉시 `npx supabase gen types typescript` 실행 규칙 문서화                                      |
| Sonner toast와 기존 폼 에러 UI 이중 표시                     | 낮음   | 중간        | 서버 액션 에러는 toast 전담, 폼 검증 에러는 인라인 유지로 역할 분리 명확화                                    |
| Phase 4 알림 테이블 RLS 정책 복잡도                          | 중간   | 중간        | 알림 INSERT를 서버 액션에서 직접 처리하고 `auth.uid()` 기반 정책으로 설계                                     |

---

## 보류 사항 및 미결 질문

### 결정 필요 사항

1. **approveParticipant Race Condition 처리 방식**: 서버 액션의 `count → update` 패턴은 동시 요청 시 Race Condition 발생 가능.
   DB 트리거(`BEFORE UPDATE`)로 정원 체크하거나 PostgreSQL 함수 + `FOR UPDATE` LOCK 적용 여부 결정 필요.
   → **Phase 1 구현 전 결정 권장**

2. **이벤트 복제 시 날짜 처리**: 복제된 이벤트의 날짜를 빈값으로 강제 리셋할지,
   기존 날짜 유지 후 사용자가 직접 수정하도록 할지.
   (현재 설계: 빈값 리셋 — 이미 지난 날짜로 생성되는 것 방지)

3. **Phase 3 필터/검색 적용 범위**: "전체 이벤트" 탭에만 적용할지, "내 이벤트", "참여 중" 탭에도 적용할지.
   (현재 설계: 전체 이벤트 탭에만 적용)

### 범위 외 기능 (v3 이후)

- 이메일/푸시 알림 (Supabase Edge Function + resend 또는 APNS/FCM)
- 이벤트 공개 목록 (현재는 초대 코드로만 접근)
- 프로필 상세 관리 (아바타 업로드, 자기소개)
- 카풀 매칭, 정산/결제 연동

---

## 변경 이력

| 버전 | 날짜       | 변경 내용                                                                                                                                                 |
| ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v2.0 | 2026-02-26 | v1 Phase 0~4 완료 기준으로 v2 최초 작성. Phase 1(버그/엣지케이스), Phase 2(UX 통일), Phase 3(신규 기능), Phase 4(고급 기능) 4단계 로드맵 설계. 배포 제외. |
