"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cancelEvent } from "@/app/protected/events/actions";
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

interface CancelEventButtonProps {
  eventId: string;
}

export function CancelEventButton({ eventId }: CancelEventButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleCancel = async () => {
    setIsPending(true);
    const result = await cancelEvent(eventId);
    setIsPending(false);

    if ("error" in result) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isPending}>
          이벤트 취소
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이벤트를 취소하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            취소된 이벤트는 복구할 수 없습니다. 참여자들에게도 취소 상태가
            표시됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>돌아가기</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={isPending}>
            {isPending ? "처리 중..." : "취소 확인"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
