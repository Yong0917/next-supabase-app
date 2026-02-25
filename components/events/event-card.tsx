import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event, EventStatus } from "@/lib/types";

// 이벤트 상태별 Badge variant 매핑
const statusVariantMap: Record<
  EventStatus,
  "default" | "destructive" | "secondary"
> = {
  active: "default",
  cancelled: "destructive",
  completed: "secondary",
};

const statusLabelMap: Record<EventStatus, string> = {
  active: "진행 중",
  cancelled: "취소됨",
  completed: "완료",
};

interface EventCardProps {
  event: Event;
  participantCount?: number;
}

export function EventCard({ event, participantCount }: EventCardProps) {
  const formattedDate = new Date(event.event_date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`/protected/events/${event.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <CardTitle className="text-base font-semibold leading-snug">
            {event.title}
          </CardTitle>
          <Badge
            variant={statusVariantMap[event.status]}
            className="shrink-0 text-xs"
          >
            {statusLabelMap[event.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>{formattedDate}</p>
          {event.location && <p>{event.location}</p>}
          <p>
            {participantCount !== undefined ? `${participantCount}명` : ""}
            {event.max_capacity ? ` / 최대 ${event.max_capacity}명` : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
