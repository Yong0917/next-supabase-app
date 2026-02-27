import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

// 이벤트 제목 기반 결정적 그라디언트 생성
const gradients = [
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-fuchsia-400 to-rose-500",
  "from-cyan-400 to-sky-500",
];

function getGradient(title: string): string {
  const code =
    (title.charCodeAt(0) ?? 0) + (title.charCodeAt(title.length - 1) ?? 0);
  return gradients[code % gradients.length];
}

interface EventCardProps {
  event: Event;
  participantCount?: number;
  myRole?: "host" | "participant" | null;
  href?: string;
}

export function EventCard({
  event,
  participantCount,
  myRole,
  href,
}: EventCardProps) {
  const formattedDate = new Date(event.event_date).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const gradient = getGradient(event.title);

  return (
    <Link href={href ?? `/events/${event.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
        {/* 커버 이미지 또는 그라디언트 플레이스홀더 */}
        <div className="relative h-36 w-full overflow-hidden">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={`${event.title} 커버 이미지`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${gradient} transition-transform duration-300 group-hover:scale-105`}
            >
              <span className="select-none text-5xl font-bold text-white/80 drop-shadow-sm">
                {event.title.charAt(0)}
              </span>
            </div>
          )}
          {/* 역할 배지 (좌측 상단) */}
          {myRole && (
            <div className="absolute left-2.5 top-2.5">
              <Badge variant="secondary" className="text-xs shadow-sm">
                {myRole === "host" ? "주최" : "참여 중"}
              </Badge>
            </div>
          )}
          {/* 상태 뱃지 오버레이 */}
          <div className="absolute right-2.5 top-2.5">
            <Badge
              variant={statusVariantMap[event.status]}
              className="text-xs shadow-sm"
            >
              {statusLabelMap[event.status]}
            </Badge>
          </div>
        </div>

        {/* 카드 내용 */}
        <div className="space-y-2 p-3.5">
          <h3 className="line-clamp-1 font-semibold leading-snug">
            {event.title}
          </h3>

          <div className="space-y-1">
            {/* 날짜 */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={11} className="shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {/* 장소 */}
            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin size={11} className="shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}

            {/* 참여 인원 */}
            {(participantCount !== undefined || event.max_capacity) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users size={11} className="shrink-0" />
                <span>
                  {participantCount !== undefined
                    ? `${participantCount}명`
                    : ""}
                  {event.max_capacity ? ` / 최대 ${event.max_capacity}명` : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
