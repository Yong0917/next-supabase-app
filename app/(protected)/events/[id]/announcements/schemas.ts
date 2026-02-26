import { z } from "zod";

import type { Announcement, AnnouncementComment, Profile } from "@/lib/types";

// 공지 폼 Zod 스키마
export const AnnouncementFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(100, "제목은 100자 이하로 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
});

export type AnnouncementFormValues = z.infer<typeof AnnouncementFormSchema>;

// 댓글 폼 Zod 스키마
export const CommentFormSchema = z.object({
  content: z
    .string()
    .min(1, "댓글을 입력해주세요.")
    .max(500, "댓글은 500자 이하로 입력해주세요."),
});

export type CommentFormValues = z.infer<typeof CommentFormSchema>;

// 작성자 프로필 요약 타입
type AuthorProfile = Pick<Profile, "id" | "username" | "full_name">;

// 공지 목록 아이템 타입 (댓글 수 + 작성자 포함)
export type AnnouncementWithCommentCount = Announcement & {
  commentCount: number;
  author: AuthorProfile | null;
};

// 댓글 + 작성자 타입
export type CommentWithAuthor = AnnouncementComment & {
  author: AuthorProfile | null;
};

// 공지 상세 타입 (댓글 목록 + 작성자 포함)
export type AnnouncementDetail = Announcement & {
  author: AuthorProfile | null;
  comments: CommentWithAuthor[];
};
