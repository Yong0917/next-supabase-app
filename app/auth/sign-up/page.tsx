// 회원가입 페이지 - 전역 헤더 아래 중앙 정렬
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-screen-sm items-center justify-center px-4 py-10">
      <div className="w-full">
        <SignUpForm />
      </div>
    </div>
  );
}
