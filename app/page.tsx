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
  accent: string;
}

// 기능 카드 컴포넌트
function FeatureCard({
  icon,
  title,
  description,
  iconBg,
  accent,
}: FeatureCardProps) {
  return (
    <Card
      className={`group flex flex-col gap-4 overflow-hidden border-border/50 bg-card/50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${accent}`}
    >
      <CardHeader className="p-0">
        <div
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white ${iconBg}`}
        >
          {icon}
        </div>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <CardDescription className="text-xs leading-relaxed">
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm shadow-amber-200 dark:shadow-amber-900">
          {number}
        </div>
        {!isLast && (
          <div className="mt-1 h-full w-px bg-gradient-to-b from-amber-300 to-transparent dark:from-amber-700" />
        )}
      </div>
      <div className="space-y-1 pb-6 pt-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

// 히어로 영역에 보여줄 이벤트 카드 미리보기
function MockEventCard() {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/10 dark:shadow-black/30">
      {/* 그라디언트 커버 */}
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500">
        <span className="select-none text-6xl font-bold text-white/75 drop-shadow-sm">
          봄
        </span>
        {/* 승인 뱃지 */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          <BadgeCheck size={10} />
          진행 중
        </div>
      </div>
      {/* 카드 내용 */}
      <div className="space-y-2 p-4">
        <p className="font-semibold">봄 맞이 소풍 모임</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={11} />
            <span>3월 15일(토) 오전 10:00</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={11} />
            <span>서울 한강공원 반포 지구</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={11} />
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
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg dark:shadow-amber-900/30"
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
        className="w-full border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800/60 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
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
      <div className="h-11 w-full animate-pulse rounded-md bg-amber-200/60 dark:bg-amber-900/30" />
      <div className="h-11 w-full animate-pulse rounded-md bg-muted/60" />
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
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(38 80% 94%) 0%, transparent 70%)",
        }}
      >
        {/* 배경 도트 패턴 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(28 88% 50% / 0.2) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* 뱃지 */}
        <div className="relative mb-6 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400">
          <Sparkles size={11} />
          <span>모임 관리의 새로운 시작</span>
        </div>

        {/* 헤드라인 */}
        <h1 className="relative mb-3 text-[2.1rem] font-bold leading-tight tracking-tight text-foreground">
          모임을 더 쉽게,
          <br />
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            함께를 더 즐겁게
          </span>
        </h1>

        {/* 서브텍스트 */}
        <p className="relative mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
          이벤트 생성부터 참여자 관리, 일정 공유까지.
          <br />
          모임의 모든 것을 한 곳에서.
        </p>

        {/* 이벤트 카드 미리보기 */}
        <div className="relative mb-9 w-full max-w-xs">
          <MockEventCard />
          {/* 그림자 반사 효과 */}
          <div className="absolute -bottom-3 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-full bg-black/10 blur-lg dark:bg-black/30" />
        </div>

        {/* CTA 버튼 */}
        <Suspense fallback={<HeroButtonsFallback />}>
          <HeroButtons />
        </Suspense>

        <p className="relative mt-4 text-xs text-muted-foreground">
          무료로 시작 · 신용카드 불필요
        </p>
      </section>

      {/* ===== 2. Features 섹션 ===== */}
      <section className="px-4 py-10">
        <div className="mb-7 text-center">
          <h2 className="mb-1.5 text-xl font-bold text-foreground">
            필요한 모든 기능
          </h2>
          <p className="text-xs text-muted-foreground">
            복잡한 모임 관리를 간단하게.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FeatureCard
            icon={<CalendarDays size={20} />}
            title="손쉬운 이벤트 생성"
            description="몇 번의 탭으로 날짜, 장소, 인원 제한까지 설정하세요."
            iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
            accent="hover:border-amber-200 hover:shadow-amber-100/50 dark:hover:border-amber-800/50 dark:hover:shadow-amber-900/20"
          />
          <FeatureCard
            icon={<Users size={20} />}
            title="참여자 관리"
            description="초대 코드로 참여자를 모집하고 한눈에 확인하세요."
            iconBg="bg-gradient-to-br from-rose-400 to-pink-500"
            accent="hover:border-rose-200 hover:shadow-rose-100/50 dark:hover:border-rose-800/50 dark:hover:shadow-rose-900/20"
          />
          <FeatureCard
            icon={<Share2 size={20} />}
            title="간편한 일정 공유"
            description="링크 하나로 이벤트를 공유하고 함께해요."
            iconBg="bg-gradient-to-br from-emerald-400 to-teal-500"
            accent="hover:border-emerald-200 hover:shadow-emerald-100/50 dark:hover:border-emerald-800/50 dark:hover:shadow-emerald-900/20"
          />
        </div>
      </section>

      {/* ===== 3. How it works 섹션 ===== */}
      <section className="relative overflow-hidden px-4 py-10">
        {/* 배경 */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-amber-50/30 to-transparent dark:from-amber-950/20 dark:via-amber-950/10 dark:to-transparent" />

        <div className="relative">
          <div className="mb-7 text-center">
            <h2 className="mb-1.5 text-xl font-bold text-foreground">
              이렇게 사용하세요
            </h2>
            <p className="text-xs text-muted-foreground">3단계면 충분합니다.</p>
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
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-center shadow-xl shadow-amber-200/50 dark:shadow-amber-900/30">
          {/* 배경 패턴 */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
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
                className="w-full bg-white font-semibold text-amber-600 shadow-sm hover:bg-white/90 hover:text-amber-700"
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
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">이미 계정이 있으신가요?</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ===== 5. Footer ===== */}
      <footer className="border-t border-border/50 px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <CalendarDays size={11} />
          </div>
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-sm font-semibold text-transparent">
            모임
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          이벤트 관리를 더 간편하게
        </p>
      </footer>
    </div>
  );
}
