"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  CommentFormSchema,
  type CommentFormValues,
} from "@/app/(protected)/events/[id]/announcements/schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  action: (
    data: CommentFormValues,
  ) => Promise<{ error?: string } | { success: true }>;
}

export function CommentForm({ action }: CommentFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CommentFormSchema) as any,
    defaultValues: { content: "" },
  });

  const onSubmit = async (data: CommentFormValues) => {
    setServerError(null);
    const result = await action(data);

    if (result && "error" in result && result.error) {
      setServerError(result.error);
    } else {
      // 성공 시 폼 초기화 + 페이지 새로고침 (댓글 목록 갱신)
      reset();
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* 서버 오류 표시 */}
      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* 댓글 입력 */}
      <div className="space-y-1.5">
        <Label htmlFor="comment-content">댓글 작성</Label>
        <Textarea
          id="comment-content"
          placeholder="댓글을 입력하세요 (최대 500자)"
          rows={3}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}
