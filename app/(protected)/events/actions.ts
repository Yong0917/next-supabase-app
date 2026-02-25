"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Event, ParticipantStatus } from "@/lib/types";

import {
  EventFormSchema,
  type EventFormValues,
  type EventWithRole,
  type ParticipatingEvent,
} from "./schemas";

// 이벤트 생성
export async function createEvent(
  formData: EventFormValues,
): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();

  if (authError || !data?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = data.claims.sub;

  const validated = EventFormSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { event_date, event_time, max_capacity, ...rest } = validated.data;

  // 날짜 + 시간 합산하여 ISO 문자열 생성
  const eventDatetime = `${event_date}T${event_time}:00`;

  // 8자리 대문자 영숫자 초대 코드 생성
  const inviteCode = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  const { data: insertedEvent, error: insertError } = await supabase
    .from("events")
    .insert({
      ...rest,
      event_date: eventDatetime,
      host_id: userId,
      invite_code: inviteCode,
      max_capacity: max_capacity ?? null,
    })
    .select("id")
    .single();

  if (insertError || !insertedEvent) {
    return { error: "이벤트 생성에 실패했습니다. 다시 시도해주세요." };
  }

  redirect(`/events/${insertedEvent.id}`);
}

// 이벤트 수정
export async function updateEvent(
  eventId: string,
  formData: EventFormValues,
): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();

  if (authError || !data?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = data.claims.sub;

  // 이벤트 조회 및 주최자 검증
  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (fetchError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  const validated = EventFormSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { event_date, event_time, max_capacity, ...rest } = validated.data;
  const eventDatetime = `${event_date}T${event_time}:00`;

  const { error: updateError } = await supabase
    .from("events")
    .update({
      ...rest,
      event_date: eventDatetime,
      max_capacity: max_capacity ?? null,
    })
    .eq("id", eventId);

  if (updateError) {
    return { error: "이벤트 수정에 실패했습니다. 다시 시도해주세요." };
  }

  redirect(`/events/${eventId}`);
}

// 이벤트 취소
export async function cancelEvent(
  eventId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();

  if (authError || !data?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = data.claims.sub;

  // 이벤트 조회 및 주최자 검증
  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (fetchError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  const { error: updateError } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", eventId);

  if (updateError) {
    return { error: "이벤트 취소에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");

  return { success: true };
}

// 내가 주최한 이벤트 목록 조회
export async function getMyHostedEvents(): Promise<
  { data: Event[] } | { error: string }
> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();

  if (authError || !data?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = data.claims.sub;

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", userId)
    .order("event_date", { ascending: false });

  if (error) {
    return { error: "이벤트 목록을 불러오는 데 실패했습니다." };
  }

  return { data: events };
}

// 내가 참여한 이벤트 목록 조회
export async function getMyParticipatingEvents(): Promise<
  { data: ParticipatingEvent[] } | { error: string }
> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();

  if (authError || !data?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = data.claims.sub;

  const { data: participants, error } = await supabase
    .from("event_participants")
    .select("*, events(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) {
    return { error: "참여 이벤트 목록을 불러오는 데 실패했습니다." };
  }

  return { data: participants as ParticipatingEvent[] };
}

// 이벤트 상세 조회 (현재 사용자 역할 포함)
export async function getEventById(
  eventId: string,
): Promise<EventWithRole | { error: string }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 이벤트 조회
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  // 승인된 참여자 수 조회
  const { count: participantCount } = await supabase
    .from("event_participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "approved");

  // 현재 사용자의 참여 상태 조회
  const { data: myParticipation } = await supabase
    .from("event_participants")
    .select("status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  // 역할 판단
  let role: "host" | "participant" | "none" = "none";
  let participantStatus: ParticipantStatus | null = null;

  if (event.host_id === userId) {
    role = "host";
  } else if (myParticipation) {
    role = "participant";
    participantStatus = myParticipation.status;
  }

  return {
    event,
    role,
    participantStatus,
    participantCount: participantCount ?? 0,
  };
}
