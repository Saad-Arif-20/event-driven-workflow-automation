"use client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";
import { Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, loginLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg shadow-amber-900/5 animate-fade-in">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--primary)" }}>
          <Zap size={16} className="text-neutral-900" />
        </div>
        <span className="font-bold text-lg text-neutral-800">FlowForge</span>
      </div>

      <h1 className="text-2xl font-bold text-neutral-800 mb-1">Welcome back</h1>
      <p className="text-sm mb-8 text-neutral-400">Sign in to your automation dashboard</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Email address
          </Label>
          <Input id="email" type="email" placeholder="you@company.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className="h-11 rounded-2xl border-neutral-200 bg-neutral-50 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-300 placeholder:text-neutral-300" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Password
          </Label>
          <Input id="password" type="password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required
            className="h-11 rounded-2xl border-neutral-200 bg-neutral-50 focus-visible:ring-1 focus-visible:ring-amber-400 placeholder:text-neutral-300" />
        </div>
        <Button type="submit" disabled={loginLoading}
          className="w-full h-11 font-semibold rounded-2xl text-neutral-900 hover:brightness-105 transition-all"
          style={{ background: "var(--primary)", border: "none" }}>
          {loginLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          {loginLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm mt-6 text-neutral-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
