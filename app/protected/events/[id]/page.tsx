import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventById } from "../actions";
import { CancelEventButton } from "@/components/events/cancel-event-button";
import { InviteCodeDisplay } from "@/components/events/invite-code-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const result = await getEventById(id);

  if ("error" in result) {
    notFound();
  }

  const { event, role, participantStatus, participantCount } = result;

  const formattedDate = new Date(event.event_date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusLabel =
    event.status === "active"
      ? "진행 중"
      : event.status === "cancelled"
        ? "취소됨"
        : "완료";

  const statusVariant =
    event.status === "active"
      ? "default"
      : event.status === "cancelled"
        ? "destructive"
        : "secondary";

  const joinPolicyLabel =
    event.join_policy === "open" ? "즉시 참여" : "승인 후 참여";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>

        {/* 주최자 액션 버튼 */}
        {role === "host" && event.status === "active" && (
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" asChild>
              <Link href={`/protected/events/${event.id}/edit`}>수정</Link>
            </Button>
            <CancelEventButton eventId={event.id} />
          </div>
        )}
      </div>

      <Separator />

      {/* 이벤트 정보 */}
      <div className="space-y-3 text-sm">
        <div className="flex gap-3">
          <span className="w-20 shrink-0 font-medium text-muted-foreground">
            일시
          </span>
          <span>{formattedDate}</span>
        </div>
        {event.location && (
          <div className="flex gap-3">
            <span className="w-20 shrink-0 font-medium text-muted-foreground">
              장소
            </span>
            <span>{event.location}</span>
          </div>
        )}
        <div className="flex gap-3">
          <span className="w-20 shrink-0 font-medium text-muted-foreground">
            참여 인원
          </span>
          <span>
            {participantCount}명
            {event.max_capacity ? ` / 최대 ${event.max_capacity}명` : ""}
          </span>
        </div>
        <div className="flex gap-3">
          <span className="w-20 shrink-0 font-medium text-muted-foreground">
            참여 방식
          </span>
          <span>{joinPolicyLabel}</span>
        </div>
        {event.description && (
          <div className="flex gap-3">
            <span className="w-20 shrink-0 font-medium text-muted-foreground">
              설명
            </span>
            <span className="whitespace-pre-wrap">{event.description}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* 역할별 하단 UI */}
      {role === "host" && (
        <div className="space-y-3">
          <p className="text-sm font-medium">초대 코드</p>
          <InviteCodeDisplay inviteCode={event.invite_code} />
          <p className="text-xs text-muted-foreground">
            이 코드를 공유하면 누구나 이벤트에 참여 신청할 수 있습니다.
          </p>
        </div>
      )}

      {role === "participant" && participantStatus === "approved" && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          참여가 승인되었습니다.
        </div>
      )}

      {role === "participant" && participantStatus === "pending" && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          승인 대기 중입니다. 주최자의 승인을 기다려 주세요.
        </div>
      )}

      {role === "participant" && participantStatus === "rejected" && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          참여 신청이 거절되었습니다.
        </div>
      )}

      {role === "none" && event.status === "active" && (
        <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
          초대 코드가 있다면{" "}
          <Link
            href={`/invite/${event.invite_code}`}
            className="font-medium underline underline-offset-4"
          >
            초대 링크
          </Link>
          를 통해 참여 신청할 수 있습니다.
        </div>
      )}
    </div>
  );
}
