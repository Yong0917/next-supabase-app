// 인증 상태에 따른 컴팩트 버튼 (모바일 우선)
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return user ? (
    <LogoutButton />
  ) : (
    <Button asChild size="sm">
      <Link href="/auth/login">로그인</Link>
    </Button>
  );
}
