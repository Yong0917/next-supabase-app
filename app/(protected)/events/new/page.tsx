import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createEvent } from "../actions";
import { EventForm } from "@/components/events/event-form";
import { createClient } from "@/lib/supabase/server";

async function NewEventContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // 이미지 업로드 경로 생성에 사용할 사용자 ID
  const userId = data.claims.sub;

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">새 이벤트 만들기</h1>
      <EventForm
        action={createEvent}
        submitLabel="이벤트 만들기"
        userId={userId}
      />
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense>
      <NewEventContent />
    </Suspense>
  );
}
