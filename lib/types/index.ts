import type { Database } from "./database";

// profiles 테이블 Row 타입 (조회 시 사용)
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// profiles 테이블 Insert 타입 (삽입 시 사용)
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

// profiles 테이블 Update 타입 (수정 시 사용)
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// events 테이블 타입
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

// event_participants 테이블 타입
export type EventParticipant =
  Database["public"]["Tables"]["event_participants"]["Row"];
export type EventParticipantInsert =
  Database["public"]["Tables"]["event_participants"]["Insert"];
export type EventParticipantUpdate =
  Database["public"]["Tables"]["event_participants"]["Update"];

// announcements 테이블 타입
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type AnnouncementInsert =
  Database["public"]["Tables"]["announcements"]["Insert"];
export type AnnouncementUpdate =
  Database["public"]["Tables"]["announcements"]["Update"];

// announcement_comments 테이블 타입
export type AnnouncementComment =
  Database["public"]["Tables"]["announcement_comments"]["Row"];
export type AnnouncementCommentInsert =
  Database["public"]["Tables"]["announcement_comments"]["Insert"];

// enum 타입
export type EventStatus = Database["public"]["Enums"]["event_status"];
export type JoinPolicy = Database["public"]["Enums"]["join_policy"];
export type ParticipantStatus =
  Database["public"]["Enums"]["participant_status"];
