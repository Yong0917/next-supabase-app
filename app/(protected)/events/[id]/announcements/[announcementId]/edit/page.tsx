import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getEventById } from "../../../../actions";
import { getAnnouncementById, updateAnnouncement } from "../../actions";
import { AnnouncementForm } from "@/components/events/announcements/announcement-form";
import type { AnnouncementFormValues } from "@/app/(protected)/events/[id]/announcements/schemas";

interface EditAnnouncementPageProps {
  params: Promise<{ id: string; announcementId: string }>;
}

export default async function EditAnnouncementPage({
  params,
}: EditAnnouncementPageProps) {
  const { id, announcementId } = await params;

  // 이벤트 역할 + 공지 상세를 병렬 조회
  const [eventResult, announcementResult] = await Promise.all([
    getEventById(id),
    getAnnouncementById(announcementId),
  ]);

  if ("error" in eventResult) {
    notFound();
  }

  if ("error" in announcementResult) {
    notFound();
  }

  const { event, role } = eventResult;
  const announcement = announcementResult;

  // 주최자가 아니면 공지 목록으로 리다이렉트
  if (role !== "host") {
    redirect(`/events/${id}/announcements`);
  }

  // Server Action을 공지 ID에 바인딩
  const boundAction = updateAnnouncement.bind(null, announcementId) as (
    data: AnnouncementFormValues,
  ) => Promise<{ error?: string } | void>;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* 헤더 */}
      <div>
        <div className="mb-1 text-sm text-muted-foreground">
          <Link href={`/events/${id}`} className="hover:underline">
            {event.title}
          </Link>
          {" › "}
          <Link
            href={`/events/${id}/announcements`}
            className="hover:underline"
          >
            공지사항
          </Link>
          {" › "}
          <Link
            href={`/events/${id}/announcements/${announcementId}`}
            className="hover:underline"
          >
            {announcement.title}
          </Link>
        </div>
        <h1 className="text-2xl font-bold">공지 수정</h1>
      </div>

      {/* 기존 값으로 폼 초기화 */}
      <AnnouncementForm
        defaultValues={{
          title: announcement.title,
          content: announcement.content,
        }}
        action={boundAction}
        submitLabel="수정 완료"
      />
    </div>
  );
}
