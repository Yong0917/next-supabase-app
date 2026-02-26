import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getMyHostedEvents, getMyParticipatingEvents } from "./actions";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";

async function EventsContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const [hostedResult, participatingResult] = await Promise.all([
    getMyHostedEvents(),
    getMyParticipatingEvents(),
  ]);

  const hostedEvents = "data" in hostedResult ? hostedResult.data : [];
  const participatingEvents =
    "data" in participatingResult ? participatingResult.data : [];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 이벤트</h1>
        <Button asChild>
          <Link href="/events/new">새 이벤트 만들기</Link>
        </Button>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="hosted">
        <TabsList className="w-full">
          <TabsTrigger value="hosted" className="flex-1">
            주최한 이벤트 ({hostedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="participating" className="flex-1">
            참여한 이벤트 ({participatingEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* 주최한 이벤트 */}
        <TabsContent value="hosted" className="mt-4">
          {hostedEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
              <p>주최한 이벤트가 없습니다.</p>
              <Button variant="outline" asChild>
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
            <div className="py-12 text-center text-muted-foreground">
              <p>참여한 이벤트가 없습니다.</p>
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

export default function EventsPage() {
  return (
    <Suspense>
      <EventsContent />
    </Suspense>
  );
}
