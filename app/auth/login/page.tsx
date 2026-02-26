// 로그인 페이지 - 전역 헤더 아래 중앙 정렬
import { LoginForm } from "@/components/login-form";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function Page({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-screen-sm items-center justify-center px-4 py-10">
      <div className="w-full">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
