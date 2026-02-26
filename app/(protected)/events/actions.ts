"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Event, ParticipantStatus, Profile } from "@/lib/types";

import {
  EventFormSchema,
  type EventFormValues,
  type EventWithRole,
  type InviteEventData,
  type ParticipatingEvent,
  type ParticipantWithProfile,
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

  const { event_date, event_time, max_capacity, cover_image_url, ...rest } =
    validated.data;

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
      // 커버 이미지 URL (업로드 완료 후 전달된 공개 URL)
      cover_image_url: cover_image_url ?? null,
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

  const { event_date, event_time, max_capacity, cover_image_url, ...rest } =
    validated.data;
  const eventDatetime = `${event_date}T${event_time}:00`;

  const { error: updateError } = await supabase
    .from("events")
    .update({
      ...rest,
      event_date: eventDatetime,
      max_capacity: max_capacity ?? null,
      // 커버 이미지 URL (업로드 완료 후 전달된 공개 URL, null이면 제거)
      cover_image_url: cover_image_url ?? null,
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

// 초대 코드로 이벤트 공개 정보 + 승인 인원 수 조회 (비인증 접근 가능)
export async function getEventByInviteCode(
  inviteCode: string,
): Promise<InviteEventData | { error: string }> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, title, description, location, event_date, max_capacity, join_policy, status, cover_image_url, invite_code",
    )
    .eq("invite_code", inviteCode)
    .single();

  if (error || !event) {
    return { error: "유효하지 않은 초대 코드입니다." };
  }

  // 승인된 참여자 수 조회
  const { count: participantCount } = await supabase
    .from("event_participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("status", "approved");

  return {
    ...event,
    participantCount: participantCount ?? 0,
  };
}

// 이벤트 참여 신청 (invite_code 기반, join_policy에 따라 자동 승인 또는 대기)
export async function joinEvent(
  inviteCode: string,
): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // invite_code로 이벤트 조회
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, status, join_policy, max_capacity, host_id")
    .eq("invite_code", inviteCode)
    .single();

  if (eventError || !event) {
    return { error: "유효하지 않은 초대 코드입니다." };
  }

  if (event.status === "cancelled") {
    return { error: "취소된 이벤트입니다." };
  }

  // 주최자 본인 신청 방지
  if (event.host_id === userId) {
    return { error: "주최자는 참여 신청할 수 없습니다." };
  }

  // 중복 신청 방지: 기존 참여 기록 조회
  const { data: existing } = await supabase
    .from("event_participants")
    .select("id, status")
    .eq("event_id", event.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (
    existing &&
    existing.status !== "cancelled" &&
    existing.status !== "rejected"
  ) {
    return { error: "이미 참여 신청한 이벤트입니다." };
  }

  // 정원 초과 확인 (max_capacity가 설정된 경우에만)
  if (event.max_capacity !== null) {
    const { count } = await supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("status", "approved");

    if ((count ?? 0) >= event.max_capacity) {
      return { error: "정원이 마감되었습니다." };
    }
  }

  // join_policy 분기: open → 즉시 approved, approval → pending
  const newStatus = event.join_policy === "open" ? "approved" : "pending";

  if (existing) {
    // 이전에 cancelled/rejected였으면 update로 재신청
    const { error: updateError } = await supabase
      .from("event_participants")
      .update({ status: newStatus })
      .eq("id", existing.id);

    if (updateError) {
      return { error: "참여 신청에 실패했습니다. 다시 시도해주세요." };
    }
  } else {
    const { error: insertError } = await supabase
      .from("event_participants")
      .insert({ event_id: event.id, user_id: userId, status: newStatus });

    if (insertError) {
      return { error: "참여 신청에 실패했습니다. 다시 시도해주세요." };
    }
  }

  redirect(`/events/${event.id}`);
}

// 이벤트 참여 취소 (본인 참여 상태를 cancelled로 변경)
export async function cancelParticipation(
  eventId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  const { error: updateError } = await supabase
    .from("event_participants")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: "참여 취소에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
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

// 이벤트 참여자 목록 조회 (주최자 전용, 프로필 join 포함)
export async function getParticipantsByEvent(
  eventId: string,
): Promise<{ data: ParticipantWithProfile[] } | { error: string }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 주최자 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  // 참여자 목록 조회
  const { data: participants, error: participantsError } = await supabase
    .from("event_participants")
    .select("id, user_id, status, joined_at")
    .eq("event_id", eventId)
    .order("joined_at", { ascending: true });

  if (participantsError) {
    return { error: "참여자 목록을 불러오는 데 실패했습니다." };
  }

  if (!participants || participants.length === 0) {
    return { data: [] };
  }

  // 참여자들의 user_id 목록으로 프로필 조회 (FK 없으므로 별도 쿼리)
  const userIds = participants.map((p) => p.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    return { error: "프로필 정보를 불러오는 데 실패했습니다." };
  }

  // 프로필 Map 생성 (userId → profile)
  const profileMap = new Map<
    string,
    Pick<Profile, "id" | "username" | "full_name" | "avatar_url">
  >();
  for (const profile of profiles ?? []) {
    profileMap.set(profile.id, profile);
  }

  // 참여자 + 프로필 조합
  const result: ParticipantWithProfile[] = participants.map((p) => ({
    id: p.id,
    userId: p.user_id,
    status: p.status,
    joinedAt: p.joined_at,
    profile: profileMap.get(p.user_id) ?? null,
  }));

  return { data: result };
}

// 참여자 승인 (주최자 전용, 정원 초과 시 에러)
export async function approveParticipant(
  participantId: string,
  eventId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 이벤트 조회 및 주최자 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id, max_capacity")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  // 정원 초과 여부 확인 (max_capacity가 설정된 경우에만)
  if (event.max_capacity !== null) {
    const { count: approvedCount } = await supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "approved");

    if ((approvedCount ?? 0) >= event.max_capacity) {
      return { error: "정원이 초과되어 승인할 수 없습니다." };
    }
  }

  // 상태를 approved로 변경
  const { error: updateError } = await supabase
    .from("event_participants")
    .update({ status: "approved" })
    .eq("id", participantId);

  if (updateError) {
    return { error: "승인 처리에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/events/${eventId}/manage`);
  revalidatePath(`/events/${eventId}`);

  return { success: true };
}

// 참여자 거절 (주최자 전용)
export async function rejectParticipant(
  participantId: string,
  eventId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "인증이 필요합니다." };
  }

  const userId = authData.claims.sub;

  // 이벤트 조회 및 주최자 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { error: "권한이 없습니다." };
  }

  // 상태를 rejected로 변경
  const { error: updateError } = await supabase
    .from("event_participants")
    .update({ status: "rejected" })
    .eq("id", participantId);

  if (updateError) {
    return { error: "거절 처리에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/events/${eventId}/manage`);
  revalidatePath(`/events/${eventId}`);

  return { success: true };
}
