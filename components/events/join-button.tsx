"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { joinEvent } from "@/app/(protected)/events/actions";
import { Button } from "@/components/ui/button";
import type { EventStatus, ParticipantStatus } from "@/lib/types";

interface JoinButtonProps {
  inviteCode: string;
  // 서버 컴포넌트에서 인증 상태를 판단하여 주입
  isLoggedIn: boolean;
  // "none": 아직 신청하지 않은 상태
  currentStatus: ParticipantStatus | "none";
  isFull: boolean;
  eventStatus: EventStatus;
}

export function JoinButton({
  inviteCode,
  isLoggedIn,
  currentStatus,
  isFull,
  eventStatus,
}: JoinButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 이벤트가 취소된 경우
  if (eventStatus !== "active") {
    return (
      <Button className="w-full" disabled>
        이벤트 취소됨
      </Button>
    );
  }

  // 비로그인 사용자: 현재 경로를 next로 저장하고 로그인 페이지로 이동
  if (!isLoggedIn) {
    const loginUrl = `/auth/login?next=${encodeURIComponent(pathname)}`;
    return (
      <Button className="w-full" onClick={() => router.push(loginUrl)}>
        로그인하고 참여 신청
      </Button>
    );
  }

  // 이미 승인 대기 중
  if (currentStatus === "pending") {
    return (
      <Button className="w-full" disabled variant="outline">
        승인 대기 중
      </Button>
    );
  }

  // 이미 승인됨
  if (currentStatus === "approved") {
    return (
      <Button className="w-full" disabled variant="outline">
        참여 승인됨
      </Button>
    );
  }

  // 정원 마감 (아직 신청하지 않은 상태에서만)
  if (isFull && currentStatus === "none") {
    return (
      <Button className="w-full" disabled variant="outline">
        정원 마감
      </Button>
    );
  }

  // 참여 신청 가능 상태 (none, rejected, cancelled)
  const handleJoin = async () => {
    setIsPending(true);
    setError(null);
    const result = await joinEvent(inviteCode);
    // joinEvent는 성공 시 redirect()를 호출하므로 여기에 도달하면 에러
    if (result && "error" in result) {
      setError(result.error);
    }
    setIsPending(false);
  };

  const buttonLabel =
    currentStatus === "rejected"
      ? "거절됨 (재신청)"
      : currentStatus === "cancelled"
        ? "참여 신청 (재신청)"
        : "참여 신청";

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={handleJoin} disabled={isPending}>
        {isPending ? "처리 중..." : buttonLabel}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
