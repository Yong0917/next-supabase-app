import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, CalendarPlus, Home } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* ===== 전역 상단 헤더 ===== */}
          <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
              {/* 앱 로고 */}
              <Link href="/" className="flex items-center gap-2">
                {/* 로고 아이콘: 앰버 그라디언트 */}
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                  <CalendarDays size={15} />
                </div>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-base font-bold tracking-tight text-transparent">
                  모임
                </span>
              </Link>

              {/* 우측: 인증 버튼 */}
              <Suspense
                fallback={
                  <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
                }
              >
                <AuthButton />
              </Suspense>
            </div>
          </header>

          {/* ===== 페이지 컨텐츠 (하단 네비 높이만큼 여백) ===== */}
          <div className="pb-16">{children}</div>

          {/* ===== 전역 하단 탭 네비게이션 (모든 페이지 공통) ===== */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-screen-sm items-center justify-around px-2">
              {/* 홈 */}
              <Link
                href="/"
                className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Home size={20} />
                <span className="text-xs font-medium">홈</span>
              </Link>

              {/* 이벤트 */}
              <Link
                href="/events"
                className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <CalendarDays size={20} />
                <span className="text-xs font-medium">이벤트</span>
              </Link>

              {/* 새 이벤트 (중앙 강조) */}
              <Link
                href="/events/new"
                className="flex flex-col items-center gap-1 px-6 py-2"
                aria-label="새 이벤트 만들기"
              >
                {/* 새 이벤트 버튼: 앰버 그라디언트 */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md transition-transform active:scale-95">
                  <CalendarPlus size={20} />
                </div>
              </Link>
            </div>
          </nav>
        </ThemeProvider>
      </body>
    </html>
  );
}
