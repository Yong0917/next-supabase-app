import Link from "next/link";
import { MessageSquare } from "lucide-react";

import type { AnnouncementWithCommentCount } from "@/app/(protected)/events/[id]/announcements/schemas";
import { DeleteAnnouncementButton } from "./delete-announcement-button";
import { Button } from "@/components/ui/button";

interface AnnouncementCardProps {
  announcement: AnnouncementWithCommentCount;
  eventId: string;
  currentUserId: string;
  isHost: boolean;
}

export function AnnouncementCard({
  announcement,
  eventId,
  currentUserId,
  isHost,
}: AnnouncementCardProps) {
  // 수정/삭제 권한 판단: 주최자이거나 본인이 작성한 공지
  const canModify = isHost || announcement.author_id === currentUserId;

  const formattedDate = new Date(announcement.created_at).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const authorName =
    announcement.author?.full_name ??
    announcement.author?.username ??
    "알 수 없음";

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/events/${eventId}/announcements/${announcement.id}`}
        className="block"
      >
        {/* 공지 제목 */}
        <h3 className="mb-2 font-semibold leading-snug hover:underline">
          {announcement.title}
        </h3>

        {/* 작성자 및 날짜 정보 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{authorName}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          <span>·</span>
          {/* 댓글 수 */}
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {announcement.commentCount}
          </span>
        </div>
      </Link>

      {/* 수정/삭제 버튼 (권한 있는 경우에만 표시) */}
      {canModify && (
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/events/${eventId}/announcements/${announcement.id}/edit`}
            >
              수정
            </Link>
          </Button>
          <DeleteAnnouncementButton
            announcementId={announcement.id}
            eventId={eventId}
          />
        </div>
      )}
    </div>
  );
}
