"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Building2,
  Package,
  BarChart3,
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/superadmin", icon: LayoutDashboard, label: "Overview" },
  { href: "/superadmin/restaurants", icon: Building2, label: "Restaurants" },
  { href: "/superadmin/packages", icon: Package, label: "Packages" },
  { href: "/superadmin/analytics", icon: BarChart3, label: "Analytics" },
];

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== "SUPER_ADMIN")) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  const { mutate: logout } = useMutation({
    mutationFn: async () => api.post("/auth/logout"),
    onSettled: () => { clearAuth(); router.push("/login"); },
  });

  if (!mounted || !user || user.role !== "SUPER_ADMIN") return null;

  return (
    <div className="min-h-screen flex">
      <aside className="fixed left-0 top-0 h-full w-60 bg-surface-elevated border-r border-surface-border flex flex-col z-40">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-surface-border">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-surface-elevated">
            <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
          </div>
          <div>
            <span className="font-display text-sm font-bold text-gradient">RestroSphere</span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <ShieldCheck className="w-3 h-3" />
              Super Admin
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`sa-nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-900/60 text-brand-300 border border-brand-700/30"
                    : "text-text-secondary hover:bg-surface-card hover:text-text-primary"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-surface-border p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">{user.name}</div>
              <div className="text-xs text-text-muted">{user.email}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            id="sa-logout-btn"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 min-h-screen">
        <header className="sticky top-0 z-30 h-16 border-b border-surface-border bg-surface/80 backdrop-blur-xl flex items-center justify-between px-6">
          <h1 className="font-display font-bold text-text-primary">
            {navItems.find((n) => n.href === pathname)?.label || "Superadmin"}
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
