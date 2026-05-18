"use client";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderOpen,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/menu", icon: UtensilsCrossed, label: "Menu Items" },
  { href: "/dashboard/categories", icon: FolderOpen, label: "Categories" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/subscription", icon: CreditCard, label: "Subscription" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant-profile"],
    queryFn: async () => {
      const res = await api.get("/restaurant/profile");
      return res.data.data;
    },
    enabled: !!isAuthenticated && !!user?.restaurantId,
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      clearAuth();
      router.push("/login");
    },
  });

  if (!mounted || !isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen flex">
      {/* ─── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-surface-elevated border-r border-surface-border transition-all duration-300 z-40 flex flex-col",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-surface-border">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-surface-elevated shrink-0">
            <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
          </div>
          {sidebarOpen && (
            <span className="font-display text-lg font-bold text-gradient">RestroSphere</span>
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
                id={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-900/60 text-brand-300 border border-brand-700/30"
                    : "text-text-secondary hover:bg-surface-card hover:text-text-primary",
                  !sidebarOpen && "justify-center"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                {sidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Restaurant slug link */}
        {sidebarOpen && user.restaurantId && restaurant?.slug && (
          <div className="px-3 py-2">
            <a
              href={`/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-text-muted hover:text-brand-400 transition-colors px-3 py-2 rounded-xl hover:bg-surface-card"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Menu
            </a>
          </div>
        )}

        {/* User + Logout */}
        <div className="border-t border-surface-border p-3">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{user.name}</div>
                <div className="text-xs text-text-muted truncate">{user.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={() => logout()}
            id="logout-btn"
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && "Logout"}
          </button>
        </div>

        {/* Toggle */}
        <button
          onClick={toggleSidebar}
          id="sidebar-toggle"
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand-600/50 transition-all duration-200 shadow-card"
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* ─── Main Content ────────────────────────────────────────────────────── */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-60" : "ml-16"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-surface-border bg-surface/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div>
            <h1 className="font-display font-bold text-text-primary">
              {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="badge-brand">{user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
