// 모임(Moim) 이벤트 관리 앱 메인 랜딩 페이지
// Mobile First 반응형 디자인, 서버 컴포넌트 (use client 없음)

import Link from "next/link";
import {
  CalendarDays,
  Users,
  Share2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  BadgeCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

// 기능 카드 타입
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  borderAccent: string;
  shadowAccent: string;
}

// 기능 카드 컴포넌트
function FeatureCard({
  icon,
  title,
  description,
  iconBg,
  borderAccent,
  shadowAccent,
}: FeatureCardProps) {
  return (
    <Card
      className={`group relative flex flex-col gap-0 overflow-hidden border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${borderAccent} ${shadowAccent}`}
    >
      {/* 카드 상단 컬러 악센트 바 */}
      <div className={`absolute left-0 top-0 h-0.5 w-full ${iconBg}`} />
      <CardHeader className="p-0 pb-3">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm ${iconBg}`}
        >
          {icon}
        </div>
        <CardTitle className="text-sm font-semibold text-slate-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <CardDescription className="text-xs leading-relaxed text-slate-500">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

// 단계 아이템 컴포넌트
function StepItem({
  number,
  title,
  description,
  isLast,
}: {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      {/* 번호 + 연결선 */}
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm shadow-amber-200">
          {number}
        </div>
        {!isLast && (
          <div className="mt-1 h-full w-px bg-gradient-to-b from-amber-300 to-transparent" />
        )}
      </div>
      <div className="space-y-1 pb-6 pt-1">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}

// 히어로 영역에 보여줄 이벤트 카드 미리보기
function MockEventCard() {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-xl shadow-amber-100/60">
      {/* 그라디언트 커버 */}
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500">
        <span className="select-none text-6xl font-bold text-white/75 drop-shadow-sm">
          봄
        </span>
        {/* 상태 뱃지 */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          <BadgeCheck size={11} />
          진행 중
        </div>
      </div>
      {/* 카드 내용 */}
      <div className="space-y-2.5 p-4">
        <p className="font-semibold text-slate-800">봄 맞이 소풍 모임</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={11} className="shrink-0 text-amber-400" />
            <span>3월 15일(토) 오전 10:00</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin size={11} className="shrink-0 text-amber-400" />
            <span>서울 한강공원 반포 지구</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users size={11} className="shrink-0 text-amber-400" />
            <span>12명 / 최대 20명</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 로그인 상태에 따라 CTA 버튼 목적지를 분기하는 서버 컴포넌트
async function HeroButtons() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;
  const startHref = isLoggedIn ? "/events" : "/auth/login";

  return (
    <div className="relative flex w-full flex-col gap-3">
      <Button
        asChild
        size="lg"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/60 transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50"
      >
        <Link href={startHref} className="flex items-center gap-2">
          지금 시작하기
          <ArrowRight size={16} />
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="w-full border-amber-200 bg-white text-amber-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
      >
        <Link href="/events" className="flex items-center gap-2">
          이벤트 둘러보기
          <ChevronRight size={16} />
        </Link>
      </Button>
    </div>
  );
}

// 버튼 로딩 중 fallback
function HeroButtonsFallback() {
  return (
    <div className="relative flex w-full flex-col gap-3">
      <div className="h-11 w-full animate-pulse rounded-lg bg-amber-100/80" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-screen-sm flex-col">
      {/* ===== 1. Hero 섹션 ===== */}
      <section
        className="relative flex flex-col items-center overflow-hidden px-4 pb-14 pt-10 text-center"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 0%, hsl(38 90% 95%) 0%, transparent 72%)",
        }}
      >
        {/* 배경 도트 패턴 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(28 88% 55% / 0.25) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* 뱃지 */}
        <div className="relative mb-6 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-semibold text-amber-600 shadow-sm shadow-amber-100">
          <Sparkles size={11} />
          <span>모임 관리의 새로운 시작</span>
        </div>

        {/* 헤드라인 */}
        <h1 className="relative mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-slate-900">
          모임을 더 쉽게,
          <br />
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            함께를 더 즐겁게
          </span>
        </h1>

        {/* 서브텍스트 */}
        <p className="relative mb-8 max-w-[280px] text-sm leading-relaxed text-slate-500">
          이벤트 생성부터 참여자 관리, 일정 공유까지.
          <br />
          모임의 모든 것을 한 곳에서.
        </p>

        {/* 이벤트 카드 미리보기 */}
        <div className="relative mb-9 w-full max-w-xs">
          <MockEventCard />
          {/* 그림자 반사 효과 */}
          <div className="absolute -bottom-3 left-1/2 h-5 w-4/5 -translate-x-1/2 rounded-full bg-amber-300/20 blur-xl" />
        </div>

        {/* CTA 버튼 */}
        <Suspense fallback={<HeroButtonsFallback />}>
          <HeroButtons />
        </Suspense>

        <p className="relative mt-4 text-xs text-slate-400">
          무료로 시작 · 신용카드 불필요
        </p>
      </section>

      {/* ===== 2. Features 섹션 ===== */}
      <section className="px-4 py-10">
        <div className="mb-7 text-center">
          <h2 className="mb-2 text-xl font-bold text-slate-800">
            필요한 모든 기능
          </h2>
          <p className="text-xs text-slate-500">복잡한 모임 관리를 간단하게.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FeatureCard
            icon={<CalendarDays size={20} />}
            title="손쉬운 이벤트 생성"
            description="몇 번의 탭으로 날짜, 장소, 인원 제한까지 설정하세요."
            iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
            borderAccent="border-amber-100 hover:border-amber-200"
            shadowAccent="hover:shadow-amber-100/60"
          />
          <FeatureCard
            icon={<Users size={20} />}
            title="참여자 관리"
            description="초대 코드로 참여자를 모집하고 한눈에 확인하세요."
            iconBg="bg-gradient-to-br from-rose-400 to-pink-500"
            borderAccent="border-rose-100 hover:border-rose-200"
            shadowAccent="hover:shadow-rose-100/60"
          />
          <FeatureCard
            icon={<Share2 size={20} />}
            title="간편한 일정 공유"
            description="링크 하나로 이벤트를 공유하고 함께해요."
            iconBg="bg-gradient-to-br from-emerald-400 to-teal-500"
            borderAccent="border-emerald-100 hover:border-emerald-200"
            shadowAccent="hover:shadow-emerald-100/60"
          />
        </div>
      </section>

      {/* ===== 3. How it works 섹션 ===== */}
      <section className="relative overflow-hidden px-4 py-10">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/70 via-amber-50/30 to-transparent" />

        <div className="relative">
          <div className="mb-7 text-center">
            <h2 className="mb-2 text-xl font-bold text-slate-800">
              이렇게 사용하세요
            </h2>
            <p className="text-xs text-slate-500">3단계면 충분합니다.</p>
          </div>

          <div className="flex flex-col">
            <StepItem
              number="1"
              title="계정 만들기"
              description="이메일로 빠르게 가입하세요. 1분이면 충분합니다."
            />
            <StepItem
              number="2"
              title="이벤트 생성"
              description="이름, 날짜, 장소를 입력하고 초대 코드를 받으세요."
            />
            <StepItem
              number="3"
              title="함께 즐기기"
              description="초대 코드를 공유하고 즐거운 모임을 만들어보세요."
              isLast
            />
          </div>
        </div>
      </section>

      {/* ===== 4. CTA 섹션 ===== */}
      <section className="px-4 py-10">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-center shadow-xl shadow-amber-200/60">
          {/* 배경 패턴 */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* 배경 하이라이트 */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-orange-300/20 blur-2xl" />

          <CardContent className="relative space-y-5 p-7">
            <h2 className="text-xl font-bold text-white">
              지금 무료로 시작하세요
            </h2>
            <p className="text-xs leading-relaxed text-white/80">
              첫 번째 이벤트를 만드는 데 1분도 걸리지 않습니다.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                asChild
                size="lg"
                className="w-full bg-white font-semibold text-amber-600 shadow-sm transition-all hover:bg-white/95 hover:text-amber-700 hover:shadow-md"
              >
                <Link href="/auth/sign-up" className="flex items-center gap-2">
                  무료 회원가입
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">이미 계정이 있으신가요?</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ===== 5. Footer ===== */}
      <footer className="border-t border-amber-100/80 px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
            <CalendarDays size={11} />
          </div>
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-sm font-bold text-transparent">
            모임
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">이벤트 관리를 더 간편하게</p>
      </footer>
    </div>
  );
}
