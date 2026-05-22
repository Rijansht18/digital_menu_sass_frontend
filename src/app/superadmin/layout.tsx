"use client";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
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
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set sidebar to closed by default on mount
    setSidebarOpen(false);
  }, [setSidebarOpen]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-surface">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-surface-elevated border-r border-gray-200 dark:border-surface-border transition-all duration-300 z-40 flex flex-col shadow-sm dark:shadow-none",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-gray-200 dark:border-surface-border">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-gray-100 dark:bg-surface-elevated shrink-0">
            <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
          </div>
          {sidebarOpen && (
            <span className="font-display text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-800 dark:text-gradient bg-clip-text text-transparent">
              RestroSphere
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`sa-nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-text-secondary dark:hover:bg-surface-card dark:hover:text-text-primary",
                  !sidebarOpen && "justify-center"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-200 dark:border-surface-border p-3">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-text-primary truncate">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-text-muted truncate">{user.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={() => logout()}
            id="sa-logout-btn"
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              !sidebarOpen && "justify-center",
              "text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-text-muted dark:hover:text-red-400 dark:hover:bg-red-900/10"
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && "Logout"}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          id="sidebar-toggle"
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-surface-card border border-gray-200 dark:border-surface-border flex items-center justify-center text-gray-500 hover:text-brand-600 dark:text-text-muted dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-600/50 transition-all duration-200 shadow-md dark:shadow-card"
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-60" : "ml-16"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-surface-border bg-white/80 dark:bg-surface/80 backdrop-blur-xl flex items-center justify-between px-6">
          <h1 className="font-display font-bold text-gray-900 dark:text-text-primary">
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