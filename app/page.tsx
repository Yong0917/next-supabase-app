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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// 기능 카드 타입
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}

// 기능 카드 컴포넌트
function FeatureCard({ icon, title, description, iconBg }: FeatureCardProps) {
  return (
    <Card className="flex flex-col gap-4 border-border/50 bg-card/50 p-5 transition-all duration-200 hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800">
      <CardHeader className="p-0">
        {/* 아이콘 배경: 각 카드별로 다른 컬러 적용 */}
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
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      {/* 단계 번호: 그라디언트 배경 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
        {number}
      </div>
      <div className="space-y-1 pt-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    // max-w-screen-sm: 모바일 화면 기준 최대 너비
    <div className="mx-auto flex w-full max-w-screen-sm flex-col">
      {/* ===== 1. Hero 섹션 ===== */}
      {/* 배경: indigo-50 → white → purple-50 그라디언트 */}
      <section className="flex flex-col items-center bg-gradient-to-b from-indigo-50 via-white to-purple-50 px-4 pb-12 pt-10 text-center dark:from-indigo-950/30 dark:via-background dark:to-purple-950/20">
        {/* 뱃지: indigo 계열 컬러 */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Sparkles size={11} />
          <span>모임 관리의 새로운 시작</span>
        </div>

        {/* 헤드라인 */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
          모임을 더 쉽게,
          <br />
          {/* 강조 텍스트: 그라디언트 */}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            함께를 더 즐겁게
          </span>
        </h1>

        {/* 서브텍스트 */}
        <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
          이벤트 생성부터 참여자 관리, 일정 공유까지. 모임의 모든 것을 한
          곳에서.
        </p>

        {/* CTA 버튼 */}
        <div className="flex w-full flex-col gap-3">
          {/* 시작하기 버튼: 그라디언트 배경 */}
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transition-all duration-200 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg"
          >
            <Link href="/auth/login" className="flex items-center gap-2">
              시작하기
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
          >
            <Link href="/events" className="flex items-center gap-2">
              둘러보기
              <ChevronRight size={16} />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          무료로 시작 · 신용카드 불필요
        </p>
      </section>

      {/* ===== 2. Features 섹션 ===== */}
      <section className="px-4 py-10">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-foreground">
            필요한 모든 기능
          </h2>
          <p className="text-xs text-muted-foreground">
            복잡한 모임 관리를 간단하게.
          </p>
        </div>

        {/* 기능 카드 그리드: 모바일 1열, sm 이상 3열 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* 아이콘 배경: 각각 indigo, violet, purple 계열 */}
          <FeatureCard
            icon={<CalendarDays size={20} />}
            title="손쉬운 이벤트 생성"
            description="몇 번의 탭으로 날짜, 장소, 인원 제한까지 설정하세요."
            iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <FeatureCard
            icon={<Users size={20} />}
            title="참여자 관리"
            description="초대 코드로 참여자를 모집하고 한눈에 확인하세요."
            iconBg="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <FeatureCard
            icon={<Share2 size={20} />}
            title="간편한 일정 공유"
            description="링크 하나로 이벤트를 공유하고 함께해요."
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>
      </section>

      {/* ===== 3. How it works 섹션 ===== */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-purple-50/50 px-4 py-10 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-foreground">
            이렇게 사용하세요
          </h2>
          <p className="text-xs text-muted-foreground">3단계면 충분합니다.</p>
        </div>

        {/* 단계 목록: 모바일 세로 나열 */}
        <div className="flex flex-col gap-6">
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
          />
        </div>
      </section>

      {/* ===== 4. CTA 섹션 ===== */}
      <section className="px-4 py-10">
        {/* CTA 카드: indigo → purple 그라디언트 배경 */}
        <Card className="border-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-center shadow-lg">
          <CardContent className="space-y-5 p-6">
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
                className="w-full bg-white text-indigo-600 hover:bg-white/90"
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
          {/* 푸터 로고 */}
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CalendarDays size={11} />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-sm font-semibold text-transparent">
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
