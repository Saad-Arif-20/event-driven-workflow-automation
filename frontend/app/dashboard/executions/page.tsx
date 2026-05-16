"use client";
import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/lib/api";
import { DEMO_MODE, mockEvents } from "@/lib/mock-data";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Zap } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  user_signup: "#e8b830", payment_failed: "#e54d4d", order_placed: "#4caf50",
  user_inactive: "#ff9800", cron_daily: "#42a5f5",
};

export default function ExecutionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: DEMO_MODE ? async () => ({ events: mockEvents }) : () => eventApi.list().then((r) => r.data.data),
    refetchInterval: false,
  });
  const events = data?.events ?? [];

  return (
    <div className="animate-fade-in">
      <Header title="Event Log" subtitle="All incoming trigger events" />

      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
          <Activity size={13} className="text-amber-600" />
          <h2 className="font-semibold text-neutral-800 text-sm">Events</h2>
          <span className="text-[10px] text-neutral-400 ml-2">{events.length} total</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
            <span className="text-[10px] text-green-600 font-semibold">{DEMO_MODE ? "DEMO" : "LIVE"}</span>
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--primary-pale)" }}>
              <Activity size={18} className="text-amber-600" />
            </div>
            <p className="text-sm text-neutral-400">No events received yet.</p>
          </div>
        ) : (
          <div>
            {events.map((ev: any, i: number) => {
              const c = TYPE_COLORS[ev.type] ?? "#e8b830";
              return (
                <div key={ev.id} className={`px-6 py-3.5 flex items-center gap-4 hover:bg-amber-50/30 transition-colors ${
                  i < events.length - 1 ? "border-b border-neutral-100" : ""
                }`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c}12` }}>
                    <Zap size={12} style={{ color: c }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className="text-[10px] px-2 py-0 rounded-full border-0 font-mono font-semibold"
                      style={{ background: `${c}15`, color: c }}>{ev.type}</Badge>
                    <p className="text-[11px] mt-0.5 font-mono truncate text-neutral-400">{JSON.stringify(ev.payload)}</p>
                  </div>
                  <span className="text-[11px] flex-shrink-0 text-neutral-400 tabular-nums">
                    {new Date(ev.createdAt).toISOString().replace("T", " ").substring(0, 19)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
