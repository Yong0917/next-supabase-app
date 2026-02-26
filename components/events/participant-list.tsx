"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ParticipantWithProfile } from "@/app/(protected)/events/schemas";
import {
  approveParticipant,
  rejectParticipant,
} from "@/app/(protected)/events/actions";
import { ParticipantStatusBadge } from "./participant-status-badge";
import { Button } from "@/components/ui/button";

interface ParticipantListProps {
  participants: ParticipantWithProfile[];
  eventId: string;
  // pending 탭에서만 승인/거절 버튼 표시
  showActions?: boolean;
}

export function ParticipantList({
  participants,
  eventId,
  showActions = false,
}: ParticipantListProps) {
  const router = useRouter();
  // 개별 처리 중 상태 관리 (participantId → boolean)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const setLoading = (id: string, loading: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (loading) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleApprove = async (participantId: string) => {
    setLoading(participantId, true);
    const result = await approveParticipant(participantId, eventId);
    setLoading(participantId, false);

    if ("error" in result) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  const handleReject = async (participantId: string) => {
    setLoading(participantId, true);
    const result = await rejectParticipant(participantId, eventId);
    setLoading(participantId, false);

    if ("error" in result) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  if (participants.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        해당하는 참여자가 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {participants.map((participant) => {
        const isLoading = pendingIds.has(participant.id);
        const displayName =
          participant.profile?.full_name ??
          participant.profile?.username ??
          participant.email ??
          "알 수 없음";

        const formattedDate = new Date(participant.joinedAt).toLocaleDateString(
          "ko-KR",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        );

        return (
          <li
            key={participant.id}
            className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3"
          >
            {/* 참여자 정보 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{displayName}</span>
                <ParticipantStatusBadge status={participant.status} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                신청일: {formattedDate}
              </p>
            </div>

            {/* 승인/거절 버튼 (pending 탭에서만 표시) */}
            {showActions && participant.status === "pending" && (
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(participant.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "처리 중..." : "승인"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(participant.id)}
                  disabled={isLoading}
                >
                  거절
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
