import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "event-images";

/**
 * 서버 액션용 이벤트 커버 이미지 삭제
 * - 공개 URL에서 파일 경로를 파싱하여 삭제
 * - URL 형태: .../object/public/event-images/{userId}/{filename}
 * - 삭제 실패 시 throw하지 않고 오류 로깅 후 반환
 */
export async function deleteEventImageServer(imageUrl: string): Promise<void> {
  // URL에서 버킷 이후 경로 파싱
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split(`/object/public/${BUCKET_NAME}/`);
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];

  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error("[storage-server] 이미지 삭제 실패:", error.message);
  }
}
