"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: "active", label: "진행 중" },
  { value: "cancelled", label: "취소됨" },
  { value: "completed", label: "완료" },
];

export function EventFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/events?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="mb-4 flex gap-2">
      <Input
        placeholder="이벤트 검색..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateParams("search", e.target.value)}
        className="max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParams("status", value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
