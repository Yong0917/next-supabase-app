import type { Database } from "./database";

// profiles 테이블 Row 타입 (조회 시 사용)
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// profiles 테이블 Insert 타입 (삽입 시 사용)
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

// profiles 테이블 Update 타입 (수정 시 사용)
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
