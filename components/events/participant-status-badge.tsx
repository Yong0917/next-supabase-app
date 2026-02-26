import { Badge } from "@/components/ui/badge";
import type { ParticipantStatus } from "@/lib/types";

interface ParticipantStatusBadgeProps {
  status: ParticipantStatus;
}

// 참여자 상태별 배지 레이블 및 색상 정의
const STATUS_CONFIG: Record<
  ParticipantStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "대기 중",
    className:
      "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200",
  },
  approved: {
    label: "승인됨",
    className:
      "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200",
  },
  rejected: {
    label: "거절됨",
    className:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200",
  },
  cancelled: {
    label: "취소됨",
    className:
      "border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400",
  },
};

export function ParticipantStatusBadge({
  status,
}: ParticipantStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
