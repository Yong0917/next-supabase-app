"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  EventFormSchema,
  type EventFormValues,
} from "@/app/protected/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  action: (formData: EventFormValues) => Promise<{ error?: string } | void>;
  submitLabel?: string;
}

export function EventForm({
  defaultValues,
  action,
  submitLabel = "저장",
}: EventFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<EventFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(EventFormSchema) as any,
    defaultValues: {
      join_policy: "open",
      ...defaultValues,
    },
  });

  const joinPolicy = watch("join_policy");

  const onSubmit = async (data: EventFormValues) => {
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

      {/* 이벤트 제목 */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          이벤트 제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="이벤트 이름을 입력하세요"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-1.5">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="이벤트에 대한 설명을 입력하세요 (선택)"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* 날짜 / 시간 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="event_date">
            날짜 <span className="text-destructive">*</span>
          </Label>
          <Input id="event_date" type="date" {...register("event_date")} />
          {errors.event_date && (
            <p className="text-xs text-destructive">
              {errors.event_date.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event_time">
            시간 <span className="text-destructive">*</span>
          </Label>
          <Input id="event_time" type="time" {...register("event_time")} />
          {errors.event_time && (
            <p className="text-xs text-destructive">
              {errors.event_time.message}
            </p>
          )}
        </div>
      </div>

      {/* 장소 */}
      <div className="space-y-1.5">
        <Label htmlFor="location">장소</Label>
        <Input
          id="location"
          placeholder="이벤트 장소를 입력하세요 (선택)"
          {...register("location")}
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location.message}</p>
        )}
      </div>

      {/* 최대 인원 */}
      <div className="space-y-1.5">
        <Label htmlFor="max_capacity">최대 인원</Label>
        <Input
          id="max_capacity"
          type="number"
          min={1}
          placeholder="제한 없음"
          {...register("max_capacity", {
            setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
          })}
        />
        {errors.max_capacity && (
          <p className="text-xs text-destructive">
            {errors.max_capacity.message}
          </p>
        )}
      </div>

      {/* 참여 방식 */}
      <div className="space-y-2">
        <Label>
          참여 방식 <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={joinPolicy}
          onValueChange={(value) =>
            setValue("join_policy", value as "open" | "approval")
          }
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="open" id="join_open" />
            <Label htmlFor="join_open" className="font-normal">
              즉시 참여 — 초대 코드로 바로 참여 가능
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="approval" id="join_approval" />
            <Label htmlFor="join_approval" className="font-normal">
              승인 후 참여 — 주최자가 참여를 승인해야 확정
            </Label>
          </div>
        </RadioGroup>
        {errors.join_policy && (
          <p className="text-xs text-destructive">
            {errors.join_policy.message}
          </p>
        )}
      </div>

      {/* 제출 버튼 */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "처리 중..." : submitLabel}
      </Button>
    </form>
  );
}
