"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Workflow, Activity, Settings, Zap, LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/dashboard/workflows",  label: "Workflows",   icon: Workflow },
  { href: "/dashboard/executions", label: "Executions",  icon: Activity },
  { href: "/dashboard/settings",   label: "Settings",    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col w-[230px] h-screen sticky top-0 py-6 px-4"
      style={{ background: "var(--background)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--primary)" }}>
          <Zap size={14} className="text-neutral-900" />
        </div>
        <span className="font-bold text-base text-neutral-800 tracking-tight">FlowForge</span>
      </div>

      {/* Nav pills — like Crextio's top nav but vertical */}
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
              }`}>
              <Icon size={16} className={active ? "text-amber-600" : "text-neutral-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="mt-4">
        <div className="rounded-2xl p-3 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-neutral-800"
              style={{ background: "linear-gradient(135deg, #f5cb4c, #e8b830)" }}>
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-neutral-800 truncate">{user?.email?.split("@")[0] ?? "User"}</p>
              <p className="text-[10px] text-neutral-400">Pro Plan</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-red-500 transition-colors w-full px-1">
            <LogOut size={11} /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
