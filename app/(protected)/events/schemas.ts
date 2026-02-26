import { z } from "zod";

import type { Event, EventParticipant, ParticipantStatus } from "@/lib/types";

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
