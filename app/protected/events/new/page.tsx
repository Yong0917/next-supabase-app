import { redirect } from "next/navigation";

import { createEvent } from "../actions";
import { EventForm } from "@/components/events/event-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">새 이벤트 만들기</h1>
      <EventForm action={createEvent} submitLabel="이벤트 만들기" />
    </div>
  );
}
