"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface InviteCodeDisplayProps {
  inviteCode: string;
}

export function InviteCodeDisplay({ inviteCode }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
      <span className="font-mono text-sm font-semibold tracking-widest">
        {inviteCode}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2"
        aria-label="초대 코드 복사"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs">{copied ? "복사됨!" : "복사"}</span>
      </Button>
    </div>
  );
}
