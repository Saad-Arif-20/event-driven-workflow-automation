"use client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Key, Shield, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyEvent = () => {
    navigator.clipboard.writeText(`curl -X POST http://localhost:3000/api/v1/events \\\n  -H "Content-Type: application/json" \\\n  -d '{"type":"user_signup","payload":{"email":"test@example.com"}}'`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="space-y-4">
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={14} className="text-amber-600" />
            <h3 className="font-semibold text-sm text-neutral-700">Profile</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-neutral-800"
              style={{ background: "linear-gradient(135deg, #f5cb4c, #e8b830)" }}>
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-semibold text-neutral-800">{user?.email}</p>
              <p className="text-[11px] mt-0.5 text-neutral-400">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
            <span className="ml-auto pill-active">Active</span>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <Key size={14} className="text-amber-600" />
            <h3 className="font-semibold text-sm text-neutral-700">Fire an Event (cURL)</h3>
          </div>
          <div className="rounded-2xl p-4 font-mono text-[11px] relative bg-neutral-800 text-amber-200">
            <pre className="whitespace-pre-wrap">
{`curl -X POST http://localhost:3000/api/v1/events \\
  -H "Content-Type: application/json" \\
  -d '{"type":"user_signup","payload":{"email":"test@example.com"}}'`}
            </pre>
            <Button size="sm" variant="ghost" onClick={copyEvent}
              className="absolute top-3 right-3 h-7 w-7 p-0 text-neutral-500 hover:text-white">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            </Button>
          </div>
          <p className="text-[11px] mt-3 text-neutral-400">
            Fires a trigger event. Active workflows with matching <code className="text-amber-600">triggerType</code> will execute.
          </p>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={14} className="text-amber-600" />
            <h3 className="font-semibold text-sm text-neutral-700">Tech Stack</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Frontend", "Next.js 16 + Tailwind + Shadcn"],
              ["Backend", "Node.js + Express.js"],
              ["Database", "PostgreSQL via Prisma ORM"],
              ["Queue", "BullMQ + Redis"],
              ["Auth", "JWT + bcrypt"],
              ["State", "TanStack React Query"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl p-3 border border-neutral-100" style={{ background: "var(--card-muted)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{k}</p>
                <p className="text-[11px] mt-0.5 text-neutral-700">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-neutral-200" />

        <Button variant="ghost" onClick={logout}
          className="gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl w-full h-11">
          <LogOut size={14} /> Sign out of FlowForge
        </Button>
      </div>
    </div>
  );
}
