"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteAnnouncement } from "@/app/(protected)/events/[id]/announcements/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteAnnouncementButtonProps {
  announcementId: string;
  eventId: string;
}

export function DeleteAnnouncementButton({
  announcementId,
  eventId,
}: DeleteAnnouncementButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    const result = await deleteAnnouncement(announcementId);
    setIsPending(false);

    if ("error" in result) {
      alert(result.error);
    } else {
      // 공지 목록 페이지로 이동
      router.push(`/events/${eventId}/announcements`);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isPending}>
          삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>공지를 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            삭제된 공지와 댓글은 복구할 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? "삭제 중..." : "삭제 확인"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
