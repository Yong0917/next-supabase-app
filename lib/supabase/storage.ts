"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "event-images";

// 허용 이미지 MIME 타입
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// 최대 파일 크기: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * 이미지 파일 유효성 검사
 * - 허용된 MIME 타입인지 확인
 * - 파일 크기가 5MB 이하인지 확인
 */
export function validateImageFile(
  file: File,
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "JPG, PNG, WebP, GIF 형식의 이미지만 업로드할 수 있습니다.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "파일 크기는 5MB 이하여야 합니다." };
  }
  return { valid: true };
}

/**
 * 이벤트 커버 이미지 업로드
 * - Storage 경로: {userId}/{randomId}.{ext}
 * - 공개 URL 반환
 */
export async function uploadEventImage(
  file: File,
  userId: string,
): Promise<string> {
  const supabase = createClient();

  // 파일 확장자 추출
  const ext = file.name.split(".").pop() ?? "jpg";
  // 고유한 파일명 생성 (crypto.randomUUID 사용)
  const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) throw new Error(error.message);

  // 공개 URL 조회
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * 이벤트 커버 이미지 삭제
 * - 공개 URL에서 파일 경로를 파싱하여 삭제
 * - URL 형태: .../object/public/event-images/{userId}/{filename}
 */
export async function deleteEventImage(imageUrl: string): Promise<void> {
  const supabase = createClient();

  // URL에서 버킷 이후 경로 파싱
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split(`/object/public/${BUCKET_NAME}/`);
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];
  await supabase.storage.from(BUCKET_NAME).remove([filePath]);
}
