import Image from "next/image";
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
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {/* 커버 이미지 (있을 경우에만 표시) */}
        {event.cover_image_url && (
          <div className="relative h-40 w-full">
            <Image
              src={event.cover_image_url}
              alt={`${event.title} 커버 이미지`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
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
