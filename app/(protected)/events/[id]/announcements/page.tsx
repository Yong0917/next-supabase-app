import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getEventById } from "../../actions";
import { getAnnouncements } from "./actions";
import { AnnouncementCard } from "@/components/events/announcements/announcement-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

interface AnnouncementsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnnouncementsPage({
  params,
}: AnnouncementsPageProps) {
  const { id } = await params;

  // 현재 사용자 인증 확인
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const currentUserId = authData.claims.sub;

  // 이벤트 정보 및 역할 조회
  const eventResult = await getEventById(id);

  if ("error" in eventResult) {
    notFound();
  }

  const { event, role, participantStatus } = eventResult;

  // role이 none이면 이벤트 상세 페이지로 리다이렉트
  if (role === "none") {
    redirect(`/events/${id}`);
  }

  // 접근 권한 판단
  const canAccess =
    role === "host" ||
    (role === "participant" && participantStatus === "approved");

  // 공지 목록 조회 (접근 가능한 경우에만)
  const announcementsResult = canAccess
    ? await getAnnouncements(id)
    : { error: "" };

  const announcements = !("error" in announcementsResult)
    ? announcementsResult
    : [];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-sm text-muted-foreground">
            <Link href={`/events/${id}`} className="hover:underline">
              {event.title}
            </Link>
          </div>
          <h1 className="text-2xl font-bold">공지사항</h1>
        </div>

        {/* 주최자만 공지 작성 버튼 표시 */}
        {role === "host" && (
          <Button asChild>
            <Link href={`/events/${id}/announcements/new`}>공지 작성</Link>
          </Button>
        )}
      </div>

      {/* 접근 권한 없는 참여자에게 안내 메시지 */}
      {!canAccess && role === "participant" && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-6 text-center text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          <p className="font-medium">
            승인된 멤버만 공지를 열람할 수 있습니다.
          </p>
          <p className="mt-1 text-yellow-700 dark:text-yellow-300">
            주최자의 승인을 기다려 주세요.
          </p>
        </div>
      )}

      {/* 공지 목록 */}
      {canAccess && (
        <>
          {announcements.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              아직 공지가 없습니다.
              {role === "host" && (
                <span>
                  {" "}
                  <Link
                    href={`/events/${id}/announcements/new`}
                    className="font-medium underline underline-offset-4"
                  >
                    첫 공지를 작성해보세요.
                  </Link>
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  eventId={id}
                  currentUserId={currentUserId}
                  isHost={role === "host"}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
