import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventById, getParticipantsByEvent } from "../../actions";
import { ParticipantList } from "@/components/events/participant-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ParticipantWithProfile } from "../../schemas";
import type { ParticipantStatus } from "@/lib/types";

interface ManagePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

// 유효한 탭 값 목록
const VALID_TABS: ParticipantStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
];

export default async function ManagePage({
  params,
  searchParams,
}: ManagePageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  // 이벤트 조회 (역할 확인용)
  const eventResult = await getEventById(id);

  if ("error" in eventResult) {
    notFound();
  }

  const { event, role, participantCount } = eventResult;

  // 비주최자 접근 차단
  if (role !== "host") {
    notFound();
  }

  // 참여자 목록 조회
  const participantsResult = await getParticipantsByEvent(id);

  if ("error" in participantsResult) {
    // 데이터 조회 실패 시 빈 배열로 폴백
    notFound();
  }

  const allParticipants = participantsResult.data;

  // 상태별 필터링
  const byStatus = (status: ParticipantStatus): ParticipantWithProfile[] =>
    allParticipants.filter((p) => p.status === status);

  const pendingList = byStatus("pending");
  const approvedList = byStatus("approved");
  const rejectedList = byStatus("rejected");
  const cancelledList = byStatus("cancelled");

  // 현재 탭 값 결정 (searchParams 기반, 기본값 pending)
  const activeTab: ParticipantStatus =
    tab && VALID_TABS.includes(tab as ParticipantStatus)
      ? (tab as ParticipantStatus)
      : "pending";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">참여자 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">{event.title}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/events/${id}`}>이벤트 상세</Link>
        </Button>
      </div>

      <Separator />

      {/* 승인 인원 / 최대 인원 현황 */}
      <div className="flex items-center gap-6 rounded-lg border bg-card px-4 py-3 text-sm">
        <div className="text-center">
          <p className="text-lg font-semibold">{participantCount}</p>
          <p className="text-muted-foreground">승인된 인원</p>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div className="text-center">
          <p className="text-lg font-semibold">
            {event.max_capacity ?? "무제한"}
          </p>
          <p className="text-muted-foreground">최대 인원</p>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div className="text-center">
          <p className="text-lg font-semibold">{pendingList.length}</p>
          <p className="text-muted-foreground">대기 중</p>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div className="text-center">
          <p className="text-lg font-semibold">{allParticipants.length}</p>
          <p className="text-muted-foreground">전체 신청</p>
        </div>
      </div>

      {/* 상태별 탭 */}
      <Tabs defaultValue={activeTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" asChild>
            <Link href={`/events/${id}/manage?tab=pending`}>
              대기 중 {pendingList.length > 0 && `(${pendingList.length})`}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="approved" asChild>
            <Link href={`/events/${id}/manage?tab=approved`}>
              승인됨 {approvedList.length > 0 && `(${approvedList.length})`}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="rejected" asChild>
            <Link href={`/events/${id}/manage?tab=rejected`}>
              거절됨 {rejectedList.length > 0 && `(${rejectedList.length})`}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="cancelled" asChild>
            <Link href={`/events/${id}/manage?tab=cancelled`}>
              취소됨 {cancelledList.length > 0 && `(${cancelledList.length})`}
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <ParticipantList
            participants={pendingList}
            eventId={id}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <ParticipantList
            participants={approvedList}
            eventId={id}
            showAttendance={true}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <ParticipantList participants={rejectedList} eventId={id} />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4">
          <ParticipantList participants={cancelledList} eventId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
