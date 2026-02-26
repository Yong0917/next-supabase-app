"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteCodeInput() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) {
      router.push(`/invite/${trimmed}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="예: 925D37A5"
        className="font-mono text-sm tracking-widest placeholder:font-sans placeholder:tracking-normal"
        maxLength={8}
      />
      <Button
        type="submit"
        size="sm"
        disabled={code.trim().length === 0}
        className="shrink-0 gap-1.5"
      >
        참여
        <ArrowRight size={14} />
      </Button>
    </form>
  );
}
