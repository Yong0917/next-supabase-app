import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createEvent, getEventById } from "../actions";
import { EventForm } from "@/components/events/event-form";
import { createClient } from "@/lib/supabase/server";
import type { EventFormValues } from "../schemas";

interface NewEventPageProps {
  searchParams: Promise<{ from?: string }>;
}

async function NewEventContent({ searchParams }: NewEventPageProps) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // 이미지 업로드 경로 생성에 사용할 사용자 ID
  const userId = data.claims.sub;

  // ?from= 파라미터로 이벤트 복제 prefill 처리
  const { from } = await searchParams;
  let defaultValues: Partial<EventFormValues> | undefined = undefined;

  if (from) {
    const result = await getEventById(from);
    if (!("error" in result)) {
      const { event } = result;
      defaultValues = {
        title: event.title,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
        max_capacity: event.max_capacity ?? undefined,
        join_policy: event.join_policy,
        // event_date, event_time, cover_image_url는 의도적으로 제외 (날짜 리셋)
      };
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">새 이벤트 만들기</h1>
      <EventForm
        action={createEvent}
        submitLabel="이벤트 만들기"
        userId={userId}
        defaultValues={defaultValues}
      />
    </div>
  );
}

export default function NewEventPage({ searchParams }: NewEventPageProps) {
  return (
    <Suspense>
      <NewEventContent searchParams={searchParams} />
    </Suspense>
  );
}
