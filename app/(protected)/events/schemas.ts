import { z } from "zod";

import type {
  Event,
  EventParticipant,
  EventStatus,
  JoinPolicy,
  ParticipantStatus,
  Profile,
} from "@/lib/types";

// 이벤트 폼 Zod 스키마 (클라이언트/서버 공용)
export const EventFormSchema = z.object({
  title: z.string().min(2, "제목은 2자 이상 입력해주세요."),
  description: z.string().optional(),
  event_date: z.string().min(1, "날짜를 선택해주세요."),
  event_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "올바른 시간 형식을 입력해주세요."),
  location: z.string().optional(),
  max_capacity: z.coerce
    .number()
    .int()
    .positive("최대 인원은 1 이상이어야 합니다.")
    .optional(),
  join_policy: z.enum(["open", "approval"], {
    error: "참여 방식을 선택해주세요.",
  }),
  // 커버 이미지 URL (업로드 후 Storage에서 반환된 공개 URL)
  cover_image_url: z.string().url().optional().nullable(),
});

export type EventFormValues = z.infer<typeof EventFormSchema>;

// 이벤트 상세 조회 반환 타입
export type EventWithRole = {
  event: Event;
  role: "host" | "participant" | "none";
  participantStatus: ParticipantStatus | null;
  participantCount: number;
};

// 참여 이벤트 조회 반환 타입 (event_participants + events join)
export type ParticipatingEvent = EventParticipant & {
  event: Event;
};

// 참여자 + 프로필 조합 타입 (참여자 관리 UI용)
export type ParticipantWithProfile = {
  id: string;
  userId: string;
  status: ParticipantStatus;
  joinedAt: string;
  profile: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
  email: string | null;
};

// 초대 코드로 조회한 이벤트 정보 반환 타입 (공개 미리보기용)
export type InviteEventData = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  max_capacity: number | null;
  join_policy: JoinPolicy;
  status: EventStatus;
  cover_image_url: string | null;
  invite_code: string;
  participantCount: number;
};
