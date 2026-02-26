import type { CommentWithAuthor } from "@/app/(protected)/events/[id]/announcements/schemas";
import { DeleteCommentButton } from "./delete-comment-button";

interface CommentListProps {
  comments: CommentWithAuthor[];
  currentUserId: string;
  announcementId: string;
}

export function CommentList({
  comments,
  currentUserId,
  announcementId,
}: CommentListProps) {
  // 댓글이 없을 경우 안내 메시지 표시
  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        아직 댓글이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const authorName =
          comment.author?.full_name ?? comment.author?.username ?? "알 수 없음";

        const formattedDate = new Date(comment.created_at).toLocaleDateString(
          "ko-KR",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        );

        const isMyComment = comment.author_id === currentUserId;

        return (
          <div key={comment.id} className="rounded-md border bg-muted/30 p-3">
            {/* 댓글 헤더: 작성자 + 날짜 */}
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {authorName}
                </span>
                <span>·</span>
                <span>{formattedDate}</span>
              </div>

              {/* 본인 댓글 삭제 버튼 */}
              {isMyComment && (
                <DeleteCommentButton
                  commentId={comment.id}
                  announcementId={announcementId}
                />
              )}
            </div>

            {/* 댓글 내용 */}
            <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
          </div>
        );
      })}
    </div>
  );
}
