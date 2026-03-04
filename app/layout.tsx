import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, CalendarPlus, Home } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "모임 - 이벤트 관리 앱",
  description:
    "모임을 더 쉽게, 함께를 더 즐겁게. 이벤트 생성부터 참여자 관리까지.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        {/* 라이트 모드 고정 - 다크 모드 비활성화 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {/* ===== 전역 상단 헤더 ===== */}
          <header className="sticky top-0 z-50 w-full border-b border-amber-100/80 bg-white/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
              {/* 앱 로고 */}
              <Link href="/" className="group flex items-center gap-2.5">
                {/* 로고 아이콘: 앰버 그라디언트 */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-200 transition-transform duration-200 group-hover:scale-105">
                  <CalendarDays size={16} />
                </div>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-[17px] font-bold tracking-tight text-transparent">
                  모임
                </span>
              </Link>

              {/* 우측: 인증 버튼 */}
              <Suspense
                fallback={
                  <div className="h-8 w-20 animate-pulse rounded-lg bg-amber-50" />
                }
              >
                <AuthButton />
              </Suspense>
            </div>
          </header>

          {/* ===== 페이지 컨텐츠 (하단 네비 높이만큼 여백) ===== */}
          <div className="pb-16">{children}</div>

          {/* ===== 전역 하단 탭 네비게이션 (모든 페이지 공통) ===== */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-amber-100/80 bg-white/95 shadow-[0_-1px_12px_rgba(251,191,36,0.08)] backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-screen-sm items-center justify-around px-2">
              {/* 홈 */}
              <Link
                href="/"
                className="group flex flex-col items-center gap-1 px-6 py-2 text-slate-400 transition-colors hover:text-amber-500"
              >
                <Home size={20} strokeWidth={1.75} />
                <span className="text-[10px] font-semibold tracking-wide">
                  홈
                </span>
              </Link>

              {/* 이벤트 */}
              <Link
                href="/events"
                className="group flex flex-col items-center gap-1 px-6 py-2 text-slate-400 transition-colors hover:text-amber-500"
              >
                <CalendarDays size={20} strokeWidth={1.75} />
                <span className="text-[10px] font-semibold tracking-wide">
                  이벤트
                </span>
              </Link>

              {/* 새 이벤트 (중앙 강조) */}
              <Link
                href="/events/new"
                className="flex flex-col items-center gap-1 px-6 py-2"
                aria-label="새 이벤트 만들기"
              >
                {/* 새 이벤트 버튼: 앰버 그라디언트 */}
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 transition-all duration-200 hover:shadow-lg hover:shadow-amber-300/50 active:scale-95">
                  <CalendarPlus size={21} strokeWidth={1.75} />
                </div>
              </Link>
            </div>
          </nav>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
