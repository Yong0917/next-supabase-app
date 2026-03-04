import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Plus, Ticket } from "lucide-react";

import {
  getAllEvents,
  getMyHostedEvents,
  getMyParticipatingEvents,
} from "./actions";
import { EventCard } from "@/components/events/event-card";
import { EventFilter } from "@/components/events/event-filter";
import { InviteCodeInput } from "@/components/events/invite-code-input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";

interface EventsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

async function EventsContent({ searchParams }: EventsPageProps) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { search, status } = await searchParams;

  const [hostedResult, participatingResult, allResult] = await Promise.all([
    getMyHostedEvents(),
    getMyParticipatingEvents(),
    getAllEvents({
      search: search || undefined,
      status: status || undefined,
    }),
  ]);

  const hostedEvents = "data" in hostedResult ? hostedResult.data : [];
  const participatingEvents =
    "data" in participatingResult ? participatingResult.data : [];
  const allEvents = "data" in allResult ? allResult.data : [];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">이벤트</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            모임을 만들고, 함께 참여하세요
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/events/new">
            <Plus size={15} className="mr-1" />새 이벤트
          </Link>
        </Button>
      </div>

      {/* 초대 코드로 참여 */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ticket size={14} />
          </div>
          <p className="text-sm font-semibold">초대 코드로 참여하기</p>
        </div>
        <InviteCodeInput />
      </div>

      <Separator />

      {/* 탭 */}
      <Tabs defaultValue="all">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            전체 이벤트 ({allEvents.length})
          </TabsTrigger>
          <TabsTrigger value="hosted" className="flex-1">
            내 이벤트 ({hostedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="participating" className="flex-1">
            참여 중 ({participatingEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* 전체 이벤트 */}
        <TabsContent value="all" className="mt-4">
          {/* 검색/필터 UI */}
          <Suspense>
            <EventFilter />
          </Suspense>
          {allEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className="text-3xl">📅</span>
              <p className="text-sm font-medium text-muted-foreground">
                {search || status
                  ? "조건에 맞는 이벤트가 없습니다."
                  : "진행 중인 이벤트가 없습니다."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {allEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  participantCount={event.participantCount}
                  myRole={event.myRole}
                  href={`/invite/${event.invite_code}`}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 주최한 이벤트 */}
        <TabsContent value="hosted" className="mt-4">
          {hostedEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="text-3xl">✨</span>
              <p className="text-sm font-medium text-muted-foreground">
                주최한 이벤트가 없습니다.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events/new">첫 이벤트 만들기</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {hostedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 참여한 이벤트 */}
        <TabsContent value="participating" className="mt-4">
          {participatingEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className="text-3xl">🎟️</span>
              <p className="text-sm font-medium text-muted-foreground">
                참여한 이벤트가 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {participatingEvents.map((item) => (
                <EventCard key={item.event_id} event={item.event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EventsPage({ searchParams }: EventsPageProps) {
  return (
    <Suspense>
      <EventsContent searchParams={searchParams} />
    </Suspense>
  );
}
