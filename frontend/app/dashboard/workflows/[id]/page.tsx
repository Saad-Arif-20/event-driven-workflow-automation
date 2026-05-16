"use client";
import { use, useState } from "react";
import { useWorkflow } from "@/hooks/useWorkflows";
import { useExecutions } from "@/hooks/useExecutions";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Workflow, Mail, Webhook, Clock, Zap, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { DEMO_MODE } from "@/lib/mock-data";
import { eventApi } from "@/lib/api";
import { toast } from "sonner";

const ACTION_ICONS: Record<string, any> = { email: Mail, webhook: Webhook, delay: Clock };
const ACTION_COLORS: Record<string, string> = { email: "#e8b830", webhook: "#4caf50", delay: "#42a5f5" };

const STATUS_CFG: Record<string, { icon: any; cls: string }> = {
  SUCCESS: { icon: CheckCircle2, cls: "status-success" },
  FAILED:  { icon: XCircle,     cls: "status-failed" },
  RUNNING: { icon: Loader2,     cls: "status-running" },
  PENDING: { icon: RefreshCw,   cls: "status-paused" },
};

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: workflow, isLoading } = useWorkflow(id);
  const { data: execData, isLoading: execLoading } = useExecutions(id);
  const [firing, setFiring] = useState(false);
  const executions = execData?.executions ?? [];

  const fireEvent = async () => {
    if (!workflow) return;
    setFiring(true);
    try {
      if (DEMO_MODE) { await new Promise((r) => setTimeout(r, 800)); }
      else { await eventApi.fire({ type: workflow.triggerType, payload: { email: "test@example.com" } }); }
      toast.success(`Event "${workflow.triggerType}" fired!`);
    } catch { toast.error("Failed to fire event"); }
    finally { setFiring(false); }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64 rounded-2xl" /><Skeleton className="h-40 rounded-3xl" /></div>;
  if (!workflow) return <p className="text-neutral-400">Workflow not found</p>;

  return (
    <div className="animate-fade-in space-y-5">
      <Header title={workflow.name} subtitle={`Trigger: ${workflow.triggerType}`}
        action={
          <Button onClick={fireEvent} disabled={firing}
            className="gap-2 rounded-2xl text-neutral-900 font-semibold"
            style={{ background: "var(--primary)", border: "none" }}>
            {firing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {firing ? "Firing..." : "Fire Test Event"}
          </Button>
        }
      />

      {/* Steps */}
      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
          <Workflow size={13} className="text-amber-600" />
          <h2 className="font-semibold text-neutral-800 text-sm">Pipeline Steps ({workflow.steps?.length ?? 0})</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 flex-wrap">
            {workflow.steps?.map((step: any, i: number) => {
              const Icon = ACTION_ICONS[step.actionType] ?? Workflow;
              const color = ACTION_COLORS[step.actionType] ?? "#e8b830";
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}15` }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Step {step.stepOrder}</span>
                        <p className="text-xs font-semibold text-neutral-700 capitalize">{step.actionType}</p>
                      </div>
                    </div>
                    <pre className="text-[10px] whitespace-pre-wrap break-all font-mono text-neutral-400 max-w-[200px]">
                      {JSON.stringify(step.config, null, 2)}
                    </pre>
                  </div>
                  {i < (workflow.steps.length - 1) && (
                    <div className="w-4 h-px bg-amber-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Executions */}
      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={13} className="text-amber-600" />
            <h2 className="font-semibold text-neutral-800 text-sm">Execution History</h2>
          </div>
          <span className="text-[10px] text-neutral-400">{DEMO_MODE ? "demo data" : "live · 5s"}</span>
        </div>
        {execLoading ? (
          <div className="p-4 space-y-2">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-2xl" />)}</div>
        ) : executions.length === 0 ? (
          <div className="py-12 text-center"><p className="text-sm text-neutral-400">No executions yet — fire a test event above</p></div>
        ) : (
          <div>
            {executions.map((exec: any, i: number) => {
              const cfg = STATUS_CFG[exec.status] ?? STATUS_CFG.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={exec.id} className={`px-6 py-3.5 ${i < executions.length - 1 ? "border-b border-neutral-100" : ""}`}>
                  <div className="flex items-center gap-4">
                    <Badge className={`text-[11px] px-2.5 py-0.5 rounded-full border-0 font-semibold gap-1.5 ${cfg.cls}`}>
                      <StatusIcon size={10} className={exec.status === "RUNNING" ? "animate-spin" : ""} />
                      {exec.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-neutral-400">{exec.id}</span>
                    <span className="text-[11px] ml-auto text-neutral-400">{new Date(exec.startedAt).toLocaleString()}</span>
                  </div>
                  {exec.logs?.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-[11px] text-amber-600 cursor-pointer hover:text-amber-700 font-semibold">
                        {exec.logs.length} log{exec.logs.length !== 1 ? "s" : ""}
                      </summary>
                      <div className="mt-2 space-y-1">
                        {exec.logs.map((log: any) => (
                          <p key={log.id} className={`text-[11px] font-mono p-2.5 rounded-xl ${
                            log.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}>{log.message}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
