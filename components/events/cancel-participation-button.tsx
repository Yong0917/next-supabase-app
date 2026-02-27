"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cancelParticipation } from "@/app/(protected)/events/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
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

interface CancelParticipationButtonProps {
  eventId: string;
}

export function CancelParticipationButton({
  eventId,
}: CancelParticipationButtonProps) {
  const router = useRouter();
  const { handleResult } = useActionToast();
  const [isPending, setIsPending] = useState(false);

  const handleCancel = async () => {
    setIsPending(true);
    const result = await cancelParticipation(eventId);
    setIsPending(false);

    handleResult(result, "참여가 취소되었습니다.");
    if ("success" in result) {
      router.refresh();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          참여 취소
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>참여를 취소하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            참여를 취소하면 주최자의 재승인이 필요할 수 있습니다.
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
