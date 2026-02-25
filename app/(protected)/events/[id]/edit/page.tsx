import { notFound, redirect } from "next/navigation";

import { getEventById, updateEvent } from "../../actions";
import { EventForm } from "@/components/events/event-form";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const result = await getEventById(id);

  if ("error" in result) {
    notFound();
  }

  const { event, role } = result;

  // 비주최자 접근 차단
  if (role !== "host") {
    redirect(`/events/${id}`);
  }

  // event_date를 날짜/시간으로 분리
  const dateObj = new Date(event.event_date);
  const eventDate = dateObj.toISOString().slice(0, 10);
  const eventTime = dateObj.toTimeString().slice(0, 5);

  // Server Action에 eventId 바인딩
  const updateEventWithId = updateEvent.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">이벤트 수정</h1>
      <EventForm
        action={updateEventWithId}
        submitLabel="수정 완료"
        defaultValues={{
          title: event.title,
          description: event.description ?? undefined,
          event_date: eventDate,
          event_time: eventTime,
          location: event.location ?? undefined,
          max_capacity: event.max_capacity ?? undefined,
          join_policy: event.join_policy,
        }}
      />
    </div>
  );
}
