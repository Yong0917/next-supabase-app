import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getEventById } from "../../../actions";
import { createAnnouncement } from "../actions";
import { AnnouncementForm } from "@/components/events/announcements/announcement-form";
import type { AnnouncementFormValues } from "@/app/(protected)/events/[id]/announcements/schemas";

interface NewAnnouncementPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewAnnouncementPage({
  params,
}: NewAnnouncementPageProps) {
  const { id } = await params;

  // 이벤트 정보 및 역할 조회
  const eventResult = await getEventById(id);

  if ("error" in eventResult) {
    notFound();
  }

  const { event, role } = eventResult;

  // 주최자가 아니면 공지 목록 페이지로 리다이렉트
  if (role !== "host") {
    redirect(`/events/${id}/announcements`);
  }

  // Server Action을 이벤트 ID에 바인딩
  const boundAction = createAnnouncement.bind(null, id) as (
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
        </div>
        <h1 className="text-2xl font-bold">공지 작성</h1>
      </div>

      {/* 공지 폼 */}
      <AnnouncementForm action={boundAction} submitLabel="공지 등록" />
    </div>
  );
}
