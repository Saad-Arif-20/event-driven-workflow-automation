"use client";
import { useWorkflows, useDeleteWorkflow } from "@/hooks/useWorkflows";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus, Workflow, ArrowRight, Trash2, Zap, Mail, Webhook, Clock } from "lucide-react";

const ICONS: Record<string, any> = { email: Mail, webhook: Webhook, delay: Clock };

export default function WorkflowsPage() {
  const { data, isLoading } = useWorkflows();
  const deleteMutation = useDeleteWorkflow();
  const workflows = data?.workflows ?? [];

  return (
    <div className="animate-fade-in">
      <Header title="Workflows" subtitle="Build and manage your automation workflows"
        action={
          <Link href="/dashboard/workflows/new">
            <Button className="gap-2 rounded-2xl text-[13px] font-semibold text-neutral-900"
              style={{ background: "var(--primary)", border: "none" }}>
              <Plus size={14} /> New Workflow
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid gap-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}</div>
      ) : workflows.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--primary-pale)" }}>
            <Workflow size={22} className="text-amber-600" />
          </div>
          <p className="font-semibold text-neutral-700 text-lg">No workflows yet</p>
          <p className="text-sm mt-1 mb-5 text-neutral-400">Create your first automation in minutes</p>
          <Link href="/dashboard/workflows/new">
            <Button className="gap-2 rounded-2xl text-neutral-900 font-semibold" style={{ background: "var(--primary)", border: "none" }}>
              <Plus size={14} /> Create your first workflow
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {workflows.map((w: any) => (
            <div key={w.id} className="card-base p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: w.isActive ? "var(--primary-pale)" : "#f5f5f5" }}>
                  <Workflow size={16} className={w.isActive ? "text-amber-600" : "text-neutral-400"} />
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">{w.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-amber-600 font-mono">
                      <Zap size={9} /> {w.triggerType}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {w.steps?.length ?? 0} steps · {w._count?.executions ?? 0} runs
                    </span>
                  </div>
                  {/* Mini flow */}
                  <div className="flex items-center gap-0.5 mt-2">
                    {(w.steps ?? []).slice(0, 5).map((s: any, i: number) => {
                      const Icon = ICONS[s.actionType] ?? Zap;
                      return (
                        <div key={i} className="flex items-center gap-0.5">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--primary-pale)" }}>
                            <Icon size={9} className="text-amber-600" />
                          </div>
                          {i < (w.steps ?? []).slice(0, 5).length - 1 && <div className="w-1.5 h-px bg-amber-200" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${w.isActive ? "pill-active" : "status-paused"}`}>
                  {w.isActive ? "Active" : "Paused"}
                </span>
                <Link href={`/dashboard/workflows/${w.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-[11px] text-neutral-400 hover:text-neutral-800 rounded-xl">
                    View <ArrowRight size={11} />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-red-500 rounded-xl h-8 w-8 p-0"
                  onClick={() => deleteMutation.mutate(w.id)} disabled={deleteMutation.isPending}>
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
