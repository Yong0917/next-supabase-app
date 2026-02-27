"use client";

import Link from "next/link";

import { CancelEventButton } from "@/components/events/cancel-event-button";
import { Button } from "@/components/ui/button";

interface HostActionPanelProps {
  eventId: string;
}

export function HostActionPanel({ eventId }: HostActionPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        주최자로 참여 중인 이벤트입니다.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href={`/events/${eventId}/manage`}>참여자 관리</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/events/${eventId}/edit`}>수정</Link>
        </Button>
        <CancelEventButton eventId={eventId} />
      </div>
    </div>
  );
}
