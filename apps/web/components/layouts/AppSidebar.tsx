"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Gamepad2,
  Brain,
  Users,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../lib/auth";
import { toast } from "sonner";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/roadmaps", icon: Map, label: "Roadmaps" },
  { href: "/practice", icon: Gamepad2, label: "Practice" },
  { href: "/memory", icon: Brain, label: "Memory Lab" },
  { href: "/community", icon: Users, label: "Community" },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to log out");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-cyan" />
          </div>
          <span className="font-heading font-bold text-lg text-white">
            Skill<span className="text-brand-cyan">Forge</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive(item.href)
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive(item.href)
                ? "bg-brand-cyan/10 text-brand-cyan"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-all duration-200"
          onClick={() => void handleLogout()}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
