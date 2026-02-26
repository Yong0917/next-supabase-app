import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getEventById } from "../../../actions";
import { createComment, getAnnouncementById } from "../actions";
import { DeleteAnnouncementButton } from "@/components/events/announcements/delete-announcement-button";
import { CommentForm } from "@/components/events/announcements/comment-form";
import { CommentList } from "@/components/events/announcements/comment-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import type { CommentFormValues } from "@/app/(protected)/events/[id]/announcements/schemas";

interface AnnouncementDetailPageProps {
  params: Promise<{ id: string; announcementId: string }>;
}

export default async function AnnouncementDetailPage({
  params,
}: AnnouncementDetailPageProps) {
  const { id, announcementId } = await params;

  // 현재 사용자 인증 확인
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const currentUserId = authData.claims.sub;

  // 이벤트 역할 + 공지 상세를 병렬 조회
  const [eventResult, announcementResult] = await Promise.all([
    getEventById(id),
    getAnnouncementById(announcementId),
  ]);

  if ("error" in eventResult) {
    notFound();
  }

  if ("error" in announcementResult) {
    notFound();
  }

  const { event, role, participantStatus } = eventResult;
  const announcement = announcementResult;

  // 접근 권한 판단
  const canAccess =
    role === "host" ||
    (role === "participant" && participantStatus === "approved");

  if (!canAccess) {
    // 미승인 참여자는 공지 목록으로 이동 (목록에서 안내 메시지 표시)
    redirect(`/events/${id}/announcements`);
  }

  // 수정/삭제 권한 판단
  const canModify = role === "host" || announcement.author_id === currentUserId;

  const formattedDate = new Date(announcement.created_at).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const authorName =
    announcement.author?.full_name ??
    announcement.author?.username ??
    "알 수 없음";

  // Server Action을 공지 ID에 바인딩
  const boundCreateComment = createComment.bind(null, announcementId) as (
    data: CommentFormValues,
  ) => Promise<{ error?: string } | { success: true }>;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* 브레드크럼 */}
      <div className="text-sm text-muted-foreground">
        <Link href={`/events/${id}`} className="hover:underline">
          {event.title}
        </Link>
        {" › "}
        <Link href={`/events/${id}/announcements`} className="hover:underline">
          공지사항
        </Link>
      </div>

      {/* 공지 헤더 */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-snug">
            {announcement.title}
          </h1>

          {/* 수정/삭제 버튼 (권한 있는 경우에만) */}
          {canModify && (
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/events/${id}/announcements/${announcementId}/edit`}
                >
                  수정
                </Link>
              </Button>
              <DeleteAnnouncementButton
                announcementId={announcementId}
                eventId={id}
              />
            </div>
          )}
        </div>

        {/* 작성자 및 날짜 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{authorName}</span>
          <span>·</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      <Separator />

      {/* 공지 내용 */}
      <div className="min-h-[120px] whitespace-pre-wrap text-sm leading-relaxed">
        {announcement.content}
      </div>

      <Separator />

      {/* 댓글 섹션 */}
      <div className="space-y-4">
        <h2 className="font-semibold">
          댓글{" "}
          {announcement.comments.length > 0 &&
            `(${announcement.comments.length})`}
        </h2>

        {/* 댓글 목록 */}
        <CommentList
          comments={announcement.comments}
          currentUserId={currentUserId}
          announcementId={announcementId}
        />

        {/* 댓글 작성 폼 */}
        <CommentForm action={boundCreateComment} />
      </div>
    </div>
  );
}
