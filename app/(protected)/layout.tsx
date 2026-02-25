// 인증된 사용자 레이아웃
// 상단 헤더 + 하단 네비는 app/layout.tsx 전역 레이아웃이 담당
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-screen-sm px-4 py-5">{children}</div>
  );
}
