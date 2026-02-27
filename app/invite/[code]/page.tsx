import Image from "next/image";
import { notFound } from "next/navigation";

import { getEventByInviteCode } from "@/app/(protected)/events/actions";
import { HostActionPanel } from "@/components/events/host-action-panel";
import { JoinButton } from "@/components/events/join-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import type { ParticipantStatus } from "@/lib/types";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;

  // 초대 코드로 이벤트 공개 정보 조회 (비인증 접근 가능)
  const result = await getEventByInviteCode(code);

  if ("error" in result) {
    notFound();
  }

  // 현재 사용자 인증 상태 + 참여 현황 조회
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;
  const isHost = isLoggedIn && authData?.claims?.sub === result.host_id;

  let currentStatus: ParticipantStatus | "none" = "none";

  if (isLoggedIn) {
    const userId = authData!.claims!.sub;
    const { data: participation } = await supabase
      .from("event_participants")
      .select("status")
      .eq("event_id", result.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (participation) {
      currentStatus = participation.status;
    }
  }

  const isFull =
    result.max_capacity !== null &&
    result.participantCount >= result.max_capacity;

  const formattedDate = new Date(result.event_date).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const joinPolicyLabel =
    result.join_policy === "open" ? "즉시 참여" : "승인 후 참여";

  const statusLabel =
    result.status === "active"
      ? "진행 중"
      : result.status === "cancelled"
        ? "취소됨"
        : "완료";

  const statusVariant =
    result.status === "active"
      ? "default"
      : result.status === "cancelled"
        ? "destructive"
        : "secondary";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      {/* 커버 이미지 */}
      {result.cover_image_url && (
        <div className="relative h-56 w-full overflow-hidden rounded-lg">
          <Image
            src={result.cover_image_url}
            alt={`${result.title} 커버 이미지`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{result.title}</h1>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
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
        {result.location && (
          <div className="flex gap-3">
            <span className="w-20 shrink-0 font-medium text-muted-foreground">
              장소
            </span>
            <span>{result.location}</span>
          </div>
        )}
        <div className="flex gap-3">
          <span className="w-20 shrink-0 font-medium text-muted-foreground">
            참여 인원
          </span>
          <span>
            {result.participantCount}명
            {result.max_capacity ? ` / 최대 ${result.max_capacity}명` : ""}
            {isFull && (
              <Badge variant="secondary" className="ml-2">
                정원 마감
              </Badge>
            )}
          </span>
        </div>
        <div className="flex gap-3">
          <span className="w-20 shrink-0 font-medium text-muted-foreground">
            참여 방식
          </span>
          <span>{joinPolicyLabel}</span>
        </div>
        {result.description && (
          <div className="flex gap-3">
            <span className="w-20 shrink-0 font-medium text-muted-foreground">
              설명
            </span>
            <span className="whitespace-pre-wrap">{result.description}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* 참여 신청 버튼 / 주최자 관리 패널 */}
      {isHost ? (
        <HostActionPanel eventId={result.id} />
      ) : (
        <JoinButton
          inviteCode={code}
          isLoggedIn={isLoggedIn}
          currentStatus={currentStatus}
          isFull={isFull}
          eventStatus={result.status}
        />
      )}
    </div>
  );
}
