"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteComment } from "@/app/(protected)/events/[id]/announcements/actions";
import { Button } from "@/components/ui/button";

interface DeleteCommentButtonProps {
  commentId: string;
  announcementId: string;
}

export function DeleteCommentButton({
  commentId,
  announcementId,
}: DeleteCommentButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    // 간단한 confirm으로 삭제 확인 (댓글은 경량화)
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    setIsPending(true);
    const result = await deleteComment(commentId);
    setIsPending(false);

    if ("error" in result) {
      alert(result.error);
    } else {
      // 댓글 목록 갱신
      router.refresh();
    }
  };

  // announcementId는 revalidatePath용으로 actions.ts에서 사용하지만
  // 클라이언트에서도 참조 가능하도록 prop으로 유지
  void announcementId;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto px-2 py-0.5 text-xs text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "삭제 중..." : "삭제"}
    </Button>
  );
}
