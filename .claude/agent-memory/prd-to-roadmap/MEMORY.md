# PRD to Roadmap - 에이전트 메모리

## 프로젝트 도메인 정보

- **서비스**: 소규모 모임 매니저 MVP (이벤트 생성, 초대 코드, 참여자 관리, 공지)
- **핵심 도메인 용어**: 이벤트(event), 초대 코드(invite_code), 참여자(participant), 공지(announcement), 댓글(comment), 주최자(host), 참여 방식(join_policy: open/approval)

## 기술 결정 사항

- **서버 액션 파일 위치**: `app/protected/events/actions.ts` (이벤트/참여), `app/protected/events/[id]/announcements/actions.ts` (공지/댓글)
- **폼 관리**: React Hook Form 7.x + Zod (PRD에서 확정)
- **자동 승인 처리**: DB 트리거보다 서버 액션에서 join_policy 분기 처리를 권장 (디버깅 용이)
- **미들웨어 예외**: `/invite/*` 경로는 `lib/supabase/proxy.ts`에서 인증 예외 처리 필요

## Phase 구성 패턴 (이 프로젝트에서 성공적으로 사용됨)

```
Phase 0: DB 스키마 + 타입 (독립 완료 후 이후 Phase 진행 가능)
Phase 1: 핵심 CRUD (이벤트)
Phase 2: 외부 접근 + 참여 시스템 (미들웨어 수정 포함)
Phase 3: 소통 기능 (공지 + 댓글)
Phase 4: 관리 기능 (참여자 관리)
Phase 5: 마무리 + 배포
```

## 자주 누락되는 요구사항 체크리스트

- [ ] cascade 삭제 설정 (공지 삭제 시 댓글 자동 삭제 등)
- [ ] 재신청 허용 여부 (취소 후 동일 이벤트 재신청 UPSERT vs INSERT)
- [ ] 최대 인원 초과 시 승인 버튼 처리 방식 (에러 vs 비활성화)
- [ ] 완료(completed) 상태의 MVP 포함 여부
- [ ] 댓글 작성자 표시 필드 (full_name vs username)

## 태스크 복잡도 산정 기준 (이 프로젝트)

- Server Action 1개: 0.5d (단순) ~ 1d (검증 + 권한 체크 포함)
- 폼 컴포넌트 (RHF + Zod): 1~2d
- 페이지 (서버 컴포넌트 + 조건부 UI): 1~2d
- RLS 정책 테이블당: 0.5~1d
- 역할 기반 조건부 UI 페이지 (주최자/승인참여자/대기참여자 분기): 2d

## 관련 파일

- PRD: `docs/PRD.md`
- 로드맵: `docs/ROADMAP_v1.md`
