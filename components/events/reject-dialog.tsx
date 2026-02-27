"use client";

import { useState } from "react";

import { rejectParticipant } from "@/app/(protected)/events/actions";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/lib/hooks/use-action-toast";

interface RejectDialogProps {
  participantId: string;
  eventId: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function RejectDialog({
  participantId,
  eventId,
  disabled,
  onSuccess,
}: RejectDialogProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { handleResult } = useActionToast();

  const handleConfirm = async () => {
    setIsLoading(true);
    const result = await rejectParticipant(
      participantId,
      eventId,
      reason || undefined,
    );
    setIsLoading(false);

    handleResult(result, "거절 처리되었습니다.");

    if ("success" in result) {
      setReason("");
      onSuccess?.();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          거절
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>참여 신청 거절</AlertDialogTitle>
          <AlertDialogDescription>
            거절 사유를 입력하면 참여자에게 표시됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="reject-reason">거절 사유 (선택)</Label>
          <Textarea
            id="reject-reason"
            placeholder="거절 사유를 입력하세요 (선택)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "처리 중..." : "거절"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
