"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import {
  EventFormSchema,
  type EventFormValues,
} from "@/app/(protected)/events/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteEventImage,
  uploadEventImage,
  validateImageFile,
} from "@/lib/supabase/storage";

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  action: (formData: EventFormValues) => Promise<{ error?: string } | void>;
  submitLabel?: string;
  // 이미지 업로드에 필요한 사용자 ID
  userId: string;
}

export function EventForm({
  defaultValues,
  action,
  submitLabel = "저장",
  userId,
}: EventFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  // 선택된 이미지 파일
  const [imageFile, setImageFile] = useState<File | null>(null);
  // 미리보기 URL (로컬 ObjectURL 또는 기존 이미지 URL)
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultValues?.cover_image_url ?? null,
  );
  // 이미지 업로드 중 여부
  const [isUploading, setIsUploading] = useState(false);
  // 이미지 유효성 오류 메시지
  const [imageError, setImageError] = useState<string | null>(null);

  // 숨김 파일 input 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    // 클라이언트 유효성 검사 (타입, 크기)
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error);
      // input 초기화
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 기존 ObjectURL 해제
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    // 로컬 미리보기 생성
    setImagePreview(URL.createObjectURL(file));
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    // ObjectURL이면 해제
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    setValue("cover_image_url", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EventFormValues) => {
    setServerError(null);

    let coverImageUrl: string | null = data.cover_image_url ?? null;

    // 새로 선택한 파일이 있으면 업로드
    if (imageFile) {
      setIsUploading(true);
      try {
        // 기존 이미지가 있으면 삭제
        if (defaultValues?.cover_image_url) {
          await deleteEventImage(defaultValues.cover_image_url);
        }
        coverImageUrl = await uploadEventImage(imageFile, userId);
      } catch {
        setServerError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // 이미지 제거된 경우
    if (!imagePreview && !imageFile) {
      coverImageUrl = null;
    }

    const result = await action({ ...data, cover_image_url: coverImageUrl });
    if (result && "error" in result && result.error) {
      setServerError(result.error);
    }
  };

  // 제출 버튼 비활성화 조건
  const isDisabled = isSubmitting || isUploading;

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

      {/* 커버 이미지 업로드 */}
      <div className="space-y-2">
        <Label>이미지</Label>

        {/* 미리보기 영역 */}
        {imagePreview ? (
          <div className="relative">
            <div className="relative h-48 w-full overflow-hidden rounded-md border">
              <Image
                src={imagePreview}
                alt="커버 이미지 미리보기"
                fill
                className="object-cover"
              />
            </div>
            {/* 이미지 제거 버튼 */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={handleRemoveImage}
              aria-label="이미지 제거"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* 이미지 선택 영역 */
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
          >
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">클릭하여 이미지 선택</span>
            <span className="text-xs">JPG, PNG, WebP, GIF · 최대 5MB</span>
          </div>
        )}

        {/* 이미지가 있을 때 변경 버튼 */}
        {imagePreview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            이미지 변경
          </Button>
        )}

        {/* 숨김 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 이미지 유효성 오류 */}
        {imageError && <p className="text-xs text-destructive">{imageError}</p>}
      </div>

      {/* 제출 버튼 */}
      <Button type="submit" disabled={isDisabled} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            이미지 업로드 중...
          </>
        ) : isSubmitting ? (
          "처리 중..."
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
