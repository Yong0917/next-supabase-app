"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  AnnouncementFormSchema,
  CommentFormSchema,
  type AnnouncementDetail,
  type AnnouncementFormValues,
  type AnnouncementWithCommentCount,
  type CommentFormValues,
  type CommentWithAuthor,
} from "./schemas";

// 공지 목록 조회 (댓글 수 + 작성자 프로필 포함)
export async function getAnnouncements(
  eventId: string,
): Promise<AnnouncementWithCommentCount[] | { error: string }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  // 공지 목록 조회 (최신순)
  const { data: announcements, error: announcementsError } = await supabase
    .from("announcements")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (announcementsError) {
    return { error: "공지 목록을 불러오는 데 실패했습니다." };
  }

  if (!announcements || announcements.length === 0) {
    return [];
  }

  // 작성자 ID 목록 추출 (중복 제거)
  const authorIds = [...new Set(announcements.map((a) => a.author_id))];

  // 공지 ID 목록 추출
  const announcementIds = announcements.map((a) => a.id);

  // 작성자 프로필 + 댓글 목록을 병렬로 조회
  const [profilesResult, commentsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name")
      .in("id", authorIds),
    supabase
      .from("announcement_comments")
      .select("announcement_id")
      .in("announcement_id", announcementIds),
  ]);

  // 프로필 맵 생성 (id → profile)
  const profileMap = new Map((profilesResult.data ?? []).map((p) => [p.id, p]));

  // 공지별 댓글 수 집계
  const commentCountMap = new Map<string, number>();
  for (const comment of commentsResult.data ?? []) {
    const prev = commentCountMap.get(comment.announcement_id) ?? 0;
    commentCountMap.set(comment.announcement_id, prev + 1);
  }

  // 결과 조립
  return announcements.map((announcement) => ({
    ...announcement,
    commentCount: commentCountMap.get(announcement.id) ?? 0,
    author: profileMap.get(announcement.author_id) ?? null,
  }));
}

// 공지 상세 조회 (댓글 목록 + 작성자 프로필 포함)
export async function getAnnouncementById(
  announcementId: string,
): Promise<AnnouncementDetail | { error: string }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  // 공지 조회
  const { data: announcement, error: announcementError } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", announcementId)
    .single();

  if (announcementError || !announcement) {
    return { error: "공지를 찾을 수 없습니다." };
  }

  // 댓글 목록 조회
  const { data: comments, error: commentsError } = await supabase
    .from("announcement_comments")
    .select("*")
    .eq("announcement_id", announcementId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    return { error: "댓글 목록을 불러오는 데 실패했습니다." };
  }

  // 작성자 ID 목록 (공지 작성자 + 댓글 작성자, 중복 제거)
  const commentAuthorIds = (comments ?? []).map((c) => c.author_id);
  const allAuthorIds = [
    ...new Set([announcement.author_id, ...commentAuthorIds]),
  ];

  // 프로필 일괄 조회
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .in("id", allAuthorIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // 댓글에 작성자 정보 조립
  const commentsWithAuthor: CommentWithAuthor[] = (comments ?? []).map(
    (comment) => ({
      ...comment,
      author: profileMap.get(comment.author_id) ?? null,
    }),
  );

  return {
    ...announcement,
    author: profileMap.get(announcement.author_id) ?? null,
    comments: commentsWithAuthor,
  };
}

// 공지 생성 (주최자만 가능)
export async function createAnnouncement(
  eventId: string,
  formData: AnnouncementFormValues,
): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 주최자 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { error: "주최자만 공지를 작성할 수 있습니다." };
  }

  // 입력값 유효성 검사
  const validated = AnnouncementFormSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // 공지 삽입
  const { data: inserted, error: insertError } = await supabase
    .from("announcements")
    .insert({
      event_id: eventId,
      author_id: userId,
      title: validated.data.title,
      content: validated.data.content,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: "공지 작성에 실패했습니다. 다시 시도해주세요." };
  }

  redirect(`/events/${eventId}/announcements/${inserted.id}`);
}

// 공지 수정 (주최자만 가능)
export async function updateAnnouncement(
  announcementId: string,
  formData: AnnouncementFormValues,
): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 공지 조회 및 작성자 검증
  const { data: announcement, error: fetchError } = await supabase
    .from("announcements")
    .select("author_id, event_id")
    .eq("id", announcementId)
    .single();

  if (fetchError || !announcement) {
    return { error: "공지를 찾을 수 없습니다." };
  }

  if (announcement.author_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  // 입력값 유효성 검사
  const validated = AnnouncementFormSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // 공지 업데이트
  const { error: updateError } = await supabase
    .from("announcements")
    .update({
      title: validated.data.title,
      content: validated.data.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", announcementId);

  if (updateError) {
    return { error: "공지 수정에 실패했습니다. 다시 시도해주세요." };
  }

  redirect(`/events/${announcement.event_id}/announcements/${announcementId}`);
}

// 공지 삭제 (작성자 검증 후 삭제)
export async function deleteAnnouncement(
  announcementId: string,
): Promise<{ error: string } | { success: true; eventId: string }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 공지 조회 및 작성자 검증
  const { data: announcement, error: fetchError } = await supabase
    .from("announcements")
    .select("author_id, event_id")
    .eq("id", announcementId)
    .single();

  if (fetchError || !announcement) {
    return { error: "공지를 찾을 수 없습니다." };
  }

  if (announcement.author_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  // 공지 삭제
  const { error: deleteError } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (deleteError) {
    return { error: "공지 삭제에 실패했습니다. 다시 시도해주세요." };
  }

  return { success: true as const, eventId: announcement.event_id };
}

// 댓글 작성 (승인된 참여자 또는 주최자만 가능)
export async function createComment(
  announcementId: string,
  formData: CommentFormValues,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 공지에서 event_id 조회
  const { data: announcement, error: announcementError } = await supabase
    .from("announcements")
    .select("event_id")
    .eq("id", announcementId)
    .single();

  if (announcementError || !announcement) {
    return { error: "공지를 찾을 수 없습니다." };
  }

  const eventId = announcement.event_id;

  // 주최자 여부 + 참여 상태를 병렬 조회
  const [eventResult, participantResult] = await Promise.all([
    supabase.from("events").select("host_id").eq("id", eventId).single(),
    supabase
      .from("event_participants")
      .select("status")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const isHost = eventResult.data?.host_id === userId;
  const isApprovedParticipant = participantResult.data?.status === "approved";

  if (!isHost && !isApprovedParticipant) {
    return { error: "댓글은 주최자 또는 승인된 참여자만 작성할 수 있습니다." };
  }

  // 입력값 유효성 검사
  const validated = CommentFormSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // 댓글 삽입
  const { error: insertError } = await supabase
    .from("announcement_comments")
    .insert({
      announcement_id: announcementId,
      author_id: userId,
      content: validated.data.content,
    });

  if (insertError) {
    return { error: "댓글 작성에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/events/${eventId}/announcements/${announcementId}`);
  return { success: true };
}

// 댓글 삭제 (작성자만 가능)
export async function deleteComment(
  commentId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 댓글 조회 및 작성자 검증
  const { data: comment, error: fetchError } = await supabase
    .from("announcement_comments")
    .select("author_id, announcement_id")
    .eq("id", commentId)
    .single();

  if (fetchError || !comment) {
    return { error: "댓글을 찾을 수 없습니다." };
  }

  if (comment.author_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  // 공지에서 event_id 조회 (revalidatePath 경로 구성용)
  const { data: announcement } = await supabase
    .from("announcements")
    .select("event_id")
    .eq("id", comment.announcement_id)
    .single();

  // 댓글 삭제
  const { error: deleteError } = await supabase
    .from("announcement_comments")
    .delete()
    .eq("id", commentId);

  if (deleteError) {
    return { error: "댓글 삭제에 실패했습니다. 다시 시도해주세요." };
  }

  // 공지 상세 페이지 캐시 무효화
  if (announcement?.event_id) {
    revalidatePath(
      `/events/${announcement.event_id}/announcements/${comment.announcement_id}`,
    );
  }

  return { success: true };
}
