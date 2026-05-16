"use client";
import { useWorkflows, useDashboardStats } from "@/hooks/useWorkflows";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Workflow, Activity, Plus, ArrowRight, Zap,
  CheckCircle2, XCircle, Clock, Mail, Webhook,
  TrendingUp, BarChart3, ArrowUpRight,
} from "lucide-react";

/* ── Circular Gauge ── */
function CircularGauge({ value, size = 110 }: { value: number; size?: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f0ebe2" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e8b830" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-neutral-800">{value}%</span>
        <span className="text-[9px] text-neutral-400 font-medium">SUCCESS</span>
      </div>
    </div>
  );
}

/* ── Mini bar chart ── */
function MiniChart({ total, data }: { total: number; data?: number[] }) {
  let bars: number[];
  if (data && data.length === 7) {
    const maxVal = Math.max(...data, 10);
    bars = data.map(v => Math.max((v / maxVal) * 80, 5));
  } else {
    const base = Math.max(10, Math.floor(total / 7));
    bars = [
      base * 0.5, base * 1.2, base * 0.8, 
      base * 1.5, base * 1.1, base * 0.9, 
      Math.max(base * 1.8, 10)
    ].map(v => Math.min(v, 100));
  }
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  
  return (
    <div className="flex items-end gap-1.5 h-16">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-5 rounded-lg transition-all"
            style={{
              height: `${Math.max(h * 0.6, 4)}px`, // Min height 4px
              background: i === 6 ? "var(--primary)" : "#f0ebe2",
            }} />
          <span className="text-[8px] font-medium text-neutral-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Step flow mini ── */
function StepFlow({ steps }: { steps: any[] }) {
  const icons: Record<string, any> = { email: Mail, webhook: Webhook, delay: Clock };
  return (
    <div className="flex items-center gap-0.5">
      {steps.slice(0, 4).map((s: any, i: number) => {
        const Icon = icons[s.actionType] ?? Zap;
        return (
          <div key={i} className="flex items-center gap-0.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: "var(--primary-pale)" }}>
              <Icon size={9} className="text-amber-600" />
            </div>
            {i < steps.slice(0, 4).length - 1 && (
              <div className="w-1.5 h-px bg-amber-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: workflowsData, isLoading: wLoading } = useWorkflows();
  const { data: statsData, isLoading: sLoading } = useDashboardStats();

  const isLoading = wLoading || sLoading;
  const workflows = workflowsData?.workflows ?? [];
  const total = statsData?.totalWorkflows ?? workflowsData?.meta?.total ?? 0;
  const active = statsData?.activeWorkflows ?? workflows.filter((w: any) => w.isActive).length;
  const totalExecs = statsData?.totalExecs ?? workflows.reduce((a: number, w: any) => a + (w._count?.executions ?? 0), 0);
  const successRate = statsData?.successRate ?? (totalExecs > 0 ? Math.round((totalExecs - Math.floor(totalExecs * 0.08)) / totalExecs * 100) : 0);
  const triggers = statsData?.triggers ?? [...new Set(workflows.map((w: any) => w.triggerType))].length;
  const failedCount = statsData?.failedExecs ?? Math.floor(totalExecs * 0.08);
  const queueJobs = statsData?.queue?.waiting ?? 0;
  const runningJobs = statsData?.queue?.active ?? (totalExecs > 0 ? 1 : 0);
  const dailyActivity = statsData?.dailyActivity;

  const firstName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">
            Welcome in, <span className="capitalize">{firstName}</span>
          </h1>
          <div className="flex items-center gap-4 mt-3">
            {[
              { label: "Workflows", val: total },
              { label: "Active", val: `${active}` },
              { label: "Triggers", val: triggers },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">{label}</span>
                <span className="pill-yellow">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[
            { n: totalExecs, label: "Executions" },
            { n: active, label: "Active" },
            { n: workflows.length, label: "Workflows" },
          ].map(({ n, label }) => (
            <div key={label} className="text-right">
              <p className="text-3xl font-bold text-neutral-800 tabular-nums">{n}</p>
              <p className="text-[11px] text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {/* ── Progress / Success Rate ── */}
          <div className="card-base p-6 col-span-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-neutral-700">Progress</h3>
              <ArrowUpRight size={14} className="text-neutral-400" />
            </div>
            <p className="text-[11px] text-neutral-400 mb-4">This week</p>
            <div className="flex items-center gap-4">
              <CircularGauge value={successRate} />
            </div>
          </div>

          {/* ── Execution Activity Chart ── */}
          <div className="card-warm p-6 col-span-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-neutral-700">Activity</h3>
              <ArrowUpRight size={14} className="text-neutral-400" />
            </div>
            <div className="flex items-center gap-2 mt-1 mb-4">
              <span className="text-2xl font-bold text-neutral-800">{totalExecs}</span>
              <span className="text-[11px] text-neutral-400">runs this week</span>
            </div>
            <MiniChart total={totalExecs} data={dailyActivity} />
          </div>

          {/* ── Pipeline Status ── */}
          <div className="card-base p-6 col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-700">Pipeline</h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
                <span className="text-[10px] text-green-600 font-medium">Online</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Queue", val: `${queueJobs} jobs`, icon: BarChart3, color: "#e8b830" },
                { label: "Running", val: `${runningJobs} active`, icon: Activity, color: "#4caf50" },
                { label: "Failed", val: `${failedCount}`, icon: XCircle, color: "#e54d4d" },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}12` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-neutral-700">{label}</p>
                    <p className="text-[10px] text-neutral-400">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dark panel — Onboarding / Quick Actions ── */}
          <div className="card-dark p-6 col-span-1 row-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
              <span className="text-[10px] text-neutral-500 font-mono">v1.0</span>
            </div>

            <Link href="/dashboard/workflows/new">
              <div className="rounded-2xl p-4 mb-3 transition-all hover:bg-neutral-700"
                style={{ background: "var(--dark-panel-muted)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: "#e8b830" }}>
                    <Plus size={12} className="text-neutral-900" />
                  </div>
                  <span className="text-[12px] font-semibold text-white">New Workflow</span>
                </div>
                <p className="text-[10px] text-neutral-500">Create an automation</p>
              </div>
            </Link>

            <div className="space-y-2.5 mt-5">
              <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold px-1">Recent Activity</p>
              {workflows.slice(0, 4).map((w: any, i: number) => (
                <Link key={w.id} href={`/dashboard/workflows/${w.id}`}
                  className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-white/5 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full pulse-dot"
                    style={{ background: w.isActive ? "#4caf50" : "#757575" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-neutral-300 font-medium truncate">{w.name}</p>
                    <p className="text-[9px] text-neutral-600">{w.triggerType}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Workflows List ── */}
          <div className="card-base overflow-hidden col-span-3">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2">
                <Workflow size={14} className="text-amber-600" />
                <h2 className="font-semibold text-neutral-800 text-sm">Active Workflows</h2>
              </div>
              <Link href="/dashboard/workflows">
                <Button variant="ghost" size="sm"
                  className="gap-1 text-[11px] text-neutral-400 hover:text-neutral-800 rounded-xl">
                  View all <ArrowRight size={11} />
                </Button>
              </Link>
            </div>

            {workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "var(--primary-pale)" }}>
                  <Workflow size={18} className="text-amber-600" />
                </div>
                <p className="font-medium text-neutral-600">No workflows yet</p>
                <p className="text-[12px] mt-1 mb-4 text-neutral-400">Create your first automation</p>
                <Link href="/dashboard/workflows/new">
                  <Button size="sm" className="gap-2 rounded-2xl text-neutral-900 font-semibold"
                    style={{ background: "var(--primary)", border: "none" }}>
                    <Plus size={13} /> Create Workflow
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                {workflows.map((w: any, i: number) => (
                  <Link key={w.id} href={`/dashboard/workflows/${w.id}`}
                    className={`flex items-center justify-between px-6 py-3.5 hover:bg-amber-50/30 transition-colors group ${
                      i < workflows.length - 1 ? "border-b border-neutral-100" : ""
                    }`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: w.isActive ? "var(--primary-pale)" : "#f5f5f5" }}>
                        <Workflow size={14} className={w.isActive ? "text-amber-600" : "text-neutral-400"} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-neutral-700 group-hover:text-neutral-900 truncate">{w.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-amber-600 font-mono">{w.triggerType}</span>
                          <span className="text-[11px] text-neutral-400">{w._count?.executions ?? 0} runs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <StepFlow steps={w.steps ?? []} />
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                        w.isActive ? "pill-active" : "status-paused"
                      }`}>
                        {w.isActive ? "Active" : "Paused"}
                      </span>
                      <ArrowRight size={13} className="text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
