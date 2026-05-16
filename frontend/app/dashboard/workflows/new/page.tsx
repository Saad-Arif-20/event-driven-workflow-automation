"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkflow } from "@/hooks/useWorkflows";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Mail, Webhook, Clock, Zap, ArrowRight, Loader2 } from "lucide-react";

const ACTION_ICONS: Record<string, any> = { email: Mail, webhook: Webhook, delay: Clock };

interface Step { stepOrder: number; actionType: "email" | "webhook" | "delay"; config: Record<string, string>; }

function StepCard({ step, index, onRemove, onChange }: { step: Step; index: number; onRemove: () => void; onChange: (s: Step) => void; }) {
  const Icon = ACTION_ICONS[step.actionType];
  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-3 mb-4">
        <GripVertical size={14} className="text-neutral-300 cursor-grab" />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--primary-pale)" }}>
          <Icon size={13} className="text-amber-600" />
        </div>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Step {index + 1}</span>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-neutral-300 hover:text-red-500 h-7 w-7 p-0">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Action Type</Label>
          <Select value={step.actionType}
            onValueChange={(v) => onChange({ ...step, actionType: v as any, config: {} })}>
            <SelectTrigger className="h-9 text-sm rounded-xl border-neutral-200 bg-neutral-50"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white border-neutral-200 rounded-xl">
              <SelectItem value="email">📧 Send Email</SelectItem>
              <SelectItem value="webhook">🔗 Webhook Call</SelectItem>
              <SelectItem value="delay">⏱ Delay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {step.actionType === "email" && (<>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">To</Label>
            <Input placeholder="{{email}}" className="h-9 text-sm rounded-xl border-neutral-200 bg-neutral-50"
              value={step.config.to ?? ""} onChange={(e) => onChange({ ...step, config: { ...step.config, to: e.target.value } })} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Subject</Label>
            <Input placeholder="Welcome!" className="h-9 text-sm rounded-xl border-neutral-200 bg-neutral-50"
              value={step.config.subject ?? ""} onChange={(e) => onChange({ ...step, config: { ...step.config, subject: e.target.value } })} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Body</Label>
            <Input placeholder="Hi {{email}}" className="h-9 text-sm rounded-xl border-neutral-200 bg-neutral-50"
              value={step.config.body ?? ""} onChange={(e) => onChange({ ...step, config: { ...step.config, body: e.target.value } })} />
          </div>
        </>)}
        {step.actionType === "webhook" && (<>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">URL</Label>
            <Input placeholder="https://api.example.com/hook" className="h-9 text-sm rounded-xl border-neutral-200 bg-neutral-50"
              value={step.config.url ?? ""} onChange={(e) => onChange({ ...step, config: { ...step.config, url: e.target.value } })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Method</Label>
            <Select value={step.config.method ?? "POST"}
              onValueChange={(v: string | null) => onChange({ ...step, config: { ...step.config, method: v ?? "POST" } })}>
              <SelectTrigger className="h-9 text-sm rounded-xl border-neutral-200 bg-neutral-50"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white border-neutral-200 rounded-xl">
                <SelectItem value="POST">POST</SelectItem><SelectItem value="PUT">PUT</SelectItem><SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>)}
        {step.actionType === "delay" && (
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Seconds</Label>
            <Input type="number" min={1} max={300} placeholder="30" className="h-9 text-sm rounded-xl border-neutral-200 bg-neutral-50"
              value={step.config.seconds ?? ""} onChange={(e) => onChange({ ...step, config: { ...step.config, seconds: e.target.value } })} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewWorkflowPage() {
  const router = useRouter();
  const createMutation = useCreateWorkflow();
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);

  const addStep = () => setSteps((s) => [...s, { stepOrder: s.length + 1, actionType: "email", config: {} }]);
  const removeStep = (i: number) => setSteps((s) => s.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepOrder: idx + 1 })));
  const updateStep = (i: number, u: Step) => setSteps((s) => s.map((step, idx) => (idx === i ? u : step)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, triggerType, steps }, { onSuccess: () => router.push("/dashboard/workflows") });
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <Header title="New Workflow" subtitle="Define a trigger and add action steps" />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card-base p-6 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <Zap size={14} className="text-amber-600" /> Workflow Details
          </h3>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Workflow Name</Label>
            <Input placeholder="e.g. User Signup Automation" required value={name}
              onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl border-neutral-200 bg-neutral-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Trigger Type</Label>
            <Input placeholder="e.g. user_signup" required value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)} className="h-10 rounded-xl border-neutral-200 bg-neutral-50" />
            <p className="text-[11px] text-neutral-400">Matches the <code className="text-amber-600">type</code> field in POST /events</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700">Steps <span className="text-neutral-400 font-normal">({steps.length})</span></h3>
          {steps.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-neutral-400">No steps yet</p>
              <p className="text-[11px] mt-1 mb-3 text-neutral-300">Add at least one action step</p>
            </div>
          )}
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} onRemove={() => removeStep(i)} onChange={(u) => updateStep(i, u)} />
          ))}
          <Button type="button" variant="outline" onClick={addStep}
            className="w-full rounded-2xl border-dashed border-neutral-200 gap-2 text-sm text-neutral-400 hover:text-neutral-700 hover:border-amber-300 h-11 bg-transparent">
            <Plus size={14} /> Add Step
          </Button>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}
            className="flex-1 rounded-2xl text-neutral-400 hover:text-neutral-700 h-11 bg-neutral-100">
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || steps.length === 0}
            className="flex-1 gap-2 rounded-2xl h-11 font-semibold text-neutral-900"
            style={{ background: "var(--primary)", border: "none" }}>
            {createMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <>Create Workflow <ArrowRight size={14} /></>}
          </Button>
        </div>
      </form>
    </div>
  );
}
