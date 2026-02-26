"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  AnnouncementFormSchema,
  type AnnouncementFormValues,
} from "@/app/(protected)/events/[id]/announcements/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AnnouncementFormProps {
  defaultValues?: Partial<AnnouncementFormValues>;
  action: (data: AnnouncementFormValues) => Promise<{ error?: string } | void>;
  submitLabel?: string;
}

export function AnnouncementForm({
  defaultValues,
  action,
  submitLabel = "저장",
}: AnnouncementFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(AnnouncementFormSchema) as any,
    defaultValues,
  });

  const onSubmit = async (data: AnnouncementFormValues) => {
    setServerError(null);
    const result = await action(data);
    if (result && "error" in result && result.error) {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 서버 오류 표시 */}
      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="공지 제목을 입력하세요"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* 내용 */}
      <div className="space-y-1.5">
        <Label htmlFor="content">
          내용 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          placeholder="공지 내용을 입력하세요"
          rows={6}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      {/* 제출 버튼 */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "처리 중..." : submitLabel}
      </Button>
    </form>
  );
}
